---
type: playbook
status: draft
created_at: 2026-10-18T18:57:57
updated_at: 2026-10-18T18:57:57
classification: public
categories:
  - "[[Categories/Security]]"
  - "[[Categories/Backend]]"
sources:
  - https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html
---

# Authorization and threat modeling

## Establish boundaries

List assets, actors, entry points, trust boundaries, and abuse cases. For each action, define who may perform it on which resource. Treat another team's resource identifier as hostile input.

## Review and test

The [OWASP authorization cheat sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) recommends denying by default and checking permissions on every request. Turn each ownership and role boundary into negative tests with [[Knowledge/Testing/API Testing Playbook]].

Record mitigations, remaining risks, and a reviewer. This draft is a planning aid; it is not a completed security review. Keep real threat details in an approved private repository.
