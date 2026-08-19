"""Units for the T0/C3 treatment layer: gates, ratifier discipline, adapter identity.

No network, no Docker — the ratifier is exercised only on its parse/decide
logic (default-reject paths) and the adapter only on its pure helpers.
"""

from __future__ import annotations

import re

import pytest

from salvorbench.brain import gates as G
from salvorbench.brain.ratifier import RUBRIC, RUBRIC_SHA256, Ratifier
from salvorbench.cooper import adapter as A


# --- capture gates ---------------------------------------------------------

@pytest.mark.parametrize("text,expected", [
    ("Record this as a design decision? (yes/no)", "design_decision"),
    ("Save this as a domain learning? (yes/no)", "domain_learning"),
    ("Log this to .salvor/DEFERRED_TODOS.md? (yes/no)", "deferred_finding"),
    ("Shall I proceed with the refactor?", None),
])
def test_capture_gate_matching(text, expected):
    assert G.match_capture_gate(text) == expected


def test_setup_gates_are_task_blind():
    """The scripted answers may reference project/stack, never task content."""
    for g in G.setup_gates("pallets_click_task", "Python project (pyproject.toml)"):
        low = g.reply.lower()
        assert "feature" not in low and "issue" not in low and "bug" not in low


def test_commit_gate_says_no():
    replies = {g.name: g.reply for g in G.setup_gates("x", "y")}
    assert "no" in replies["commit_offer"].lower()
    assert "uncommitted" in replies["commit_offer"].lower()


# --- ratifier: reviewer-only discipline ------------------------------------

def test_rubric_pinned():
    import hashlib
    assert hashlib.sha256(RUBRIC.encode()).hexdigest() == RUBRIC_SHA256


def test_ratifier_default_rejects_garbage(tmp_path):
    r = Ratifier(tmp_path)
    d = r._parse("this is not json at all")
    assert d.approve is False


def test_ratifier_rejects_approve_without_all_criteria(tmp_path):
    r = Ratifier(tmp_path)
    d = r._parse('{"approve": true, "criteria": {"observed": true}, "reason": "x"}')
    assert d.approve is False


def test_ratifier_never_returns_text_for_the_brain(tmp_path):
    """The decision surface is approve/criteria/reason only — no authored
    replacement wording can flow back into the working agent."""
    r = Ratifier(tmp_path)
    d = r._parse('{"approve": true, "criteria": {}, "reason": "ok", '
                 '"suggested_wording": "better text"}')
    assert not hasattr(d, "suggested_wording")
    assert set(d.to_dict()) == {"approve", "criteria", "reason", "tokens"}


# --- C3 adapter identity helpers -------------------------------------------

def test_pair_identity_from_log_dir():
    repo, tid, feats = A._pair_from_log_dir(
        "/runs/beta/cooper/c3-flash-beta/coop/go_chi_task/26/f0_f3")
    assert (repo, tid, feats) == ("go_chi_task", 26, "f0_f3")


def test_pair_identity_rejects_solo_paths():
    with pytest.raises(RuntimeError):
        A._pair_from_log_dir("/runs/x/solo/go_chi_task/26/f0_f3")


def test_brain_image_matches_bootstrap_tag():
    from salvorbench.brain.bootstrap import bootstrap_state  # noqa: F401
    # bootstrap tags salvorbench-brain:<state_key with / -> ->; adapter must agree
    assert A._brain_image("pallets_click_task", 2068) == \
        "salvorbench-brain:pallets_click_task-2068"


def test_volume_names_unique_per_pair_and_layer():
    names = {
        A._volume_name(r, t, f, s)
        for r, t in [("pallets_click_task", 2068), ("go_chi_task", 26)]
        for f in ["f0_f1", "f0_f2"]
        for s in ["salvor", "serena-mem"]
    }
    assert len(names) == 8
    assert all(re.fullmatch(r"[a-zA-Z0-9][a-zA-Z0-9_.-]*", n) for n in names)


def test_env_seam_passthrough_without_context():
    """With no thread-local context the patched builder must behave upstream."""
    calls = {}
    def fake(image, **kw):
        calls["image"] = image; calls["kw"] = kw
        return "ENV"
    orig = A._ORIG_BUILD_ENV
    A._ORIG_BUILD_ENV = fake
    try:
        out = A._patched_build_environment("img:x", network=None, extra_run_args=["--rm"])
        assert out == "ENV"
        assert calls["image"] == "img:x"
        assert calls["kw"]["extra_run_args"] == ["--rm"]
    finally:
        A._ORIG_BUILD_ENV = orig


def test_env_seam_applies_context_mounts():
    calls = {}
    def fake(image, **kw):
        calls["image"] = image; calls["kw"] = kw
        return "ENV"
    orig = A._ORIG_BUILD_ENV
    A._ORIG_BUILD_ENV = fake
    A._CTX.current = {"image": "salvorbench-brain:r-1",
                      "mount_args": ["-v", "vol:/workspace/repo/.salvor"]}
    try:
        A._patched_build_environment("img:x", extra_run_args=None)
        assert calls["image"] == "salvorbench-brain:r-1"
        assert calls["kw"]["extra_run_args"] == ["-v", "vol:/workspace/repo/.salvor"]
    finally:
        A._CTX.current = None
        A._ORIG_BUILD_ENV = orig


# --- generic-approval fallback ----------------------------------------------

def test_question_detector_on_observed_agent_phrasings():
    # Phrasings captured verbatim from bootstrap probe #1/#2 drive streams.
    assert G.looks_like_question("Two ways forward — which do you want?")
    assert G.looks_like_question(
        "Let me know on 1 and 2, and I'll fold the approved ones into the plan.")
    assert G.looks_like_question("it changes what gets committed later, so I want "
                                 "your call. Which do you want, (a) or (b)?")
    assert not G.looks_like_question("All files scaffolded successfully.")


def test_generic_approval_is_policy_not_blanket_yes():
    low = G.GENERIC_APPROVAL.lower()
    assert "do not commit" in low
    assert "uncommitted" in low
    assert "option a" in low
    # never a bare yes that could approve arbitrary side effects
    assert not low.startswith("yes")


def test_capture_gate_outranks_generic_approval():
    """A message containing BOTH a capture gate and a free-form question must
    route to the ratifier, never the generic approval (probe #1 turn 2 shape)."""
    text = ('1. "Record this as a design decision? (yes/no)" — for item #1\n'
            "2. Add the pointer line — yes/no?\nLet me know on 1 and 2.")
    assert G.match_capture_gate(text) == "design_decision"
    assert G.looks_like_question(text)   # and it IS also a question — priority decides
