# Security policy

## Supported versions

No release has been published. Security fixes target the default branch; older
commits are not maintained separately.

## Scope

This repository is an Obsidian vault template with Node.js maintenance scripts.
Relevant reports include:

- Scripts that write outside their documented paths, run unexpected commands, or
  mishandle local configuration and backups.
- Agent instructions or skills that could lead an agent to run untrusted content
  or expose private data.
- Checks that miss secrets or restricted content they are documented to reject.
- CI configuration that could expose credentials or run untrusted code.
- Private information accidentally published in this repository or its history.

Report suspected Obsidian vulnerabilities through
[Obsidian's security channel](https://obsidian.md/help/resources#Report+a+security+issue).
Report problems in the vendored skills upstream to
[kepano/obsidian-skills](https://github.com/kepano/obsidian-skills), and let us know
so the pinned copy can be updated.

## Report a suspected vulnerability

Use this repository's
[**Security → Advisories → Report a vulnerability**](https://github.com/JhojanL/Dev-Second-Brain/security/advisories/new)
form. Include a summary, affected files or commit, reproduction steps if known,
and possible impact. Uncertain reports are welcome; a complete exploit is not
required. If private reporting is unavailable, email
<jhojanl.contact@proton.me>.

Keep vulnerability details, credentials, and private notes out of public issues.
Reports are assessed privately, with follow-up for missing information and
coordinated disclosure after a fix where practical. No response-time guarantee
or bounty is offered.

If credentials were committed, rotate them immediately and review repository
history and every distributed copy. See [the security guidance](System/Security.md).
