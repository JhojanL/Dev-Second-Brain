# Security and privacy

This repository is a public template containing synthetic examples. Use a
separate private directory and repository before storing real work. Classification
is descriptive metadata; it does not encrypt files or control access. A Git ignore
rule does not remove files already tracked or erase repository history.

## Owner checklist

- Use OS disk encryption and an appropriate laptop account.
- Keep an independent, access-controlled backup and test restoring it.
- Store passwords and tokens in a password manager or approved secret store.
- Review attachments and screenshots for private text, metadata, and EXIF data.
- Follow employer rules before moving work into a personal vault or an AI service.
- Local Obsidian CLI access does not make a cloud AI model local. Review what you
  send and the provider's applicable account and data settings.
- If a secret enters Git, rotate it and address history. Deleting its latest copy
  alone is insufficient. Scan working files and history before publication.

Setup does not inspect or change disk encryption, backup destinations, account
policies, or cloud-sync arrangements. The existing enabled Sync core plugin does
not establish that this vault is connected to a subscription or remote vault.

## Attachments and repositories

Put note attachments in `Media/`. Keep application code and large build workloads
in their own repositories, preferably on the Linux filesystem for WSL workloads.
Review Git LFS only if media size makes it useful; it is not configured in v1.
Never commit local CLI executable paths, setup reports, agent transcripts, auth
files, or community-plugin binaries/state.

Report potential template problems using [SECURITY.md](../SECURITY.md).

## Tooling controls

The [tooling guide](Tooling.md#dependency-security-policy-and-updates) documents
script-free dependency installation, release-age and trust checks, and the scoped
security override. Run the separate registry audit as well as the offline
repository checks. Local pre-commit hooks
scan the Git index and pre-push runs the full check; hooks are bypassable and CI
runs its checks independently. Review generated artifact URLs and checksums in
`mise.lock` before locked tool installation.
