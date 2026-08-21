#!/usr/bin/env bash
# Wait for S1 to finish, then run the CooperBench baseline arms.
# Sequential rather than concurrent so per-unit wall-clock stays a valid metric.
set -uo pipefail
cd "$(dirname "$0")/.."
echo "[$(date -u +%FT%TZ)] waiting for S1 to finish..."
while [ ! -f runs/beta/records/S1/units.json ]; do
  sleep 30
  if ! pgrep -f run_swecl.py >/dev/null 2>&1; then
    echo "[$(date -u +%FT%TZ)] run_swecl no longer running; proceeding"
    break
  fi
done
echo "[$(date -u +%FT%TZ)] S1 phase done; starting C1 (solo)"
bash scripts/run_cooper.sh C1 2>&1 | tail -40
echo "[$(date -u +%FT%TZ)] C1 finished; starting C2 (coop)"
bash scripts/run_cooper.sh C2 2>&1 | tail -40
echo "[$(date -u +%FT%TZ)] C2 finished"
