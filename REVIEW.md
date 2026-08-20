# Review book

Things from the builds that need Warwick's eye. Nothing here is broken — these are decisions I
made on your behalf, numbers I could not confirm, or gaps I chose not to close alone.

Newest first. Move an item to **Settled** when it's decided, with the answer.

---

## Open

### 0 · Seeded material price points — review and adjust
**v1044 · 2026-08-20 · price book**

You asked me to put starting values in so you could review them. These are **my numbers, not yours** —
Southern California retail, material only, before waste, tax and freight. Every one is a guess I would
not normally make; adjust under Installation assemblies → Materials.

| Material | Value | Standard | Premium |
|---|---|---|---|
| Natural Stone Paving | $12 | $25 | $60 |
| 3/4" Calibrated Limestone | $14 | $22 | $38 |
| 2" Bluestone | $18 | $28 | $45 |
| Porcelain Pavers | $8 | $14 | $28 |
| Concrete Pavers | $4 | $7 | $12 |
| Brick Paving | $5 | $9 | $16 |
| Permeable Pavers | $6 | $10 | $16 |
| Pebble / Baja Stone | $6 | $12 | $22 |

Concrete flatwork, stamped concrete and gravel/DG carry no separate material price — their material
is inside the assembly.

Worth checking first: Natural Stone Paving at Standard now derives **$57.13/SF** against the old typed
band of $40–$95, so the Standard price point moves from $58 to $57.13. Close, but the Entry and Luxury
ends move much further — $37.28 and $103.34 against $40 and $95.

---

### 0 · Same component, different prices — the auditor's first findings
**v1037 · 2026-08-20 · knowledge model**

`kmAudit()` reads the whole assembly library looking for the same fact stored more than once with
different values. It found 7 high, 7 medium, 10 low. Two are real discrepancies in the source cost
sheets and need your answer:

| Component | Priced as | In |
|---|---|---|
| **4″ road base** | **$2.00** | stone mortar-set |
| | **$0.70** | concrete flatwork, stamped, gravel/DG |
| **4″ concrete** | **$3.50** | stone mortar-set |
| | **$2.75** | concrete flatwork, stamped |

Same nominal item, different number. Either the stone assembly is carrying something extra, or one
of the sheets is out of date. Also inconsistent: Forms ($0.25 / $0.20), Bedding sand ($0.50 / $0.30),
Edge restraint ($0.40 / $0.45), Miscellaneous materials (four different values).

**The underlying cause is architectural.** Components are copies, not references — "4″ road base"
is seven separate numbers, so changing one changes nothing else. The fix is a shared resource
library: materials and labour tasks as objects with unit prices, assemblies declaring how much of
each they consume. Not started; Warwick does not want it rushed.

Until then the auditor reports the disagreements every time it runs, and is registered as a
specialist so it can be asked directly.

---

### 0 · Project Modifiers — how hard, kept separate from what
**v1035 · 2026-08-20 · estimating engine**

17 conditions from Warwick's list, grouped as Access & logistics / Site conditions / Earthwork /
Constraints / Location. Project state only — a modifier never touches the price book.

**Not percentages on the total.** Each modifier declares which channels it affects and the engine
applies them where they belong:

| Channel | Where it lands |
|---|---|
| `labor` | multiplier on labour hours |
| `matHandling` | multiplier on delivered material |
| `equipmentUnit` | $ per unit of driver quantity, inside the rate |
| `equipmentJob` | $ once per job, as its own named line |
| `temporary` | temporary works as their own cost, never hidden in a rate |
| `schedule` | days, recorded not costed |

So steep slope moves labour and leaves materials alone; difficult access moves handling and leaves
laying alone; a crane is carried once for the job, not per square foot.

**Every magnitude ships null — they are your numbers.** A modifier that is switched on but has no
values is reported in `unpriced[]` rather than silently doing nothing.

**Needed from you:** the magnitudes. For each of the 17, what it does to labour, material handling,
equipment (per job or per unit), any temporary works, and schedule days.

**Not built:** the advisor. `modRecommend()` declares the signals each modifier reads
(`avgSlopePct`, `sideYardWidthFt`, `haulMiles`, `cutDepthFt`…) so scoring can be added without
touching this layer, but no thresholds are invented — it returns `scored:false`.

---

### 0 · Tracked values — editable costs with provenance, scope and history
**v1034 · 2026-08-20 · estimating engine**

Built as a reusable layer for every cost component in the platform, not just paving.

- **Nothing is overwritten.** The database default survives; an override is recorded at a scope.
- **Resolution:** project → book/region → global → database default.
- **Edits default to THIS PROJECT ONLY** unless a broader scope is chosen deliberately.
- **Every value answers "where did this come from?"** — source, date, scope, reason, and the
  original default. Source types: Studio H default, User entered, Contractor bid, Supplier quote,
  Manufacturer, AI web research, Historical project, Regional price book.
- **History is append-only.** Nothing discarded, so escalation and trend reporting are possible later.
- **AI proposes, never writes.** `valProposal()` builds the comparison — current, recommended,
  range, delta, sources, confidence, reason. `valAcceptProposal()` only runs from an explicit user
  choice, and the change is attributed to the AI in history.

Every assembly component and every material input now resolves through it, so the values are already
editable and tracked before any UI exists.

**Not built yet:**

1. **The UI.** Progressive disclosure — L1 price, L2 summary, L3 full breakdown, L4 edit / source /
   research / calculation. Today the trace build-up is read-only display and the price book edits
   the raw defaults rather than going through the tracked layer.
2. **The live AI research call.** `valProposal()` is the shape; nothing calls the worker yet. Needs
   the research prompt and the multi-source methodology — geographic relevance, recency, retail vs
   contractor, quantity assumptions, unit conversions, freight, tax, material vs installed.
3. **Region identity.** Book-scope overrides are stored but there is no region concept yet, so
   "this price book / region" is really "this book".

---

### 0 · Driver-based assemblies — the universal quantity architecture
**v1032 · 2026-08-20 · estimating engine**

Every assembly declares the quantity its costs are written against, and how to derive it from what
is convenient to measure. No special cases, no height bands, no per-height assemblies.

| Category | Driver | Measured as | Derived |
|---|---|---|---|
| Paving, decking | SF | SF | — |
| Wall | Wall face SF | LF | LF × height |
| Planting, lighting | EA | EA | — |
| Pipe, fence | LF | LF | — |

`asmSystemCost()` aggregates components on different drivers into one estimate — irrigation is LF of
pipe plus EA of heads plus EA of valves plus one controller, each on its own driver, no composite
special case.

**Still needed from you:**

1. **LF and EA efficiency curves.** Only the SF curve is yours; the others fall back to it and
   report `effAssumed:true`.
2. **Costs for the 10 scaffolded assemblies** (3 wall, 3 decking, 4 planting). They refuse to price
   until filled in.
3. **Parameter defaults.** `heightFt` has no default, so a wall will not price without one. Paving
   thickness/base/rebar and planting container size are marked `baked:true` — captured as knowledge
   but already inside the costs.

**Next architectural step, not built:** parameters that *scale line items* — concrete thickness
moving the concrete line, pipe diameter moving the pipe line. Today a parameter either derives the
driver quantity (wall height) or is descriptive (`baked:true`). Nothing in between yet.

---

### 0 · Architecture validated across 4 categories — three changes it needs
**v1031 · 2026-08-20 · estimating engine**

Scaffolded walls (3), decking (3) and planting (4) alongside paving (7) to test whether one
framework really covers every category. Material → Assembly → Pattern → Options → Complexity →
Area Efficiency → Productivity → Rate → Cost held up. Paving numbers unchanged, verified.

**What broke, and what it needs:**

**1. Efficiency is a quantity curve, and quantity is not always SF.** Done structurally — `QTY_EFF`
is now keyed by unit. Only the SF curve is yours. LF and EA fall back to it and report
`effAssumed:true`, because 30 plants is not the same job shape as 30 SF. **Need your LF and EA
curves.**

**2. Walls have a second dimension the engine cannot carry.** A retaining wall is quantified in LF
but its cost scales with height — a 2ft wall and a 6ft wall are not the same LF rate. The assemblies
carry `driver:"heightFt"` as a marker but nothing consumes it. Options: (a) per-unit line items
scale with a declared driver, (b) assemblies quantified by SF of wall face instead of LF, or
(c) height bands. **This is the one real architectural gap. Needs your call.**

**3. Irrigation, lighting and drainage need multiple quantity drivers at once.** An irrigation
assembly is LF of pipe *and* EA of heads *and* EA of valves *and* one controller. Today an assembly
has a single unit, so these three categories cannot be modelled without either composite assemblies
(an assembly made of sub-assemblies with their own units) or multi-driver line items. Deliberately
not built until #2 is decided, since the answer probably serves both.

**All 10 new assemblies carry component names only — no costs.** They refuse to price until filled
in, so nothing can quietly produce an invented number.

---

### 0 · Assembly engine — two things deliberately deferred
**v1028 · 2026-08-19 · estimating engine**

Both agreed with Warwick, neither blocking:

**1. Edging is a $0.50/SF allowance.** It should be priced from linear feet once takeoff geometry
can supply the perimeter of a paved area. Applies to `pav.dg` today; concrete pavers and brick
carry edge restraint on the same basis. Not solved now, by agreement.

**2. Construction parameters are baked into the defaults.** The assemblies assume 4" concrete,
4" road base, #3 rebar at ~18" OC, ~1" bedding sand. These must become editable variables before
the engine is considered complete:

- Concrete thickness
- Aggregate base thickness
- Rebar size
- Rebar spacing
- Bedding sand thickness
- Mortar bed thickness
- Joint width
- Paver / stone thickness

The Assembly Selection Engine should recommend defaults from the assembly and the intended use
(pedestrian, pool deck, driveway), with the user able to override. Today it scores thickness only —
its other twelve factors are listed in `ASM_FACTORS_PENDING` and surfaced as not yet considered.

**Defaults settled:** natural stone sealer defaults ON (most high-end SoCal stone is sealed);
DG stabiliser defaults OFF (a deliberate choice per project).

---

### 0 · Assembly architecture is now the standard shape — catalogue and tier profiles are yours to fill
**v1021 · 2026-08-19 · estimating engine**

Locked in, per your call:

    Material  →  Installation Assembly  →  Assembly Selection Engine  →  Cost Engine

Assemblies are reusable and each material declares which it supports, so one material at two
install methods is one material, not two. Labour is always hours x rate, never dollars per unit.
Contractor tiers are quality tiers, not points in a lo-hi band.

**Shipped and verified** (39 assertions against your worked examples, all green):
Option A mortar-set $10.10 non-stone / 0.168 hr/SF; Option B sand-set $5.05 / 0.133 hr/SF;
delivered stone $32.75; the eight-step area-efficiency curve; Value/Standard/Premium at
$55/$85/$120 per hour; and the rule that the area multiplier touches labour hours ONLY.
Option A @ 500 SF standard = $57.13/SF = $28,565. Option B = $49.11/SF = $24,555.

**What I did not fill in, because they are your numbers:**

1. **Complexity factor (`cx`)** — you named pattern and material complexity as a variable but gave
   no values. Every material ships at `cx: 1.00`, multiplying labour hours only. Herringbone vs
   running bond, calibrated vs irregular, small format vs large — set these and they take effect
   with no code change.
2. **Tier profiles beyond the rate** — `CONTRACTOR_TIERS` carries `prod`, `waste`, `oh`, `profit`
   fields, all sitting neutral (1, 1, 0, 0). A Premium contractor costing more per hour but working
   faster needs `prod` set. Until then a Premium tier is purely more expensive, which is not what
   you described.
3. **The material catalogue** — seeded with exactly the two you named (3/4" Calibrated Limestone,
   mortar-set only; 2" Bluestone, both). The existing nine `PAV_MATS` are NOT yet mapped to
   assemblies and still price off their old lo-hi bands. Nothing regressed; nothing migrated either.
4. **Assembly Selection Engine scores thickness only.** Your other twelve factors — manufacturer
   requirements, structural conditions, vehicular use, slope, drainage, soil movement, tree roots,
   utility access, design intent — are listed as `ASM_FACTORS_PENDING` and shown to the user as not
   yet considered, rather than being silently ignored so the pick looks smarter than it is.

**Not yet wired to anything.** The engine is additive — no existing price reads it. Take-off,
the paving detail card and the Price Book UI still use the old path. That is the next build.

---

### 1 · Manual louvers are priced at ×0.72 — confirm or replace the rule
**v883 · 2026-08-17 · pergola**

The louver operation choice used to do nothing (Manual and Motorized both returned $38,364 —
no control existed and neither the kit path nor the custom-insert path read it). It works now, but
I refused to invent a manual rate, so I used the ratio your own two Price Book lines already state:

    Louver System — Manual  $78/SF
    Louver System — Motorized  $108/SF   →  ×0.72

Applied to the kit's material and its price floor. **Labour to hang it is not scaled** — same roof
either way, only the product differs.

| Tier | Motorized | Manual |
|---|---|---|
| DIY Kit | $27,773 | $23,106 |
| Mid-range | $30,430 | $26,152 |
| Premium | $49,870 | $42,870 |

**Decide:** is manual a ratio of the motorised kit, a flat price of its own, or does it also cut
the labour? Default is Motorized, so nothing already quoted moved.

---

### 2 · Connect the Materials library to the Price Book and the estimator
**decided 2026-08-17 · TO BUILD**

Warwick's call: **build it.** A material should be a thing you pick, not a number you type.

**The shape**
- A Price Book line can **point at a Materials library item** instead of carrying a typed material
  cost. Today the material figure on a split M+L line is typed there and linked to nothing.
- A supplier price change in the library then **flows through** to every line that points at it,
  and from there into the estimate.
- In the **estimator** you can see the material options behind a line and **pick a different
  product** — the same swap the *Other ways to do this* card offers, but by product rather than by
  price-book line.

**Settled 17 Aug 2026**
- **The Price Book line carries a default product.** That default is what the estimate specifies
  unless the estimate overrides it on that job. So the book holds the standing choice; the job holds
  the exception — the same rule the alternatives card already follows.
- **Discontinued products auto-substitute** to a similar one rather than leaving a line dead.

**Still to settle**
- An auto-substitution **changes a price**. It has to say so — the drift bar built in v906 is the
  pattern: *"2 lines were re-specified because a product was discontinued"*, with what changed and
  what it cost. A silent substitution is the one thing that would make this untrustworthy.
- What "similar" means, and who decides: same supplier, same category, nearest price, or AI. The
  standing rule applies — it may rank and annotate, never invent.
- Does the library carry installed cost, or material only with labour still coming from the book's
  hours × rate? The second is more honest and matches how split lines already work.

Related: [[material-library-roadmap]], [[mood-board-roadmap]], and REVIEW #9 (the AI layer on
alternatives).

---

### 3 · Price Book edits do not re-price a job that is already open
**v906 · 2026-08-17 · RESOLVED, but read the rule**

A job still keeps the unit cost it opened with — that has not changed, and a price you typed on
the job is now genuinely protected (`ucSet`, which used to be wiped on the next book edit).

What is new: the Price Book shows a bar when the two have drifted — *"3 lines in this job price at
the old rate"* — with **Bring them up to date**. It skips anything you typed here, anything
specified from a supplier, and build-ups, which recompute anyway.

**Decide:** should this ever happen automatically, or is a deliberate button right? My view is the
button — a rate change silently moving a bid you have already sent is worse than a stale one.

---

### 4 · Infinity edge — $850/LF or $550/LF
**v873 · spa**

The old model used $850/LF. The spreadsheet you sent says $550/LF, and that is what is in the book
now. Never confirmed which is right.

---

### 5 · A standalone spa omits the spillway
**v873 · spa**

By design — there is no pool to spill into. It puts the standalone spa **$1,752 (Standard)** and
**$3,300 (Premium)** under the spreadsheet's figure. Confirm that is what you want, or the
spreadsheet's standalone number needs adjusting.

---

### 6 · Rafter and lattice lines do not fold into a family
**v927 · 2026-08-17 · RESOLVED without renaming**

`Aluminum 2x2 / 2x4` and `Steel 2x2 / 2x4` now fold. The first-word rule folds at **two** lines
rather than three; the dash rule still needs three, because `Steel Beam Wrap — Wood` reads fine on
its own while `Aluminum 2x2` is a bare repeat.

Renaming them to carry a dash was the other option and it was the wrong one: `mergeDefaults`
matches saved books **by name**, so every existing book would have kept the old line and gained a
duplicate. Seven two-line families appear book-wide — Electrical, Stone, Groundcover, Gas, Stone,
Aluminum, Steel — all of them sensible.

---

### 7 · Assumptions still living in code
**v886 · 2026-08-17 · price book**

Seventeen are now editable under **Price Book → Feeds every section → Assumptions**, with the code
constant kept as the fallback: veneer setting hours (by price point), install hours and watts for
all seven fixture types, and transformer capacity + headroom.

Still in code, deliberately:

| Constant | Decides | Why it stayed |
|---|---|---|
| `TK_FOOTPRINT` | assumed SF — firepit 20, fireplace 14, kitchen 2.5/LF | an assumed *quantity*, better surfaced on the Assumed screen in the take-off |
| `_spaGeom`, `_poolGeom` factors | interior SF = plan × 2.3334, excavation = SF × 0.189 | physical, not judgement — editing these breaks the model rather than tuning it |
| `SPA_RAISE_IN`, `SPA_JETS` | 0/12/24″ raise, 6/10/14 jets by price point | specification, not a rate — belongs with the spa builder's own controls |

**Decide:** do you want the geometry factors exposed anyway? My view is no.

---

### 8 · AI search answers are now checked, but the check is arithmetic only
**v908 · 2026-08-17 · price book**

Every dollar figure in an answer is matched back against the lines the model said it used. A figure
that is not one of those rates, and is not a clean multiple of one, is called out under the answer:
*"⚠ $73 is not on any line it cited — check before using"*.

What it cannot catch: a figure that happens to match a **different** line than the one meant, or an
answer that is wrong in words rather than numbers.

**Decide:** good enough, or should an answer carrying an unverified figure be withheld entirely
rather than shown with a warning?

---

### 9 · AI judgement on the alternatives card
**v924 · 2026-08-17 · price book · ON THE ROADMAP**

The **Cheaper ways to do this** card is built and needs no AI — the alternatives are the lines the
builder already picks between, and the saving is `(this rate − that rate) × quantity on this job`.

What it cannot do is say **which swap a client would accept**. Option B from the mockup adds a short
AI paragraph above the list: *"porcelain reads closest to stone at a distance and takes $1,200 off
with almost no loss on a patio — the joints are the tell. Decomposed granite is not a substitute
here, it cannot take furniture."* Plus a **Swap** button per row.

**Two things to settle before that is built:**
- A swap must change **this job only**, never the Price Book — the book is the library.
- The AI must not invent alternatives; it may only rank and annotate the lines it is handed.

Part of [[value-engineering-roadmap]] — the same arithmetic run across every line is how the app
would suggest where to cut to hit a budget.

---

## Settled

_(nothing yet)_

## 10 · Savings tab — what may be deferred, and the rough-in % (v930)
v929 offered to defer a pool. Wrong, and Warwick was right to stop it: excavating,
shooting gunite and re-plumbing through a finished garden costs far more than the
deferral saves and destroys what is already built. Pool and water features are now
excluded outright.

Deferral is only offered where phase two **drops onto services left waiting**:

| Section | Rough-in kept | What has to go in first |
|---|---|---|
| Outdoor Kitchen | 12% | gas, water, drain, dedicated circuit stubbed to the slab |
| Pergola | 13% | footings poured, conduit sleeved before the paving |
| Fire Pit / Fireplace | 8% | gas line run and capped at the location |

The percentages are my placeholders, not measurements, and they set what every
Defer card is worth. **Your call.** `VE_DEFER` in `index.html`.

## 11 · Value engineering — substitution sets (v929)
Which lines are interchangeable is domain knowledge, not something the data
knows. Inferring it from a shared unit had the app offering a GFCI outlet in
place of a main panel upgrade, so the sets are curated in `VE_SUBS`:
paving materials · irrigation methods · decking · fencing · court surfaces.

Anything not listed is never suggested — the safe direction, but it means the
big material choices are currently invisible to the tab, because they live in
builder sections (wall veneer, countertops, pool finishes, coping). **Extending
this list is the highest-value next move on the tab.**

## 12 · Value engineering — not built yet (v929)
- **Running-cost savings.** Needs address → utility-rate resolution. Confirmed
  for 1205 Patton Way: SoCalGas $2.08/therm, SCE 34.4¢/kWh, Cal Am San Marino
  $6.05/HCF flat (CPUC sheet 11646-W, eff. 1 Jan 2026) — but San Marino is split
  between Cal Am and Sunny Slope and the boundary runs inside the city, so the
  purveyor has to be asked once and stored on the project.
- **Swaps inside builder sections** (walls, kitchen, pergola, water, pool). They
  set their own quantities, so moving a quantity between lines does nothing.
- **Design fee estimator**, for comparing what VE saved against what design cost.

## 13 · Algorithms tab (v933)
Internal tab listing every derivation that is a **rule** rather than a rate.
Rates stay in the Price Book; single numeric assumptions stay in its Assumptions
pane; this is the arithmetic between them, and it links out rather than copying.

Fifteen entries: Savings 6 · Pricing spine 2 · Planting 3 · Water 2 ·
Structures 1 · Confidence 1. Each evaluates live against the open job.

**Constants hoisted out of formulas** into `ALGO_DEFAULTS` (localStorage
`studioh_algo_v1`), defaults unchanged:

| Key | Default | Drives |
|---|---|---|
| `ve.impact.min` / `.med` | 1 / 2 | which tier a swap lands in |
| `ve.frac.a` / `.b` | 0.4 / 0.2 | the partial-substitution shares |
| `ve.minSave` | 250 | smallest saving offered |
| `ve.roughin.kitchen/pergola/firepit` | 12 / 13 / 8 | what a Defer card is worth |
| `plant.ocFactor` | 0.75 | spacing → plant count → most of a planting budget |
| `plant.basal` | 0.8 | ground denied to groundcover |
| `plant.mulchAllow` | 0.10 | mulch area at install |
| `water.deficit.tree/shrub/gc` | 0.25 / 0.55 / 0.7 | established water per plant |

**Still to add** — algorithms that exist in the code but are not yet described
here: the pergola beam/post sizing, the louvered-kit build-up, transformer
sizing (the numbers are in Assumptions but the formula is not), the MWELO water
budget alongside the real-world model, and the establishment curve years 1–10.

## 14 · Lighting auto-estimate (v937)
Conceptual lighting package, computed from area/count data at the Lighting
section's price point. **Runs only when there is no lighting plan** (rule #1) —
any fixture with a quantity, or a trace, makes it step aside. Feature lighting
(BBQ, pergola, fire, water) is excluded; those are their builders.

**Wired from real data now:**
- Path/area: paving SF ÷ per-fixture (300/175/100 Accent/Std/Showcase)
- Turf path: border LF ÷ spacing (25/15/10) — border is √area×4, an estimate
- Tree uplights: 2 × density by box (sm 25/50/75%, big 50/75/100%)
- Downlights: trees ≥48″ box × 2
- Shrub uplights: bed SF ÷ 1000 × density (3/5/10)
- Tape: (bench LF + step LF) × 1.0, Standard+ only
- Wiring: fixtures × 25 LF; transformers: watts × headroom ÷ capacity

**Held for a trace (constants stored, NOT applied):**
- Front/rear/side yard factors (1.2 / 1.0 / 0.3) — needs to know which bed is where
- Tree property-line proximity & side-yard exclusion
- Walkway centreline LF (vs gross paving SF)
- Driveway: wall-mount-first hierarchy, wall LF vs open-edge LF, garage bays
- Downlight → path-light cross-reduction in turf (30′ spread)

All 26 constants adjustable in the Algorithms tab (`lgt.*`). The percentages and
spacings are Warwick's spec verbatim; the two softest — turf-border proxy and
25 LF/fixture wiring — are flagged as estimates in the UI.

**Next lighting step:** wire the trace-only refinements once a lighting trace
layer exists, and add the driveway sub-algorithm (needs wall segments + bays).

## 15 · "Place lighting" on the trace (v938)
A **Lights** button in the Take-offs toolbar drops the lighting algorithm's
layout onto the traced plan as real fixture markers, to look at and adjust —
the fastest way to dial the numbers in. Uses the same `lgt.*` constants.

Placement (space-agnostic — interpolates along traced points, works map-live or PDF):
- **Path lights** — evenly around each paving polygon perimeter (inset), driveway excluded
- **Turf path** — around turf perimeters by border spacing
- **Shrub uplights** — along planting-bed edges, by area density
- **Tree uplights** — a share of each size class lit, 2 fanned below each lit tree
- **Downlights** — trees ≥ min box, 2 each
- **LED tape** — step and bench runs copied as tapelight linears (Standard+)

Re-run replaces only what it placed; hand-placed fixtures are preserved. Traced
fixtures already flow into the Lighting section via ptApply.

**Still trace-geometry TODO** (the refinements from REVIEW #14 that a trace now
makes possible but this first pass does not yet use): yard weighting from which
polygon a bed/tree sits in, property-line proximity for tree uplights, walkway
centrelines vs gross paving, driveway wall-vs-open-edge, downlight→path
cross-reduction. The button is the hook to build these against next.

## 16 · Lighting pricing corrected to the cost database (v940)
Costs were ~2.5x too high ($43k/$83k/$126k on a 134-fixture package that should
be ~$17k/$30k/$60k). Design and pricing were already separate — the design engine
outputs counts, the Price Book prices them — so only the numbers changed.

| Line | Old (lo/std/hi) | New (Low/Med/Prem) |
|---|---|---|
| Path / Area | 110/195/380 | 40/120/300 |
| Uplight / Accent | 85/150/300 | 45/125/325 |
| Downlight / Moonlight | 130/225/450 | 50/140/350 |
| Step / Hardscape | 90/160/320 | 60/160/375 |
| Bollard (≈Well) | 170/300/600 | 65/180/425 |
| Low-Voltage Wire /LF | 4 – 12 | 0.7/0.85/1.1 |
| LED Tape /LF | 18 – 45 | 15/28/55 |
| Transformer & Controller | 650/1100/2400 | 475/850/1650 |

- Wire was the single biggest error (~10x). Now $0.85/LF, 12 LF/fixture.
- **Smart-control line no longer auto-added** — default control changed
  smart -> standard. Smart is a premium trait folded into the premium
  transformer, not a $1,325/transformer add-on on every scheme.
- Install hours trimmed (downlight 1.8->1.0, step 1.2->0.9, path/up 0.6->0.5) so
  per-fixture install lands near the DB's flat $55/75/120.
- `lightRepriceV1` one-time reseed force-sets these onto existing saved books.

**Not done (deliberately):** install stays hours x labor-rate rather than a flat
per-fixture number. It already lands close to the DB and the hours model ties
into the labor-tier system; converting to flat would decouple that. Revisit if
the flat model is wanted.

**Counts (design) are the other half of the "too high":** 100 uplights on the
sample is density, tuned in the Algorithms tab (`lgt.*`), not pricing.

## 17 · Lighting corrections + a root pricing bug (v941)
Warwick ran the placement and caught real errors. All fixed:

**Root pricing bug (affected every section):** `applyPriceBook` kept the old `uc`
even on un-edited lines, so a Price Book price change never reached a project that
already existed — which is why v940's corrected prices did nothing. Now a clean
line tracks the book's tier price; only a user-typed price (`ucSet`) is preserved.

**Density identical at every tier:** `lgtPoint()` read `S.cats.lighting.tier`, but
the Value/Standard/Premium tabs set `ptPricePoint()`. Now reads the active point →
counts scale (11 / 19 / 30 on the test trace).

**Placement geometry:** path lights now sit just OUTSIDE the paving edge in soil;
a block test rejects any fixture inside paving/driveway/pool/spa/water/building/
exclude or within 3 ft of a wall; shrub uplights scatter INSIDE beds (no more
property-line ringing); trees in excluded ground get nothing.

**Downlights:** only where a 36″+ trunk is within 12 ft of a paving edge
(`lgt.downNearPaving`), per Warwick's rule — not box-size alone.

**Install per fixture, flat** (55/75/120), not hours. I argued for hours against
Warwick's explicit instruction — that was wrong. Wire, transformers, sleeves and
120 V feed remain separate.

New constants: `lgt.install.low/std/prem`, `lgt.downNearPaving`, `lgt.edgeOffset`,
`lgt.wallClear`.

**Loose ends:** the `light.hrs|*` assumptions still appear in the Price Book
Assumptions pane but no longer drive install (they're dead for pricing now) —
remove or repurpose. Trace-geometry refinements from REVIEW #15 (yard weighting,
walkway centrelines, driveway wall logic, downlight→path thinning) still pending.

## 18 · Lighting tier buttons: stable & monotonic (v943)
The Value/Standard/Premium buttons priced the CURRENT placement three ways, and
auto-replace changed that placement on every click → all three totals shifted,
and the popover rendered before the re-place so a tier showed the previous tier's
count (Value appearing to have more uplights than Standard).

Fix: geometry walk is now a pure counter (`_lgtCompute` / `lightingCountAt`), each
tier priced from its own count at its own point (`_lgtPriceAt`). The three buttons
are independent of the current placement — stable, low < std < prem. Verified
12/20/36 uplights and stable totals [2850, 8007, 29526] regardless of which is
clicked.

**Watch — stale prices in the take-off:** the screenshots showed Path $415/ea and
wire $8/LF, which match neither the old nor the corrected book. That is the
price book on that project not carrying the v940/v941 corrections — most likely
the Cloudflare-synced `studioh_pricebook_v5` (a SHARED_CFG key) restoring the old
numbers over the local reseed. If prices still look stale after v943, Warwick
should re-open the Price Book, confirm the lighting lines read 40/120/300 etc.,
and **Publish** to push the corrected book to the cloud. Open question: should the
reseed run after cloud pull, or is re-publish the intended path.

## 19 · Lighting prices: edits win over the database (v945)
v944's enforcement meant lighting prices could not be edited. Fixed: typing a
lighting price (pbSetStd / pbEdit / pbStepStd) sets `it._lgtEdited`, and
`_lgtApplyPriceDB` skips any flagged line — so a hand-typed price survives reload
and cloud sync. The `↺ Reset` on the line clears the flag and the database takes
it back. The flag lives in the book item, so it syncs across devices.

So: un-touched lighting lines follow the cost database automatically (and can't be
reverted by a stale server copy); any line you type yourself is yours and sticks.

## 20 · Auto building footprint — site intelligence (v948, phase 1)
Hybrid approach (Warwick's call): real data first, AI refine on top.

**Phase 1 (built):** "Building" auto-fill button → `buildingDetect()` fetches the
building-footprint polygon from public GIS layers (`BUILDING_LAYERS`: FEMA USA
Structures, Microsoft), picks the largest footprint under the address pin, insets
it 2 ft (`build.inset`) roof→wall, drops it as an editable `building` polygon.
Confidence High/Med/Low from pin-containment + house-scale size. Graceful fallback
to hand-tracing.

Geometry verified headless (inset exact, selection correct). **Live GIS fetch is
untested from here** — needs a real address on the satellite view. If a region
returns empty, add/adjust a layer in `BUILDING_LAYERS`. Candidates if FEMA/MS are
thin: county building layers (LA County has one), Overpass `building=*`.

**Still to build:**
- Phase 2 — AI verify: send the satellite tile + the GIS polygon to Claude vision,
  flag only the wrong regions (missing wing/garage, bad corner), return confidence;
  prompt manual review when Low. Don't redraw the whole building.
- Phase 3 — Refine AI Trace: paint brushes Expand / Trim / Replace / Ignore-trees,
  re-detect only the painted region, merge, preserve the rest.
- Clip footprint to parcel (skipped in v1 — buildings rarely exceed the parcel).
- Then the same import→verify→refine flow for driveway, pool, spa, existing trees,
  paving, accessory buildings, retaining/property walls, planting areas.
- AI Learning Mode: corrections become per-project training context for later
  detections.
