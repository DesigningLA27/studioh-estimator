# Backlog — deferred work

Everything consciously left undone, so none of it is forgotten. Nothing is removed from this
file until it is actually built; when it ships, move it to **Done** with the version number.

Ordered roughly by how much it costs us to keep not doing it.

---

## Open

### 1 · Natural language — what is left
**v1464: seven builders speak, all seven place on the plan, the mic is live.**
- ~~**Fence & Gates**~~ — built v1491. It needed more than the others: four of its 35 fields are
  *structures*, not scalars, because one sentence legitimately makes five runs at two heights.
  `nlbRun` gained struct support, a per-builder `space()` and a `before()` reset hook for it.
- **Adding plants by name** ("three olive trees") is not covered — the planting adapter sets zone
  area, cover bands and layers, not plant rows. It needs the plant book, and reports the request
  as not covered rather than guessing.
- ~~**Which item the bar targets**~~ — built v1497. It was the last in the list, for both `cur()` and
  the setter, so on a job with two pools every instruction hit the second. The bar now names the one
  it will change and lets you pick; the choice is per builder and survives a stale index.
- **Placement built in v1470–71.** ptSiteFrame reads front/rear/left/right off the drawing,
  ptSolvePlace turns "rear yard, 5′ off, centred on the living room" into a position, and the
  staging tray holds what the AI built until you tap it onto the plan.
  All three follow-ups closed in v1472: the box is the tray's empty state and also sits in the AI
  dock panel, the stamp snaps to corners, lines, midpoints and the rest, and the tray rides with
  the project.
  Group placement and the Project Info way in both landed in v1473–74.
- Speech needs a real device check — the API is present in the headless browser, but permission,
  accents and iPad Safari behaviour are untested on the actual iPad.

### 1b · Setbacks — deploy the reader, then research the 51
- **Deployed v1468.** The page reader is live. It reads ordinary city .gov pages fine.
- **It cannot read the big code hosts.** Municode is a JavaScript shell (16 characters of content);
  Code Publishing, American Legal and qcode return 403 to anything that is not a browser — to the
  worker AND to Claude's own fetch, so this is not a worker problem to solve. Those cities go
  through the paste box instead, which is grounded in exactly the same way.
- ~~**PDFs are refused**~~ — built v1499, worker deployed. A PDF comes back as the document itself
  and goes to the model as a document block, so it reads the page as published. Verified live:
  Placer County's pool-enclosure PDF (420 KB) reads as 60″ minimum barrier, no 4″ sphere, 2″
  clearance, cited to P.C.C. 15.04.320 and HSC 115923; a 3.8 MB Tustin code attachment reads in
  13 seconds. 8 MB cap with a readable message above it. An extension-less URL that turns out to
  be a PDF is caught by content-type.
- **51 of 65 cities are still estimates** (`verified:false`) — the OC cities and a band of SGV ones.
  Warwick asked for these to be researched properly as a batch, with citations, not flagged and left.
  **Re-tested 2026-09-12 from this session's own fetch:** amlegal codelibrary and burbankca.gov both
  return **403**. Web *search* returns numbers, but they come from a small model reading a snippet,
  not from the code — not good enough to write in as fact. The paste box remains the only grounded
  route. **v1485** makes the gap unmistakable in Project Info: the card now names the city, states
  the pattern it is using instead (20/5/15/5), says how many of the 65 are in the same position,
  and offers a button that opens a targeted search in the user's own browser.
- **v1500 gives it a home:** Price Book › Setbacks. All 65 cities in one list with what each holds,
  the reader pointed at any of them without changing the project, two searches aimed at the right
  document, and what came back shown with citations before it is written.
- **The count was wrong and is now honest.** "14 verified" meant somebody typed those figures in —
  checking all 14 found **not one carries a citation**. It reads 0 from code, 14 on file, 51 on the
  pattern. The 14 are as unsourced as the 51; they are just closer to right.
- **What is left is judgement, not plumbing.** The reader works; knowing which document is the
  authoritative one for a given city does not come out of a search result. A Tustin council-agenda
  attachment read cleanly and gave "front 50, side 1" — real figures from the wrong document.
  Warwick pointing it at the right page per city is now an afternoon, not a research project.
- **v1504 — one definition of where a figure came from.** `verified:true` on a record used to be
  enough to call a figure the city's code, and each surface had its own idea of what that meant.
  `sbFor` now decides once from whether a section is on record: **code** / **on file** / **estimated**,
  with one badge and one sentence used everywhere. Placement says it at the moment it matters —
  the point where the figure stops being a note and decides where something is built.
- **v1505–06 — the finding system.** Discovery cannot be automated (every code host 403s), so the
  once-somebody-looks now counts: a city keeps the **document**, not just the figures, so the next
  read is one tap; "Read it again" re-runs every source and shows what moved before writing;
  a **sweep** does that across every city on record. The book syncs, so a city read by one person is
  read for everybody. The counts are honest — figures found vs items mentioned without a distance.
- **A zoning API is the real answer at scale, and it is a commercial decision.** Zoneomics and
  Regrid both publish setbacks at parcel level across 22,000+ jurisdictions; both want an account.
  `sbProvider` is the seam, deliberately inert, and will not be wired to a live service until it
  has been run against one.
- Only the six original edges have real figures even on verified cities; the nine landscape items
  inherit from the structure rule. Worth reading the actual accessory-structure sections so a fire
  pit, a pool heater and a patio cover carry their own numbers where the code gives them one.
- Nothing reads setbacks for pricing or placement yet — that lands with AI placement (item 1).

### 2 · Product records — the fields beyond a price
v1475 wired the Materials book to the wall's veneer and cap and the court's surface: a named
product replaces the generic allowance at its own $/SF with the right waste, and one with no
price on file says so and stays on the allowance.
What the specs ask for and the book does not hold yet: manufacturer, model, finish/colour,
dimensions, image, specification PDF, CAD/detail reference, vendor, purchase link. Those are a
Materials-book schema job, not a builder job — and they are what §27's specification output needs.
**v1494 built the shape on the fence segment** (mfr, product, model, vendor, purchaseUrl, specUrl,
cadRef, warranty, matRate + matRateSrc) and proved the pricing seam: a real material $/LF replaces
the *material inside* the assembly and keeps the book's labour, using the record's labour share to
say which part is which. Still open: no library to pick from, no images, and the wall, court, pool
and water builders have none of it. `MFG_COLORS_SEED` is a **colour** library, not a product one.

### 3 · ~~Fence & Gates hand-off~~ — built v1493
`cbToFence()` hands a court's perimeter to the Fence Builder and drops its own fencing, gates and
windscreen in the same move — measured, a tennis court with 360 LF of 10′ fence sheds $35,960 and
arrives as an itemised $34,461 fence. The court's own records stay for a court nobody has detailed
and each now says that is what it is.
**Still open:** the same seam does not exist for the court's *windscreen* records (they are dropped,
not handed over — the fence book has no windscreen product), and nothing periodically checks that
the two books have not drifted apart on chain link.

### 6 · ~~Concrete engine §19 and §20~~ — both built
§20 in v1479 (pad count read off the trace), §19 in v1480 (Simple shows finish, colour and
scoring; Advanced opens thickness, strength, reinforcement, joint grid, base, shape and access).

### 7 · ~~Paving book rates unreviewed~~ — checked and corrected, v1481–83
Warwick asked how they broke out. They were set before the installation assemblies existed and
nothing ever reconciled them, so the same material priced two ways disagreed by up to 65%.
Every band is now **what its own assembly builds**, measured at 800 SF, $85/hr, no project modifiers:

| | was (Standard) | now | built |
|---|---|---|---|
| Natural Stone (mortar-set on slab) | $58 | $52 | $52.21 |
| Porcelain | $48 | $38 | $37.69 |
| Concrete Pavers | $33 | $20 | $20.19 |
| Brick | $31 | $22 | $22.31 |
| Permeable | $39 | $28 | $27.57 |
| Pebble, loose | $30 | $12 | $11.64 |
| Pebble, mortar-set *(new line)* | — | $40 | $39.91 |
| DG | $7 | $7 | $7.47 |

Warwick's own reference figures corroborate: an $8–10/SF stone installs at $37.69 (he said "$40
range"); a $22 stone at $52.21 (he said "$58"). Two real faults were found doing it —
**permeable was priced as an ordinary paver patio** (road base, bedding sand, compacted subgrade —
the opposite of how permeable works), and **bulk stone was paying $2.50/SF freight twice** because
it is quoted per ton delivered. Both fixed.
**Still open:** the corrector only moves a line still on its original seed, so anyone who had typed
their own paving price keeps it — correct, but it means a device with edited paving prices will not
pick these up. Worth a look at the Price Book for any paving line still showing an old figure.

### 8 · ~~`pav.stamped` finish disagreement~~ — there wasn't one
Checked properly in v1478. The note compared the assembly's finish **material** ($2.10) against the
engine's finish **adder** ($12.00), which are not the same thing — the assembly's stamping is mostly
labour. Built up in full: the assembly installs at **$21.84/SF** and the concrete engine at
**$22.21/SF** on the same 600 SF slab. They agree to 1.7%. Nothing to fix.

### 9 · ~~Wall §68 height zones inside one drawn run~~ — already built
`wbSplitDrawn()` makes one zone per leg of the drawn polyline, each with its own measured length.
The note predated it.

### 10 · ~~Court §31 band for a fully-loaded full basketball court~~ — the check was wrong, v1484
Not the band and not the engine — the comparison. A published court cost is **the court**: clear the
pad, build the base, surface it, stripe it, hang the goals. Fencing, lighting, drainage, furniture,
engineering and permits are always quoted on top. The check was holding the whole estimate against
the band, so $74,888 of fence, lighting package, photometric study, gates, windscreen, drainage and
benches was being counted against a figure that never included any of it.
It now compares the court proper and lists the extras beside it at cost. That left $160,000 still
over, and a band assumes a **specification** too — so the same court is re-priced at what a published
figure assumes (reinforced concrete base, acrylic colour coat, residential goals) and comes to
$112,440, inside the band, with post-tensioning, a cushioned surface and competition goals
accounting for the $47,560. Scope that explains itself is no longer flagged as an error.
A plain full court is $109,440 and in band; tennis, pickleball and half-court all still are.

### 11 · §77 — what to do with the bid log
v1477 built the store: every bid keeps what was estimated, what was bid, and the geometry, system,
finish, access, price point and city that would explain the gap. bidLogReview() groups them and
refuses to draw a conclusion from fewer than three, or from three that disagree.
v1478 added the page — Price Book › Bids vs estimates.
~~Applying a finding is still manual.~~ — built v1487. Every logged bid now also keeps **which
records the job spent on and how much**, so a plan has something to point at instead of a percentage
with no home. The group is ranked by share of the estimate and the plan covers the records carrying
the first 70%, leaving the long tail alone — a 15% gap on a CMU retaining wall is not evidence about
its permit allowance. The dialog shows each record, what it is now and what it becomes at all three
price points, its share of these jobs, whether it had already been edited by hand, and that the job
ends up about 10% dearer rather than the full 15% because of what is deliberately not moved.
Nothing changes until a second tap; each record is stamped with where the change came from.
~~Still open: there is no undo other than "Back to the defaults".~~ — built v1498. Each moved record
keeps what it was, on the record, because dividing the new figure back out does not land on the old
one (bands are rounded the way a price book is written). The Bids page undoes a whole group; each
record carries a text link saying what it would go back to. A rate typed by hand before the move
survives the undo, which "Back to the defaults" would have discarded.

### 13 · Older open items — verified v1495–96
All three were checked against a real DEMO build driven headlessly, not read.
- **Exports.** The plant report and the specification schedule are both correct and complete — four
  zones, 20 species with botanical names, water by year, sizes, colours, quantities and a pet/child
  safety block; six products grouped by section with manufacturer, finish, thickness, dimensions and
  quantity. **The client PDFs were broken** and are fixed in v1495: both buttons exported the
  Dashboard's card, not the estimate, and produced identical output. The Proposal export is
  `_reportSoon(…)` — deliberately not built, see the Proposals tab roadmap.
- **Mood board** renders its ten sections.
- **"Project Sample 1"** (`bid_mt9her0rfie5`) is not repairable and does not need to be. 6.2 MB, of
  which 6.24 MB is a snapshot of the plant book from before the image migration — 4,554 rows with 15
  embedded base64 images, Rosemary alone at 569 KB. Until v1496 **opening it would have replaced the
  live plant book with that snapshot**, which is a good deal worse than the record being stale. That
  path now merges and refuses base64 images, so it is safe to open. It is still 6.2 MB of nothing
  useful: **Warwick's call whether to delete it.** The nine other saved projects are unaffected.
- **The bug behind it was live.** Every save was embedding all 16 trees and 8 palms because the
  library seeds USFS growth data onto them at boot and `PLANT_DB_DEFAULTS` does not declare those
  fields — fixed v1496, a clean book now embeds nothing.
- ~~`builderTotalFor` referenced and never defined~~ — fixed v1476.
- ~~`projDigest()` stamped `totalIsExact` on a subtotal~~ — fixed v1476.

---

## Done

- **v1474** Engines re-read after a config pull; the dead auto bar deleted; a court hands its
  retaining wall to the Wall Builder; Project Info opens the plan with the box focused.
- **v1473** Relational placement — beside, next to, near, clear of, facing.
- **v1472** The whole-garden box, stamp snapping, the tray saved with the project.
- **v1471** The staging tray. **v1470** The site frame and the placement solver.
- **v1469** Resize grips — corners keep the shape, edges do not.
- **v1462** Natural language on the Sport Court Builder; schema generated from the rules; patch
  applied through the builder's own setter; court placed on the plan at true size.
- **v1461** Sport Court Builder reachable without tracing — courts list in Specialty & Amenities.
- **v1459–60** Sport Court Builder: 96 price records, engine, Price Book section, builder UI.
- **v1449–54** Wall Builder: records, engine, Price Book section, builder UI, height zones.

### 14 · Fence, Gate & Screening Builder — what the spec asks for and is not built
Built v1486–94 against Warwick's 40-section GPT spec. The seven QA tests (A–G) all pass and Test A
lands on the spec's own worked figure to the dollar ($13,900). What is **not** done:
- **§33 Specification Book.** `fenceSpec(f)` produces the records and the panel shows them, but
  there is no Project Specification Book to write them into yet. The spec calls it "future".
- **§2B two of six.** "Select existing property-line segments" and "trace from an aerial" both work.
  **Placing a gate by tapping the line** and **marking a height transition by tapping** do not —
  gates and transitions are set from the Properties panel, not by clicking a point on the run.
- **§3 product library.** The fields exist (v1494) but nothing to pick from — see item 2.
- **§10 component charging is opt-in.** Quantities are always calculated; they are only *charged*
  when a segment is set to decompose. That is §37-correct, but there is no per-project default and
  no way to say "always decompose from Construction Documents onward".
- **§22 gate fabrication by weight.** The spec asks that gate fabrication move to frame/infill/
  finish/weight once the details exist. It is still an allowance or a quote, nothing in between.
- **§35 comparison list is fixed.** Fourteen hand-written options with a `when` test. Fine, but it
  cannot compare two arbitrary configurations, and the maintenance figures are text, not data.
- **§26 automatic code retrieval.** The fence reads a city height limit off `SETBACKS` when one is
  there and marks it verified only when that record is — but nothing *fetches* a fence height limit,
  and `SETBACKS` does not carry `fenceFront`/`fenceSide` for any city. See item 1b.
