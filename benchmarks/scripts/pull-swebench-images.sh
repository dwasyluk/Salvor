#!/usr/bin/env bash
# Pull the 19 pytest SWE-bench eval images with bounded retries.
#
# The registry link on this host is flaky: intermittent EOF on blob transfers,
# throughput measured between 0.15 and 1.3 MB/s. `docker pull` resumes layers it
# already has, so a retry loop makes forward progress across drops instead of
# restarting from zero. macOS ships bash 3.2, so no mapfile / no arrays-from-pipe.
set -uo pipefail
cd "$(dirname "$0")/.."

NS=swebench
ATTEMPTS=${ATTEMPTS:-40}
LOG=${LOG:-runs/_pull/pull.log}
mkdir -p "$(dirname "$LOG")"

IDS_FILE=$(mktemp)
python3 -c '
import json
d=json.load(open("vendor/swebench-cl-curriculum.json"))
seq=next(s for s in d["sequences"] if "pytest" in (s.get("id") or s.get("repo","")))
for t in sorted(seq["tasks"], key=lambda t: t["continual_learning"]["sequence_position"]):
    print(t["metadata"]["instance_id"])
' > "$IDS_FILE"

total=$(wc -l < "$IDS_FILE" | tr -d " ")
echo "[$(date -u +%FT%TZ)] pulling $total images" | tee -a "$LOG"
ok=0; fail=0
while IFS= read -r id; do
  [ -n "$id" ] || continue
  img="${NS}/sweb.eval.x86_64.$(echo "$id" | sed 's/__/_1776_/'):latest"
  if docker image inspect "$img" >/dev/null 2>&1; then
    echo "[$(date -u +%FT%TZ)] CACHED $img" | tee -a "$LOG"; ok=$((ok+1)); continue
  fi
  got=0
  a=1
  while [ "$a" -le "$ATTEMPTS" ]; do
    if docker pull --platform linux/amd64 -q "$img" >>"$LOG" 2>&1; then
      echo "[$(date -u +%FT%TZ)] OK(attempt $a) $img" | tee -a "$LOG"; got=1; break
    fi
    if [ "$a" -lt 5 ]; then sleep 5; else sleep 20; fi
    a=$((a+1))
  done
  if [ "$got" = 1 ]; then ok=$((ok+1)); else
    echo "[$(date -u +%FT%TZ)] FAILED after $ATTEMPTS attempts: $img" | tee -a "$LOG"; fail=$((fail+1))
  fi
done < "$IDS_FILE"
rm -f "$IDS_FILE"
echo "[$(date -u +%FT%TZ)] done: ok=$ok failed=$fail of $total" | tee -a "$LOG"
