"""The ledger must be tamper-evident and the governor must actually bound spend."""
from __future__ import annotations

import json
from decimal import Decimal
from pathlib import Path

import pytest

from salvorbench.cost.governor import BudgetExceeded, Governor
from salvorbench.cost.ledger import Ledger
from salvorbench.cost.pricing import TokenUsage

TS = "2026-08-19T02:00:00.000Z"


def book(ledger: Ledger, unit: str, out_tokens: int, cond: str = "C2") -> Decimal:
    return ledger.append(unit_id=unit, condition=cond, phase="tasks", attempt=1,
                         model="claude-sonnet-5",
                         usage=TokenUsage(output=out_tokens), ts=TS)


def test_chain_verifies_when_intact(tmp_path: Path) -> None:
    led = Ledger(tmp_path)
    for i in range(5):
        book(led, f"u{i}", 100_000)
    ok, err = led.verify_chain()
    assert ok and err is None


def test_chain_detects_edited_entry(tmp_path: Path) -> None:
    led = Ledger(tmp_path)
    for i in range(3):
        book(led, f"u{i}", 100_000)

    lines = led.path.read_text().splitlines()
    tampered = json.loads(lines[1])
    tampered["cost_usd"] = "0.0001"          # make a run look cheaper
    lines[1] = json.dumps(tampered, sort_keys=True)
    led.path.write_text("\n".join(lines) + "\n")

    ok, err = led.verify_chain()
    assert not ok and "altered after write" in err


def test_chain_detects_deleted_entry(tmp_path: Path) -> None:
    led = Ledger(tmp_path)
    for i in range(4):
        book(led, f"u{i}", 100_000)
    lines = led.path.read_text().splitlines()
    del lines[2]
    led.path.write_text("\n".join(lines) + "\n")
    ok, err = led.verify_chain()
    assert not ok


def test_totals_accumulate_exactly(tmp_path: Path) -> None:
    led = Ledger(tmp_path)
    book(led, "u0", 1_000_000)               # $10.00 output
    book(led, "u1", 1_000_000)
    assert led.total() == Decimal("20.00")


def test_governor_refuses_admission_before_crossing_cap(tmp_path: Path) -> None:
    led = Ledger(tmp_path)
    gov = Governor(led, cap_usd=Decimal("50"), reserve_usd=Decimal("5"))
    gov.set_probe("cooper_pair", Decimal("10"))

    for i in range(4):                       # $40 booked, spendable is $45
        book(led, f"u{i}", 1_000_000)
    ok, reason = gov.can_admit("cooper_pair")
    assert not ok and "admission refused" in reason

    with pytest.raises(BudgetExceeded):
        gov.admit("u_next", "cooper_pair")


def test_in_flight_units_are_reserved_against_the_cap(tmp_path: Path) -> None:
    """Two concurrent launches must not each assume the other's budget."""
    led = Ledger(tmp_path)
    gov = Governor(led, cap_usd=Decimal("50"), reserve_usd=Decimal("5"))
    gov.set_probe("cooper_pair", Decimal("20"))

    gov.admit("a", "cooper_pair")            # $20 committed, unbooked
    gov.admit("b", "cooper_pair")            # $40 committed
    ok, _ = gov.can_admit("cooper_pair")     # would be $60 > $45
    assert not ok


def test_estimate_uses_probe_until_enough_observations(tmp_path: Path) -> None:
    gov = Governor(Ledger(tmp_path))
    gov.set_probe("swe_task", Decimal("3"))
    for _ in range(4):
        gov.observe("swe_task", Decimal("0.5"))
    assert gov.estimate("swe_task") == Decimal("3"), "4 observations is not enough"
    gov.observe("swe_task", Decimal("0.5"))
    assert gov.estimate("swe_task") < Decimal("3")


def test_empirical_estimate_never_collapses_below_half_the_probe(tmp_path: Path) -> None:
    """A run of cheap units must not license one runaway launch."""
    gov = Governor(Ledger(tmp_path))
    gov.set_probe("swe_task", Decimal("4"))
    for _ in range(20):
        gov.observe("swe_task", Decimal("0.01"))
    assert gov.estimate("swe_task") == Decimal("2")


def test_watchdog_detects_in_flight_overrun(tmp_path: Path) -> None:
    led = Ledger(tmp_path)
    gov = Governor(led, cap_usd=Decimal("50"), reserve_usd=Decimal("5"))
    book(led, "u0", 4_000_000)               # $40 booked
    assert gov.would_exceed(Decimal("11"))   # a live unit at $11 crosses $50
    assert not gov.would_exceed(Decimal("5"))
