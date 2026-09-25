# V1 behavior reviewed for these mockups

Source: root index.html, Moodboard and library detail controls.

- `_mbAddToBoardBtn` is used by material and furnishing detail views. It calls `mbAddExistingGoods`, which calls `specAdd`: these are project selections, not disconnected image copies.
- `_mbAddToBoardBtnPlant` and Plant Book details call `mbAddExistingPlant`, adding a design-plan planting row. Quantities need confirmation.
- `mbHideItem` hides board presentation only. It does not un-specify or remove pricing. `mbUnhideSection` restores visibility.
- `renderMoodBoard` gathers existing project selections, supports Grid/Editorial/Photo wall, palette groups, section visibility, search/add, style-driven and typed suggestions, inspiration pins and client-safe insight cards.
- `_mbWizSteps` preserves nine steps: style, budget, goals, plant character, water use, plant types, plant colors, color palette, board sections.
- Items without photos remain visible. These mockups deliberately demonstrate that state for plants; the icons are placeholders, not botanical photos.

## What this study demonstrates

Three arrangements of the same sample project: Studio board, Editorial, Visual wall. Adding a sample library item updates all layouts; hide/restore keeps selected state. Palette editing, section choices, a compact nine-step guide, presentation view and theme changes can be tried. State is temporary, in memory only.

## Still required in production

Wire the approved layout to V1 project selections and library identifiers, quantity/specification flows, cloud project persistence, true library media, palette groups, inspiration pins, real estimate/insight cards and the existing AI service. The study does not claim those integrations are working. AI and insight dialogs are explicitly preview-only. No actual project data changes.
