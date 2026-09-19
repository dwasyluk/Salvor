"""Pricing must match the verified rate card and the JSON mirror exactly."""
from __future__ import annotations

from decimal import Decimal

from salvorbench.cost.pricing import RATES, TokenUsage, cost_usd, load_conf

SONNET = "claude-sonnet-5"


def test_rates_match_official_pricing_page() -> None:
    """Verified 2026-08-18 at platform.claude.com/docs/en/about-claude/pricing.

    The page states the $2/$10 introductory rate is now standard and the
    scheduled 2026-09-01 increase to $3/$15 will not occur.
    """
    r = RATES[SONNET]
    assert r["input"] == Decimal("2.00")
    assert r["output"] == Decimal("10.00")
    assert r["cache_write_5m"] == Decimal("2.50")
    assert r["cache_write_1h"] == Decimal("4.00")
    assert r["cache_read"] == Decimal("0.20")


def test_cache_multipliers_hold() -> None:
    r = RATES[SONNET]
    assert r["cache_write_5m"] == r["input"] * Decimal("1.25")
    assert r["cache_write_1h"] == r["input"] * Decimal("2")
    assert r["cache_read"] == r["input"] * Decimal("0.1")


def test_json_mirror_agrees_with_python() -> None:
    """The Node contract test reads the JSON; drift between the two would let a
    published figure disagree with the ledger that produced it."""
    conf = load_conf()["models"][SONNET]
    for field, value in RATES[SONNET].items():
        assert Decimal(str(conf[field])) == value, field


def test_cost_is_exact_decimal_arithmetic() -> None:
    usage = TokenUsage(input=1_000_000, output=1_000_000)
    assert cost_usd(usage) == Decimal("12.00")


def test_unknown_model_refuses_rather_than_guessing() -> None:
    import pytest
    with pytest.raises(ValueError, match="never guess"):
        cost_usd(TokenUsage(input=1), model="claude-not-a-real-model")
