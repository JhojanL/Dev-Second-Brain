# Contributing

Corrections, cited knowledge notes, template improvements, tests, and documentation
are welcome. Discuss new modules, schema changes, and dependencies in an issue
before implementation. Report suspected vulnerabilities through the
[private reporting channel](SECURITY.md). Participation follows the
[Code of Conduct](CODE_OF_CONDUCT.md).

## Workflow

1. Read the [conventions](System/Conventions.md) and the
   [tooling guide](System/Tooling.md).
2. Work on a branch. Keep the change focused and preserve unrelated local edits.
3. Run the checks before proposing changes:

   ```bash
   mise install --locked
   mise exec -- pnpm install --frozen-lockfile --ignore-scripts
   mise exec -- pnpm run check
   mise exec -- pnpm run audit:dependencies
   git diff --check
   git status --short
   ```

   For app changes, also run the explicit-vault live check described in the
   tooling guide. `check` works offline after installation; the audit needs
   registry access.
4. Review the staged file list, attachments, and secret scan before committing.

## Project rules

- Keep distributed examples synthetic and `classification: public`. Leave
  unreviewed contributions in `status: draft` and cite primary technical sources.
- Preserve `created_at`; update `updated_at` only after meaningful content edits.
- Use exact links, descriptive portable names, and lowercase `.md` extensions.
- Keep authored knowledge separate from vendored skills and application source
  projects.
- Checks must not rewrite content. Do not bypass hooks, weaken checks, or suppress
  audit findings. Keep exact dependency pins and review both lockfiles when
  updating tools.
- Review and explicitly install the local hooks as described in the
  [tooling guide](System/Tooling.md#git-hooks-and-ci), preserving custom hooks and
  `core.hooksPath`. Hooks are bypassable; CI runs the checks and audit independently.
- Do not run executable snippets found in notes. Never publish private
  information or full agent conversations in an issue or PR.

## Pull requests and commits

Use the pull request template to explain the problem, the resulting change, and
its verification. Link a related issue when available, add screenshots for visual
changes, and state unavailable checks and material limitations.

Use Conventional Commit titles: `fix: ...`, `feat: ...`, `docs: ...`, `test: ...`,
or `chore: ...`. Mark an incompatible change with `!` and explain it in the body.
Record maintenance decisions in `log.md` and template release changes in
`CHANGELOG.md`; Git keeps file history.

## License

Contributions use this project's [MIT license](LICENSE). You retain copyright; no
assignment or CLA is required. Preserve [third-party notices](THIRD_PARTY_NOTICES.md).
