"""Token extraction from Claude Code's stream-json output.

Two independent extractions, then reconciliation. This is deliberate, not
belt-and-braces:

* The terminal ``result`` event is the field CooperBench's own parser reads. It
  is convenient but fragile - a unit killed by a timeout never emits one, and
  upstream's parser then reports all-zeros, silently under-billing exactly the
  runs most likely to be expensive.
* Summing per-turn ``assistant.message.usage`` survives truncation, but must
  dedupe on ``message.id``: some CLI versions emit one assistant event per
  content block, which would otherwise double-count a multi-block turn.

We take the MAXIMUM of the two and flag any divergence over 5%. Never trust
``total_cost_usd`` from the CLI - the ledger prices tokens itself against a
verified rate card so a published figure is reproducible from raw counts.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Iterable

from .pricing import TokenUsage, cost_usd

DISCREPANCY_TOLERANCE = 0.05


def _iter_events(stream: Iterable[str]) -> Iterable[dict[str, Any]]:
    for line in stream:
        line = line.strip()
        if not line:
            continue
        try:
            yield json.loads(line)
        except json.JSONDecodeError:
            # The CLI interleaves plain stderr into the tee'd log; skip it
            # rather than failing an otherwise-billable run.
            continue


def _split_cache_creation(usage: dict[str, Any]) -> tuple[int, int, str]:
    """Return (write_5m, write_1h, attribution).

    Newer payloads carry a breakdown; older ones carry only a scalar. When only
    the scalar is available we attribute it to the *more expensive* 1h bucket so
    the governor can never under-bill, and record that we did so.
    """
    breakdown = usage.get("cache_creation")
    if isinstance(breakdown, dict):
        return (
            int(breakdown.get("ephemeral_5m_input_tokens", 0) or 0),
            int(breakdown.get("ephemeral_1h_input_tokens", 0) or 0),
            "breakdown",
        )
    scalar = int(usage.get("cache_creation_input_tokens", 0) or 0)
    if scalar:
        return 0, scalar, "assumed_1h"
    return 0, 0, "breakdown"


def _usage_from(usage: dict[str, Any]) -> tuple[int, int, int, int, int, str]:
    w5, w1, attribution = _split_cache_creation(usage)
    return (
        int(usage.get("input_tokens", 0) or 0),
        int(usage.get("output_tokens", 0) or 0),
        w5,
        w1,
        int(usage.get("cache_read_input_tokens", 0) or 0),
        attribution,
    )


def extract(stream_log: str | Path) -> TokenUsage:
    """Extract reconciled token usage from a stream-json log."""
    path = Path(stream_log)
    lines = path.read_text(errors="replace").splitlines() if path.exists() else []

    seen_message_ids: set[str] = set()
    a_in = a_out = a_w5 = a_w1 = a_read = 0
    turns = 0
    attribution = "breakdown"

    r_in = r_out = r_w5 = r_w1 = r_read = 0
    saw_result = False

    for event in _iter_events(lines):
        etype = event.get("type")

        if etype == "assistant":
            message = event.get("message") or {}
            mid = message.get("id")
            if mid and mid in seen_message_ids:
                continue  # re-emitted per content block; count the turn once
            if mid:
                seen_message_ids.add(mid)
            usage = message.get("usage") or {}
            if not usage:
                continue
            i, o, w5, w1, rd, attr = _usage_from(usage)
            a_in += i; a_out += o; a_w5 += w5; a_w1 += w1; a_read += rd
            if attr == "assumed_1h":
                attribution = "assumed_1h"
            turns += 1

        elif etype == "result":
            saw_result = True
            usage = event.get("usage") or {}
            r_in, r_out, r_w5, r_w1, r_read, attr = _usage_from(usage)
            if attr == "assumed_1h":
                attribution = "assumed_1h"

    summed = TokenUsage(a_in, a_out, a_w5, a_w1, a_read, turns, "assistant_sum",
                        None, attribution)
    if not saw_result:
        # Timed-out or killed unit: bill what we can see. Upstream's parser
        # returns zeros here, which would hide the cost of the worst runs.
        return summed

    from_result = TokenUsage(r_in, r_out, r_w5, r_w1, r_read, turns,
                             "result_event", None, attribution)

    c_sum, c_res = cost_usd(summed), cost_usd(from_result)
    hi = max(c_sum, c_res)
    discrepancy = float(abs(c_sum - c_res) / hi) if hi > 0 else 0.0
    winner = summed if c_sum >= c_res else from_result

    return TokenUsage(
        winner.input, winner.output, winner.cache_write_5m, winner.cache_write_1h,
        winner.cache_read, turns,
        "reconciled" if discrepancy <= DISCREPANCY_TOLERANCE else winner.source,
        round(discrepancy * 100, 3), attribution,
    )
