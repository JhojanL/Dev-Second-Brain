---
type: decision
status: draft
created_at: 2026-10-18T18:57:57
updated_at: 2026-10-18T18:57:57
classification: public
categories:
  - "[[Categories/Architecture]]"
  - "[[Categories/Projects]]"
projects:
  - "[[Projects/Example Issue Tracker/Brief]]"
---

# Decision 001 — propose a modular monolith

## Context

[[Projects/Example Issue Tracker/Brief]] is a small fictional application with one team and no measured scaling needs. Deployment simplicity and clear ownership matter more than independent services at this stage.

## Decision proposed

Use one deployable service with explicit identity, issues, and persistence modules. A relational database is a candidate, not an installed dependency. Keep HTTP handlers separate from authorization and use-case behavior.

## Alternatives and consequences

Independent services add deployment and network coordination; keep them as a later option if ownership or scaling evidence warrants it. A monolith still requires boundaries and migration discipline. Review this proposal before implementation.

## Revisit when

One module needs separate ownership or deployment, or observed load exposes a bottleneck. Record evidence rather than inventing benchmark results.

Follow [[Knowledge/Architecture/Architecture Decision Records]]. Check the [[Projects/Example Issue Tracker/API Design|API design]] and [[Projects/Example Issue Tracker/Release and Operations|release constraints]] against this decision.
