# Dev Second Brain

An Obsidian vault template for the software development lifecycle: requirements,
design, implementation, testing, release, and maintenance.

It includes:

- A connected example project, a **synthetic and unreviewed** issue tracker, with a
  brief, requirements, an architecture decision, API design, test plan, and
  release and operations notes.
- Reusable engineering notes for architecture, backend, frontend, design, testing,
  security, and delivery.
- Seven note templates, category hubs, and Bases views driven by typed metadata.
- Repository checks for Markdown, metadata, links, and secrets, plus reviewed
  instructions and skills for coding agents.

Everything uses core Obsidian features. No community plugins, Node.js, or AI
account is needed to use the vault.

## Get started

1. Clone or download this repository.
2. Open the folder as a vault in Obsidian. Desktop 1.14.4 is the verified version.
3. Open `index.md`, or follow the [first-use walkthrough](START_HERE.md).

> [!IMPORTANT]
> Keep real work in a separate private copy. This template is public, and its
> checks reject non-public classifications. Read the
> [security guidance](System/Security.md) before adding work information.

GitHub shows the notes as plain Markdown. Wikilinks, backlinks, live properties,
and embedded Bases need Obsidian.

## Repository tooling

The tooling is needed only to run checks or contribute. Install
[mise](https://mise.jdx.dev/getting-started.html) 2026.9.11, review `mise.toml`
and `mise.lock`, run `mise trust`, then:

```bash
mise install --locked
mise exec -- pnpm install --frozen-lockfile --ignore-scripts
mise exec -- pnpm run check
```

mise installs the pinned Node.js 24.19.0, pnpm 11.28.6, Gitleaks 8.30.1, and
Lefthook 2.2.2. Dependency lifecycle scripts stay disabled.

`check` lints Markdown and JavaScript, validates metadata, links, and Bases, runs
regression tests, and scans working files and Git history for secrets. It works
offline after installation and never rewrites notes. Other commands, each run
with `mise exec --`:

| Command | Purpose |
| --- | --- |
| `pnpm run audit:dependencies` | Audit all dependencies against registry advisories (needs network) |
| `pnpm run setup -- --dry-run` | Preview missing folders and Obsidian configuration changes |
| `pnpm run skills:sync -- --dry-run` | Preview generated Claude copies of the reviewed skills |

Optional Git hooks scan staged changes for secrets before each commit and run
`check` before each push. Review and install them as described in the
[tooling guide](System/Tooling.md#git-hooks-and-ci).

## Documentation

- [Start here](START_HERE.md): follow the example and create your first notes.
- [Profiles](System/Profiles.md): full-stack, frontend, and backend setups.
- [Conventions](System/Conventions.md): metadata, linking, and review rules.
- [Tooling and recovery](System/Tooling.md): checks, setup, restore, and CI.
- [Agent configuration](System/Agents.md): Codex and Claude instructions and skills.
- [Changelog](CHANGELOG.md): changes to the template.

## Contributing and support

Report bugs and suggest improvements through the repository's issue forms.
Report suspected vulnerabilities privately as described in the
[security policy](SECURITY.md). Read [CONTRIBUTING.md](CONTRIBUTING.md) before
opening a pull request. Participation follows the
[Code of Conduct](CODE_OF_CONDUCT.md).

## License

[MIT](LICENSE), copyright JhojanL. The vendored Obsidian skills keep their own MIT
license and provenance; see [third-party notices](THIRD_PARTY_NOTICES.md).
