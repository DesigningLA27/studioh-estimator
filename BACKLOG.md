# Backlog — deferred work

Everything consciously left undone, so none of it is forgotten. Nothing is removed from this
file until it is actually built; when it ships, move it to **Done** with the version number.

Ordered roughly by how much it costs us to keep not doing it.

---

## Open

### 1 · Natural language on every builder
**v1462 shipped it on the Sport Court Builder only.**
- `nlbSchema()` already generates the Wall Builder's 25 fields — the bar just needs mounting in `wbRender`.
- Same for the Fence & Gates builder when it lands, and every builder after it.
- **Edit by voice on an existing object** ("make it 6 feet and add a gate") works through the same
  patch path, but is only wired where the bar exists.
- Not yet: speech-to-text. The bar is typed today. Web Speech API on iPad Safari is the open question.

### 2 · Materials Library on the builders — §55/§56 (Wall) and §27 (Court)
Both engines already accept a real product with waste (`matVeneerA/B`, `matCap`, court surface and
cap product records). Neither has a picker wired to the library.
Product fields the specs ask for: manufacturer, model, finish/colour, dimensions, image,
specification PDF, CAD/detail reference, unit price, vendor, purchase link.
**One job covering both builders — do it once.**

### 3 · Fence & Gates hand-off
When the Fence & Gates builder is built, the Sport Court Builder's own fencing, gate and windscreen
records must hand off to it rather than keeping a second set of prices that will drift.
Same pattern as §25's retaining hand-off. **Write the seam into the spec up front.**

### 4 · "Create a wall from this court" — Court §25
Retaining is an allowance with a note pointing at the Wall Builder. It should create the wall object.

### 5 · CONC and WALL do not re-read after a config pull
Neither `CONC` nor `WALL` refreshes itself when settings arrive from the server — a device that
pulls new concrete or wall pricing keeps the old figures until reload. `CRT` has the same gap.
The lighting price database (`_lgtFixStoredPrices`) is the pattern to copy.

### 6 · Concrete engine §19 and §20
- §19 the Advanced-settings UI.
- §20 AI geometry auto-detection from the trace.

### 7 · Paving book rates still unreviewed
Natural Stone $58, Porcelain $48, Permeable $39, Concrete Pavers $33, Brick $31, Pebble $30,
DG $7. Flat book rates, never checked against the concrete engine's calibration. **Warwick's numbers
needed — do not guess.**

### 8 · `pav.stamped` finish disagreement
The assembly builds its finish to ~$5.86/SF; the concrete spec §4 says $12.00 (stamped $9 + integral
colour $3). The engine wins on price, but the assembly card still shows its own figure.

### 9 · Wall Builder §68 — height zones inside one drawn run
Separate wall runs price separately, and stepped/sloped zones work. Splitting **one polyline** into
height zones by vertex is the remaining piece.

### 10 · Court §31 band for a fully-loaded full basketball court
$149,940 against a published $55–120k. Flagged, not overwritten, which is correct — but the band may
simply be too narrow for a court with fencing and lighting. **Warwick to confirm.**

### 11 · §77 — bid vs estimate learning store
Both the Wall and Court specs ask for it: store estimated cost, actual bid, contractor, geometry,
system, finish, access and region, then analyse variance and recalibrate the Price Book.
Eventually worth more than any national cost data.

### 12 · `pt-autobar` is dead code
Never mounted anywhere. Either mount it or delete it.

### 13 · Older open items
- Decide whether to repair "Project Sample 1" (`bid_mt9her0rfie5`).
- Verify exports (client PDF, plant report, proposal) against DEMO data.
- Confirm the mood board renders its ten sections.
- `builderTotalFor` is referenced at index.html:8306 and defined nowhere.
- `projDigest()` stamps `totalIsExact:true` on a total that carries no market adjustment or markup.

---

## Done

- **v1462** Natural language on the Sport Court Builder; schema generated from the rules; patch
  applied through the builder's own setter; court placed on the plan at true size.
- **v1461** Sport Court Builder reachable without tracing — courts list in Specialty & Amenities.
- **v1459–60** Sport Court Builder: 96 price records, engine, Price Book section, builder UI.
- **v1449–54** Wall Builder: records, engine, Price Book section, builder UI, height zones.
