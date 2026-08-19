"""The benchmark ratifier — a reviewer, never an author.

Operator-ratified design (2026-08-19): the working agent authors every candidate
capture through Salvor's normal stable gates; this component only answers those
gates. Structurally it CANNOT author knowledge: its output never enters the
brain — the harness reads exactly one boolean from it and relays "yes" or "no"
to the working agent, which then persists (or doesn't) its OWN text.

Implementation is a direct API call rather than an agent session: the ratifier
needs no tools, no filesystem, and no ability to search — giving it any of
those would be the confound the design forbids.

Determinism caveat, stated rather than hidden: the rubric and procedure are
fixed and versioned (sha256 in the manifest); the judgment inside each call is
a model inference and is not bit-reproducible. Every decision is logged with
per-criterion verdicts so any single call can be challenged after the fact.
"""

from __future__ import annotations

import hashlib
import json
import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import httpx

from ..cost.pricing import TokenUsage

MODEL = "claude-sonnet-5"
API_URL = "https://api.anthropic.com/v1/messages"

RUBRIC_VERSION = 1
RUBRIC = """\
You are a benchmark ratifier for the Salvor engineering-brain protocol. A
working agent has proposed persisting a piece of durable project knowledge and
asked a yes/no approval question. Your ONLY job is to approve or reject that
exact candidate. You must never author, rewrite, improve, trim, or suggest
replacement wording, and you must never introduce knowledge of your own.

Evaluate the candidate against these criteria, each true/false:

1. observed        - Was this actually observed during the session? (It must be
                     supported by the session evidence provided, not invented.)
2. durable         - Is it durable, project-level knowledge rather than
                     ephemeral task state or a narration of what just happened?
3. evidenced       - Is there concrete evidence for it in code, tests, docs, or
                     the session history provided?
4. category_fit    - Does it belong in an established Salvor artifact category
                     (decision, domain learning, learned failure, deferred
                     finding, docs/SOP, operational state)?
5. no_secret_leak  - Is it free of secrets, credentials, tokens, PII, raw logs,
                     and anything on Salvor's never-persist list - and free of
                     any information the agent could only have from an external
                     evaluator rather than its own work?
6. not_overspecific- Would a real maintainer keep this, rather than it being a
                     restatement of the current change that no one would file
                     as reusable knowledge?

Approve only when ALL six are true. When uncertain about any criterion, reject.

Respond with ONLY this JSON, no other text:
{"approve": true|false,
 "criteria": {"observed": bool, "durable": bool, "evidenced": bool,
              "category_fit": bool, "no_secret_leak": bool,
              "not_overspecific": bool},
 "reason": "<one sentence>"}
"""

RUBRIC_SHA256 = hashlib.sha256(RUBRIC.encode()).hexdigest()


@dataclass
class Decision:
    approve: bool
    criteria: dict[str, bool]
    reason: str
    usage: TokenUsage
    raw: str = ""

    def to_dict(self) -> dict[str, Any]:
        return {"approve": self.approve, "criteria": self.criteria,
                "reason": self.reason,
                "tokens": {"input": self.usage.input, "output": self.usage.output}}


class Ratifier:
    def __init__(self, provenance_dir: Path, *, model: str = MODEL) -> None:
        self.model = model
        self.dir = Path(provenance_dir)
        self.dir.mkdir(parents=True, exist_ok=True)
        self._n = 0
        self.decisions: list[Decision] = []

    def decide(self, *, gate_question: str, candidate: str, evidence: str,
               brain_listing: str, context: str) -> Decision:
        """One approve/reject decision, fully logged."""
        key = os.environ["ANTHROPIC_API_KEY"]
        user = (
            f"Gate question asked by the working agent:\n{gate_question}\n\n"
            f"Candidate knowledge (exact text, authored by the working agent):\n"
            f"---\n{candidate[:6000]}\n---\n\n"
            f"Session evidence (excerpts the working agent's session produced):\n"
            f"---\n{evidence[:8000]}\n---\n\n"
            f"Current brain contents (paths only):\n{brain_listing[:2000]}\n"
        )
        resp = httpx.post(
            API_URL,
            headers={"x-api-key": key, "anthropic-version": "2023-06-01",
                     "content-type": "application/json"},
            json={"model": self.model, "max_tokens": 800,
                  "system": RUBRIC,
                  "messages": [{"role": "user", "content": user}]},
            timeout=120,
        )
        resp.raise_for_status()
        body = resp.json()
        text = "".join(b.get("text", "") for b in body.get("content", [])
                       if b.get("type") == "text")
        u = body.get("usage", {})
        usage = TokenUsage(
            input=int(u.get("input_tokens", 0)),
            output=int(u.get("output_tokens", 0)),
            cache_write_5m=0,
            cache_write_1h=int(u.get("cache_creation_input_tokens", 0) or 0),
            cache_read=int(u.get("cache_read_input_tokens", 0) or 0),
            turns=1, source="result_event")

        decision = self._parse(text, usage=usage)
        self._log(context, gate_question, candidate, evidence, decision)
        self.decisions.append(decision)
        return decision

    def _parse(self, text: str, usage: TokenUsage | None = None) -> Decision:
        """Parse a raw verdict. Default-reject: no parse, no approval; an
        approval missing any of the six criteria is downgraded to reject."""
        usage = usage or TokenUsage(source="result_event")
        approve, criteria, reason = False, {}, "unparseable verdict -> reject"
        try:
            start, end = text.index("{"), text.rindex("}") + 1
            verdict = json.loads(text[start:end])
            approve = bool(verdict.get("approve"))
            criteria = {k: bool(v) for k, v in (verdict.get("criteria") or {}).items()}
            reason = str(verdict.get("reason", ""))[:400]
            if approve and not all(criteria.get(k) for k in (
                    "observed", "durable", "evidenced", "category_fit",
                    "no_secret_leak", "not_overspecific")):
                approve, reason = False, f"criteria incomplete -> reject ({reason})"
        except Exception:                                   # noqa: BLE001
            pass  # default reject stands - an unparseable verdict never approves
        return Decision(approve, criteria, reason, usage, text)

    def _log(self, context: str, gate: str, candidate: str, evidence: str,
             decision: Decision) -> None:
        self._n += 1
        record = {
            "n": self._n,
            "context": context,
            "rubric_version": RUBRIC_VERSION,
            "rubric_sha256": RUBRIC_SHA256,
            "gate_question": gate,
            "candidate_sha256": hashlib.sha256(candidate.encode()).hexdigest(),
            "candidate": candidate[:6000],
            "evidence_sha256": hashlib.sha256(evidence.encode()).hexdigest(),
            "decision": decision.to_dict(),
            "raw_verdict": decision.raw[:1200],
        }
        path = self.dir / f"decision-{self._n:03d}.json"
        path.write_text(json.dumps(record, indent=2))

    def total_usage(self) -> TokenUsage:
        t = TokenUsage()
        for d in self.decisions:
            t = TokenUsage(input=t.input + d.usage.input,
                           output=t.output + d.usage.output,
                           cache_write_1h=t.cache_write_1h + d.usage.cache_write_1h,
                           cache_read=t.cache_read + d.usage.cache_read,
                           turns=t.turns + 1, source="result_event")
        return t


def usage_from_dir(provenance_dir: Path) -> TokenUsage | None:
    """Sum token usage across a directory of decision logs (for billing)."""
    files = sorted(Path(provenance_dir).glob("decision-*.json"))
    if not files:
        return None
    tot = TokenUsage(source="result_event")
    n = 0
    for f in files:
        d = json.loads(f.read_text())
        u = (d.get("decision") or {}).get("tokens") or {}
        if not u:
            continue
        tot = TokenUsage(input=tot.input + int(u.get("input", 0)),
                         output=tot.output + int(u.get("output", 0)),
                         cache_write_5m=tot.cache_write_5m,
                         cache_write_1h=tot.cache_write_1h,
                         cache_read=tot.cache_read,
                         turns=tot.turns + 1, source="result_event")
        n += 1
    return tot if n else None
