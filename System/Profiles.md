# Content profiles

## Full-stack default

Keep Design, Frontend, Backend, Testing, Architecture, Delivery, and Security.
The example crosses those boundaries deliberately. UX research and UI design
share `Knowledge/Design/`; headings distinguish their concerns.

## Frontend focus

Keep Design, Frontend, Testing, Architecture, Delivery, and Security. Remove
Backend only after reviewing incoming links from the example API and decision.
If keeping the complete example, keep its referenced API knowledge too.

## Backend focus

Keep Backend, Testing, Architecture, Delivery, and Security. Design and Frontend
can be removed after adapting or removing the example's interface and user-flow
references. Accessibility may still matter for documentation and operator tools.

## Removing a module

Make a Git checkpoint first. Inspect backlinks for each note and category hub,
update those links, remove the unused content and corresponding category hubs,
and run `mise exec -- pnpm run check`. Home's Categories Base discovers remaining
hubs. The tooling walks existing files and does not require every module.

The acceptance test removes Frontend and its hub in a disposable copy after
updating their incoming navigation. No application build is required.

## Later modules

Add `Knowledge/Mobile/` or `Knowledge/Desktop/` only when you have useful sourced
content. Add a category hub and link it in the notes' metadata. Existing shared
views and checks discover those content folders. No expertise is implied by a
folder name, and no empty mobile or desktop curriculum is shipped.
