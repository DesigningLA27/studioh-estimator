# Backlog — deferred work

Everything consciously left undone, so none of it is forgotten. Nothing is removed from this
file until it is actually built; when it ships, move it to **Done** with the version number.

Ordered roughly by how much it costs us to keep not doing it.

---

## Open

### 1 · Natural language — what is left
**v1464: seven builders speak, all seven place on the plan, the mic is live.**
- **Fence & Gates** gets one the day it is built: `nlbRegister({id,name,cur,fields,set,refresh})`
  plus an `NLB_TRACE` entry.
- **Adding plants by name** ("three olive trees") is not covered — the planting adapter sets zone
  area, cover bands and layers, not plant rows. It needs the plant book, and reports the request
  as not covered rather than guessing.
- **Which item the bar targets** is the last one in the list. With several pools or zones it should
  let you pick.
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
- **PDFs are refused** ("not a web page"). A lot of city setback information is in PDFs. Worth
  either passing the bytes to the model as a document block, or saying so more helpfully.
- **51 of 65 cities are still estimates** (`verified:false`) — the OC cities and a band of SGV ones.
  Warwick asked for these to be researched properly as a batch, with citations, not flagged and left.
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

### 3 · Fence & Gates hand-off
When the Fence & Gates builder is built, the Sport Court Builder's own fencing, gate and windscreen
records must hand off to it rather than keeping a second set of prices that will drift.
Same pattern as §25's retaining hand-off. **Write the seam into the spec up front.**

### 6 · ~~Concrete engine §19 and §20~~ — both built
§20 in v1479 (pad count read off the trace), §19 in v1480 (Simple shows finish, colour and
scoring; Advanced opens thickness, strength, reinforcement, joint grid, base, shape and access).

### 7 · Paving book rates still unreviewed
Natural Stone $58, Porcelain $48, Permeable $39, Concrete Pavers $33, Brick $31, Pebble $30,
DG $7. Flat book rates, never checked against the concrete engine's calibration. **Warwick's numbers
needed — do not guess.**

### 8 · ~~`pav.stamped` finish disagreement~~ — there wasn't one
Checked properly in v1478. The note compared the assembly's finish **material** ($2.10) against the
engine's finish **adder** ($12.00), which are not the same thing — the assembly's stamping is mostly
labour. Built up in full: the assembly installs at **$21.84/SF** and the concrete engine at
**$22.21/SF** on the same 600 SF slab. They agree to 1.7%. Nothing to fix.

### 9 · ~~Wall §68 height zones inside one drawn run~~ — already built
`wbSplitDrawn()` makes one zone per leg of the drawn polyline, each with its own measured length.
The note predated it.

### 10 · Court §31 band for a fully-loaded full basketball court
$149,940 against a published $55–120k. Flagged, not overwritten, which is correct — but the band may
simply be too narrow for a court with fencing and lighting. **Warwick to confirm.**

### 11 · §77 — what to do with the bid log
v1477 built the store: every bid keeps what was estimated, what was bid, and the geometry, system,
finish, access, price point and city that would explain the gap. bidLogReview() groups them and
refuses to draw a conclusion from fewer than three, or from three that disagree.
v1478 added the page — Price Book › Bids vs estimates.
Still open:
- **Applying a finding is still manual.** When a group agrees, the page says so and you go and
  change the record yourself. A one-click apply with the before and after shown would be better,
  as long as it stays a deliberate act.

### 13 · Older open items
- Decide whether to repair "Project Sample 1" (`bid_mt9her0rfie5`).
- Verify exports (client PDF, plant report, proposal) against DEMO data.
- Confirm the mood board renders its ten sections.
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
