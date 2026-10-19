---
type: concept
status: draft
created_at: 2026-10-18T18:57:57
updated_at: 2026-10-18T18:57:57
classification: public
categories:
  - "[[Categories/Backend]]"
  - "[[Categories/API Testing]]"
  - "[[Categories/Security]]"
projects:
  - "[[Projects/Example Issue Tracker/Brief]]"
sources:
  - https://www.rfc-editor.org/rfc/rfc9110
---

# API design

Proposed HTTP contract for [[Projects/Example Issue Tracker/Brief]]; no endpoint is running.

## Resources and responses

- `GET /issues`: list only issues visible to the authenticated team member. Define pagination before implementation.
- `POST /issues`: validate a title and description; a successful creation returns 201 with the created resource location.
- `GET /issues/{id}`: authorize resource access before returning data.
- `PATCH /issues/{id}`: validate allowed fields and lifecycle transitions. Decide how conflicting edits are reported.

Agree on one error body shape and document validation, authentication, authorization, missing-resource, and conflict behavior before writing clients. Do not claim an OpenAPI schema exists yet. HTTP status semantics are defined by [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110).

## Security and verification

Apply [[Knowledge/Security/Authorization and Threat Modeling]] to team isolation. Use [[Knowledge/Testing/API Testing Playbook]] for negative cases and [[Projects/Example Issue Tracker/Test Plan|the project test plan]] for evidence. Keep decisions aligned with [[Projects/Example Issue Tracker/Decision 001 Modular Monolith]].
