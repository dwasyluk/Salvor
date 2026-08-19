"""Run state must be tamper-evident and prove phase ordering."""
from __future__ import annotations

import json
from pathlib import Path

from salvorbench.state.log import Event, StateLog


def test_chain_verifies_and_detects_tampering(tmp_path: Path) -> None:
    log = StateLog(tmp_path)
    log.append(Event.RUN_STARTED, run_id="r1")
    log.append(Event.PHASE_STARTED, phase="bootstrap")
    log.append(Event.PHASE_FINISHED, phase="bootstrap")
    assert log.verify_chain() == (True, None)

    lines = log.path.read_text().splitlines()
    entry = json.loads(lines[1])
    entry["phase"] = "tasks"                    # reorder history after the fact
    lines[1] = json.dumps(entry, sort_keys=True)
    log.path.write_text("\n".join(lines) + "\n")

    ok, err = log.verify_chain()
    assert not ok and "altered after write" in err


def test_phase_ordering_is_recoverable(tmp_path: Path) -> None:
    """The anti-leakage claim depends on this: bootstrap must provably finish
    before the task phase starts, and the log cannot be rewritten to fake it."""
    log = StateLog(tmp_path)
    log.append(Event.PHASE_STARTED, phase="bootstrap")
    log.append(Event.PHASE_FINISHED, phase="bootstrap")
    log.append(Event.PHASE_STARTED, phase="tasks")
    phases = log.phase_times()
    assert phases["bootstrap"]["finished_at"] <= phases["tasks"]["started_at"]


def test_unit_view_tracks_latest_state(tmp_path: Path) -> None:
    log = StateLog(tmp_path)
    log.append(Event.UNIT_STARTED, unit_id="S1/swecl/pytest/1", condition="S1")
    log.append(Event.UNIT_FINISHED, unit_id="S1/swecl/pytest/1", condition="S1",
               outcome="completed")
    units = log.units()
    assert units["S1/swecl/pytest/1"]["last_event"] == "unit_finished"
    assert units["S1/swecl/pytest/1"]["outcome"] == "completed"


def test_reserved_field_names_are_refused(tmp_path: Path) -> None:
    """A caller field named `sha256` would be signed then stripped at verify
    time, producing a false tamper report indistinguishable from a real one."""
    import pytest
    log = StateLog(tmp_path)
    with pytest.raises(ValueError, match="reserved"):
        log.append(Event.SUBSET_FROZEN, sha256="deadbeef")
    log.append(Event.SUBSET_FROZEN, subset_sha256="deadbeef")   # the correct spelling
    assert log.verify_chain() == (True, None)
