# Maintenance log

## 2026-10-20

- Pin pnpm 11.28.6 and Lefthook 2.2.2; retain Node, Gitleaks, mise, and action pins.
- Lock Linux and Windows tool artifacts with generated upstream checksums.
- Enforce pnpm script, source, release-age, timestamp, and trust policies; retain
  three exact age exceptions until 2026-10-24 UTC to preserve existing tooling
  and admit the Markdown parser security fix and its required dependency.
- Replace markdownlint-cli2 with the pinned markdownlint engine and a repository
  script; this removes the unpatched braces advisory with the CLI's file globbing.
  Keep one KaTeX override for the engine's math extension. The audit passes.
- Adopt the owner's open source community files: issue and vulnerability forms,
  a pull request template, Contributor Covenant 2.0, and Conventional Commit titles.
  GitHub settings are documented in the tooling guide, not applied.
- Add explicit Lefthook installation and isolated regression coverage for staged
  secrets, clean staging, missing tools, and scanner errors; retain full scans.

## 2026-10-18

- Chose a full-stack core with Design combining UX and UI; mobile and desktop are
  documented extensions.
- Kept generation in draft status and timestamps author-maintained.
- Chose native core plugins and small Bases views; no community plugin is required.
- Pinned upstream Obsidian skills and kept generated Claude copies local.
- Kept publication, a private work vault, QMD, and laptop security changes outside v1.
