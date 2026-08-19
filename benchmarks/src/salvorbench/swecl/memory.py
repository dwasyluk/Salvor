"""Ported SWE-Bench-CL semantic memory (arm S2).

Reproduced from the pinned upstream source (`eval_v2_agent/eval_procedure.py`,
vendored under `vendor/swebench-cl-src/`), not from the plan's shorthand. The
shorthand said "write-on-success"; upstream actually does:

    status_prefix = "[SUCCESSFUL SOLUTION]" if solution_data.get("tests_passed") \\
                    else "[ATTEMPTED SOLUTION]"

so BOTH successful and attempted solutions are retained, distinguished only by a
label. That behaviour is preserved here.

The label derives from `tests_passed` - the agent's own in-loop test result.
It is NEVER the external SWE-bench evaluator's verdict. That boundary is the
whole reason S2 is a legitimate comparison rather than a channel for hidden
ground truth, and it binds S3 identically.

Deviation, disclosed in METHODOLOGY: upstream embeds via a local Ollama daemon
(`ollama/nomic-embed-text`). This port uses a local sentence-transformers model
so no second daemon runs inside the task container. Retrieval mechanism, k,
write policy and content shape are unchanged.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

K_RESULTS = 3          # upstream default
EMBED_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

SUCCESS_PREFIX = "[SUCCESSFUL SOLUTION]"
ATTEMPT_PREFIX = "[ATTEMPTED SOLUTION]"


@dataclass
class Entry:
    task_id: str
    content: str
    tests_passed: bool
    metadata: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return {"task_id": self.task_id, "content": self.content,
                "tests_passed": self.tests_passed, "metadata": self.metadata}


def format_entry(task_id: str, *, summary: str, rationale: str,
                 code_changes: list[str], tests_passed: bool) -> str:
    """Upstream's exact content shape and status labelling."""
    body = (f"Solution Summary: {summary}\n"
            f"Rationale: {rationale}\n"
            f"Code Changes:\n" + "\n".join(code_changes))
    prefix = SUCCESS_PREFIX if tests_passed else ATTEMPT_PREFIX
    return f"{prefix} for Task {task_id}:\n{body}"


class SemanticMemory:
    """Vector store over prior solutions, k-nearest retrieval.

    Upstream rebuilds the index on every write (`FAISS.from_documents`); this
    port keeps the same semantics - a write invalidates and rebuilds - so
    retrieval behaviour matches even though the backend differs.
    """

    def __init__(self, k_results: int = K_RESULTS, model_name: str = EMBED_MODEL) -> None:
        self.k_results = k_results
        self.model_name = model_name
        self.entries: list[Entry] = []
        self._model = None
        self._vectors = None

    # -- model is loaded lazily so importing this module stays cheap --------
    def _encode(self, texts: list[str]):
        if self._model is None:
            from sentence_transformers import SentenceTransformer
            self._model = SentenceTransformer(self.model_name)
        return self._model.encode(texts, normalize_embeddings=True)

    def add_entry(self, task_id: str, content: str, *, tests_passed: bool,
                  metadata: dict[str, Any] | None = None) -> None:
        self.entries.append(Entry(task_id, content, tests_passed, metadata or {}))
        self._vectors = None                      # rebuild on next retrieval

    def retrieve_relevant(self, query: str, num_results: int | None = None) -> list[dict]:
        if not self.entries:
            return []
        k = min(num_results or self.k_results, len(self.entries))
        if self._vectors is None:
            self._vectors = self._encode([e.content for e in self.entries])
        import numpy as np
        q = self._encode([query])[0]
        scores = np.asarray(self._vectors) @ q     # cosine (vectors normalised)
        order = scores.argsort()[::-1][:k]
        return [{"task_id": self.entries[i].task_id,
                 "content": self.entries[i].content,
                 "score": float(scores[i])} for i in order]

    # -- persistence so a chain can resume without re-embedding ------------
    def save(self, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps({"model": self.model_name, "k": self.k_results,
                                    "entries": [e.to_dict() for e in self.entries]}, indent=2))

    @classmethod
    def load(cls, path: Path) -> "SemanticMemory":
        data = json.loads(Path(path).read_text())
        mem = cls(k_results=data.get("k", K_RESULTS), model_name=data.get("model", EMBED_MODEL))
        for e in data.get("entries", []):
            mem.entries.append(Entry(e["task_id"], e["content"],
                                     e.get("tests_passed", False), e.get("metadata", {})))
        return mem


def build_context(base_prompt: str, memories: list[dict]) -> str:
    """Upstream's MCPContextManager framing, preserved verbatim in shape."""
    if not memories:
        return base_prompt
    out = base_prompt + "\n\n--- Relevant Past Experiences (from Semantic Memory) ---\n"
    for m in memories:
        out += f"- Task {m['task_id']}: {m['content']} (Relevance Score: {m['score']:.2f})\n"
    return out + "\n--- End of Past Experiences ---\n"
