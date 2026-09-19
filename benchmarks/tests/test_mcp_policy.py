"""Per-arm MCP namespace policy.

These tests encode two decisions that are easy to get wrong and expensive to get
wrong silently:

* S2 legitimately runs a memory MCP server - it is the treatment being measured,
  not a contamination. A blanket "baselines must have zero MCP calls" rule would
  fail S2 by definition.
* Availability is gated; utilisation is telemetry. An arm that never calls an
  available server is exhibiting valid model behaviour and must pass.
"""
from __future__ import annotations

import json
from pathlib import Path

import pytest
import yaml

from salvorbench.isolation.mcpcheck import check, observed_namespaces

POLICY = yaml.safe_load(
    (Path(__file__).resolve().parents[1] / "conf" / "mcp-policy.yaml").read_text()
)


def stream(tmp_path: Path, *tool_names: str) -> Path:
    events = [
        {"type": "assistant",
         "message": {"id": f"m{i}", "content": [{"type": "tool_use", "name": name}]}}
        for i, name in enumerate(tool_names)
    ]
    p = tmp_path / "stream.jsonl"
    p.write_text("\n".join(json.dumps(e) for e in events) + "\n")
    return p


# ---- the corrections these tests exist to protect ----------------------

def test_s2_memory_mcp_is_allowed_not_a_violation(tmp_path: Path) -> None:
    log = stream(tmp_path, "mcp__clmem__search_memory", "mcp__clmem__add_memory")
    report = check("S2", POLICY, log)
    assert report.compliant, report.violations
    assert report.total_calls == 2


def test_available_but_unused_tools_are_compliant(tmp_path: Path) -> None:
    """Zero Serena/GitNexus calls in a Salvor arm is valid model behaviour."""
    log = stream(tmp_path)          # no MCP calls at all
    report = check("S3", POLICY, log)
    assert report.compliant and report.total_calls == 0


# ---- forbidden-namespace enforcement ----------------------------------

@pytest.mark.parametrize("arm", ["S1", "C1", "C2"])
def test_baselines_reject_salvor_stack(arm: str, tmp_path: Path) -> None:
    log = stream(tmp_path, "mcp__serena__find_symbol")
    report = check(arm, POLICY, log)
    assert not report.compliant
    assert "forbidden" in report.violations[0]


def test_s1_rejects_the_memory_arm_server(tmp_path: Path) -> None:
    log = stream(tmp_path, "mcp__clmem__search_memory")
    assert not check("S1", POLICY, log).compliant


def test_s3_rejects_the_generic_memory_server(tmp_path: Path) -> None:
    """S3 must be the Salvor stack, not Salvor plus a second memory system."""
    log = stream(tmp_path, "mcp__clmem__search_memory")
    assert not check("S3", POLICY, log).compliant


def test_s3_and_c3_accept_the_salvor_stack(tmp_path: Path) -> None:
    log = stream(tmp_path, "mcp__serena__find_symbol", "mcp__gitnexus__impact")
    for arm in ("S3", "C3"):
        report = check(arm, POLICY, log)
        assert report.compliant, (arm, report.violations)


# ---- counting semantics ------------------------------------------------

def test_text_mentions_are_not_counted_as_calls(tmp_path: Path) -> None:
    """An agent writing 'mcp__serena__find_symbol' in prose has not called it;
    counting that would fail a clean baseline on a false positive."""
    p = tmp_path / "stream.jsonl"
    p.write_text(json.dumps({
        "type": "assistant",
        "message": {"id": "m0", "content": [
            {"type": "text", "text": "I could use mcp__serena__find_symbol here."}]},
    }) + "\n")
    assert observed_namespaces(p).total() == 0
    assert check("S1", POLICY, p).compliant


def test_every_arm_in_conditions_has_a_policy() -> None:
    conditions = yaml.safe_load(
        (Path(__file__).resolve().parents[1] / "conf" / "conditions.yaml").read_text()
    )
    declared = {c["id"] for c in conditions["conditions"]}
    assert declared == set(POLICY["arms"]), "every condition needs an isolation policy"
