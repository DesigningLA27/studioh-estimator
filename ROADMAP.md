# Studio H Estimator — the complete roadmap

**Built 16 Sep 2026 against v1520.** This is the single list. It was assembled by sweeping every
session on disk — **1,846 of Warwick's messages** across four transcripts (779 MB), **96 deferrals**
written at the end of a version, and **17 explicit "add to the roadmap" instructions** — then
reconciling every one against the live `index.html`, `BACKLOG.md` and the 83 roadmap memories.

Items marked **★ RECOVERED** were raised, deferred, and never written down anywhere until this sweep.
They existed only in the transcripts.

Nothing here is a guess about what Warwick wants. Where a number or a decision is his, it says so.

---

## 1 · Decisions owed — each blocks work

| # | Decision | What it blocks | Cost of not deciding |
|---|---|---|---|
| 1.1 | **UI direction** — three mockup sets published, none chosen. Liked E · Night Studio, then sent the Ordo reference. | **All UI code.** No new UI goes into `index.html` until picked. | Everything visual is frozen |
| 1.2 | **Duplicate plant records** — 26 groups, 32 surplus rows, Spanish Lavender ×6. Merge is safe since v1519. | Plant book accuracy | Moves Garibay **+$11,577** |
| 1.3 | **Groundcover plugs per flat** — all four species read 36; the tooltip still says "often 50 or 72". | Flat counts | App may buy ~2× the flats needed |
| 1.4 | **`mirrorImagesToR2()` has never been run** — 68 of 104 images would copy to R2. | Image durability | 62 images still on someone else's server |
| 1.5 | **Six dashboard preset defaults** — Warwick sets them, not to be guessed. ★ RECOVERED | Dashboard presets ship incomplete | Presets are half-built |
| 1.6 | **Product name** — mockups keep "Studio H"; the reference was "Ordo". `.com` is exhausted for anything good. Needs to work for landscape + architecture + interiors + realtor versions. ★ RECOVERED | Branding, launch | Launch copy can't be written |
| 1.7 | **A PRO subscription tier** — the Ordo mockup gates Nurseries, Color Library, CAD Details, HOA behind PRO. Drawing it now commits to accounts early. | Tier model | Mockups can't be finalised |
| 1.8 | **Workflow steps vs phases** — treated as answered (steps map onto `PHASES_ALL` snapshots), needs confirming. | The rail's spine | Data-model risk if wrong |
| 1.9 | **`SEC_TIERS` naming** — the Price Book's "Entry/Standard/Premium/Luxury" is a separate four-tier system from "Value/Standard/Premium". Renaming touches every section and every stored band. ★ RECOVERED | Tier consistency | Two tier vocabularies in one app |
| 1.10 | **76 orphaned nursery items** — auto-add all to the Plant Book, or filter the vegetables/annuals first. ★ RECOVERED | Nursery import | 76 items in limbo |
| 1.11 | **"Project Sample 1"** (`bid_mt9her0rfie5`) — 6.2 MB of a pre-migration plant-book snapshot. Safe to open since v1496, still useless. | Nothing | Dead weight |

---

## 2 · The estimating engine — the architecture half-finished

This is the deepest unfinished layer in the app and almost none of it was written down.

| # | Item | State |
|---|---|---|
| 2.1 | **Assemblies exist for paving only.** Pool, spa, walls, decking and planting still price off flat book rates. Walls/decking/planting are scaffolded with no costs; pool and spa have no assemblies at all. **Needs Warwick's cost sheets, same format as the paving one.** ★ RECOVERED | The real limit |
| 2.2 | **O&P has no UI.** Built v1029 — assemblies output Direct Construction Cost only, O&P resolves line → project → contractor profile → global default, all four levels sitting at 0. `studioh_oap_v1` is a live config key. Nowhere to set it, and nothing says so. ★ RECOVERED | Engine only |
| 2.3 | **Components are copies, not references.** The root cause behind assembly drift. Fix is a shared resource library — materials and labour tasks as objects, assemblies declaring how much they use. Not started, deliberately. | Not started |
| 2.4 | **Phase-defer on lines.** A line is only in or out; it cannot be pushed to a later phase. ★ RECOVERED | 0 hits in the live file |
| 2.5 | **Complexity factors and tier productivity** — logged in `REVIEW.md`, waiting on Warwick's numbers. ★ RECOVERED | His numbers |
| 2.6 | **LF and EA efficiency curves** — only SF is real; the others fall back and flag it. ★ RECOVERED | Partial |
| 2.7 | **Edging is an SF allowance, not LF-based.** Agreed to wait for takeoff geometry; the geometry now exists. ★ RECOVERED | Unblocked, undone |
| 2.8 | **Selection Engine** — returns confidence and reasons (v1030) but still labels rather than pre-selects. No explanation bullets in the UI, no alternatives advice. | Advisor roadmap |
| 2.9 | **★ The alternatives card's "B"** — A shipped (the swap list). B never got written down: AI reading the alternatives first and adding the judgement arithmetic can't — *"porcelain reads closest to stone… DG is not a substitute here, it can't take furniture."* Meant to land with value engineering. ★ RECOVERED | Lost until now |
| 2.10 | **Discontinued-product auto-substitute** — two unanswered questions: what "similar" means and who picks it; and whether the library carries installed cost or material-only with labour still from hours × rate. ★ RECOVERED | Open questions |
| 2.11 | **Provenance** — per-number source (assumed / AI / designed / entered), "% assumed", revert-to-calculated, audit trail, uncertainty ranges from lo/hi. Four disclosure levels and the research button have no UI. | Algo list |
| 2.12 | **Assumptions table** — the rules themselves as data in the Price Book, so rules reference rates instead of hard-coding them. | Algo list |

---

## 3 · Algorithms still to design — Warwick sets the numbers

Guessed rates have been wrong every time: pot $1,425 → $750, pergola $3.1k → $38k, SPJ uplight $280 → $150.

- **Value engineering** — reads the estimate against the budget and proposes how to close the gap, with the trade-off per suggestion, not just the saving. In Take-offs *and* the estimate at every phase. **The biggest one on this list.**
- **Lighting design** — fixtures placed by context: uplights per tree, downlights where a tree meets paving, well lights ~4' OC on accent walls, shrub uplighting weighted front > rear > side, vines on property walls, LED tape geometry for counters, toe kicks, step treads, bench runs.
- **Planting palette** — species mix, densities and container sizes by zone, sun and water use.
- **Lighting energy** — fixtures carry watts for transformer sizing, but nothing prices kWh. Any energy figure today would be invented. ★ RECOVERED
- **Sun & shade study** — shadows by date and time from the site's lat/long, cast from footprints and canopies. Inputs mostly exist (`S.pi.lat`/`lng`, traces in lat/long so north is derivable, per-plant `w`/`h`, `USFS_GROWTH` rates). Missing: a real house height, off-site shade (the neighbour's house and trees), terrain slope.

---

## 4 · Bid Compare — built v1521

A new tab. Four parts:

1. **Input several contractor bids** and have AI compare them.
2. **A comparison report** — red flags, variances from standard industry pricing, omissions, and a full list of every allowance and every missing item.
3. **An "actual" bid price** — what the real cost is once every bid is on the same footing: like-for-like line items, allowances equalised, omissions added back in. *The number the tool exists to produce.*
4. **Contractor lookup** — CSLB licence status, violations, workers' comp, bond amount; a full report on the contractor.

**Shipped v1521** as its own tab, replacing the "not built yet" lightbox. All four parts are in.
Standard industry pricing comes from the Price Book, never invented — every dollar the tool adds to
a bid is this project's own estimate for that section, and the working is on show.

**CSLB, checked rather than assumed (16 Sep 2026):** there is no public API, and the licence-detail
page ignores a licence number in the address — `LicNum=` redirects to the search form, so nothing can
fetch it. It works the way v1485 solved the same wall for setbacks: a button that opens the real
record with the number copied, a paste box that reads what comes back and cites it, and `bcProvider`
left inert as the seam for a paid lookup service.

**Round 2, specified 16 Sep 2026 — the part that makes it valuable, none of it built:**
- **Material allowance model.** A line is installed $/SF *of which* material $/SF, and the material is
  either a product they named or an allowance (*"$12/SF material allowance, incl. tax, overage and
  shipping"*). When we drew limestone, the question is whether their allowance buys it.
- **Questions, not only flags.** *"$32,000, per plan"* against a plan saying limestone is an
  unanswered question — hover an icon for it, and/or an allowances chart comparing all bids.
- **A sparse bid is itself the red flag** — few big line items means room to change-order. Listed for
  the client in words a client understands.
- **A contractor recommendation report** — why to use them.
- **A risk / confidence score**, big and obvious (68/100, or D+): distance under the realistic number,
  count of lines below minimum industry cost, allowance exposure, and contractor standing (licence
  history, bond, years licensed).
- **Consistency against our in-house pricing** — % +/- from standard, per line and per section.
- **Second audience:** contractors themselves, to show why their bid beats an unethically low one.

**Data it needs and does not have:** a **minimum credible install cost** per assembly — a floor, not
the Price Book's `lo` band — plus the score's weights. Warwick's numbers, not to be guessed.

**Also open:** the allowance-heavy threshold sits at 10% of the bid. Line-to-section matching is
keyword-based and editable per line. Nothing exports yet.

Note: this is separate from the **bid log** (§77, Price Book › Bids vs estimates), which compares
*our* estimate against the bid that came back. This compares *contractors* against each other.

---

## 5 · Take-offs and tracing

| # | Item | State |
|---|---|---|
| 5.1 | **Take-off sets** — satellite and PDF side by side, one marked in use. Built, reverted, never rebuilt. ★ RECOVERED | 0 hits |
| 5.2 | **Automatic PDF take-off** — the extraction code is written but has never been wired up or verified. ★ RECOVERED | Written, dead |
| 5.3 | **Scan site** — vision model identifies existing pool/spa/court/driveway/patio and feeds demo flags into the estimate. "Highest value, plumbing's ready." ★ RECOVERED | 0 hits |
| 5.4 | **AI location auto-detect** — label each paving area street/front/back/side. Needs a server-fetched satellite image (the canvas is cross-origin-tainted) → Worker vision call → map back onto areas. ★ RECOVERED | Planned, unbuilt |
| 5.5 | **Paving snaps to the building edge** — shared-boundary auto-complete. ★ RECOVERED | Own build |
| 5.6 | **Freeform drawing sheet** (option C) — "the reserve". ★ RECOVERED | Unbuilt |
| 5.7 | **Setbacks: 51 of 65 cities unsourced.** The reader works; knowing which document is authoritative per city is judgement. A zoning API (Zoneomics/Regrid) is the real answer at scale and is a commercial decision — `sbProvider` is the seam, deliberately inert. | Judgement, not plumbing |
| 5.8 | **Accessory-structure setbacks** — only the six original edges have real figures; the nine landscape items inherit the structure rule. A fire pit, pool heater and patio cover should carry their own numbers where the code gives them one. | Open |
| 5.9 | **Nothing reads setbacks for pricing or placement yet** — lands with AI placement. | Open |

---

## 6 · Libraries

- **Product records — the fields beyond a price.** Manufacturer, model, finish/colour, dimensions, image, spec PDF, CAD/detail reference, vendor, purchase link. The shape was proved on the fence segment (v1494) and the pricing seam works. **No library to pick from, no images, and the wall, court, pool and water builders have none of it.**
- **Material Library** — three prices (MSRP / contractor / designer) + margin + commission, supplier logins, the full field list. *The moat.* Supplier tenancy needs accounts; the designer half does not.
- **Furnishings** — earnings model (markup / cost-plus / commission / show trade discounts) and per-product client pricing. ★ RECOVERED
- **Size filter on materials** — sizes are free text (`7/8" x 7/8" tile`), so it needs parsing into real dimensions first. ★ RECOVERED
- **Gloster (91) and TUUCI (137)** — research completed, never imported. ★ RECOVERED
- **Typed prices live on the shared book** (`p.mp`) — fine while Warwick is the only author, needs per-region scoping before seats are sold. ★ RECOVERED
- **Plant filter match counts** — Water, Sun and Stocking carry them; Bloom, Foliage, Fire, Tags and Upkeep don't. ★ RECOVERED
- **The plant row ends in empty space** — a Price Book line ends in its price. A mature-size column was built and reverted: at ~370px the list can't fit star + thumb + name + icons + a value. Either drop the icon groups or widen the list. **Warwick's call.** ★ RECOVERED
- **Species as one cell** in cards/photos — mocked up, not built. ★ RECOVERED
- **Nursery PDF import** — asked for, barely present in the file. ★ RECOVERED
- **Colour Library** — manufacturer databases, AI and find-similar were phased down live and deliberately deferred.
- **CAD detail library and spec sheets** on products — not scoped.
- **Product Watch** — nightly sharded sweep for price changes, sales and new products. Findings queue, never auto-applied. Known blockers: qdisurfaces CDN 403s, Bedrosians' sitemap behind a WAF captcha.
- **AI sale search** — sites publish sales as banners and landing pages, not data, so it needs its own approach. ★ RECOVERED

---

## 7 · Reports, documents and output

- **Proposals tab** — generate the proposal from project data, *and* upload one written elsewhere so AI knows the agreed scope. It is the missing reference document for Financials.
- **Financials** — cost, time spent, fees, margin; AI flags when a change order is due. **Depends on Proposals** — a change order is meaningless without an agreed scope. Time tracking is the missing input; keep entry cheap (per phase, not per task).
- **Plan Check** — upload DXF or PDF, AI returns a red-flag report: spelling, plant and material names, scale and drawing standards, details called out but missing, materials not specified, conflicts with HOA rules and setbacks. Dropbox API so files need no uploading.
- **Whole-job receipt as a Reports export.** ★ RECOVERED
- **Mood Board** — manual reordering, per-section AI suggestions for materials/furnishings/lighting (trickier than plants: goods need a cost-book line, not just a library match), multiple outputs (PDF / web / interactive / budget-focused), AI-generated inspiration images. ★ partially RECOVERED
- **Proposal export** is deliberately `_reportSoon(…)`.

---

## 8 · Platform, accounts and the commercial layer

Blocked on the backend/accounts phase, in CLAUDE.md's locked build sequence.

- **Accounts / multi-tenant** — per-subscriber libraries server-side as an **overlay on the master, not a copy**. Decided 8 Aug 2026, treat as settled. Decide the data shape before per-user writes ship.
- **Client Center** — one shared link, free tier + a paid tier the designer resells. Link-first, not accounts-first. Margin, markup, labour rates and unit costs **absent from the payload**, not merely hidden.
- **Per-user plant favourites**, and **per-user image framing** (`imgZoom`/`imgPanX`/`imgPanY` are global on the shared book today, so one person's crop changes it for everyone).
- **AI usage metering** — cap per subscriber in documents and searches, not tokens.
- **Community centre, forum and contributions** — users build and save their own plant/furniture/colour palettes; a review queue only Warwick sees.
- **HOA library** — crowd-sourced HOA/DRC/CCR guidelines by city, attached to jobs. *The community moat.*
- **Communication centre** — client chat through their portal, plus internal chat.
- **iPad native app** — Capacitor wrapper for haptics and offline job sites. After accounts.
- **Admin / Public view across the whole app** — exists in places, never made systematic. ★ RECOVERED
- **Launch copywriting** — features to make the app launch-ready. ★ RECOVERED

---

## 9 · Smaller open items

- **Per-phase input gating** — hiding fields can hide work already entered, so it wants walking phase by phase rather than switching on blind. ★ RECOVERED
- **Metric units** — the Metric button is present and deliberately inert. Feet, SF and gallons are written into every calculator and price line, so a switch has to convert the pricing, not relabel it. ★ RECOVERED
- **PWA offline** — never verified on a real iPad. Install from Safari, then airplane-mode it. ★ RECOVERED
- **Speech on the real iPad** — the natural-language bar's mic is proven in headless Chrome only. Permission prompts, accents and iPad Safari behaviour untested.
- **Adding plants by name** ("three olive trees") — the planting adapter sets zone area, cover bands and layers, not plant rows. Reports the request as not covered rather than guessing.
- **Fence Builder §33/§2B/§22/§26/§35/§10/§3** — seven gaps against the 40-section spec; all seven QA tests pass.
- **Court windscreen hand-off** — the fence book has no windscreen product, so a court's windscreen records are dropped, not handed over. Nothing checks the two books haven't drifted on chain link.
- **Paving price corrector only moves untouched lines** — a device with hand-edited paving prices won't pick up the v1481–83 corrections.
- **To-dos** under the Checklist section.
- **GPS address** — tap location on site to suggest the property address.
- **Instructions manual** with AI search; **video tutorials** in context; **new-user tutorial** per tool.
- **Delete the three heavy transcripts** (~640 MB). Housekeeping. ★ RECOVERED

---

## 10 · How to keep this correct

The gap this sweep closed was structural: **capture depended on Warwick saying the word "roadmap."**
Anything deferred mid-build — including every "Not done" line at the end of a version — had no home
and survived only in the transcripts.

The rule from here: **a deferral goes into `BACKLOG.md` or this file at the moment it is made**, not
when someone remembers it. `REVIEW.md` keeps the reasoning; this keeps the list.
