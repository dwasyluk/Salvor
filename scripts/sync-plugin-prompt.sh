#!/usr/bin/env bash
# Keep the plugin's bundled setup prompt byte-identical to the canonical one.
# The canonical SETUP_PROMPT.md at the repo root is the single source of truth;
# the Claude Code plugin bundles a copy so /salvor:init runs the exact same prompt.
#
# Usage:
#   scripts/sync-plugin-prompt.sh          # copy root SETUP_PROMPT.md -> plugin
#   scripts/sync-plugin-prompt.sh --check  # exit 1 if out of sync (for CI/pre-commit)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$ROOT/SETUP_PROMPT.md"
DST="$ROOT/claude-plugin/skills/init/SETUP_PROMPT.md"

if [[ ! -f "$SRC" ]]; then
  echo "error: canonical prompt not found at $SRC" >&2
  exit 2
fi

if [[ "${1:-}" == "--check" ]]; then
  if [[ ! -f "$DST" ]] || ! diff -q "$SRC" "$DST" >/dev/null 2>&1; then
    echo "OUT OF SYNC: bundled plugin prompt differs from SETUP_PROMPT.md." >&2
    echo "Run: scripts/sync-plugin-prompt.sh" >&2
    exit 1
  fi
  echo "In sync: $DST matches SETUP_PROMPT.md"
  exit 0
fi

mkdir -p "$(dirname "$DST")"
cp "$SRC" "$DST"
echo "Synced: SETUP_PROMPT.md -> claude-plugin/skills/init/SETUP_PROMPT.md"
