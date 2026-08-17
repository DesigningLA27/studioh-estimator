# Review book

Things from the builds that need Warwick's eye. Nothing here is broken — these are decisions I
made on your behalf, numbers I could not confirm, or gaps I chose not to close alone.

Newest first. Move an item to **Settled** when it's decided, with the answer.

---

## Open

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

### 2 · Material on a split line is typed, not linked to anything
**v885 · 2026-08-17 · price book**

On a Split M+L line the material figure is **typed on that line**, in the line's own unit. Pressing
Split M+L seeds it from the midpoint of that line's Low/High, and after that it is yours. It is not
pulled from the Price Book, the Materials library or a supplier — so there is nothing to link to,
which is why the term is tagged `TYPED · on this line · per SF`.

**Decide:** should material instead be able to point at a **Materials library** item, so a supplier
price change flows through to every line that uses it? That is real work and overlaps
[[material-library-roadmap]] — worth it only if you intend to keep supplier pricing current.

---

### 3 · Price Book edits do not re-price a job that is already open
**pre-existing · found v883 · whole app**

`applyPriceBook()` seeds a project's unit cost once and then keeps it:

```js
base.uc = def.bd ? computeBuildupUC(def) : (old ? old.uc : tierUC(def, tiers, ti));
```

So changing a rate in the book moves **new** jobs and split (M+L) lines, but not the ordinary lines
of a job that already loaded. That is deliberate — a per-project edit survives — but it means
"I fixed the rate in the book" does not fix the estimate in front of you.

**Decide:** should there be a "pull the latest book rates into this job" action, and should it be
per-section or all-or-nothing?

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
**v882 · pergola**

`Wood 1x2`, `Wood 2x4`, `Aluminum 2x2`, `Steel 2x4` and the rest now group under **Wood** by first
word, but `Aluminum` (2) and `Steel` (2) are below the three-line threshold. Renaming them
`Rafter — Aluminum 2x2` would fold them properly — but the builders match these lines **by name**,
so every reference has to be checked first.

**Decide:** worth the rename?

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

## Settled

_(nothing yet)_
