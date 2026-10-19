# Start here

## Follow the example

1. Open [index.md](index.md) in Obsidian. Follow the **Example Issue Tracker** link.
2. Read its brief, then follow requirements, the architecture decision, API
   design, test plan, and release checklist. Every artifact is a synthetic draft.
3. Open the API Testing category. Its embedded Base and the Backlinks pane collect
   real links from the example and reusable playbook.
4. Return home and open the Projects and Notes needing review views.

## Make your first notes

1. Create a private copy before adding real work. Create `Projects/My Project/`
   and a `Brief.md` note there. Use **Templates: Insert template** → **Project**.
2. Replace the heading, write the problem and desired outcome, and keep
   `status: draft`. Set `classification` appropriately in your private copy;
   the public template's checks deliberately reject restricted classifications.
3. Create a concept note inside an existing `Knowledge/` module using **Concept**.
   Add a category link in the `categories` property and link the concept from
   your project using Obsidian's link picker.
4. Open the category through home. Find the concept in its Base and the project's
   link in the concept's Backlinks pane. If the pane is hidden, expand the right
   sidebar and select Backlinks. Use the in-document backlinks toggle if needed.
5. Use **Daily notes: Open today's daily note**. It creates `Daily Notes/YYYY-MM-DD.md`
   from `Templates/Daily.md`; link the project and capture the next action.
6. Review changes with `git status` and `git diff`. Run the repository checks if
   tooling is installed. Commit only material appropriate for that repository.

Templates initialize local timestamps. Preserve `created_at`; change `updated_at`
after meaningful content edits. No watcher updates it for you.

## Customize deliberately

Read [Profiles](System/Profiles.md) before removing modules. The home page lists
category hubs dynamically. Remove unused notes and category hubs together, review
incoming links, and run checks. Keep mobile and desktop modules for later needs.

The [owner's optional Colors plugin](System/Optional%20Integrations.md) is not needed
for navigation. No community plugins are installed by this template.
