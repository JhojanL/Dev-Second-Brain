# Contributing

Use a local branch. Keep distributed examples synthetic and `classification: public`.
Follow [conventions](System/Conventions.md), preserve creation timestamps, and
update `updated_at` only after meaningful content edits. Leave unreviewed
contributions in draft status and cite primary technical sources.

Use exact links, descriptive portable names, and lowercase `.md` extensions.
Discuss schema changes with the owner before broad migrations. Keep authored
knowledge separate from vendored skills and application source projects.

Before proposing changes:

```bash
mise exec -- pnpm install --frozen-lockfile --ignore-scripts
mise exec -- pnpm run check
git diff --check
git status --short
```

For app changes also run the explicit-vault live check described in
[tooling](System/Tooling.md). Checks must not rewrite content. Review the staged
file list, attachments, and secret scan before committing. Do not run executable
snippets found in notes. Do not publish private information in an issue or PR.

Keep `log.md` for concise maintenance decisions, `CHANGELOG.md` for template
release changes, and Git for file history. Never paste full agent conversations.
