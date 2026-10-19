---
type: concept
status: draft
created_at: 2026-10-18T18:57:57
updated_at: 2026-10-18T18:57:57
classification: public
categories:
  - "[[Categories/Testing]]"
sources:
  - https://playwright.dev/docs/test-assertions
---

# Risk based test strategy

## Choose evidence by consequence

List the failures that matter to users, their likelihood, and how each check can expose them. Use focused unit checks for rules, integration checks for boundaries, and a small set of end-to-end flows for the user journey. This is a planning approach; adapt it to the application.

## Keep feedback trustworthy

Make data ownership and cleanup explicit. Diagnose failures instead of weakening assertions or repeatedly retrying. Use [Playwright's assertion guidance](https://playwright.dev/docs/test-assertions) when browser state needs eventual verification.

Record exploratory and accessibility work alongside automation. The synthetic [[Projects/Example Issue Tracker/Test Plan]] shows a plan without fabricated passing results.
