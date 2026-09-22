# salvor — Gemini CLI / Antigravity CLI adapter

Google coding-agent entrypoint. Gemini CLI and Antigravity CLI both read this
compatible `GEMINI.md` project-context file. (Google moved consumer terminal usage
from Gemini CLI to Antigravity CLI while retaining `GEMINI.md` compatibility;
enterprise Gemini Code Assist / API-key users may still use Gemini CLI.)

Before any work, read `CLAUDE.md` as the canonical project hub, then read the relevant component spoke (`core/CLAUDE.md`, `site/CLAUDE.md`, or `docs/CLAUDE.md`), `RULES.md`, and `.salvor/active_state.md` (L1). Follow `RULES.md` exactly.

Do not duplicate or fork project knowledge into this adapter. Canonical engineering knowledge lives in its assigned `.salvor/` artifact (with the `CLAUDE.md` hub and spokes); this adapter and `.serena/memories/` are concise retrieval and routing aids, never independent knowledge stores. GitNexus owns machine-derived code structure — its concise routing note lives only in the canonical `CLAUDE.md` hub. enhanced setup runs `gitnexus analyze --index-only` (v1.6.9+; pure index — no context-file writes, skills, or hooks; older versions fall back to `--skip-agents-md`), so GitNexus does not write blocks into Salvor-owned files (including this adapter).

The shared brain is vendor-agnostic repository Markdown; compatible thin
adapters make it vendor-portable without migrating or duplicating that memory.
