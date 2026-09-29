# Optional integration: HEAD-refresh hooks

> **Status: optional, opt-in, not part of Salvor Core.** Salvor Core installs no
> hooks, and setup never adds these. This page is for teams that want an automatic
> signal when the repository HEAD moves during an agent session. Tracking issue: #6.

## The problem

An agent loads the hub, the relevant spoke and `.salvor/active_state.md` at session
start. If HEAD moves while the session is still running, that context is stale, and
so is any GitNexus index. HEAD can be moved by the agent itself, by a teammate in
another terminal, or by an IDE. The moves that matter are a branch switch, a pull,
merge, rebase or amend, and `reset --hard`. The refresh procedure is the one in #6:
re-read the hub, spoke and L1; run the §10.2 post-pull Brain Reconcile if the move
touched a §10.2 brain surface (`.salvor/`, `VERSION.md`, `RULES.md`,
`.serena/memories/`); and run `gitnexus analyze --index-only` before relying on
impact analysis.

This integration automates the *signal*, not the refresh:

1. Git hooks append one line per HEAD move to a marker file inside the git directory
   (`<git-dir>/salvor-head-moved`). The marker is never committed.
2. At the next turn, a thin agent adapter reads the marker, deletes it, and tells
   the agent to refresh.

Without the hooks, the hookless fallback being specified in #6 still applies:
compare a (HEAD OID + branch) fingerprint at turn boundaries. The hooks add
coverage for moves made outside the agent, and they record *which* operation
happened.

## What gets marked

Verified with git 2.53 in a disposable repository:

| Operation | Marker | Hook that fires |
|---|---|---|
| normal commit | clean | (`reference-transaction`, cleared by `post-commit`) |
| `cherry-pick` | clean | same as a normal commit |
| `reset --hard <other commit>` | **marked** | `reference-transaction` |
| `reset --hard HEAD` | clean | — (the ref does not change) |
| `switch`/`checkout` to a branch, even at the same commit | **marked** | `post-checkout` (`$3=1`) |
| file checkout (`git checkout -- f`) | clean | — (`post-checkout` with `$3=0`, ignored) |
| `commit --amend` | **marked** | `post-rewrite` |
| fast-forward merge / `pull` | **marked** | `post-merge`, `reference-transaction` |
| merge commit | **marked** | `post-merge`, `reference-transaction` |
| `rebase` / `pull --rebase` | **marked** | `post-rewrite`, `reference-transaction` |
| `fetch` only | clean | — (only remote-tracking refs change) |

`reference-transaction` closes the `reset --hard` gap. It sees *every* update of the
checked-out branch ref, including ordinary commits, so `post-commit` removes the
entry for the commit that was just made. Credit for this split: @alituzun in #6.

## Install

One script handles all five hook names. Save it once, for example as
`.git/hooks/salvor-head-hook`, then copy or link it under each name:

```sh
#!/bin/sh
# Salvor optional HEAD-refresh hook (opt-in). Install the same file as
# post-checkout, post-merge, post-rewrite, post-commit and reference-transaction.
# It appends one line per HEAD move to <git-dir>/salvor-head-moved; the agent
# adapter reads and deletes that file at the next turn. Nothing is committed.
marker="$(git rev-parse --git-dir)/salvor-head-moved"
hook=$(basename "$0")
now=$(date -u +%Y-%m-%dT%H:%M:%SZ)
case "$hook" in
  post-checkout)
    [ "$3" = 1 ] || exit 0                     # file checkout: not a HEAD move
    echo "$now post-checkout $(git rev-parse --short HEAD)" >> "$marker" ;;
  post-merge|post-rewrite)
    echo "$now $hook $(git rev-parse --short HEAD)" >> "$marker" ;;
  reference-transaction)
    [ "$1" = committed ] || exit 0
    head_ref=$(git symbolic-ref -q HEAD || echo HEAD)
    while read -r old new ref; do
      [ "$ref" = "$head_ref" ] && [ "$old" != "$new" ] &&
        echo "$now reference-transaction $(git rev-parse --short "$new")" >> "$marker"
    done ;;
  post-commit)
    # An ordinary commit also moves the branch ref; drop only that entry.
    [ -f "$marker" ] || exit 0
    short=$(git rev-parse --short HEAD)
    grep -v " reference-transaction $short\$" "$marker" > "$marker.tmp"
    if [ -s "$marker.tmp" ]; then mv "$marker.tmp" "$marker"; else rm -f "$marker" "$marker.tmp"; fi ;;
esac
exit 0
```

```sh
hooks="$(git rev-parse --git-path hooks)"
chmod +x "$hooks/salvor-head-hook"
for h in post-checkout post-merge post-rewrite post-commit reference-transaction; do
  ln -s salvor-head-hook "$hooks/$h"      # or cp, if the filesystem has no symlinks
done
```

Notes:

- **Hooks are not cloned.** Every clone, and every teammate, opts in separately.
- **Existing hooks.** If `core.hooksPath` is set, or a hook manager owns the hooks
  directory (husky, lefthook, pre-commit), don't overwrite its files. Call the
  script from the existing hook instead, forwarding arguments and stdin, for
  example `"$(git rev-parse --git-path hooks)/salvor-head-hook" "$@"`. Add one entry
  per hook name. For `reference-transaction`, make sure stdin reaches the script.
- **Worktrees.** Hooks are shared across worktrees, but `git rev-parse --git-dir`
  is per worktree, so each worktree gets its own marker. A move in one worktree
  does not signal a session running in another.

## Agent adapters

### Claude Code

A `UserPromptSubmit` hook runs before every turn. Its stdout is added to the
agent's context. Save as, for example, `.claude/hooks/salvor-head-refresh.sh`:

```sh
#!/bin/sh
# Claude Code UserPromptSubmit hook: if git hooks recorded a HEAD move since the
# last turn, tell the agent to refresh Salvor context, then clear the marker.
cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0
marker="$(git rev-parse --git-dir 2>/dev/null)/salvor-head-moved"
[ -s "$marker" ] || exit 0
moves=$(tr '\n' ';' < "$marker")
rm -f "$marker"
printf '%s\n' "HEAD moved since the last turn ($moves). Before continuing: re-read the CLAUDE.md hub, the relevant component spoke and .salvor/active_state.md; if the move touched .salvor/, VERSION.md, RULES.md or .serena/memories/, run the RULES.md §10.2 post-pull Brain Reconcile; if GitNexus is in use, run gitnexus analyze --index-only before any impact-analysis claim."
exit 0
```

Register it in `.claude/settings.json` (shared) or `.claude/settings.local.json`
(personal):

```json
{
  "hooks": {
    "UserPromptSubmit": [
      { "hooks": [{ "type": "command", "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/salvor-head-refresh.sh" }] }
    ]
  }
}
```

Verified with Claude Code: after a branch switch, the next prompt received the
note and the marker was deleted. The following prompt received nothing.

### Other agents

Agents without a per-turn hook can follow a one-line rule, added to the adapter file
the team already uses (`AGENTS.md`, `GEMINI.md`):

> At the start of each turn, if `<git-dir>/salvor-head-moved` exists, read it, delete
> it, and refresh Salvor context as described in `docs/HEAD_REFRESH_HOOKS.md`.

This depends on the agent following the instruction. The fingerprint fallback in #6
is the deterministic backstop.

## Uninstall

```sh
hooks="$(git rev-parse --git-path hooks)"
for h in post-checkout post-merge post-rewrite post-commit reference-transaction salvor-head-hook; do
  rm -f "$hooks/$h"      # only if these files are the ones installed above
done
rm -f "$(git rev-parse --git-dir)/salvor-head-moved"
```

Then remove the `UserPromptSubmit` entry and `.claude/hooks/salvor-head-refresh.sh`.
If you chained into existing hooks, remove the added call lines instead of the files.

## Limits

- The marker records that HEAD moved, not what changed. The refresh procedure
  decides what to re-read.
- Moves made by the agent itself are marked too, which is intended: after its own
  `switch` or `pull`, the agent should refresh as well.
- `cherry-pick` and ordinary commits are deliberately not marked. They add a commit
  on top of the context the agent already holds.
- Prior art: git-hook-driven context switching for coding agents exists outside
  Salvor. This page only wires the signal to Salvor's refresh and §10.2 reconcile.
