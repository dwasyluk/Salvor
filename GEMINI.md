# salvor — Gemini CLI / Antigravity CLI adapter

Google coding-agent entrypoint. Gemini CLI and Antigravity CLI both read this
compatible `GEMINI.md` project-context file. (Google moved consumer terminal usage
from Gemini CLI to Antigravity CLI while retaining `GEMINI.md` compatibility;
enterprise Gemini Code Assist / API-key users may still use Gemini CLI.)

Before any work, read `CLAUDE.md` as the canonical project hub, then read the relevant component spoke (`core/CLAUDE.md`, `site/CLAUDE.md`, or `docs/CLAUDE.md`), `RULES.md`, and `.salvor/active_state.md` (L1). Follow `RULES.md` exactly.

Do not duplicate or fork project knowledge into this adapter. Shared truth belongs in `CLAUDE.md`, the spokes, `.salvor/`, and `.serena/memories/` — including the GitNexus code-intelligence routing, which lives only in the canonical `CLAUDE.md` hub (`.gitnexusrc` sets `skipContextFiles: true` so GitNexus does not write blocks into this adapter).
