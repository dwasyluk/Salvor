# Security Policy

## What Salvor is (and isn't)

Salvor is a set of files and prompts you copy into your own repository — a
repo-native memory and governance protocol for coding agents. There is **no
hosted service, no account, no telemetry**. Nothing in Salvor phones home.
Everything Salvor produces lives in your git repository, under your control.

That shape means most "security" for Salvor is about **what you and your
coding agent write into the repo**, and **which tools you choose to run
alongside it**.

## Secret handling in `.salvor/` artifacts

Salvor's capture triggers write knowledge into git-tracked files (`.salvor/`,
`CLAUDE.md`, spokes, L1/L2 caches). Treat every capture as something that will
be committed, pushed, and read by future agents and teammates.

**Never persist into Salvor artifacts:**

- API keys, passwords, tokens, or private keys
- `.env` contents or other environment secrets
- Connection strings / URLs with embedded credentials
- Customer data or other PII
- Unredacted logs, stack traces, or tool output that may contain any of the above

Redact before capture: replace secrets with placeholders (`<API_KEY>`,
`redacted`) when recording a learning, failure, or deferred finding whose
context involves credentials.

**If a secret is already committed:** adding it to `.gitignore` does **not**
remove it from history. Treat the credential as compromised — revoke/rotate it
first, then remediate git history (e.g. `git filter-repo` or BFG, followed by a
force-push and re-clone coordination with your team).

## Trust boundaries

- **MCP servers (Serena, GitNexus).** Salvor's Enhanced mode optionally uses
  these third-party tools running locally with access to your code. Salvor does
  not vet, bundle, or control them. Review what you install, pin versions where
  you can, and apply the same scrutiny you would to any local dev dependency.
- **Your coding agent and its model provider.** Repository content — including
  Salvor artifacts — is processed by whatever agent/CLI you use, under that
  provider's own terms and data-handling policies. Salvor adds no layer on top
  of this; know your provider's policy.

## Prompt injection via repository content

Salvor artifacts are, by design, **agent-readable instructions stored in the
repo**. Files like `.salvor/**`, `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, and
`RULES.md` steer what a coding agent does.

That makes them an injection surface: a malicious or careless change to these
files can direct an agent to exfiltrate data, weaken rules, or take unwanted
actions. **Review PRs that modify these files with the same rigor as code
changes** — arguably more, since their effects are indirect and easy to skim
past.

## Reporting a vulnerability

If you find a security issue in Salvor (the setup prompt, templates, docs, or
site):

1. **Preferred:** use GitHub's private vulnerability reporting — "Report a
   vulnerability" under the repository's **Security** tab.
2. **Alternative:** open a regular issue that describes the *area* of concern
   without disclosing exploit details, and ask for a private channel to share
   the rest.

Please don't post working exploits or sensitive details in public issues.
We'll acknowledge reports as quickly as we can; this is a small project, but
security reports go to the front of the queue.
