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
