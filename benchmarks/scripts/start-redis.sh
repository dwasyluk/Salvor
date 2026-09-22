#!/usr/bin/env bash
# Dedicated Redis for CooperBench coordination.
#
# CooperBench starts and manages its own Redis on 6379 (container
# `cooperbench-redis`), so this script is only needed if that container is absent
# or you want a host-side instance. Verified 6379 is free on this host: the other
# project's Redis container publishes no host ports, so there is no collision. Bound to 0.0.0.0 with
# protected-mode off so task containers can reach it via host.docker.internal -
# a host-only bind is the classic silent invalidator here, degrading cooperative
# arms into two isolated solos that are still labelled cooperative.
set -euo pipefail
PORT=${SALVORBENCH_REDIS_PORT:-6379}
if redis-cli -p "$PORT" ping >/dev/null 2>&1; then
  echo "redis already listening on :$PORT"; exit 0
fi
redis-server --port "$PORT" --bind 0.0.0.0 --protected-mode no \
             --daemonize yes --save "" --appendonly no
sleep 1
redis-cli -p "$PORT" ping
