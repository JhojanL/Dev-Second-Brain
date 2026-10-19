# Reviewed agent configuration

`AGENTS.md` is the common instruction source. `CLAUDE.md` imports it using Claude's
documented `@AGENTS.md` syntax. Codex's project configuration uses `on-request`
approval and `workspace-write`; it does not pin a model, account, or global trust.
Claude's shared settings start with an empty object. Local settings stay ignored.

The three source skills in `.agents/skills/` come from a single reviewed upstream
commit recorded in [third-party notices](../THIRD_PARTY_NOTICES.md). Bundled
references and the MIT license are retained. No update command fetches new skills.
Review upstream instructions against the task and local conventions before use;
examples in a skill do not override this vault's schema or installed CLI help.

Run `mise exec -- pnpm run skills:sync -- --dry-run`, then `mise exec -- pnpm run skills:sync`
to generate ignored `.claude/skills/` copies. The ownership manifest records file
hashes. A preexisting unmanaged directory, modified generated file, or symlink
causes a clear conflict; remove or preserve your own copies deliberately first.
Unchanged copies are not rewritten. Source integrity is checked against provenance.

In a new trusted Codex project session, confirm the skill list includes
`obsidian-markdown`, `obsidian-bases`, and `obsidian-cli`. In an installed Claude
session, inspect `/skills` or invoke `/obsidian-markdown`. Existing sessions may
need restarting to refresh discovery. Do not install missing agents or start paid
model calls merely to check files. The source/adapter checks run offline; live
agent discovery is a separate human-visible check where the agent is available.

References: [Codex configuration](https://developers.openai.com/codex/config-basic/),
[Codex skills](https://developers.openai.com/codex/skills/),
[Claude memory imports](https://code.claude.com/docs/en/memory),
[Claude settings](https://code.claude.com/docs/en/settings), and
[Claude skills](https://code.claude.com/docs/en/skills).
