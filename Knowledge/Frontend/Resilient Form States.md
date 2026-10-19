---
type: concept
status: draft
created_at: 2026-10-18T18:57:57
updated_at: 2026-10-18T18:57:57
classification: public
categories:
  - "[[Categories/Frontend]]"
  - "[[Categories/Design]]"
sources:
  - https://www.w3.org/TR/WCAG22/
platforms:
  - web
---

# Resilient form states

## Design the state transitions

Describe ready, validating, submitting, failed, and saved states before implementation. Preserve user input across a failed request and explain how to retry. Define how duplicate submissions and navigation during a save should behave. These are design recommendations requiring application-specific review.

## Verify recovery

Exercise keyboard-only entry, field errors, a slow request, a failed request, and a retry. Verify accessible feedback using [[Knowledge/Design/Accessible User Flows]] and the [WCAG 2.2 error and status-message criteria](https://www.w3.org/TR/WCAG22/).

Do not copy a framework-specific pattern without checking that framework's current documentation.
