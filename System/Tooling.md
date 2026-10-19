# Tooling and recovery

## Non-mutating checks

Review `mise.toml`, trust this project if appropriate, and install its pinned
tools. Install dependencies with `mise exec -- pnpm install --frozen-lockfile --ignore-scripts`.
Run `mise exec -- pnpm run check` for Markdown, ESLint, JSON/YAML/schema/Bases,
links, public classification, skill provenance, regression tests, and Gitleaks.
Checks do not rewrite notes or update timestamps. The Git history scan uses
`--all`; an unborn repository reports no history yet. Working files are copied
to an ephemeral directory using Git's distributable file set before scanning.
Ignored local backups, dependencies, and credentials are not distribution inputs.

No .NET SDK is needed for notes containing C# snippets. If executable .NET
projects are added in separate repositories, use their analyzers, build/tests,
and `dotnet format --verify-no-changes` there.

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

## Git and CI

Work on a local branch; review `git diff --check`, `git status`, and staged paths
before committing. The prepared GitHub workflow uses read-only permissions,
pinned action commits, a frozen lockfile, and no repository secrets. It runs
desktop-independent checks only. It has not run on GitHub until you publish.

Do not push or publish as part of local setup. Keep the supplied implementation
handoff ignored because it contains laptop paths. Preserve intended agent source
skills and the `.obsidian/` allowlist; ignore layouts, plugin state, and sessions.
