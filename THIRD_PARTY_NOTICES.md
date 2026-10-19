# Third-party notices

## Obsidian skills

The source directories `obsidian-markdown`, `obsidian-bases`, and `obsidian-cli`
under `.agents/skills/` are unmodified copies from
[kepano/obsidian-skills](https://github.com/kepano/obsidian-skills) at commit
[`3ccff5338ea700537839b21900aa5358a0402c98`](https://github.com/kepano/obsidian-skills/commit/3ccff5338ea700537839b21900aa5358a0402c98),
reviewed on 2026-10-18. Their bundled Markdown references are retained.

Copyright (c) 2026 Steph Ango (@kepano). MIT licensed. The full upstream license
is in `.agents/skills/LICENSE`, and `provenance.json` records SHA-256 hashes for
every vendored file. Only these three essential skills are included; there is
no remote auto-update mechanism. Claude copies are generated and ignored.

## Repository tools

Development dependencies are pinned in `package.json` and `pnpm-lock.yaml` and
are installed separately, not copied into this repository. Their respective
licenses apply. Gitleaks is installed separately through its project mise pin;
it is not bundled. CI actions are pinned to reviewed upstream revisions.

Technical sources are linked from notes and documentation. Those references do
not imply endorsement by their authors. Original template content is covered by
the root MIT license.
