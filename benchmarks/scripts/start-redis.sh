#!/usr/bin/env bash
# Dedicated Redis for CooperBench coordination.
#
# Port 6399, not 6379: other projects on this host run their own Redis on the
# default port, and the benchmark must never disturb them. Bound to 0.0.0.0 with
# protected-mode off so task containers can reach it via host.docker.internal -
# a host-only bind is the classic silent invalidator here, degrading cooperative
# arms into two isolated solos that are still labelled cooperative.
set -euo pipefail
PORT=${SALVORBENCH_REDIS_PORT:-6399}
if redis-cli -p "$PORT" ping >/dev/null 2>&1; then
  echo "redis already listening on :$PORT"; exit 0
fi
redis-server --port "$PORT" --bind 0.0.0.0 --protected-mode no \
             --daemonize yes --save "" --appendonly no
sleep 1
redis-cli -p "$PORT" ping
