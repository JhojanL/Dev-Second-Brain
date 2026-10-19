---
type: concept
status: draft
created_at: 2026-10-18T18:57:57
updated_at: 2026-10-18T18:57:57
classification: public
categories:
  - "[[Categories/Delivery]]"
sources:
  - https://opentelemetry.io/docs/concepts/signals/
---

# Monitoring and incident notes

## Signals with a purpose

For each important user action, define how to notice failure, who responds, and where to find evidence. [OpenTelemetry](https://opentelemetry.io/docs/concepts/signals/) describes traces, metrics, and logs among its signals; instrumentation choices depend on the application.

## Incident record

Capture impact, the observation timeline, hypotheses, actions, outcomes, and follow-ups. Separate observations from guesses. Redact private request payloads and credentials before attaching evidence.

Keep [[Knowledge/Delivery/Rollback Playbook]] close to release planning. Do not write invented alert thresholds or performance results as if measured.
