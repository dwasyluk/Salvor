#!/usr/bin/env bash
# Run one CooperBench arm over the frozen flash set.
#
# C1/C2 use the stock upstream claude_code adapter unmodified. Concurrency 4
# matches how upstream runs the benchmark for its own published figures, so
# wall-clock stays comparable within the benchmark; it is recorded in the
# manifest either way.
set -euo pipefail
cd "$(dirname "$0")/.."
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
  --redis "redis://host.docker.internal:${SALVORBENCH_REDIS_PORT:-6399}/9" \
  --agent-config conf/agent.yaml \
  --dataset-dir dataset \
  --log-dir "runs/beta/cooper" \
  --no-auto-eval
