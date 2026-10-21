# Tooling and recovery

## Pinned tools and artifacts

Review `mise.toml` and generated `mise.lock` before trusting this project with
`mise trust`. Use mise 2026.9.11, the version pinned in CI. Install with:

```bash
mise install --locked
mise exec -- pnpm --version
mise exec -- pnpm install --frozen-lockfile --ignore-scripts
```

The expected pnpm output is exactly `11.28.6`; `mise.toml`, `packageManager`, and
`engines.pnpm` must agree. Stay on pnpm 11. Node 24.19.0 and Gitleaks 8.30.1 remain
pinned; Lefthook is [2.2.2](https://github.com/evilmartians/lefthook/releases/tag/v2.2.2).
If global mise tools lack lock entries, install only the
project tools with `mise install --locked node pnpm gitleaks lefthook`.

The [supported mise lock workflow](https://mise.jdx.dev/dev-tools/mise-lock.html)
records upstream URLs and SHA-256 checksums for all four tools on `linux-x64`,
`linux-arm64`, `windows-x64`, and `windows-arm64`. Linux targets use glibc and cover
WSL and the Ubuntu CI runner; musl and macOS are not locked. Node archives come
from `nodejs.org`; the three aqua tools come from their official GitHub releases.
pnpm and Lefthook also record provenance metadata. Gitleaks on Windows ARM64
resolves to the upstream x64 archive and requires Windows x64 emulation.
Platform entries establish download coverage, not successful execution on every OS.

The aqua pnpm executable bundles its own Node runtime and can report Node 26.0.0
in engine diagnostics. `mise exec -- node --version` and
`mise exec -- pnpm exec node --version` use the project's Node 24.19.0. Keep that
pin and engine range. A probe of the npm backend with mise 2026.9.11 produced only
a version entry, without artifact checksums or a dependency graph; retain aqua.
The existing pinned mise-action supports `install_args: --locked`; neither the
action commit nor its mise version needs changing.

## Non-mutating checks

Run `mise exec -- pnpm run check` for Markdown, ESLint, JSON/YAML/schema/Bases,
links, public classification, skill provenance, regression tests, and Gitleaks.
Checks do not rewrite notes or update timestamps. The Git history scan uses
`--all`; an unborn repository reports no history yet. Working files are copied
to an ephemeral directory using Git's distributable file set before scanning.
Ignored local backups, dependencies, and credentials are not distribution inputs.
After tool and dependency installation, these checks need no registry connection.
The separate online dependency audit is:

```bash
mise exec -- pnpm run audit:dependencies
```

This runs `pnpm audit --audit-level low` across all dependencies, including dev
and optional dependencies; `--dev` alone would restrict the audit to dev packages.
It returns failure for any reported advisory or registry error. It is deliberately
outside `check`; do not add `--ignore-registry-errors`, advisory suppressions, or
an automatic `audit --fix`. See the [pnpm audit reference](https://pnpm.io/cli/audit).

No .NET SDK is needed for notes containing C# snippets. If executable .NET
projects are added in separate repositories, use their analyzers, build/tests,
and `dotnet format --verify-no-changes` there.

## Dependency security policy and updates

`pnpm-workspace.yaml` persists `ignoreScripts: true`, `blockExoticSubdeps: true`,
`minimumReleaseAge: 10080` (seven days), `minimumReleaseAgeStrict: true`, and
`minimumReleaseAgeIgnoreMissingTime: false`. Releases without publication times
fail verification. `trustPolicy: no-downgrade` passed for the installed graph
without trust exclusions. `trustLockfile: false` keeps the policy checks active
for loaded lockfiles, including frozen installs. Continue passing `--ignore-scripts`
explicitly; no dependency has lifecycle-script permission. See the official
[dependency policy](https://pnpm.io/settings/dependency-resolution) and
[script settings](https://pnpm.io/settings/build).

As reviewed on 2026-10-20, exact age exceptions retain `eslint@10.13.0` (published
2026-10-16) without changing unrelated tooling, and admit the security fix
`markdown-it@15.0.3` (2026-10-16) and its required `argparse@3.0.3` (2026-10-15).
Remove these three exceptions on or after **2026-10-24 UTC**, regenerate the
lockfile, and repeat the frozen install and audit. They do not exclude whole
packages, disable timestamp checks, or bypass trust checks.

Markdown linting calls the [markdownlint](https://github.com/DavidAnson/markdownlint#api)
engine directly from `scripts/lint-markdown.mjs`, using the rules in
`.markdownlint.json`. It lints the same distributable file set as the other checks,
skips vendored skills, and never writes files. Editors with a markdownlint
extension read the same rules. A wrapper CLI is deliberately not used:
`markdownlint-cli2` 0.23.3 depends on the unpatched
[braces advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), and
`markdownlint-cli` 0.49.1 requires vulnerable `markdown-it` and `smol-toml` ranges.

The engine's `micromark-extension-math@3.1.0` accepts only KaTeX `^0.16.0`, which
has no patched release. One parent-scoped override replaces it with 0.18.2, the
first patched release, which retains the `renderToString` API the extension uses.
Its [release notes](https://github.com/KaTeX/KaTeX/blob/v0.18.2/CHANGELOG.md)
describe changed internal APIs and CSS class prefixes; the override affects only
development linting, not Obsidian's renderer. A regression test renders inline and
block math through the override. As of 2026-10-20 the registry audit reports no
known vulnerabilities, and no advisory is suppressed.

For updates, inspect current registry advisories, upstream release notes,
publication times, trust evidence, and declared ranges. Remove the KaTeX override
once the math extension accepts a patched release. Keep direct dependency versions
exact. Regenerate through pnpm with
`mise exec -- pnpm install --lockfile-only --ignore-scripts`; review the resulting
diff, then run the frozen install, `check`, and the online audit. Investigate policy
failures before adding a justified exact-version exception; do not weaken policy
globally or run `audit --fix` blindly.

When changing tool versions, keep all pnpm pins together and regenerate artifacts
with `mise lock --platform linux-x64,linux-arm64,windows-x64,windows-arm64`.
Review every source URL, checksum, backend, and platform fallback in `mise.lock`;
never hand-author checksums. Repeat `mise install --locked` and version checks.
Locked installation may reuse already installed tools; a clean installation is
needed to exercise downloads and verification. Add any new OS target explicitly.

## Repeatable configuration

`mise exec -- pnpm run setup -- --dry-run` reports missing directories and intended
configuration changes without writing. `--apply --vault-closed` applies missing
defaults and backs up affected configuration to ignored `.local/backups/`.
It refuses conflicting existing values unless `--merge` is explicit. It never
recreates or overwrites authored notes, adjusts timestamps, or deletes modules.
The vault-closed flag is an operator assertion: close this vault's window first.
Reopen it normally after applying. Preserve other vault windows.

Every backup includes original bytes, absent-file markers, and the resulting
file hashes. Close the vault, then use `pnpm run setup -- --restore=BACKUP_ID --vault-closed`.
Restore accepts Obsidian's whitespace normalization and refuses changed setting
values since that setup run. Preview with
`--dry-run`; add `--apply` to perform the restore. Backups are local recovery
material, not an independent backup.

## Explicit-vault live check

Create ignored `.local/obsidian.json` with exactly these fields:

```json
{
  "executable": "obsidian",
  "vault": "Dev Second Brain",
  "expectedPath": "REPLACE_WITH_THE_REGISTERED_ABSOLUTE_VAULT_PATH"
}
```

For Windows Obsidian from WSL, discover the installed CLI with
`cmd.exe /D /C where obsidian`, convert its `Obsidian.com` path using `wslpath`,
and put that executable path in this ignored file. Do not guess an installation
directory. The Node wrapper starts the executable directly with an argument
array, no shell. It preserves spaces, literal content, and process exit codes,
and rejects CLI error text returned with exit status zero.

Run `mise exec -- pnpm run check:obsidian`. It verifies the reported vault path
against both the configured absolute path and this repository before proceeding.
It reads home, checks core plugin IDs and templates, backlinks, unresolved links,
and actual results from each Base view. The desktop app must be running.
Use `-- --fixtures` for temporary concept/template, daily, attachment, rename,
and backlink acceptance checks. Only agent-owned UUID paths are cleaned up;
an existing daily note is preserved. This explicit mode changes temporary files.
The read-only check is repeated after cleanup.

For a harmless clipboard image test, paste a synthetic image into an agent-owned
note and confirm Obsidian creates it under `Media`. The automated attachment test
checks configuration, file/embed resolution, and the rendered embed; it does not
claim to exercise the operating-system clipboard.

## Git hooks and CI

Before installing, review `lefthook.yml`, inspect
`git config --show-origin --get-all core.hooksPath` (exit 1 means unset), and inspect
the hooks directory reported by `git rev-parse --git-path hooks`. Preserve custom
hooks and any existing hooks path; resolve integration conflicts deliberately.
Do not use Lefthook's `--force` or `--reset-hooks-path` to overwrite that setup.
When no integration conflict remains, install explicitly:

```bash
mise exec -- lefthook validate
mise exec -- lefthook install
mise exec -- pnpm run test:hooks
```

Installation uses no dependency lifecycle scripts and does not change Obsidian
configuration. Automatic hook installation is disabled; repeat the explicit
install after reviewing configuration changes. The generated hook calls
`mise exec -- lefthook`; mise must be on the PATH used by terminal and GUI Git.
Native Windows hooks require Git for Windows' shell. Tools missing at execution
and scanner errors cause failure when the staged job runs.

Pre-commit runs exactly
`mise exec -- gitleaks git --pre-commit --staged --redact --config .gitleaks.toml`.
It scans the Git index, including content left staged after the working copy is
sanitized. Pre-push runs `mise exec -- pnpm run check`; the distributable working-tree
and all-history scans remain part of that check. `test:hooks` installs the reviewed
hooks in disposable Git repositories and proves staged-secret rejection, clean
restaging, redaction, and clear missing-tool and scanner-configuration failures.
Hook fixtures ignore user and system Git configuration so custom global hooks
remain untouched. Their synthetic staged secrets never enter this vault's index or history.
The check runner clears Git's repository-local environment variables before
launching child checks so hook context cannot redirect disposable fixture commands
to the parent repository or index.

Local hooks are bypassable (for example with `--no-verify` or `LEFTHOOK=0`) and do
not replace CI. CI never installs or invokes the vault's hooks; it asserts pnpm
11.28.6, installs locked tools and frozen dependencies without scripts, and runs
`check` and the separate registry audit. The audit still runs after a failed check
when dependency installation succeeded, and registry errors fail visibly.

Work on a local branch; review `git diff --check`, `git status`, and staged paths
before committing. The prepared GitHub workflow uses read-only permissions,
pinned action commits, locked tool artifacts, a frozen dependency lockfile, and no repository secrets. It runs
desktop-independent checks only.

Do not push or publish as part of local setup. Keep the supplied implementation
handoff ignored because it contains laptop paths. Preserve intended agent source
skills and the `.obsidian/` allowlist; ignore layouts, plugin state, and sessions.

## GitHub repository settings

These settings live on GitHub; committed files alone do not enable them. Apply
them when publishing and keep them while maintaining the repository:

- **Private vulnerability reporting:** enable it under **Settings → Advanced
  Security**. `.github/VULNERABILITY_REPORT.yml` customizes the report form, and
  the issue chooser links to `/security/advisories/new`. Watch the repository
  with **Custom → Security alerts** and enable email notifications for watched
  repositories. See GitHub's
  [setup instructions](https://docs.github.com/en/code-security/how-tos/report-and-fix-vulnerabilities/configure-vulnerability-reporting/configure-for-a-repository).
- **Issues and pull requests:** forms in `.github/ISSUE_TEMPLATE/` disable blank
  issues, and `.github/pull_request_template.md` prefills pull requests. Preview
  both after publishing.
- **Default branch and merging:** use a stable default branch such as `main`,
  enable squash merging, and make the pull request title the default squash commit
  message so Conventional Commit titles reach the history.
- **Branch protection:** require a pull request and the **check** status check
  from the **Check vault** workflow; block force pushes and deletion.
- **Actions:** allow only `actions/checkout` and `jdx/mise-action`. The workflow
  needs read-only contents permission and no secrets.
