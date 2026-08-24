# Review book

Things from the builds that need Warwick's eye. Nothing here is broken — these are decisions I
made on your behalf, numbers I could not confirm, or gaps I chose not to close alone.

Newest first. Move an item to **Settled** when it's decided, with the answer.

---

## Open

### 0 · Material price points — researched, with sources
**v1045 · 2026-08-20 · price book**

Replaced my earlier guessed figures with researched ones. Material only, $/SF, before waste, tax and
freight. Where national averages sit low against high-end SoCal residential, the Premium point is set
above the published range deliberately.

| Material | Value | Standard | Premium | Research range (material only) |
|---|---|---|---|---|
| Natural Stone Paving | $10 | $22 | $45 | $6–25/SF; bluestone $10–20, sandstone $5–12, local $3–8 |
| 3/4" Calibrated Limestone | $12 | $20 | $34 | select/calibrated sits at the top of the stone range |
| 2" Bluestone | $12 | $18 | $28 | bluestone $10–20/SF |
| Porcelain Pavers | $6 | $10 | $16 | 2cm porcelain $5–10/SF, to $15 |
| Concrete Pavers | $3 | $6 | $10 | wholesale from $2.50; Angelus $4–8; Belgard $6–7 |
| Brick Paving | $4 | $7 | $12 | brick pavers $4–8/SF, to $14 |
| Permeable Pavers | $5 | $9 | $13 | PICP $7–12/SF installed; material below that |
| Pebble / Baja Stone (2"–3") | **$4.50 flat** | | | one price per product, not a band |
| Rolled 3/8" Pebble | **$0.90 flat** | | | $60–120/ton decorative, ~120 SF/ton at 2" |

**Pebble, corrected twice.** I first guessed $6/$12/$22, then over-corrected to $1/$2/$4 by pricing
bulk small gravel. Warwick's definition is the right one: **Mexican beach pebble means the 2"–3"
rounded black or white cobble**, not the small stuff — that is *rolled 3/8" pebble*, a separate
product. The 2"–3" cobble carries a wide spread: bulk yards ~$66/ton, premium washed black at
$0.20/lb ($400/ton), select graded to ~$750/ton. At 90–100 SF per ton that lands at roughly
$0.70–$8.00/SF, hence $1.50 / $4.50 / $8.00.

**Settled:** pebble does not carry a price band — one product, one price. Both pebbles are now single
values that apply at every price point. *Rolled 3/8" pebble* is its own material.

**Corrected:** I had 2"–3" beach pebble set in mortar. It is not — both pebbles go loose over weed
barrier. `pav.pebble` is now *Decorative pebble over weed barrier*: excavate/grade, commercial weed
barrier fabric, place pebble, edging, cleanup. No road base, no compaction, marked non-vehicular and
ground cover in its attributes.

| | Stone | Assembly | Hours | Installed @ Standard |
|---|---|---|---|---|
| 2"–3" beach pebble | $9.76 | $0.83 | 0.044 | **$14.33 / SF** |
| Rolled 3/8" pebble | $3.59 | $0.83 | 0.044 | **$8.16 / SF** |

**Labour: researched, and DG's rate stands.** Published spreading productivity is 120–160 SF/hr per
worker by hand (0.006–0.008 hr/SF) and about 0.009 hr/SF for a 3-man crew with a tractor at 324
SF/hr. Your DG figure of **0.014 hr/SF** sits above both, which is right here — Warwick confirms
2"–3" pebble arrives in 50 lb bags that are dumped and spread, so there is bag handling on top of
spreading, but no hand-placing. **Both pebbles keep 0.014 and no complexity multiplier.**

**Material corrected again:** 2"–3" pebble was $4.50/SF, which works out near $430/ton. Published
pricing is $475–800/ton and $500–950/ton for premium, against $0.20/lb ($400/ton) wholesale in San
Diego. Set to **$6.00/SF** (~$570/ton at 95 SF/ton).

**Still mine, not yours:** weed barrier fabric at **$0.18/SF** (commercial woven $0.12–0.15, pro-grade
to $0.45+) and **0.006 hr** to lay it.

Sources: [homeguide flagstone](https://homeguide.com/costs/flagstone-cost) ·
[homeguide pavers/SF](https://homeguide.com/costs/pavers-cost-per-square-foot) ·
[Angi flagstone](https://www.angi.com/articles/what-are-common-flagstone-prices.htm) ·
[Prime — LA paver costs](https://prime3.com/blog/paver-cost-los-angeles) ·
[Levelworks — Angelus](https://www.levelworksinc.com/post/angelus-pavers-guide) ·
[Eagle Pavers — Belgard](https://eaglepavers.us/how-much-do-belgard-pavers-cost/) ·
[Angi porcelain](https://www.angi.com/articles/how-much-porcelain-pavers-cost.htm) ·
[homeguide brick patio](https://homeguide.com/costs/brick-patio-cost) ·
[homeguide permeable](https://homeguide.com/costs/permeable-pavers-cost) ·
[Cummin — beach pebbles](https://cumminlandscapesupply.com/beachpebbles1-riverrock_2)

Still yours to confirm. Adjust under Installation assemblies → Materials.

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

## v1065 — Plant Book adopts the Price Book palette
- The two books now share one palette block, transcribed by hex: `--pbg #FFFFFF`, `--pbcard #FBFAF6`,
  `--pbpill #FFFFFF`, `--brand-soft #EAF1E5`, toolbar `#C8DABE`. Selected row carries the same
  `inset 3px 0 0 var(--gm)` rail and green name as `.pb3-li.on`.
- Plant rows no longer toggle off; the list lands on its first row so the inspector is never empty.
- **Not done:** the plant row has no right-hand value the way a Price Book line ends in its price.
  A mature-size column was built and reverted — at ~370px the list cannot hold star + thumb + name +
  icons + a value without clipping. Open question: drop the icon groups from the row (they are
  already unreadable at that width), or widen the list.

## v1067 — Plant Book top bar, option C
- One row at rest (70px, was 226px across four rows). A second row appears only when a
  filter is on, listing only what is on, each chip removing that filter where you read it.
- All ten facets moved behind one `Filters` button carrying the active count. `_pbkActive()`
  is the single source for both the chips and the badge, so they cannot disagree.
- Kind tabs removed from the bar — the Type list in the tree already calls `pbBookKind()`.
- **Decision:** the project's Sunset zone counts as an active filter and is named in the row
  ("Zone 18"), because it narrows the book. `sunset:"all"` names nothing. "Clear all" now
  clears climate too, so the bar always returns to one row.
- Removed the old "✕ Clear N" quick button — it cleared a different set than "Clear all".

## v1068 — top bar is one row, always
- A project with an address always has a Sunset zone filtering the book, so C's
  "second row only while filtering" was in practice permanent. Reverted to a single row;
  the active-filter list and its removes moved inside the Filters panel, so nothing is lost.
- Borders removed from every control in the bar. Fill against the green band carries the
  weight; hover is a background change rather than an outline.

## v1069 — Plant Book sidebar, all sixteen sections
- Runs the full height of the screen (`calc(100vh - 168px)`, min 420px) and scrolls inside
  itself, so it never stops short with dead white beneath it. Width 206 → 236px.
- Sections: Type, Water, Sun, Fire, Climate zone, Mature size, Foliage, Bloom season,
  Availability (+ per nursery), Priced by nursery, Toxic/thorny, Top tags, Saved,
  In this job (+ by area), Recently added, Book upkeep.
- Every header folds and the fold is remembered in `PB_BOOK.secs`. Open by default: Type,
  Water, Sun, Fire, Saved, In this job. A folded section is skipped when counting.
- `_pbkTally(skip, keyfn)` walks the book once per section rather than once per row —
  16 passes instead of ~60 — and neutralises that section's own facet so its counts are
  what you would get by choosing it.
- **New filters:** mature size band (on `p.w`), priced/unpriced (`NURSERY_DB.stock`),
  toxic/thorny (`p.toxic`), recently added (last 30 in the book). All four clear with
  "Clear all" and appear in the active-filter list.
- **Fixed:** "Specified" was always 0 — it read `S.plants`, which is an object. Planting
  lives in `S.planting.zones[].{shrub,gc,tree,palm}Rows`. Now reports real counts by area.
- **Open:** "Recently added" uses position in the book (everything that adds a plant pushes).
  A real added-on stamp would survive a re-sort.

## v1070–1071 — Plant Book chrome made identical to the Price Book
- Count pills copied from `#view-pricebook .pbz-t .n` — `--brand-soft` fill, `--gm` text,
  weight 800, radius 6px, and white on the selected row. Verified equal on every computed
  property in both states.
- Geometry matched by measurement, not by eye. Bar: x117 y94 w1214 h72 r16px, no border,
  16px/18px padding, 40px controls. Columns: y181, tree 248px, list 642px, inspector 300px,
  radius 20px, `--pbcard` fill, same scroll caps (88vh / 78vh / 84vh).
- The list now scrolls inside itself at 78vh like `.pb3-list`, instead of growing the page
  to the length of the book.
- Remaining difference is content height only (tree 832 vs 750 in the sample) — every edge
  that determines placement is identical, so switching tabs moves nothing.

## v1072 — Plant Book type and rules matched to the Price Book
- No lines anywhere: the row divider (`.pb-item+.pb-item`), the green left rail on the
  selected row, and the 1px hairlines between icon groups inside a row. The hairlines are
  grid columns, so their fill is cleared rather than the column collapsed — `display:none`
  shifts every icon one place left and eats the water droplet.
- Rows now match `.pb3-li` exactly: `border:0; border-radius:13px; padding:10px 13px;
  margin-bottom:3px`, selected state a plain `--brand-soft` fill with no shadow.
- Type transcribed from the Price Book and verified equal by computed style:
  list name 13.5px/600, tree row 12.5px/700 radius 12px, section heading 14px/700 at
  -.014em, sub-heading 10.5px/600 at .02em.
- Note: `font: <weight> <size> inherit` is invalid shorthand — the declaration is dropped
  and the size silently falls back. Set font-size and font-weight separately.

## v1073 — Plant Book cards lose their border
- The three columns were using the global `.card`, which carries `border:1px solid var(--brl)`
  and a shadow. The Price Book's `.pbz-tree` / `.pb3-list` / `.pb3-ins` carry neither —
  measured `box-shadow: none` on all three — so both are now cleared, on the columns and
  on the toolbar.

## v1074 — Plant Book bar controls match the Price Book's
- The search field was a 999px pill with a 1px border sitting beside 11px-radius buttons,
  so it read as a different shape from everything next to it. Now 13px radius, no border —
  every control on the Price Book bar is a 13px rect.
- AI Search was a 25px pill inside the field against the Price Book's 39px Ask button.
  Now 32px, 13px radius, 12.5px type.
- Buttons: radius 11 → 13px, type 12 → 12.5px, so Filters / Tools / Add match Ask /
  Conceptual / Publish.

## v1076 — Plant Book rows: chips + species grouping
- Row is now flex, not a twelve-column grid: thumbnail (38px) → name/botanical → chip set →
  chevron. Chips in priority order: favourite, water, spread × height, sun, growth rate.
- Width is shed from the right by container query on `.pbk-list`: growth below 560px, sun
  below 470, size below 390, water below 320. The star never goes.
- Chips have fixed widths, so all 23 rows end at the same x (measured: 1 distinct right edge).
- Species grouping mirrors the Price Book's family rows. `_pbSpecies()` strips the cultivar
  and any var./ssp. from the botanical, then takes genus + epithet. A species with one entry
  gets no heading. Headings show the count and fold; state in `PB_SPOPEN`.
- Children indent by `padding-left` on the row, not margin on the wrapper — a wrapper margin
  pulls the right-hand chips in and breaks the flush edge.
- **Dropped from the mockup:** the gallon-size and price chips, at Warwick's call.
- **Open:** `Phormium 'Jack Spratt'` keys to `Phormium` while `Phormium tenax` keys to
  `Phormium tenax`, so a cultivar with no epithet does not group with the species. Correct
  botanically, but worth revisiting if it reads oddly on the full book.

## v1078 — plant detail moves to the right panel, prices become editable
- **Inline drawer deleted.** Tapping a row selects it and fills the inspector; the chevron
  went with it. Verified: 0 `.pb-body`, 0 `.pb-exp` in the view.
- Inspector is option A: Conditions · Climate · Sizes & prices · Tags · In this job · Actions,
  all in the Price Book's field rows.
- **Every size is priceable.** A nursery in LA prices nothing on a job in Chicago, so each size
  takes a typed number. Provenance is on the row: a quote reads green with the nursery named,
  a typed price reads amber, labelled "typed · over <nursery>", with a ↺ back to the quote.
  Revert only appears where a quote exists to go back to.
- Sizes shown = every size a nursery quotes, plus any typed; with no quotes at all, a ladder by
  kind (shrub 1G/5G/15G, tree 15G/24"/36", gc 4IN/1G) so an unstocked plant is still priceable.
- Verified end to end headlessly: quote $38 → type 55 → row turns manual, ↺ appears → click ↺ →
  back to $38, manual count 0.
- **DECISION NEEDED — where a typed price lives.** It is stored on the plant record (`p.mp`),
  which is the *shared master book*, so one user's Chicago price would follow the plant for
  everyone. Fine while Warwick is the only author. Before selling seats this has to become
  per-subscriber or per-region, like [[image-framing-roadmap]].

## v1079 — inspector photo never loaded
- `style="background-image:url("+JSON.stringify(p.img)+")"` — JSON.stringify wraps the URL in
  raw double quotes, which close the `style` attribute the moment they are written. The photo
  had never rendered. Now an `<img class="pbk-ph">` with `escAttr` and `onerror="pbImgErr"`,
  which also gives the broken-image fallback the background version could not have.

## v1080 — the inspector becomes editable (B + C)
- `PB_FIELDS` is one registry of ten editable fields — water, sun, mature size, growth,
  foliage, sunset, USDA, fire zone, bloom season, bloom colour — with a type each
  (one / many / num2 / text). Both faces render from it, so they cannot drift apart.
- **B — popover.** A field row is a target; its control opens beside the panel, over the
  list, where there is width. Panel height never changes. One popover at a time; closes on
  the same row again. Below 1180px the inspector is the only column, so the control drops
  under the row instead of floating off the edge.
- **C — form.** The same fields as one scrolling form. A record that is new or fails
  `hasDetails()` opens here; anything filled opens on the reading face. Read/Edit switch is
  always present, so either is one tap away.
- Editing a field clears `p.detFlag` — reviewing a value IS editing it, which is what the
  sidebar's "AI, unreviewed" count is watching.
- Verified headlessly on all four control types: water L→H, sun 1→2 values, spread→7,
  sunset→"8-9, 14-24"; thin record opens on edit (18 pills, 6 inputs), full record opens on
  read with 10 tappable rows and 0 popovers until tapped.

## v1081 — inspector polish, and the popover that never appeared
- **Nothing dropped down when a row was tapped.** `.pbk-ins` scrolls, so a popover positioned
  outside its box was clipped away — the row lit up and nothing else happened. The control now
  drops in flow under the row, which is what the mockup showed anyway.
- **A tapped row fills solid green**, like every other selected thing in the app, instead of
  growing a border. The `.hot` rule had to be id-scoped: `#view-plantbook .pbk-f` already paints
  those rows, so a class-only rule lost and the row stayed white while its text went white —
  an invisible row.
- **Every option is a pill.** Unselected pills had `--surface2`, near-invisible on the cream
  card, so the form read as loose text. White fill, 999px, green when live. Same for tags,
  text inputs and the Read/Edit track.
- **Section headings match the sidebar** — 14px/700 at -.014em, normal case, `--tx` — instead
  of the small grey uppercase they were.
- **Scroll stopped dead at the end of a column.** `overscroll-behavior:contain` on the list and
  inspector blocked chaining to the page. Removed; the panel's bottom padding went 18 → 22px.

## v1082 — long field values painted over their label
- `.pbk-f b` was not a sized flex item, so "Full sun · Sun–part · Part shade" overflowed its
  box and drew across the "Sun" label. Now `flex:0 1 auto; min-width:0; text-align:right;
  overflow-wrap:anywhere` — it wraps inside its own column and the row grows to two lines.
- Measured: label 1056–1094, value 1102–1287, no overlap, row 46px.

## v1083 — list / cards / photos, and sorting
- Checked first: no card or photo view survived in the file, so this is a rebuild. The only
  `pbMode` left is the Price Book's Conceptual/Contractor lens.
- Three faces of the same filtered set, switched top-right of the list header. The choice is
  remembered **per kind** (`PB_BOOK.vm`), so shrubs can sit in cards while trees stay a list.
- **Cards** — 150px min, photo 96px, name, botanical, water + spread chips. **Photos** — square
  tiles, name on a scrim; selected puts the name on a solid green bar rather than a ring.
  A plant with no photo still gets a card or tile: a gap you can see is a gap you fix.
- **Sorting** did not exist at all — the list was book order. Eight options, including
  **Has photo first** and **Missing photo first**, plus name, botanical, water, size and
  recently added. AI search still wins: when the model has ranked, its order is kept.
- Species grouping works identically in all three; cards and tiles sit in a grid under the
  heading. Consecutive ungrouped plants share one grid — wrapping each on its own put a single
  card per row, which is what the first build did.
- Verified headlessly: 18 rows / 18 cards / 18 tiles from the same set; "has photo" put 10 of
  10 photographed tiles first; "missing photo" put 8 of 8 blanks first; name sort alphabetical;
  view remembered across a kind switch and back.

## v1084 — no species bars in cards or photos
- Collapsed species bars sat between cells in book order, cutting the grid into runs of one
  and two cards with a full-width bar between them. Cards and photos are now one continuous
  grid; the list still groups.
- Measured: 1 grid, 0 species bars, 23 cells, 3 across at 624px (more at full width).
- **Not done, offered:** a species could instead occupy a single cell — one card showing the
  cultivar count, tapping it filters to that species — which would keep grouping without ever
  breaking the grid. Warwick has not asked for this yet.

## v1085 — one surface, tinted cards, round photos, zero borders
- **The white box is gone.** `.pb-list` was `background:var(--card)` plus a 1px border — a second
  surface inside the column, and the last line in the view. The count bar and the field now share
  one background.
- **Cards** take `--pbtile #F2F0E7` (dark #232B37), selected `--pbsel #DCEAD3`. Corners nest:
  photo 12 → card 15 → column 20, each tighter than what holds it.
- **The square photos were a class collision.** A generic `.ph` already exists as a button style
  with `padding:6px 10px 7px`; padding on an `<img>` insets the picture inside its own rounded
  box, so the well was round and the photo was not. Renamed to `.pb-cdph` with `padding:0`.
- Chips removed from cards; cards are ~120px instead of 190.
- **Border sweep, as asked.** First pass found 77, then 88 with the filter panel open —
  `pbf-pill` 37, `pbf-tag` 26, `pbf-sw` 12, `pbfp` 9, plus `hmenu`, `pbf-tagsearch`, `pbk-btn`
  and my own `pb-fpanel` separator. All cleared; the panel now separates with a gap.
  **Verified: 0 bordered elements in the whole view with the filter panel open.**

## v1086 — defaults
- The view switch track takes the same fill as the sort beside it (`--pbpill`, white) instead of
  `--surface2`, which was invisible on the surface.
- Cards is the default view; the switch reads **Cards · Photos · List**.
- Default sort is **Has photo first** — a book you judge by picture should lead with the ones
  that have one, and it puts the gaps at the end where they read as a to-do.
- Verified: switch `[Cards*, Photos, List]`, both controls `rgb(255,255,255)`, sort value
  `photo`, first 12 cards all photographed.

## v1087 — Materials & Furnishings take the Price Book frame
- Both books now render as green bar spanning the full width, then three cream columns:
  tree 248 · grid · inspector 300, radius 20, no borders.
- `_goodsTree(kind)` — Category, Supplier/Brand, Finish/Material, Book upkeep. Counts come off
  MATERIALS / FURNISHINGS directly, so a row cannot promise items the grid does not have.
- `_goodsIns(kind)` — photo, colour swatches, Price (cost green with the supplier and the quote
  date), Spec, Install (materials only), Tags, and Open full record.
- **Card tap now selects** and fills the inspector; the full record moved to a button in the
  panel. `MAT_PICK` / `FUR_PICK` are separate from `MAT_SEL`, which is bulk-edit selection.
- Two new sorts driven by the Book upkeep rows: **no photo first** and **price over 90 days
  first**. `_goodsStale()` treats a missing or unparseable `priced:` date as stale.
- The filter rail now starts closed — the tree carries category, supplier and finish; the rail
  keeps what it does not (colour, size, price band, on sale).
- **Nothing was removed**: rail, bulk bar, URL import, web search, AI search, card-size and the
  cards/photos/list switch all still run inside the middle column.
- Border sweep: 89 in Materials and 26 in Furnishings → **0 in both**, measured with a card
  selected. Offenders were card tag chips, the card footer rule, the "+N" chip, photo popovers,
  dropdown menus, the rail, and the tag search.
- **Open:** one bordered element reappears in Materials on some renders (a native select). The
  card copy is tighter than the mockup — the existing card body was kept rather than rebuilt.

## v1088 — the three books share one rule set
- **Root cause of the mismatch was mine:** the Plant Book's type, spacing and pill styling were
  written as `#view-plantbook`-scoped rules, so Materials and Furnishings fell through to the
  unscoped defaults — bigger text, wrong spacing, no pills. All three views now carry
  `class="view lib"` and **104 selectors were rescoped from `#view-plantbook` to `.lib`**, so
  one rule set serves all three. Nothing is re-declared per book.
- **The filter rail is never a column.** `matRailOpen()` returns false; category, supplier and
  finish are the tree, everything else opens from Filters.
- **Cards are the Plant Book's card** — 132px grid, 92px photo, 15px radius — carrying only
  name and supplier · price. The old body (tags, colour, availability, commission) moved to the
  panel, which is why the panel exists.
- **Top bar is one row at 72px.** The second row of chips is hidden, not deleted — all of it
  still opens from Tools. The bar title is gone; the left nav already names the book.
- Measured across all three: bar 72/71/71px on `rgb(200,218,190)`, cards 132/133/133,
  tree 248, inspector 300, headings 14px, tree rows 12.5px, **0 borders**.
- **Still off:** Filters sits above the grid rather than inside the green bar; the inspector's
  long spec values wrap awkwardly at 300px.

## v1089 — sort, views, auto-select, and the bar actually matching
- **Why the bar was still wrong:** the Plant Book passes `cls:"pb-gsearch"` into
  `goodsSearchBarHTML`; Materials and Furnishings pass none. Every rule I had written for
  `.pb-gsearch` therefore never reached them, so they kept the bare `.gsearch` — a 999px pill
  with `min-width:320px` that never flexed. Now `.lib .pb-gsearch, .lib .mat-h .gsearch` share
  one rule, and `.sp` is a flex row so the field fills it.
- Bar controls matched to the Plant Book: field 40px at 13px radius, chips 40px at 13px radius
  and 12.5px type, the book/web switch shaped like the AI Search button.
- **Sort like the Plant Book** — the same `<select class="pb-sort">` in the count row, eight
  options: has photo, missing photo, price over 90 days, name, supplier, category, price low→high,
  price high→low. Furnishings had **no sorting at all**; `furSortList()` gives it the same
  comparators.
- **Cards · Photos · List** in all three. Furnishings had no view modes; `FUR_VIEW` plus shared
  `_goodsTileCell` / `_goodsRowCell` draw photos and list with the Plant Book's own cells, and
  Materials now routes through them too, so the three libraries are one object in three places.
- **The first item is selected on render**, so the panel is never an empty column.
- Measured, all three: bar 72px, field 40px/13px radius, buttons 40px/13px/12.5px.

## v1090 — Filters moves into the bar and works
- **It could not open.** v1088 hard-wired `matRailOpen()` to `return false` to kill the rail
  column, which also killed the toggle — the button was live but had nothing to flip.
- Filters is now a `.pb-fbtn` in the top bar with its count, exactly as in the Plant Book, and it
  drops a `.pb-fpanel` inside the bar carrying the rail's own contents laid out as a wrapping
  row rather than a column. The old tab above the grid is hidden, which is the space it was
  taking.
- Verified by driving it: bar 72px closed → 220px open with 7 filter groups → 72px closed again,
  no errors.
- **Open:** Furnishings has no rail to put in the panel (`furRailHTML` does not exist), so its
  Filters button is present but empty until that is built. Its Tags menu still works.

## v1091 — product lightbox for Materials & Furnishings
- Tapping "Photos & financials" in the panel (replacing "Open full record") opens a sheet in the
  plant lightbox's language: prev/next, position, photo at size with a thumbnail strip from
  `goodsImgs()`, and three headline stats — your cost, client pays, what you make — read through
  `goodsModel()` so a resale book shows margin and a commission book shows commission.
- **Six cards, carrying every field the old detail view had.** The seven that were missing from
  the mockup are in: Heat, Edge restraint, CSI, and the five companion fields (Wall, Steps,
  Coping, Planting, Lighting) as a "Goes with this" card, plus the `m.ai` write-ups as Notes and
  `m.src` as a Source link.
- Quantity stepper drives the Earnings line live; "Add to project" writes through
  `specSheetSet()`, the same store the tree's Specified count reads.
- **iPad guards, measured at 1376×945:** sheet 1100×789, fits the viewport, body scrolls inside
  itself, cards wrap 4→2→1. Keyboard: ← → step, Esc closes.
- Panel gains one row — **You make · % · $/unit** — under Price. Anything more belongs in the
  lightbox; the panel is 300px.
- Verified by driving it: panel button label, 6 cards, 31 rows, 3 stats, quantity changes the
  earnings figure, next moves to the next product, Esc closes, no errors.

## v1092 — the lightbox was unreachable
- **Two real misses in v1091.** The panel photo had no `onclick` — the Plant Book's does, and I
  copied the markup without it. And the button sat under Actions at the foot of a scrolling
  panel, so it was never on screen.
- The photo now opens the lightbox, and the button moved directly under the name: solid green,
  full width, labelled **More info** (with a photo count when there is more than one). Its rule
  needed `.lib .pbk-btn.gd-more` — a plain `.gd-more` tied with the generic `.pbk-btn` fill on
  specificity and lost, which is why it first rendered white.
- Documents / Where used stays at the foot as a secondary action.
- Verified in both books: label "More info", fill `rgb(76,123,61)`, visible without scrolling,
  photo carries the handler, and both entry points open the sheet.

## v1093 — lightbox rebuilt: gallery + tabs
- The card grid is gone. It was the real fault: four boxes each set their own alignment, so
  nothing lined up across them however much padding was added.
- **Gallery is the larger half** — image `object-fit:contain` on a neutral field, so the whole
  picture shows instead of a centre crop, with a filmstrip under it and real space around both.
- **Facts are one tabbed column**: Money · Spec · Install · Supply · Goes with · Notes. Every
  field the record carries is in there — cost, bill, MSRP, sale, commission, earnings at qty,
  volume offer, quote age; category, finish, thickness, sizes, dimensions, material, cushion,
  weight, slip, ADA, heat, CSI; method, bedding, edge, joint, labour, installed; supplier, brand,
  location, distance, stock, lead, shipping, region; the five companions; the AI notes and the
  supplier link.
- **`_gBlank()` is one predicate** — `""`, `"—"`, `"-"`, `"–"`, `"n/a"` — used for rows, for
  hiding a tab that has nothing, and for the "Not recorded — …" line that names the gaps once.
  Measured: **0 empty rows**.
- A tab with no content does not render; on a thin record the strip shows four tabs, not six.
- Measured at 1376×945: sheet 1120×769, fits the viewport, each column scrolls on its own.

## v1094 — images: lazy loading and fixed boxes
- `loading="lazy"` appeared **zero times in the whole file** — every card, tile and row image
  in every library fetched immediately, so a full grid fired ~80 full-resolution requests at
  once. Supplier product photos are often 2–4 MB being drawn into a 92px box; that is the
  three-second stutter.
- Every card, tile, row and filmstrip image now carries `loading="lazy"`, `decoding="async"`
  and intrinsic `width`/`height`. Inspector and lightbox hero images stay eager — they are the
  thing you opened.
- **Measured on an 80-card list: 20 load, 60 defer.** On the 23-plant sample, 20 load and 3 defer.
- Intrinsic sizes plus the already-fixed boxes mean the grid does not reflow as pictures arrive.
- **Still open (the real cure):** imported products keep the supplier's own image URL and are
  only upgraded to R2 if the rehost succeeds — so some images still come from a supplier's web
  server at full resolution. Serving resized copies from R2 is a worker change.

## v1095 — imported images that were never there, and the supplier link
- **"2 photos" over a placeholder.** Nothing checked that a scraped URL was a photo.
  Bedrosians hands back links that 404 or refuse a hotlink, so the count reported stored
  strings while the tile rendered the leaf.
  - Import now **verifies every image in the browser** (`goodsVerifyImgs`) and keeps only
    what actually renders — a URL that fails is never stored.
  - `pbImgErr` **forgets** a dead link instead of re-requesting it every render. The order
    mattered: my first attempt overwrote `src` before reading it and captured the placeholder.
  - Opening a record **verifies its whole set once** (`goodsVerifyRecord`), so products
    imported before this fix repair themselves without a re-import. Measured: a record
    claiming 2 photos with two dead links ends at 0 and the button drops "2 photos".
- **After a batch import, the count of products with no usable image is offered for deletion**,
  in the same shape as the existing thin-spec prompt, staggered so the two never stack.
- **The supplier link never rendered.** The importer writes `srcUrl`; the lightbox read
  `x.src`. `_gSrc()` now reads `srcUrl || src || url`, and the link appears in three places:
  the panel's Actions, the Supply tab, and the lightbox footer — labelled with the host,
  e.g. "Open on bedrosians.com ↗".

## v1096 — Tools restored (a v1088 regression I caused)
- v1088 hid every non-primary chip in the library bars, claiming "all of it still opens from
  Tools". That was true for Materials' *contents* but I hid **the Tools trigger itself**, and
  Furnishings had no Tools menu at all — so eleven actions vanished, including **Get images**
  and **Save to server now**.
- `.mtools` is now exempt from the hide rule, and `furToolsHTML()` gives Furnishings the same
  menu Materials has: Price sheet · Estimate prices · Get images · Colours from photos ·
  Fix brands · Material type · Outdoor sort · CSI & location · Find sales · Drop empties ·
  Save to server now.
- `matDDToggle()` redrew Materials whichever book you were in, so the Furnishings menu opened
  in state and never painted. It now redraws whichever view is active.
- Verified with the right selector — `_ddFit` portals an open menu to `<body>`, so querying
  inside the view returns nothing and my first three readings were false negatives.
  Materials 13 items, Furnishings 11, with live counts (Get images 3 / 4).

## v1097 — the Bedrosians bug, found
- **Root cause: a duplicate function.** A plain `_imgLoads(url)` already existed at line 18252
  accepting anything with `naturalWidth>0`. Two function declarations in one script means the
  later one wins, so the strict check I added in v1095 was silently replaced. Every verification
  since had been running the loose one — which is why a row could claim three images that show
  nothing: supplier swatches and 1px pixels load perfectly. Renamed to `_goodsImgOk`.
- **The check now requires a real picture**: http(s) only, and at least 80×80. Proved with served
  files — 16px rejected, 400px kept, missing rejected, 1 of 3 survives.
- **The re-read never verified at all.** v1095 added verification to the import path only;
  `goodsFetchImages` stored whatever it scraped. It verifies now too.
- **Per-product "Find images"** in the More info sheet, scoped to that one product, no confirms —
  replacing the whole-library sweep, which is removed from both goods Tools menus.
- **Import leaves image-less products out by default** and says so, instead of adding them and
  offering a clean-up afterwards.
- The Plant Book keeps its bulk "Fill missing images" — a plant book is filled in bulk.

## v1098 — why Find images found nothing
- The code only ever read `sc.images` — the `<img>` tags in the server-side HTML. Bedrosians
  and most modern catalogues **lazy-load their images**, so that list is empty or near it even
  though the page is full of pictures.
- `_goodsAllImages(sc)` now also reads **schema.org `product.image`** and the **Open Graph**
  tags (`og:image`, `og:image:secure_url`, `twitter:image`), which sites publish precisely so
  other software can find the photo. Used by the import and both fetch paths.
- Verified end to end with served PNGs: gathered from og:image + JSON-LD, ranked, 16px swatch
  rejected, real photo kept.
- **A category URL now says so.** `_goodsIsListUrl()` recognises `/product/list/`, `/category/`,
  `/collection/` etc. and explains that a listing has no product photo of its own, instead of
  reporting "nothing usable" and sending you hunting for a bug.
- **Still worker-side, not fixed here:** discovery found 9 products on a catalogue with hundreds.
  `goodsDiscover` already asks for 1500, so the limit is not the client — the worker reads the
  served HTML, and a JS-rendered listing exposes few product links. The cure is for the worker
  to read the site's sitemap.xml or follow pagination.

## v1099 — "DimensioHs": a label overflowing its own box
- `.pbk-f .k` had `min-width:38px`. With a long value the label shrank to 38px and
  "Dimensions" — about 75px of text — overflowed its box and printed across the value.
  The v1082 fix had made the *value* behave; the label was the other half.
- Label minimum is now 72px, and **a value over 22 characters stacks**: label on its own
  line, value beneath, left aligned — the same rule the lightbox already uses. The panel's
  field helper also drops blank values now, so `_gBlank` governs every surface.
- Measured on the Ecal stool/table record: 6 rows, 1 stacked, **0 overlapping**.
- **Open:** that record is really two products in one row — "Stool: 17×13×17; Table: 28×19×11".
  A variant selector is the honest fix; stacking only makes it legible.

## v1100 — 9 products became 230, and why some had no photo
Diagnosed against the live site rather than guessed:
- **Product pages are fine.** `/product/detail/celine-tile/` returns 3 images and an `og:image`
  on five fetches out of five. The links were never bad.
- **The listing is paginated and page 1 is the thinnest.** `?page=1` yields 6 product links,
  `?page=2` 14, `?page=10` 31 — each page a different slice. Discovery only ever read page 1.
- `_goodsDiscoverPages()` now walks `?page=2…` merging unique `/product/detail/` links until two
  consecutive pages bring nothing new, capped at 40 pages. **Measured on bedrosians.com:
  6 → 230 products.**
- **The photo-less rows point at the listing itself.** Discovery returned
  `/en/product/list/` and a bare `/product/detail/` among its "products", so rows were created
  from pages that have no product photo — which is exactly what "Tiles and Slabs" is. The page
  walker now keeps only URLs with a slug after `/product/detail/`, so those rows stop being
  created; v1098 already explains the case when you hit Find images on an old one.
- Note for the record: `bedrosians.com/robots.txt` and `/sitemap.xml` are behind an Azure WAF
  captcha (403), so a sitemap-based crawl is not available — pagination is the route that works.

## v1101 — duplicates, in all three books
- **There was no guard at all.** Every import minted a fresh random id, so re-running that
  Bedrosians catalogue would have produced 230 second copies.
- `_goodsUrlKey()` canonicalises a product URL — drops scheme, `www.`, query, hash, trailing
  slash, case — so the same product written four ways matches. `goodsFindExisting()` tries the
  URL first (exact) then supplier + name (for hand-added rows and older imports).
- The check runs **before the fetch**, so a re-run of a catalogue costs nothing for the products
  you already have, and again after the name is known, since one product is often reachable at
  more than one URL.
- The batch reports it plainly: *"180 imported · 50 already in your library"*, live in the
  progress line as it goes.
- **Plant Book:** `addPlantByName` now matches on common *or* botanical name; if the plant is
  already there it selects it and says so rather than adding a second copy.
- Verified: four spellings of one URL all match, a different URL does not, and name matching
  works on both plant name fields.

## v1102 — delete, bulk select, and the Tools race
- **Tools intermittently did nothing.** `matDDToggle` called `_ddFit()` itself, and the render
  schedules another on the next frame. `_ddFit` strips every `body > .mddm[data-portal]` and
  then re-portals only `.mddm.open:not([data-portal])` — so the second run removed the menu the
  first had just portalled and could not re-find it. Whether it survived was a timing race.
  The explicit call is gone; the render's own is enough. Six runs out of six now open, both books.
- **Delete existed but was barely reachable** — `goodsDelete()` only from the full-record view,
  and the bulk bar only in List. Now:
  - **Delete** at the foot of the right panel and in the More info sheet, both confirming by name.
  - **Select mode**: a Select button in the count row. Tapping a card picks it instead of opening
    it; picked cards, tiles and rows carry a green ring. The bar shows the count with **All shown**,
    **Clear** and a red **Delete n** — and warns when any of them are specified on the project.
  - Filter to a brand in the tree first and "All shown" means that brand.
- Selection is per book and clears when the mode is turned off.

## v1104 — two site-wide bugs, and the gestures
- **Cards blanked when selecting.** Every selection re-rendered the whole grid, which discards
  each `<img>` and re-requests it. Selection now toggles the class on the one element you touched
  and syncs the count in place. Proved by identity: the same `<img>` node survives a select.
- **Every click scrolled to the top, on every page.** A render replaces `innerHTML`; for a moment
  the page has no height and the browser clamps scrollTop to 0. `renderMaterials`,
  `renderFurnishings`, `renderPlantBook` and `renderPriceBook` are now wrapped in a shim that
  snapshots the window and every scrolling column and restores them on the next frame — so all
  their call sites are covered without touching one of them. Snapshot is **by selector and index,
  never by element**: the render replaces the node, so a stored reference is already detached.
  Measured: tree at 180px before a click, 180px after.
- **Gestures.** Swipe a list row — right adds to the project at its existing quantity, left
  deletes (still confirming). A drag that is mostly vertical is handed back to the page, so
  scrolling still works. Hold 500ms or right-click any card, tile or row for: Add to project ·
  Favourite · Compare · More info · Find images · Open on <supplier> · Delete.
  `-webkit-touch-callout:none` keeps Safari's own callout out of the way.
- Swiping is off while Select mode is on, so the two cannot fight.

## v1105 — Compare: tray and sheet
- **Tray** appears only once something is picked, per book, four maximum with the oldest
  dropping off. Carries thumbnails with a remove ✕, the count, **the quantity**, Clear and
  Compare. `body.tray-on` adds matching bottom padding to the grid so the last row is never
  hidden behind it.
- **Sheet** is a table, not four spec cards: cost · client pays · you make · installed, then the
  job total and earnings **at the tray's quantity**, then finish, thickness, sizes, slip, heat,
  and lead · stock · region · supplier. Rows nobody carries are dropped entirely.
- **Best value marked per row** where "better" is unambiguous — lowest cost, highest earning,
  best slip, shortest lead, most stock. Heat and finish are judgements and stay unmarked.
- **Differences only** hides every row where all agree, and says how many. Measured on three
  Bedrosians tiles: 7 rows → 3, with "4 rows hidden".
- The quantity is why the tray exists: `At 640 sf` reads $54,170 / $103,091 / $27,507 — the row
  that actually decides it, and it means nothing without a number set before the sheet opens.
- **Not done:** printing. The same table is what you would send a client, so it belongs in
  Reports as well as here.

## v1106 — the blanking, properly this time
- v1104 fixed the wrong path. Select mode was one route into it; the ordinary one is
  **clicking a card**, which called `goodsPick` → `renderMaterials()` → the whole grid rebuilt
  and every `<img>` discarded and re-requested. The Plant Book did the same through
  `pbkSelect` → `renderPlantBookList()`.
- Both now repaint only what changed: the two cards whose highlight moved, and the panel.
  `_goodsPickPaint()` falls back to a full render if the panel is missing, so nothing can
  get stuck.
- Plant cards and tiles carry `data-pid` — without it the highlight had nothing to find in
  card or photo view.
- Verified by node identity in both books: the same `<img>` elements are still there after a
  click, all still loaded, highlight moved, panel refilled.

## v1107 — the compare tray sits over the work area, not the window
- It was `left:0;right:0` with a 1240px inner bar, so it ran under the green rail and was the
  same width whether one thing was picked or four.
- It now measures the **active view** on every paint and takes that left and width, so it centres
  on the working area whether the rail is open or closed. A resize listener and a
  MutationObserver on `body.class` re-measure when the rail toggles.
- **Width follows content.** One pick shows a thumbnail and "hold another to compare"; the
  quantity field and Clear only appear once there are two. Measured: **332px → 428px → 550px**
  at one, two and four picks, centred at 724 every time, and clear of the rail at each size.

## v1108–1109 — Compare rebuilt: $/sf, install, and rows you choose
- **Money block, four rows, fixed and first**: Material $/sf · Install $/sf · Installed $/sf ·
  Total at the area. Nothing else unless you add it.
- **$/sf normalisation.** `_cmpPerSf()` reads the unit and the size string: a stated coverage
  ("1.06 sf/sheet") wins, else the piece size is parsed — inches with fractions — to give pieces
  per sf. Verified across three units in one comparison: $0.95/pc → **$8.55**, $35.00/sheet ÷ 1.06
  → **$33.02**, $14.20/sf → **$14.20**. Where the size cannot be parsed the row says
  **unit unknown** and stays out rather than guessing.
- **Area and method in the header.** Install comes from the Price Book assembly's `nonMatSF`.
  Where there is no rate the install rows read **no rate yet** and the footer says which of the
  three reasons applies — no assembly, assembly with no rates set, or supply only.
- **Add a row.** Fourteen fields, each showing how many of your picks carry it; fields nobody
  carries are listed but disabled. Colour renders as swatches. Choice persists in `PREFS.cmpRows`.
- **The sheet never grows.** Fixed at `min(1120px, 95vw) × min(720px, 88vh)`; the body scrolls.
  Measured: adding four rows took labels 6 → 9 with the height unchanged at 720 and the body
  scrolling.
- **Each product links to its page** — host-labelled, new tab, absent when there is no URL.
- **Recovered from my own mistake:** the region replacement that rebuilt the sheet also deleted
  twelve functions that happened to live inside it (`_gBlank`, `_gSrc`, the whole `goodsLbx*`
  set). Restored from the last commit and verified by diffing every function name against it —
  a check worth running after any region replacement.

## v1110–1111 — Compare from Select, and the tray that flashed
- **Compare joins the select bar.** Pick several cards, press Compare — no need to hold each one.
  Enabled at two, capped at four with a prompt when more are selected, and it hands the picks to
  the tray so the two stay consistent. Verified: disabled at 1, "Compare 3" at 3, opens a
  three-column sheet, leaves select mode, tray shows three slots.
- **The flashing was a feedback loop I built.** v1107 added a `MutationObserver` on
  `body.class` to re-measure when the rail toggles — and `_goodsTrayPaint` toggles
  `body.tray-on`. So the paint triggered the observer that triggered the paint, forever. That is
  the flashing, and it is why the Compare button could not be clicked: the element was replaced
  before the tap completed.
  - The observer is now a `ResizeObserver` on the **view**, which the tray cannot change.
  - The class is only touched when it actually differs.
  - The paint carries a signature of picks + quantity + width and returns early when nothing has
    changed, so identical markup is never rewritten — rewriting it discards the thumbnails and
    re-requests them.
  - Measured: two adds produce two builds, then **zero rebuilds while idle**, and the same
    `<img>` node survives.

## v1112 — Dialogs, and the importer's filter-page bug
**Decided**
- The app has its own dialog, `askDlg({title, body, note, danger, actions:[…]})`. Buttons are
  named after the action, so the body never explains them. Primary is last (green, or red for
  destructive); Escape, the scrim and a stray tap all take the *first* button, which is the safe
  one. Destructive dialogs focus the safe button so a held Return cannot confirm a deletion.
- `alert()` is deliberately left alone — it is already replaced with a bottom notice further down
  the file, because a browser told to "prevent additional dialogs" kills alert() silently and
  Save/Open stop working. Only `confirm()` produces the native grey box.
- 20 confirms converted (importer, materials, furnishings, deletes, compare). **51 remain** in
  trace, plant book, projects and the price book.

**Fixed**
- The importer was offering a site's own filter pages as products. qdisurfaces.com returned
  20 `/products/<facet>/<facet>/` alongside 1,447 `/product/<slug>` — and the filters sorted
  first, so the opening screen was entirely filters. `_goodsDropFacets` drops them on two
  structural signals (a site publishing `/product/` in bulk is using `/products/` for listings;
  two or more segments under a `/products/` root is a filter crossing) and never returns an empty
  list. Verified against live data: 1,467 → 1,447, Shopify-shaped catalogues untouched.
- `goodsDeleteOne` asked, then called `goodsDelete` which asked again. `goodsDelete(book,id,asked)`.

**Open**
- The remaining 51 confirms.
- The notifications question is still undecided — 216 toasts, ~80 of them saying a thing that is
  already visible on screen.

## v1113 — The importer, as cards
**Decided**
- 24 products a page, shown on the library's own card: photo, name, supplier, price.
- Only the 24 on screen are read. A peek is one fetch per product with **no model behind it** —
  the page's own structured data carries name, price and photo. "Select all N" never peeks and
  imports from the URL list exactly as before, so taking a whole catalogue costs nothing extra.
- Price on the card is `toFixed(2)`, not `fmtN`. $4.49/sf rounded to $4 is an 11% error and this
  card is what the tile gets chosen on.
- **With photos** is the default. Photoless products drop out once the page has finished reading
  — not per card — and the page backfills from further down the list. Capped at three refills,
  because a supplier with no photos would otherwise have its whole catalogue read to fill one
  screen. Whatever was set aside is counted in the bar with a **Show them** button next to it.
- A tap repaints one card and the footer, never the grid. Re-rendering on tap is what made every
  other card blank for a frame.
- The rail carries this site's groups (from the existing layer detection) above the suppliers
  already in your library, so a second import is a tap rather than another paste.
- Finishing asks **Close** / **Import more**; "Import more" leaves the picker where it is with the
  selection cleared.

**Open**
- Furnishings still has no filter rail (`furRailHTML` does not exist), so its Filters panel is empty.
- No way to upload your own photo for a product that has none.

## v1114 — Why the card picker came up empty on a real supplier
Shipped in v1113 having only ever been tested against a stub. Driven against
qdisurfaces.com it produced 24 empty cards. Three faults, stacked:
- **The layer sampler raced the cards.** `_gpickAnalyse` asks the reader for a dozen pages at
  once — a dozen upstream fetches into the same supplier the cards are being read from — and its
  two re-renders abandoned the card reads mid-flight. It now runs *after* the first page of cards.
- **A failed read was cached for ever.** One timeout and that card stayed dead, because nothing
  ever asked again. Reads now retry (three times), and `_gpickPeekOne` retries internally because
  the reader gives up at ~9s while a cold page on a big catalogue takes longer — the same page
  answers instantly on the second ask.
- **A photo that would not LOAD was reclassified as "no photo"**, which under "With photos" deleted
  the card. On a supplier whose CDN is unreachable that emptied the whole grid. It now says so and
  stays put.

**Lesson, recorded:** a stub proves the rendering, never the flow. Anything touching the scrape
worker gets driven over CDP against a real supplier before it ships.

## v1115 — The search bar IS the importer
**Decided**
- One box. A **link** opens the picker immediately — no 40-second model call to confirm that
  bedrosians.com exists. A **search term** runs the supplier search and then goes straight into the
  best match's catalogue.
- **The intermediate list of eight suppliers is gone.** Finding suppliers and then making you pick
  one from a list was a step for its own sake.
- The rail carries the other suppliers **for that search** — a tile search gives tile houses, a
  furniture search gives furniture houses — under "Also for '…'". Switching supplier keeps the rail
  and puts the one you left into it.
- Pasting a link cannot know the category, so its rail is your own suppliers plus **"Suppliers like
  this one"**, which reads what the site sells off its own pages and then searches. On request only:
  it costs the best part of a minute.

**Verified on the live site**, v1115, real web search: "outdoor porcelain pavers" → picker on
qdisurfaces.com, 1,447 products, rail listing Walker Zanger, Thompson, MSI, Bedrosians, Arizona
Tile and Daltile — all outdoor-paver pages.

**Open**
- Related suppliers show their host rather than their company name when the structuring call
  returns nothing and the prose fallback is used.
- QDI's image CDN refuses this machine, so photo rendering on that one supplier is still unverified
  from here; Bedrosians renders 18 of 24.
