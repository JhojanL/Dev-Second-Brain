---
type: concept
status: draft
created_at: 2026-10-18T18:57:57
updated_at: 2026-10-18T18:57:57
classification: public
categories:
  - "[[Categories/Projects]]"
  - "[[Categories/Design]]"
projects:
  - "[[Projects/Example Issue Tracker/Brief]]"
---

# Requirements and flow

Synthetic requirements for [[Projects/Example Issue Tracker/Brief]]; these are hypotheses, not research findings.

## UX questions

Who assigns work? What does “closed” mean? Can a member see every issue? Interview prospective users and record findings before treating these assumptions as requirements.

## Proposed flow

Open issue list → choose New issue → enter title and description → submit → view saved issue → assign → close. On validation or network failure, explain the error and preserve entered values.

## Acceptance examples

- Given a member in the team, submitting a nonempty title creates one issue and opens its detail.
- An empty title shows an associated error and does not create a record.
- A request outside the member's team is rejected without revealing the issue.
- A failed save leaves the form recoverable; a retry must not silently duplicate an issue.

Use [[Knowledge/Design/Accessible User Flows]] for UX and UI questions. The [[Projects/Example Issue Tracker/UI Accessibility|UI checklist]] and [[Projects/Example Issue Tracker/Test Plan|test plan]] turn these proposals into checks.
