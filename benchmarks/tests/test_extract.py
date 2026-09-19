"""Token extraction must survive truncation and never double-count."""
from __future__ import annotations

import json
from pathlib import Path

import pytest

from salvorbench.cost.extract import extract


def write_stream(tmp_path: Path, events: list[dict]) -> Path:
    p = tmp_path / "stream.jsonl"
    p.write_text("\n".join(json.dumps(e) for e in events) + "\n")
    return p


def assistant(mid: str, **usage) -> dict:
    return {"type": "assistant", "message": {"id": mid, "usage": usage}}


def test_dedupes_reemitted_assistant_events(tmp_path: Path) -> None:
    """Some CLI versions emit one assistant event per content block; counting
    both would double-bill a multi-block turn."""
    log = write_stream(tmp_path, [
        assistant("msg_1", input_tokens=100, output_tokens=50),
        assistant("msg_1", input_tokens=100, output_tokens=50),  # same id
        assistant("msg_2", input_tokens=200, output_tokens=80),
    ])
    usage = extract(log)
    assert usage.input == 300
    assert usage.output == 130
    assert usage.turns == 2


def test_bills_a_truncated_run_with_no_result_event(tmp_path: Path) -> None:
    """The failure mode upstream's parser gets wrong: a timed-out unit emits no
    `result` event and would otherwise be billed as zero."""
    log = write_stream(tmp_path, [
        assistant("msg_1", input_tokens=5000, output_tokens=2000),
        assistant("msg_2", input_tokens=6000, output_tokens=2500),
    ])
    usage = extract(log)
    assert usage.source == "assistant_sum"
    assert usage.input == 11000 and usage.output == 4500


def test_takes_the_higher_of_two_extractions(tmp_path: Path) -> None:
    log = write_stream(tmp_path, [
        assistant("msg_1", input_tokens=100, output_tokens=50),
        {"type": "result", "usage": {"input_tokens": 900, "output_tokens": 400}},
    ])
    usage = extract(log)
    assert usage.input == 900, "must not under-bill by trusting the smaller figure"


def test_flags_large_divergence(tmp_path: Path) -> None:
    log = write_stream(tmp_path, [
        assistant("msg_1", input_tokens=100, output_tokens=50),
        {"type": "result", "usage": {"input_tokens": 10000, "output_tokens": 5000}},
    ])
    usage = extract(log).discrepancy_pct
    assert usage is not None and usage > 5.0


def test_scalar_cache_creation_bills_the_expensive_bucket(tmp_path: Path) -> None:
    """Without a 5m/1h breakdown, attribute to 1h so we can never under-bill."""
    log = write_stream(tmp_path, [
        assistant("msg_1", input_tokens=10, cache_creation_input_tokens=1000),
    ])
    usage = extract(log)
    assert usage.cache_write_1h == 1000 and usage.cache_write_5m == 0
    assert usage.cache_write_attribution == "assumed_1h"


def test_uses_breakdown_when_present(tmp_path: Path) -> None:
    log = write_stream(tmp_path, [
        assistant("msg_1", cache_creation={"ephemeral_5m_input_tokens": 700,
                                           "ephemeral_1h_input_tokens": 300}),
    ])
    usage = extract(log)
    assert (usage.cache_write_5m, usage.cache_write_1h) == (700, 300)
    assert usage.cache_write_attribution == "breakdown"


def test_tolerates_interleaved_non_json_stderr(tmp_path: Path) -> None:
    p = tmp_path / "stream.jsonl"
    p.write_text("npm warn something\n"
                 + json.dumps(assistant("msg_1", input_tokens=10)) + "\n"
                 + "bash: line 1: noise\n")
    assert extract(p).input == 10


def test_missing_log_is_zero_not_a_crash(tmp_path: Path) -> None:
    assert extract(tmp_path / "absent.jsonl").total == 0
