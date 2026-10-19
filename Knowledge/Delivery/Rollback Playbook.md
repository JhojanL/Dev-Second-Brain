---
type: playbook
status: draft
created_at: 2026-10-18T18:57:57
updated_at: 2026-10-18T18:57:57
classification: public
categories:
  - "[[Categories/Delivery]]"
sources:
  - https://opentelemetry.io/docs/concepts/signals/
---

# Rollback playbook

## Plan before changing production

Identify the release owner, last known working revision, data migrations, configuration dependencies, and measurable recovery criteria. Choose an application-specific rollback procedure and verify it in an appropriate test environment before relying on it.

## Recover and observe

Stop the rollout when agreed criteria are met, use the reviewed recovery procedure, and verify both user behavior and data integrity. Do not assume a code rollback reverses a database migration. Record timing and observed results.

Use [[Knowledge/Delivery/Monitoring and Incident Notes]] for signals. This generic planning checklist intentionally contains no unverified infrastructure commands. The [OpenTelemetry signal model](https://opentelemetry.io/docs/concepts/signals/) is one reference for observability design.
