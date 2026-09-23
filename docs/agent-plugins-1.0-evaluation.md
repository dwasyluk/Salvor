# Agent Plugins 1.0 dual-format packaging evaluation

Evaluation date: 2026-09-23. Status: design proposal; implementation requires maintainer approval.

## Executive summary

Recommend **Option B: a portable authoring package and a generated, self-contained Claude adapter**, with two installable roots in the same repository. Keep the existing Claude marketplace source `./claude-plugin` and the `salvor` identity. A small deterministic synchronization script is sufficient; no runtime build service is needed.

Do not claim that placing two manifests into the current folder establishes conformance. The published standard requires client-specific files in reverse-domain directories; Claude uses `.claude-plugin/`. The current skill frontmatter includes nonstandard keys, and `init`/`health` additionally depend on Claude's prompt preprocessing. Those issues need explicit treatment.

The largest runtime gap is project selection. Agent Plugins has no workspace-root variable, and its default MCP working directory is the installed plugin root. Serena's `--project-from-cwd` therefore cannot safely replace `${CLAUDE_PROJECT_DIR}`. Prefer investigating explicit post-start project activation, with an appropriate Serena context, before shipping portable Serena. A wrapper cannot recover information the host never supplied.

GitNexus's command maps structurally to portable stdio, but its registry visibility, multiple-repository routing, and executable provisioning still need host validation. No host is certified for the proposed Salvor package by this evaluation.

**Invariant:** root `SETUP_PROMPT.md` remains the only installer source. Both formats bundle exact copies. Packaging never owns an adopter's knowledge: `.salvor/` stays in the adopter repository, never in plugin storage. Salvor Core remains usable without either package or MCP integration.

## 1. Baseline and evaluation method

- Issue: [upstream #3](https://github.com/dwasyluk/Salvor/issues/3).
- Fetched and checked upstream `feat/claude-code-plugin-v1`: `9604a160a51b0c571a58da1c73376265bc348d06`.
- Evaluation branch: `docs/3-agent-plugins-evaluation`, based directly on that upstream commit.
- [PR #8](https://github.com/dwasyluk/Salvor/pull/8) remains separate and open at `6a1978454dd08c0bb0deac5d7cc76c1eb76b7c61`. It is not included, amended, or modified here. Its prompt refresh and contract tests are a future integration dependency, not work to duplicate in this document.
- `ISSUE_3_AGENT_PLUGINS_EVALUATION.md` is absent from the checkout. The operator-supplied task text is the evaluation brief.
- Read manifests, marketplace, all four complete skills, companion checklist, plugin README, contributor rules, documentation spoke, and relevant existing tests/sync rules. The upstream bundled installer is stale; PR #8 addresses that independently.
- Downloaded official schemas and source snapshots into temporary storage only. No servers were started, plugins installed, indexing performed, or model behavior tested.
- Existing local Python JSON Schema/YAML libraries were used for read-only probes; no repository dependency was added. Current Claude manifest produces two portable-schema errors (missing `$schema`, disallowed keys); current MCP config produces three (missing `$schema`, two missing transport discriminators). An in-memory metadata projection and GitNexus-only MCP projection validate against the published schemas. This proves structure, not runtime compatibility.

Primary source snapshots for reproducibility:

| Source | Snapshot |
|---|---|
| Agent Plugins | Published 1.0.0; [normative specification](https://agent-plugins.org/specification) |
| Agent Skills reference implementation | [`69ef37e9424c0a7ea9dd2293b559e43ec8176379`](https://github.com/agentskills/agentskills/tree/69ef37e9424c0a7ea9dd2293b559e43ec8176379) |
| Serena source | [`b83b655cedb0c7e9b44a08246bb92241edc3d30d`](https://github.com/oraios/serena/tree/b83b655cedb0c7e9b44a08246bb92241edc3d30d) |
| GitNexus source | [`aa2d6aaf7d855f239028067af3e0724ae20ac859`](https://github.com/abhigyanpatwari/GitNexus/tree/aa2d6aaf7d855f239028067af3e0724ae20ac859) |

These upstream source commits are evidence, not dependency selections. Salvor currently uses unpinned upstream execution; the npm package resolved by `npx` is not proven identical to GitNexus's inspected `main` commit. Pin and validate actual distribution versions in a later approved phase.

## 2. Current Salvor plugin layout

```text
.claude-plugin/marketplace.json        # source: ./claude-plugin; name: salvor
claude-plugin/
├── .claude-plugin/plugin.json
├── .mcp.json
├── README.md
└── skills/
    ├── init/
    │   ├── SKILL.md
    │   └── SETUP_PROMPT.md            # generated copy of root installer
    ├── status/SKILL.md
    ├── capture/SKILL.md
    └── health/
        ├── SKILL.md
        └── HEALTH_CHECKLIST.md
```

The manifest explicitly points to `./skills/` and `./.mcp.json`. There are no Salvor plugin hooks, agents, or runtime wrappers to migrate. The four command names are `/salvor:init`, `/salvor:status`, `/salvor:capture`, and `/salvor:health`.

Serena currently launches via `uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project ${CLAUDE_PROJECT_DIR}`. GitNexus launches via `npx -y gitnexus mcp`. Both entries use argument arrays, not a shell command string.

## 3. Agent Plugins requirements and maturity

The official specification identifies **1.0.0, Published**, superseding the issue's stale Working Draft bullet. Versioned schema identifiers are immutable; schema changes require another specification release. Clients explicitly recognize supported versions/compatibility mappings. Plugin versioning is separate from format versioning; no Salvor release number should change as part of this evaluation. Distribution, marketplace installation, signing, and trust cannot be inferred from format conformance. See [specification, especially §§1 and 10](https://agent-plugins.org/specification).

Root `plugin.json` is authoritative for the portable format. Skills are immediate `skills/` children; MCP comes from root `mcp.json`. Missing component types are allowed; discovery is not recursive. A client can implement only skills or MCP and still conform, so a logo on a compatible-client list does not establish full Salvor behavior. Package files must resolve within their package root, including symlinks. See [loading and discovery](https://agent-plugins.org/client-implementers/loading-and-discovery).

**Stability gate proposed for Salvor:** target the explicit 1.0.0 identifiers, retain offline schema snapshots and hashes, test semantic constraints separately, record tested host/server versions, and require a real workspace-selection test before claiming enhanced-mode compatibility. Published format stability is adequate for static work, not evidence that every advertised host implements identical behavior.

## 4. Claude ↔ portable manifest delta

Claude's native format uses `.claude-plugin/plugin.json`, accepts explicit component paths, and can discover default component directories. The portable format has fixed paths and a closed metadata field set. Sources: [Claude plugin reference](https://code.claude.com/docs/en/plugins-reference), [portable manifest guide](https://agent-plugins.org/plugin-authors/manifest), and [manifest schema](https://agent-plugins.org/schemas/1.0.0/plugin.schema.json).

| Concept / field | Current Claude package | Agent Plugins 1.0 | Proposed mapping |
|---|---|---|---|
| Manifest location | `.claude-plugin/plugin.json` | root `plugin.json` | Separate native manifests |
| `$schema` | absent | required canonical plugin schema identifier | Add only to portable manifest |
| `name` | `salvor` | required string, constrained name | Preserve `salvor` |
| `displayName` | present | not a core field | Claude-only overlay |
| `version` | `0.1.0` | optional string | Copy selected plugin version; no release decision here |
| `description` | present | optional string | Shared metadata where appropriate; no wording assertions |
| `author` | name + URL object | optional object; only name/email/url string members | Direct mapping |
| `repository` | present string | optional string | Direct mapping |
| `homepage` | present string | optional string | Direct mapping |
| `license` | `MIT` | optional string | Direct mapping |
| `keywords` | string array | optional string array | Share product-relevant values; vendor tags need not match |
| `skills` | `./skills/` | forbidden as core field; fixed `skills/` | Omit portable path field |
| `mcpServers` | `./.mcp.json` | forbidden in portable manifest | Move declarations to root `mcp.json` |
| `extensions` | unused | optional namespace-to-object mapping | Only real, documented client namespaces |
| Marketplace | repo-root `.claude-plugin/marketplace.json` | no portable installation recipe | Retain Claude entry; host distribution configured separately |

The portable name is 1–64 characters, lowercase ASCII alphanumeric plus periods/hyphens, alphanumeric at both ends, with no consecutive periods or hyphens. `salvor` satisfies this. Optional metadata is primarily type-validated; URL/SPDX/SemVer style recommendations are not extra mandatory schema constraints.

A strict authoring validator should reject unknown portable fields. A conforming loader may report and ignore unknown top-level fields, and has special handling for malformed `extensions`; tolerance does not make the package schema-conformant. Do not use loader tolerance as a packaging strategy.

## 5. MCP delta

| Aspect | Current Salvor | Portable requirement / design consequence |
|---|---|---|
| Filename | `.mcp.json` | `mcp.json` at portable root |
| Top level | `mcpServers` | exactly `$schema` and `mcpServers` |
| Schema identifier | absent | `https://agent-plugins.org/schemas/1.0.0/mcp.schema.json` |
| Server map | `serena`, `gitnexus` objects | same named-object structure |
| Transport | implicit stdio | explicit `type: "stdio"` |
| `command` | `uvx`, `npx` | one executable token; bare name or contained `./` path |
| `args` | string arrays | same type; not a shell command |
| `env` | absent | optional string map; reserved plugin variables prohibited |
| `cwd` | absent | defaults to plugin root; cannot encode arbitrary workspace path |
| Other transports | unused | `streamable-http` or legacy `sse`, each with `url` and optional `headers` |

Remote configuration has no stdio `command`/`args`/`cwd`. Headers are literal, non-secret values; non-loopback endpoints require HTTPS. Portable OAuth credential configuration is not supplied by this format. Salvor should not invent a remote backend to work around its local-project requirement. See [MCP authoring rules](https://agent-plugins.org/plugin-authors/mcp-servers).

`PLUGIN_ROOT` is the installed package, and `PLUGIN_DATA` is client-managed writable persistent plugin state. The client supplies both. Supported placeholders expand once in argument strings, environment values, and `cwd`, never `command`, URL, or headers. Unknown placeholders remain literal. Hosts may sanitize the ambient environment. An explicit working directory must remain under the plugin or plugin-data root; an arbitrary repository root is not an allowed configured `cwd`. See [MCP runtime](https://agent-plugins.org/client-implementers/mcp-runtime).

The schemas use JSON Schema Draft 2020-12. They cannot alone establish filesystem containment, executable-token semantics, remote URL safety, or correct environment behavior. The normative text wins over a schema mismatch. Downloaded evidence hashes:

```text
plugin.schema.json SHA-256
0a4aad95ce337878ad38802ebf0daa3fde76abe3f65400c86bcbb1ec0b3ab883
mcp.schema.json SHA-256
6539175bfcdf43085855183e86da40ea94b166547a72b47ae9a0a390516d3acb
```

Sources: [plugin schema](https://agent-plugins.org/schemas/1.0.0/plugin.schema.json), [MCP schema](https://agent-plugins.org/schemas/1.0.0/mcp.schema.json). Hashes identify fetched bytes, not a new release policy.

## 6. Serena project-root analysis

### Evidence

The inspected [CLI](https://github.com/oraios/serena/blob/b83b655cedb0c7e9b44a08246bb92241edc3d30d/src/serena/cli.py#L237) makes `--project` optional. `--project-from-cwd` walks upward from the process working directory to the nearest `.serena/project.yml` or `.git` boundary, including worktree pointer files. No match leaves the project unactivated. This is not host-workspace discovery. [Running documentation](https://github.com/oraios/serena/blob/b83b655cedb0c7e9b44a08246bb92241edc3d30d/docs/02-usage/020_running.md) describes the same behavior.

Without a startup project, the [agent initialization](https://github.com/oraios/serena/blob/b83b655cedb0c7e9b44a08246bb92241edc3d30d/src/serena/agent.py#L689) does not activate one and only enables single-project mode when an active startup project exists. Explicit later activation is documented; it may implicitly create project configuration. This needs the `activate_project` tool and must respect the canonical installer's preservation and approval rules. See [project activation](https://oraios.github.io/serena/02-usage/040_workflow.html#project-activation).

A second portability issue is the context: [`ide-assistant` now aliases `claude-code`](https://github.com/oraios/serena/blob/b83b655cedb0c7e9b44a08246bb92241edc3d30d/src/serena/config/context_mode.py#L234). The [Claude context](https://github.com/oraios/serena/blob/b83b655cedb0c7e9b44a08246bb92241edc3d30d/src/serena/resources/config/contexts/claude-code.yml) contains Claude-specific tool instructions. The [generic `ide` context](https://github.com/oraios/serena/blob/b83b655cedb0c7e9b44a08246bb92241edc3d30d/src/serena/resources/config/contexts/ide.yml) is a candidate for IDE agents with native file/shell tools; it is not automatically suitable for every host. Do not silently change the existing Claude context.

### Options and verdicts

| Approach | Evidence-backed assessment | Decision |
|---|---|---|
| Keep `${CLAUDE_PROJECT_DIR}` in portable args | Unknown portable placeholder remains literal | Reject |
| Replace with `${PLUGIN_ROOT}` | Selects installation contents, potentially the Salvor package itself | Reject |
| Replace with `${PLUGIN_DATA}` | Selects plugin state, not project knowledge | Reject |
| Omit `cwd` and use `--project-from-cwd` | Walk starts in installed package; may find a cache/marketplace repository | Reject as general solution |
| Set portable `cwd` to workspace absolute path or `${WORKSPACE_ROOT}` | Neither is an allowed portable working-directory form | Reject |
| Start without `--project`; activate an explicit absolute project path afterward | Supported Serena workflow; requires host-visible repository and activation tool | Preferred experiment, not yet certified |
| MCP roots-based selection | MCP roots is a separate protocol capability; no proven automatic Serena selection path established in inspected launch code | Do not assume; investigate only if needed |
| Host-native override supplying an explicit project argument | Technically possible where a host documents it; not portable configuration | Optional adapter after validation |
| Neutral wrapper reading an explicit user configuration file | Possible design, but cannot infer active workspace or safely share a single selection across concurrent sessions | Defer unless activation is inadequate |

No wrapper is required for the explicit activation experiment. If later required, it must take validated, explicit session-scoped input, pass an argv array without a shell, reject ambiguous/missing targets, and expose its selection for verification. Do not use process-parent inspection, `PWD`, a guessed ancestor, or a global “last project” file. A wrapper that merely executes `pwd` reproduces the wrong-root problem.

Proposed experiment after approval: launch a pinned Serena with no project argument and a reviewed generic context; identify the repository through the host's trusted workspace UI/API; request or verify the exact path; activate it; confirm `get_current_config`/equivalent reports that path before code access. Repeat with two sessions, two worktrees, an uninitialized repository, and a sanitized environment. Decide whether host-native configuration is needed only from those results.

Until this succeeds, portable Core skills can ship independently of Serena. A metadata-only or skills-only artifact is not enhanced-mode parity. Do not mark the dual-format feature complete while its promised Serena behavior is unresolved.

## 7. GitNexus analysis

The native entry can map structurally to:

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",
  "mcpServers": {
    "gitnexus": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "gitnexus", "mcp"]
    }
  }
}
```

This is a schema-valid illustration, not a proposed dependency pin or a complete two-server configuration.

The [MCP CLI implementation](https://github.com/abhigyanpatwari/GitNexus/blob/aa2d6aaf7d855f239028067af3e0724ae20ac859/gitnexus/src/cli/mcp.ts#L135) initializes a registry-backed backend, starts even with no indexed repositories, and defaults to stdio. It does not run analysis at startup. It also starts a best-effort update notifier: do not equate local stdio with offline execution.

Registry location is [`GITNEXUS_HOME`, otherwise the user's home `.gitnexus`](https://github.com/abhigyanpatwari/GitNexus/blob/aa2d6aaf7d855f239028067af3e0724ae20ac859/gitnexus/src/storage/global-dir.ts). The [backend](https://github.com/abhigyanpatwari/GitNexus/blob/aa2d6aaf7d855f239028067af3e0724ae20ac859/gitnexus/src/mcp/local/local-backend.ts#L2040) accepts explicit repository selection, can select a singleton, and offers cwd-based disambiguation in selected paths. Multiple repositories are not automatically equivalent to the host's active project. Its [repository policy](https://github.com/abhigyanpatwari/GitNexus/blob/aa2d6aaf7d855f239028067af3e0724ae20ac859/gitnexus/src/mcp/repository-policy.ts) also supports configured scope/defaults.

Consequences for Salvor:

- No Claude variable is needed in this command. Changing launch cwd to the package root does not prevent registry discovery, but can change implicit selection/worktree behavior.
- Require Node/npm, `npx` resolution, accessible compatible GitNexus installation/native dependencies, indexed repository storage, and a known registry. Network may be needed for package acquisition/update checks.
- A host that sanitizes home/config variables may not see the existing index registry. Do not silently move `GITNEXUS_HOME` into `PLUGIN_DATA`: that creates a different registry and requires matching indexing configuration. An optional explicitly configured tool cache is not permission to relocate `.salvor/`.
- Prefer verified `list_repos` and an explicit unambiguous repository argument for multi-repo operations. Validate each host's identity and filesystem view.
- Package containment does not prevent the server from reading repository/index paths outside the package; that is runtime access requiring host policy. Restricting scope is a separate reviewed configuration decision.

The command is easier to translate than Serena's, but **schema-compatible is not zero-configuration runtime parity**. The source comment “no longer depends on cwd” describes startup; backend routing still uses cwd in some cases. Record that distinction rather than overstating the comment.

## 8. Agent Skills and frontmatter delta

The current [Agent Skills specification](https://agentskills.io/specification) requires `name` and `description`, defines optional `license`, `compatibility`, `metadata`, and experimental `allowed-tools`, and permits relative resource references. It does not assign portable semantics to Claude invocation controls. The [reference validator](https://github.com/agentskills/agentskills/blob/69ef37e9424c0a7ea9dd2293b559e43ec8176379/skills-ref/src/skills_ref/validator.py#L15) rejects other top-level keys. This reference is not versioned as “Agent Plugins 1.0”; pin its revision separately.

| Field | Current use | Classification | Proposed action |
|---|---|---|---|
| `name` | all four | portable-standard | Keep; directory agreement and length/character checks |
| `description` | all four | portable-standard | Keep; nonempty, ≤1024 characters |
| `allowed-tools` | all four; comma-separated Claude tool names/patterns | portable-standard field, experimental; current value is host-dependent | Preserve in Claude overlay; omit portable preapproval initially |
| `argument-hint` | init, capture | Claude-specific | Keep in Claude overlay only |
| `user-invocable` | all four, true | Claude-specific | Preserve Claude behavior in overlay |
| `disable-model-invocation` | all four, false | Claude-specific | Preserve Claude behavior in overlay |
| `license` | absent | portable-standard, optional | Optional later; not needed for validity |
| `compatibility` | absent | portable-standard, optional | Candidate for concise filesystem/runtime prerequisites |
| `metadata` | absent | portable-standard extension container | May describe extensions; does not implement invocation policy |

No currently used field is a demonstrated cross-host portable extension beyond the standard itself. Moving a Claude flag under `metadata` only preserves data; it does not make another host enforce it. Tool identifiers and permission matching need client evidence. The standard describes a space-separated `allowed-tools` string; do not assume the current commas or Bash permission patterns have equivalent meaning elsewhere.

All four current names meet the portable naming constraints. Descriptions are 250 (`init`), 225 (`status`), 238 (`capture`), and 307 (`health`) characters. All four nevertheless fail the reference allowed-field set because of Claude-only keys. Claude explicitly documents these as extensions and accepts the portable subset. See [Claude skill portability guidance](https://code.claude.com/docs/en/skills#using-skill-frontmatter-outside-claude-code).

## 9. Skill-body portability

Claude preprocesses `!`-backtick commands and substitutes `${CLAUDE_SKILL_DIR}`; these are not standard Markdown execution rules. The variable is not a guaranteed environment variable in a portable host's shell. The standard allows Markdown bodies without promising to execute embedded snippets. A fallback conditional on empty injected output does not ensure another host reads the companion. See [Claude dynamic context and substitutions](https://code.claude.com/docs/en/skills#inject-dynamic-context).

| Skill | Body classification now | Required design treatment |
|---|---|---|
| `init` | **Claude-specific wrapper required** for current injection behavior; not portable unchanged | Shared body should directly request reading the bundled relative installer before any action. Retain optional Claude injection only in a generated adapter if needed. |
| `status` | **Portable with small wrapper** | Ordinary repository reads; replace cross-command assumptions with capability names plus a Claude invocation hint. Host must provide repository file access. |
| `capture` | **Portable with small wrapper** | Ordinary Markdown directing execution of repo `RULES.md`; same cross-command caveat and explicit approval behavior. |
| `health` | **Claude-specific wrapper required** for current injection behavior; not portable unchanged | Read checklist by explicit skill-relative reference; optional injection belongs only to Claude adapter. |

None of the complete current SKILL.md files is certified fully portable because every file also has nonstandard frontmatter. The two plain bodies do not need a runtime executable wrapper; “small wrapper” here means a narrow instruction/metadata adaptation.

There is also existing semantic drift to address separately during approved wrapper normalization: init's closing paragraph says to commit and run bare `gitnexus analyze`, while the current canonical installer gates commits and indexing; status/capture/health still refer to older numeric failure identifiers and assumptions about counters/generated GitNexus blocks. Do not fix this by duplicating new protocol rules into skills. Make the wrapper defer to the repository's authoritative rules and installer. This evaluation does not rewrite those behaviors.

Portable reference convention: `[SETUP_PROMPT.md](SETUP_PROMPT.md)` and `[HEALTH_CHECKLIST.md](HEALTH_CHECKLIST.md)`, explicitly relative to the loaded skill directory. Repository files are resolved separately against the verified active repository. Confusing those two roots would make the package inspect or modify itself.

## 10. Three packaging options

### Option A — shared folder with two manifests and two MCP files

```text
claude-plugin/
├── plugin.json
├── mcp.json
├── skills/
├── .claude-plugin/plugin.json
└── .mcp.json
```

Advantages: smallest filesystem duplication, stable Claude marketplace source, simple metadata comparisons. Risks: shared skills must drop or isolate Claude-only syntax; two MCP files invite accidental equality assumptions despite different runtime semantics.

More importantly, [Agent Plugins client-extension rules](https://agent-plugins.org/plugin-authors/client-extensions) put client-specific files under reverse-domain roots. `.claude-plugin` and `.mcp.json` are not such roots. **Strict reading of the normative rule makes this layout indefensible as a conformant package without clarification.** A tolerant host may load it, but that is a compatibility observation rather than a conformance argument. Inventing `com.anthropic` does not make Claude discover it; namespace behavior belongs to the client. Revisit A only if official specifications document coexistence or Claude supports the extension location.

### Option B — portable authoring package, generated Claude distribution

```text
agent-plugin/                         # independently installable portable root
├── plugin.json
├── mcp.json                          # only after each entry passes its gate
└── skills/                           # authored portable wrappers/resources

claude-plugin/                        # existing independently installable root
├── .claude-plugin/plugin.json         # generated metadata + native overlay
├── .mcp.json                          # generated from common data + native overrides
├── README.md
└── skills/                           # generated copies + narrow Claude overlays

scripts/plugin-adapters/claude.json   # build input, outside portable package
scripts/sync-plugin-packages.mjs      # proposed deterministic sync / --check
SETUP_PROMPT.md                       # canonical installer, above both roots
```

Advantages: clear conformance boundary; no invented client namespace; portable capability content is authored once; independent adapter evolution; no installer-time build. Costs: checked-in duplicate distribution bytes, small generation tool, explicit edit-source conventions. Consumers install one root, never the whole repository as a portable plugin. All generated copies remain inside their respective root: no cross-root symlinks.

### Option C — Claude source, generated portable distribution

Keep authoring `claude-plugin/`; generate `agent-plugin/` by projecting metadata, deleting unsupported frontmatter, and transforming bodies/MCP configuration.

Advantages: easiest contributor transition, preserved Claude workflow, deterministic output possible with explicit templates and fail-closed allowlists. Risks: string-stripping cannot infer correct semantics; deleting `${CLAUDE_PROJECT_DIR}` does not solve project selection; new Claude features can silently outgrow portable equivalents. Reject unknown input extensions instead of silently dropping them. Suitable as a short transition, not the long-term ownership model: portable behavior must not be a lossy export from one vendor.

| Criterion | A | B | C |
|---|---|---|---|
| Strict portable layout defensible now | unresolved | yes, separate roots | yes, separate generated root |
| Authored skill-body duplication | low if normalized | none | none, but transforms can diverge |
| Distributed bytes duplicated | low | yes, controlled | yes, controlled |
| Claude backward path stability | yes | yes | yes |
| Vendor divergence | difficult in shared SKILL.md | explicit overlays | transformation grows fragile |
| Deterministic CI | straightforward but insufficient for layout conflict | small generator + schemas + parity | generator + stronger semantic review |
| Contributor overhead | low initially | moderate, clear source ownership | low initially, increases with divergence |

## 11. Recommended architecture and synchronization

Choose **B**, retaining `claude-plugin/` as the stable Claude distribution path. “Portable canonical” means canonical packaging/wrapper source only. It never means canonical installer, governance, or engineering knowledge.

The final portable root should contain exactly the four named skill directories and their companions, with neutral bodies and portable frontmatter. The generated Claude directories retain the four existing names and invocation/permission metadata. Prefer identical normalized Markdown bodies in both outputs. If Claude injection must remain, generate only a small explicit prelude; test the remaining body against the portable source. Do not maintain two hand-edited copies.

Keep `agent-plugin/plugin.json` as portable identity metadata. Generate the Claude manifest by copying an explicit shared-field allowlist and applying the narrow native overlay (`displayName`, component paths). Make server-specific differences explicit in that overlay rather than generic placeholder substitution. A new portable integration must not silently replace the working Claude Serena entry.

Proposed authoring workflow:

1. Edit portable wrapper content/metadata or the explicit Claude overlay; edit only root `SETUP_PROMPT.md` for installer changes.
2. Run existing `scripts/sync-plugin-prompt.sh`, extended in an approved implementation to populate both bundled prompt destinations directly from root. It remains the prompt synchronization owner.
3. Run the small package sync script for other generated artifacts. It must not overwrite prompt outputs or regenerate core rules.
4. Review both output diffs; run schema, semantic, parity, and sync checks. Commit generated files with their inputs so users need no build step.

The script should have fixed inputs/outputs, stable JSON formatting, no timestamps, network, package installation, or protocol inference. `--check` computes expected bytes and exits nonzero without writing. Unknown adapter fields fail closed. Do not use broad recursive copying that could ship `.salvor/`, caches, credentials, or unrelated files.

Manual dual manifests with JSON comparisons would suffice for the few metadata values alone. They do not solve duplicated skill bodies or incompatible frontmatter. A single small generator is justified for those; a templating framework, bundler, or generic plugin build system is not.

The existing prompt script and PR #8's tests should be integrated normally into the WIP branch first. Extend their intended contracts in the implementation PR, not in PR #8. CI must explicitly include the WIP target branch (or an approved unfiltered PR trigger) for future evaluation/implementation checks: current CI filters only `main` and `dev`, so targeting the WIP branch does not run it automatically.

## 12. Compatibility matrix

Labels refer to **Salvor behavior**, not a vendor badge. “Confirmed” below qualifies only the specific documented native capability. No end-to-end dual-format run was performed. The [Agent Plugins client list](https://agent-plugins.org/compatible-clients) is discovery evidence; host documentation and runtime tests control the actual claim.

| Host / surface | Official capability evidence | Salvor classification and remaining gate |
|---|---|---|
| Claude Code | [Native plugin paths, skills, MCP](https://code.claude.com/docs/en/plugins-reference) | **confirmed** native packaging mechanism; existing wrapper syntax documented. Proposed generated adapter is **spec-compatible but untested** against that native format. Portable-root loading is **unknown**, not assumed. Preserve names, installation path, context, approval behavior. |
| Codex local CLI/app | [OpenAI portable packaging](https://developers.openai.com/plugins/build/plugins) and [standard client components](https://agent-plugins.org/compatible-clients) | **host-specific work required** for complete enhanced behavior: neutral skills, repository activation, registry/environment validation. Proposed Core-only portable package is **spec-compatible but untested**. CLI/app workspace behavior must be tested separately. |
| ChatGPT | [Plugin packaging](https://developers.openai.com/plugins/build/plugins); [connection/testing workflow](https://developers.openai.com/plugins/deploy/connect-chatgpt) | **host-specific work required**. General local checkout access and launching these two tools are not established across web/desktop/Work surfaces. A documented tunnel/remote connection route is not a turnkey local stdio install, and creating a hosted backend is out of scope. Ordinary chat-only use of these local tools is **unsupported by this proposed artifact**; do not claim all ChatGPT surfaces unsupported. |
| GitHub Copilot CLI/app | [Agent Plugins 1.0 and fixed paths](https://docs.github.com/en/copilot/concepts/agents/about-plugins) | **spec-compatible but untested** for normalized Core skills; **host-specific work required** for the full two-server profile. Validate CLI/app separately; do not extrapolate to every Copilot surface. |
| VS Code / Copilot | [Agent Plugins, native-format coexistence, skills/MCP](https://code.visualstudio.com/docs/agent-customization/agent-plugins) | **spec-compatible but untested** Core; **host-specific work required** enhanced. Test multi-root, remote/container and local cases, workspace trust, and correct server filesystem. |
| Cursor | [Agent Plugins support and variable caveat](https://cursor.com/docs/plugins#the-agent-plugins-standard) | **host-specific work required**. Docs explicitly say `${PLUGIN_ROOT}`/`${PLUGIN_DATA}` are not expanded in `mcp.json`; `${CURSOR_PLUGIN_ROOT}` is not a portable fix. A no-placeholder profile may avoid this particular limitation but remains untested. |
| Kiro | [Powers use root plugin.json, skills/, mcp.json, dev.kiro/](https://kiro.dev/docs/powers/) | **spec-compatible but untested** Core; **host-specific work required** enhanced. Verify activation lifecycle, repository context and local runtime dependencies; do not assume identical behavior for every Kiro product surface. |

The table intentionally contains no unconditional “Salvor supported on all launch clients” statement. OpenAI's package docs explicitly describe a portable root plus `extensions.com.openai`, while other API-specific examples still show legacy `.codex-plugin` layouts; use the documentation for the chosen product surface, not interchangeable examples.

## 13. Security considerations

These are review findings and proposed test requirements, not implemented changes.

| Boundary | Risk | Design constraint / validation |
|---|---|---|
| Skill shell preprocessing | Claude injection executes a shell command before the model reads the skill | Prefer direct resource reads in portable bodies; verify retained native injection and quoting separately |
| `npx -y` / `uvx --from` | Downloads and executes third-party code; existing refs drift | Review immutable package/ref selection and reproducible prerequisites in implementation; do not describe startup as offline |
| Bare executable resolution | PATH can select an unexpected executable; Windows launch semantics differ | Verify resolved executable and version per host; keep executable and argv separate |
| Package paths | Traversal, symlinks, junctions, accidentally shipping sibling files | Realpath containment checks; independently extracted-package tests; fixed output allowlist |
| Plugin root | Installed cache can be read-only or replaced on update | Read packaged files there; no project selection from installation location |
| Plugin data | Writable persistent cache can hold stale selection or secrets | No canonical knowledge or global last-project pointer; no embedded credentials |
| Project-root injection | Untrusted input, spaces/metacharacters, wrong worktree, concurrent sessions | Explicit verified absolute path; argv APIs; no shell interpolation or ancestor guessing |
| Ambient environment | HOME/PATH/config visibility differs; inherited secrets may reach child processes | Document dependencies; avoid mandatory unspecified variables; test a sanitized environment |
| Untrusted repository | Instructions/configuration can induce actions outside intent | Treat files as data; maintain approval boundaries and inspect activation side effects |
| Serena activation | May create configuration; trusted activation commands can execute shell code | Reuse existing state and honor installer approval. Inspect pinned version and project trust before activation |
| GitNexus registry | A global registry exposes more than the active repository | Test explicit selection and scope; do not treat a read-only skill prompt as an access-control boundary |
| Server capabilities | MCP tools may edit or execute more than status/health needs | Review actual exposed tools, host permissions and server scope independently of prose |
| Extensions | Ignored metadata provides no enforcement | Never encode mandatory safety behavior solely in an optional extension |

Package path containment is **not a subprocess sandbox**. A valid config can launch software with user-level filesystem/network access. The inspected [Serena activation implementation](https://github.com/oraios/serena/blob/b83b655cedb0c7e9b44a08246bb92241edc3d30d/src/serena/agent.py#L1475) gates configured activation shell commands on project trust; packaging must not bypass that gate. Nothing here adds telemetry, authentication services, or hosted infrastructure.

## 14. Backward compatibility

Preserve these interfaces:

```text
/plugin marketplace add dwasyluk/salvor
/plugin install salvor
/salvor:init
/salvor:status
/salvor:capture
/salvor:health
```

Retain marketplace identity, `source: ./claude-plugin`, `.claude-plugin/plugin.json`, native `.mcp.json`, four directory/frontmatter names, and companion paths. Generated outputs must be committed and fully self-contained. Do not make Claude installation depend on installing `agent-plugin/`, running a build, or following sibling symlinks. Claude's [cache/path rules](https://code.claude.com/docs/en/plugins-reference#path-traversal-limitations) make self-contained artifacts the safer compatibility boundary.

No user knowledge migration is needed. The second format is an optional distribution choice. Skill invocation UI outside Claude is host-specific; capability parity does not guarantee `/salvor:*` spelling everywhere. Cache-refresh and release-number decisions remain with maintainers. Preserve current native permissions until an independently reviewed behavioral change is approved.

## 15. Conformance-test plan (before implementation)

Tests should separate package validity, generated-output parity, and actual host execution. Use Node's existing test runner for local contracts. Do not substitute a regex-only frontmatter checker for complete YAML conformance.

| Layer | Positive checks | Negative/regression cases |
|---|---|---|
| Portable manifest | root file; JSON object; required name/schema; all permitted field types; matching schema version | missing schema/name, invalid names, unknown core fields, invalid author members/extension shapes |
| Skills | exactly the four intended capabilities; valid YAML; standard keys; name-directory equality; description constraints; companions present | duplicate keys, malformed YAML, Claude-only top-level fields, missing/escaping companion, accidental new capability |
| Skill bodies | required direct relative resource references; no Claude variables or dynamic injection in portable bodies | unresolved `${CLAUDE_*}`, injection snippets, references resolved against workspace instead of skill root |
| MCP | correct schema; named entries; explicit transport; closed transport variants | missing type, mixed HTTP/stdio fields, shell-string command, reserved env names, unsupported workspace placeholders |
| Path/expansion | contained roots; literal argv; permitted cwd forms; plugin/data semantics | `../`, external symlink/junction, absolute workspace cwd, recursive substitution, command expansion |
| Cross-format metadata | stable identity/shared selected version; exactly four capability names | accidental renaming, wrong marketplace source, silently dropped unknown overlay field |
| Cross-format bodies | generated body or narrowly defined prelude + byte-identical common body | edited generated output; companion drift; vendor logic leaking into common body |
| Installer invariant | root installer equals both bundled copies as bytes | one-byte change, missing file, newline/BOM drift |
| Generation | regeneration has no diff; `--check` is read-only; explicit file inventory | stale outputs, nondeterminism, unexpected files, accidental caches/knowledge capture |
| Isolated artifacts | copy each package alone outside Git checkout; resolve every bundled reference | hidden dependency on repository root, developer HOME, sibling package, or network schema lookup |

Use vendored, hash-recorded official schemas with a pinned Draft 2020-12 validator. A small development-only validator dependency is defensible for full schema support; prefer an existing repository-compatible tool if available, and never implement an incomplete JSON Schema engine. Pin the Agent Skills reference validator or a reviewed YAML/schema equivalent for conformance. The exact tooling choice remains a maintainer decision. Keep CI runtime offline after dependency provisioning; no MCP launches or third-party availability checks in unit tests.

Not every conformance rule is captured in JSON Schema. Add semantic tests for executable tokens, filesystem containment and expansion behavior in any adapter code we actually introduce. For external clients, use a harmless local fake stdio server that records cwd/argv/environment in a temporary fixture, without reading secrets. That validates the host contract; do not build an unused Salvor runtime loader just to test the standard.

Server profile tests should be phase-aware. While Serena is gated, explicitly assert the experimental inventory and report missing enhanced parity. Once both integrations ship, require `serena` and `gitnexus` in both formats and test their intentional differences. Never silently declare a reduced package equivalent to the full one.

Approved host integration tests should then verify install/discovery, exactly four skills, companion reads, preflight approvals, no automatic commits/indexing, read-only status/health, capture delegation to repo rules, Serena activation, GitNexus repository selection, two simultaneous workspaces, package upgrades, and denied/missing MCP dependencies. Record exact versions and evidence; do not assert LLM wording as a static contract.

## 16. Proposed implementation phases

**Phase 0 — accept design and conformance boundary.** Decide whether two package roots are acceptable. Resolve any insistence on one-folder packaging with the standard maintainers before claiming conformance. Choose initial host surfaces and dependency-validation versions. Integrate PR #8 separately through its existing review.

**Phase 1 — static portable metadata and validation foundation.** Add portable identity metadata, vendored schemas, and focused conformance fixtures in a new implementation PR. Add early CI checks with an explicit WIP-branch trigger. Exercise a GitNexus stdio projection and a Serena fixture without publishing a claim of working enhanced mode. Keep native files functional; do not release a root manifest over known-invalid skills as a completed package.

**Phase 2 — portable skill sources and deterministic Claude adapter.** Normalize only wrapper boundaries: portable frontmatter, direct resource reads, neutral invocation references, and delegation to authoritative installer/rules. Preserve Claude metadata via overlays. Generate the self-contained Claude package, extend the existing prompt sync mechanism to both destinations, and prove regeneration and isolated-artifact tests. A Core-only preview may be considered only if clearly labeled and approved; it is not full feature completion.

**Phase 3 — prove workspace and server behavior.** Test pinned Serena's no-startup-project activation with an appropriate context and verified host workspace; check side effects, project switching, and concurrent sessions. Verify GitNexus registry, explicit repository routing, sanitized environment and worktree behavior. Only then add final portable MCP declarations. Introduce a client-neutral wrapper or host extension only if these tests establish a concrete unmet need and a reliable input channel.

**Phase 4 — host validation and compatibility claims.** Validate Claude native install/update first, then selected local portable hosts (proposed first pair: Codex CLI and VS Code). Expand to Copilot CLI/app, Kiro and Cursor with documented limitations. Evaluate ChatGPT surfaces separately; do not create a hosted workaround. Publish a versioned evidence matrix, not a launch-client blanket claim.

**Phase 5 — maintainer-controlled distribution.** Confirm unchanged Claude install commands and marketplace source, review scopes/security/dependency provisioning, and choose release/distribution policy separately. No phase authorizes changing Salvor Core, capture semantics, adopter storage, release auditor policy, or version numbers without its own approval.

## 17. Open maintainer decisions and evidence limits

1. Accept two self-contained roots (recommended B), or require an official exception/host change for A? Reverse-domain extension semantics cannot be invented locally.
2. May the portable package initially omit Serena as an explicitly incomplete preview, or must the first released portable artifact have two-server parity? Recommendation: gate the complete feature on Phase 3.
3. Accept explicit post-start Serena activation and a reviewed generic context, or require host-native startup selection? No automatic workspace inference has been established.
4. Which pinned Serena/GitNexus distributions and OS/runtime combinations define the supported baseline? Source inspection is not an installed-version test.
5. Which host surfaces are first-class? A local CLI, remote IDE, desktop workspace, and chat-only surface have different filesystem boundaries.
6. Preserve Claude dynamic injection through an overlay or normalize both bodies to direct reads? Prefer common bodies if host tests preserve behavior; retain the option of a narrow native prelude.
7. Which lightweight schema/YAML validator becomes the development dependency, and how are specification snapshots refreshed?
8. Which GitNexus repository access scope and registry strategy should enhanced installations use? Do not silently migrate existing indexes or widen access.
9. Should CI target the plugin WIP branch specifically or all PR branches? PR #8 remains out of this task.
10. Existing wrapper-to-protocol drift needs an explicit, narrow correction scope during Phase 2; do not use packaging work to redesign the protocol.

Recorded discrepancies: issue #3 still says Working Draft although the official format is Published; Salvor's `ide-assistant` name now resolves to a Claude-specific Serena context; GitNexus startup is cwd-independent but some routing is not; Cursor documents missing standard variable expansion despite advertising Agent Plugins support; JSON schemas intentionally cannot encode every runtime rule. The Agent Skills reference validator allows Unicode names while the plugin manifest constrains its own name to ASCII; Salvor's ASCII names avoid the ambiguity. No release-policy adjustment or runtime workaround has been made.

## 18. Evaluation completion record

This document provides the design and test plan, not implemented packaging. Only this documentation file is added on the evaluation branch. No manifests, skill bodies, MCP configs, protocol files, `.salvor/`, examples, benchmarks, site assets, release versions, or PR #8 files were changed. No commit or push was made. Runtime conformance and host certification remain implementation-phase gates.
