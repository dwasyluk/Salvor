#!/usr/bin/env bash
# Run one CooperBench arm over the frozen flash set.
#
# C1/C2 use the stock upstream claude_code adapter unmodified. Concurrency 4
# matches how upstream runs the benchmark for its own published figures, so
# wall-clock stays comparable within the benchmark; it is recorded in the
# manifest either way.
set -euo pipefail
cd "$(dirname "$0")/.."
# NOTE: do not pass a host.docker.internal redis URL. ensure_redis() pings the
# URL from the HOST, where that name does not resolve, so it reports "Failed to
# start Redis" even after successfully starting one. Upstream rewrites its own
# URL for containers (rewrite_comm_url_for_container), so let it manage Redis
# unless REDIS_URL is set to something the host can actually reach.
set -a; . ./.env; set +a

ARM="${1:?usage: run_cooper.sh C1|C2|C3}"
case "$ARM" in
  C1) SETTING=solo; AGENT=claude_code ;;
  C2) SETTING=coop; AGENT=claude_code ;;
  C3) SETTING=coop; AGENT=salvor_claude_code; export COOPERBENCH_EXTERNAL_AGENTS=salvorbench.cooper.adapter ;;
  *)  echo "unknown arm $ARM" >&2; exit 2 ;;
esac

NAME="$(echo "$ARM" | tr "[:upper:]" "[:lower:]")-flash-beta"   # bash 3.2 has no ${var,,}
uv run cooperbench run \
  -n "$NAME" -s flash --setting "$SETTING" \
  -a "$AGENT" -m claude-sonnet-5 \
  --backend docker --concurrency "${CONCURRENCY:-4}" \
  ${REDIS_URL:+--redis "$REDIS_URL"} \
  --agent-config conf/agent.yaml \
  --dataset-dir dataset \
  --log-dir "runs/beta/cooper" \
  --no-auto-eval
