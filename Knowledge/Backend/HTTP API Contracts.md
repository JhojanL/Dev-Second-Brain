---
type: concept
status: draft
created_at: 2026-10-18T18:57:57
updated_at: 2026-10-18T18:57:57
classification: public
categories:
  - "[[Categories/Backend]]"
  - "[[Categories/API Testing]]"
sources:
  - https://www.rfc-editor.org/rfc/rfc9110
platforms:
  - web
---

# HTTP API contracts

## Specify observable behavior

Define resource shapes, accepted input, status codes, pagination, and failure bodies before implementation. [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110) defines HTTP semantics; it does not choose your business permissions or domain model.

## Review boundaries

Keep transport validation, authorization, and persistence behavior explicit. Decide what clients observe for unauthorized or missing resources and conflicting writes. Check those decisions against [[Knowledge/Security/Authorization and Threat Modeling]].

Turn the contract into cases with [[Knowledge/Testing/API Testing Playbook]].
