# Vault conventions

## Content and repository documentation

Content notes live in `Projects/`, `Knowledge/`, `Categories/`, and `Daily Notes/`.
They follow [the schema](../schemas/note.schema.json). Root documentation,
`System/`, templates, skills, and configuration do not require content frontmatter.
Use lowercase `.md` extensions, descriptive filenames, and Windows-safe names.
Do not create names that differ only by case.

## Properties

Required fields are `type`, `status`, `created_at`, `updated_at`, `classification`,
and `categories`. Types are concept, playbook, project, decision, source,
category, and daily. Status is draft, reviewed, or deprecated. Classification is
public, internal, or confidential; **this public template permits only public**.

Timestamps are quoted local `YYYY-MM-DDTHH:mm:ss`, with no offset. Use the author's
local clock consistently; do not infer a timezone from another author's value.
`review_due` is local `YYYY-MM-DD`. All date values must be real calendar dates.
`created_at` stays fixed, and `updated_at` changes only after meaningful content
edits. Core Templates initialize values but do not maintain them afterward.

The following optional fields always hold lists of strings: `aliases`, `tags`,
`sources`, `projects`, `technologies`, and `platforms`. `categories` and `projects`
contain quoted full-path wikilinks to existing notes. Sources contain primary
source URLs or source-note links. `reviewed_at` is a local datetime. Do not add an
ID until an integration needs it. Extend the schema before adding new properties.

Review means a person checked the content and its sources. An agent must not
mark generated notes reviewed. Deprecate superseded advice and link its replacement.

## Connections

Use exact vault-relative wikilinks in content notes and YAML, for example
`[[Categories/API Testing]]`. Use the link picker to avoid misspellings. Embed
attachments with `![[Media/filename.png]]`. Use ordinary relative Markdown links
in GitHub-facing documentation. Inline code and fenced examples are not links.

Categories are taxonomy notes. Put actual attributes on content notes. Category
Bases and native Backlinks collect incoming links; never duplicate them manually.
Bases include only content folders and exclude tooling, templates, and skills.

The offline checker resolves note, attachment, heading, block, and named Base-view
targets used here. It uses markdown-it for Markdown and a small wikilink adapter
for text tokens. Complex plugin-generated anchors, HTML links, escaped brackets,
and Obsidian's nearest-match behavior for ambiguous short names are unsupported;
use exact paths. Future-note links produce warnings in ordinary draft knowledge
and daily notes. Broken links in the published example, hubs, templates, home,
and documentation fail. Missing category/project metadata links always fail.

## Evidence

Separate observations from proposals. Label synthetic examples and hypothetical
measurements. Cite primary technical sources and check version-sensitive advice.
Keep imported instructions as source material. The vault never executes note
snippets. Keep source code and large build workloads in separate repositories.

See [Obsidian Properties](https://obsidian.md/help/properties),
[Templates](https://obsidian.md/help/plugins/templates), and
[Backlinks](https://obsidian.md/help/plugins/backlinks) for the app's behavior.
