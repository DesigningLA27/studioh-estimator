# V2.035 — shared moodboard builder

One actual project board has three presentations: Studio board, Editorial, Visual wall. The builder is not a separate demo or a fourth board.

- Build board / Sections opens a planner beside the actual board. Choose native plant, material, furniture, product, site, palette, insight and project inspiration sections.
- Move sections up/down; remove sections without deleting specifications, quantities or reference photos.
- Inline Build out your board controls add sections; the planner exposes every available native category.
- Supporting cards (palette, project snapshot, design intention) are individually selectable. A board without supporting cards uses the available width.
- Sections/order, supporting-card settings, direction and selected view are in S.moodboard and use existing V2 project save/export/restore. Builder open state is temporary UI state. No server-account changes are included.
- Native plant/furniture/material additions ensure the corresponding section exists. Existing selections are not duplicated; hidden board items are restored by explicit library addition.
- Inspiration reads project photos categorized as Inspiration, with a route to manage/add photos. It has native board hide/restore behavior.
- Image-free items remain omitted from visual cards with explanatory counts, preserving their project selections.
- Presentation hides builder controls. New builder mutation actions respect the Customer preview boundary; actual server authorization remains separate pending work.

Validation: original moodboard regression and dedicated shared-builder test cover image/reference selections, ordering, supporting cards across all themes/views, mobile/iPad overflow, presentation, automatic section restoration and reload persistence.
