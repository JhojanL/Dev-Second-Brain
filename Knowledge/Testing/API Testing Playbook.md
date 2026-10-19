---
type: playbook
status: draft
created_at: 2026-10-18T18:57:57
updated_at: 2026-10-18T18:57:57
classification: public
categories:
  - "[[Categories/API Testing]]"
  - "[[Categories/Testing]]"
sources:
  - https://www.rfc-editor.org/rfc/rfc9110
  - https://playwright.dev/docs/test-assertions
---

# API testing playbook

## Inputs

Start from a reviewed contract such as [[Knowledge/Backend/HTTP API Contracts]]. Identify caller roles, ownership boundaries, request limits, state transitions, and expected side effects.

## Procedure

1. Exercise a successful request and verify the full response contract and stored change.
2. Send missing, malformed, oversized, and unexpected input; verify no unintended changes.
3. Test unauthenticated and unauthorized callers, including another owner's resource.
4. Check missing resources, repeated requests, and conflicting writes.
5. Test pagination and ordering using isolated data; confirm neighboring tests cannot alter results.
6. Record the revision, environment, expected behavior, and actual result.

## Tool choice and limits

Use the application's existing HTTP test tools. If a browser workflow uses Playwright, its [web-first assertions](https://playwright.dev/docs/test-assertions) support waiting for observable UI state. Do not add fixed sleeps to hide races. This proposed playbook is not evidence that an API passed.
