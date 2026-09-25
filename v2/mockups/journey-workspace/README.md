# Project journey study

Three switchable website journey layouts, all with Morning, Day, Afternoon, Dusk and Night themes and Designer, Admin, Client and Developer previews.

1. Guided workspace — recommended default. Next action, preserved home hero/metrics, numbered journey, tool access.
2. Home checklist — task-based progress and explicit complete/pending states, plus project context.
3. Studio workspace — compact next action, project context and direct tool access for experienced users.

The dropdown is a temporary comparison control. The mockup has no backend writes, localStorage, IndexedDB or uploaded client content. Sample completion exists only in page memory and updates across journey switches. The published static pages are hosted at the existing GitHub Pages site; production project data remains a Cloudflare concern.

## Reviewed sources

- Existing `../guided-workflow/index.html`, `app.js`, `style.css`: Guided workspace, single-step flow, home checklist, Design overview, recap and cover-image framing.
- `../../plans/v1-v2-capability-audit.md`: source-level V1 v1571 inventory and detailed moodboard parity.
- Root `index.html`: navigation, `renderMoodBoard`, `_mbSectionDefs`, `_mbWizSteps`, materials/furnishing earning models, price book and bid comparison.
- Root `ROADMAP.md` sections 8–10: library/profit tools, proposals, financials, staff costs, change orders, accounts and communication. Planned items are not asserted to be shipped.

The 30-entry capability map locates the major V1 capability families and requested future workflows. This is an information architecture study, not certification of every V1 control or live V2 integration.

## Roles

Admin is the studio owner/administrator with project design capabilities, membership and assignment management. Designer accesses assigned projects with separately granted financial permissions. Client sees shared project content and can contribute, review and approve. Developer is a product-level diagnostics role. In a solo firm the owner can both administer and design. Contractor/architect/realtor are future roles.

These switches only preview layouts. Production must enforce memberships and field-level access on the server and omit internal financial information from client payloads.

## Journey semantics

Percent complete is checked tasks / total tasks, never inferred from time, fees or construction. Designer sample has 22 tasks; client sample has 7 contributions. These are different checklists. In production completion must come from saved artifacts and approvals, with explicit manual tasks where appropriate; revisions can reopen tasks. Stages stay accessible out of order.

## Recommended next build

Agree the whole navigation and role model here, then implement vertical slices using existing V1 functions. First slice: real home/checklist + Brief & site. Follow with concepts/original tracer/moodboard and linked estimates, then client collaboration, financials and deliverables. Complete account-bound cloud persistence before accepting private multi-user edits. Do not rebuild the original tracer or duplicate estimate calculations.
