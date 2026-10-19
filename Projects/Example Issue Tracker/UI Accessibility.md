---
type: playbook
status: draft
created_at: 2026-10-18T18:57:57
updated_at: 2026-10-18T18:57:57
classification: public
categories:
  - "[[Categories/Design]]"
  - "[[Categories/Projects]]"
projects:
  - "[[Projects/Example Issue Tracker/Brief]]"
---

# UI accessibility checklist

Proposed checks for [[Projects/Example Issue Tracker/Brief]]; none has been executed against an application. Use [[Knowledge/Design/Accessible User Flows]].

## UI behavior

- [ ] Every field has an accessible label; errors identify the field and recovery.
- [ ] All issue actions work with keyboard navigation and visible focus.
- [ ] Loading, empty, failed, and successful states have understandable text.
- [ ] Status uses text in addition to color.
- [ ] Layout remains usable at narrow widths and browser zoom.
- [ ] A screen reader can understand the issue list and form feedback.

These checks support a review; they do not establish WCAG conformance. Record browser, assistive technology, steps, and observed results in the [[Projects/Example Issue Tracker/Test Plan|test plan]].
