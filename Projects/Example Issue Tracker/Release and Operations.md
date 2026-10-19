---
type: playbook
status: draft
created_at: 2026-10-18T18:57:57
updated_at: 2026-10-18T18:57:57
classification: public
categories:
  - "[[Categories/Delivery]]"
  - "[[Categories/Projects]]"
projects:
  - "[[Projects/Example Issue Tracker/Brief]]"
---

# Release and operations

A proposed checklist for [[Projects/Example Issue Tracker/Brief]]; no release or environment exists.

## Before release

- [ ] Review requirements, the decision, and [[Projects/Example Issue Tracker/Test Plan|test evidence]].
- [ ] Assign a release owner, rollback owner, and communication channel.
- [ ] Document configuration and migrations without copying secrets into this vault.
- [ ] Choose recovery criteria and rehearse [[Knowledge/Delivery/Rollback Playbook]].
- [ ] Define useful signals with [[Knowledge/Delivery/Monitoring and Incident Notes]].

## During and after release

- [ ] Record the real application revision, environment, and change window.
- [ ] Run agreed smoke checks and observe errors and request behavior.
- [ ] Roll back when the agreed criteria are met; record observed evidence.
- [ ] Record follow-up maintenance, dependencies, and unresolved incidents.

Leave boxes unchecked until a person performs and records the action.
