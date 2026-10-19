# Dev Second Brain

An Obsidian vault for moving software from requirements through design,
implementation, testing, release, and maintenance. Start at [home](index.md) or
follow [the first-use walkthrough](START_HERE.md).

The full-stack profile includes a connected, **synthetic and unreviewed** issue
tracker project, reusable engineering notes, seven note templates, category hubs,
and Bases views. No deployment, research, or security review is claimed.

## Open the vault

Open this folder as a vault in Obsidian. Obsidian 1.14.4 is the verified desktop
version; the CLI requires an enabled, registered desktop CLI and the app running.
Open `index.md`. Notes and core Bases views work without community plugins,
Node, or an AI account. GitHub renders ordinary Markdown but does not reproduce
wikilinks, backlinks, live properties, or embedded Bases.

Use this clean template in a **separate private directory and repository** before
adding work information. Review [security guidance](System/Security.md) first.

## Repository tooling

Install [mise](https://mise.jdx.dev/getting-started.html) separately, review
`mise.toml`, and trust that project configuration with `mise trust`. Then:

```bash
mise install
mise exec -- pnpm install --frozen-lockfile --ignore-scripts
mise exec -- pnpm run check
mise exec -- pnpm run skills:sync -- --dry-run
mise exec -- pnpm run skills:sync
```

The pins are Node 24.19.0, pnpm 11.22.0, and Gitleaks 8.30.1. Dependencies stay
local. `check` lints prose and JavaScript, validates metadata and links, runs
regression tests, and scans distributable working files plus all Git history.
It fails clearly if Gitleaks is missing. No desktop app is needed for CI.

For an existing vault, preview configuration with
`mise exec -- pnpm run setup -- --dry-run`. Close its Obsidian window before
using `--apply --vault-closed`. Existing conflicting values are reported and
require the deliberate `--merge` flag. See [tooling and recovery](System/Tooling.md).

## Choose your workflow

- [First project and daily capture](START_HERE.md)
- [Full-stack, frontend, and backend profiles](System/Profiles.md)
- [Metadata, linking, and review conventions](System/Conventions.md)
- [Local CLI smoke checks and configuration restore](System/Tooling.md)
- [Reviewed Codex and Claude skills](System/Agents.md)
- [Contribution checks](CONTRIBUTING.md) and [release history](CHANGELOG.md)

MIT licensed, copyright JhojanL. The pinned Obsidian skills retain their own
[MIT attribution and provenance](THIRD_PARTY_NOTICES.md). Nothing in setup
publishes the repository, connects private data, or activates paid services.
