#!/usr/bin/env bash
# Score a completed CooperBench arm with upstream's own deterministic evaluator.
# Run separately from execution so a scoring failure never destroys agent work
# that cost real money to produce.
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; . ./.env; set +a
ARM="${1:?usage: eval_cooper.sh C1|C2|C3}"
NAME="$(echo "$ARM" | tr '[:upper:]' '[:lower:]')-flash-beta"
uv run cooperbench eval -n "$NAME" -s flash \
  --backend docker --concurrency "${EVAL_CONCURRENCY:-6}" \
  --dataset-dir dataset --log-dir runs/beta/cooper
