"""A recovered transient error must not be recorded as a failure."""
from salvorbench.agent.classify import Outcome, classify


def test_recovered_rate_limit_is_not_an_infra_failure() -> None:
    """Claude Code retries transient API errors internally. Matching the error
    string in a run that then succeeded mis-labels the unit AND fabricates a
    condition-correlated infra signal - which is supposed to invalidate a
    comparison, so a false one is expensive."""
    c = classify(exit_code=0, result_subtype="success",
                 stream_text='... {"type":"error","error":{"type":"rate_limit_error"}} ... recovered',
                 patch="diff --git a/x b/x\n+ok\n")
    assert c.outcome is Outcome.COMPLETED


def test_real_auth_failure_with_no_output_is_still_infra() -> None:
    c = classify(exit_code=1, result_subtype=None,
                 stream_text="authentication_error", patch=None)
    assert c.outcome is Outcome.INFRA_FAILED and c.reason == "auth"


def test_empty_patch_with_clean_exit_is_a_real_negative() -> None:
    c = classify(exit_code=0, result_subtype="success", stream_text="", patch="")
    assert c.outcome is Outcome.BENCHMARK_FAILED


def test_missing_cli_binary_is_infrastructure() -> None:
    # S2 task 1: npm `latest` moved to a build whose native-binary postinstall
    # fails under amd64 emulation - claude never ran; that is infra, never a
    # benchmark negative.
    from salvorbench.agent.classify import classify
    c = classify(exit_code=1, result_subtype=None,
                 stream_text="Error: claude native binary not installed.\n"
                             "Either postinstall did not run (--ignore-scripts...)",
                 patch=None, timed_out=False, exception=None)
    assert c.outcome.value == "infra_failed"
    assert c.reason == "cli_install"
