# Worker change: add two image models, and fix the ignored aspect ratio

The app now offers three models for Studio H product renders. **Only `nano-2` currently works** — the
other two need adding to the `studioh-ai` worker, whose source is not in this repo.

| App sends `model:` | fal endpoint | Cost |
|---|---|---|
| `nano-2` | already wired | $0.08 |
| `nano-banana-pro` | `fal-ai/nano-banana-pro` | $0.15 |
| `gpt-image-2` | `fal-ai/gpt-image-2` | $0.053 at medium quality |

## 1. Map the two new names

Wherever the `genimage` handler turns `body.model` into an endpoint, add:

```js
const MODELS = {
  "nano-2":          "fal-ai/nano-banana-2",      // whatever it currently is — leave as-is
  "flux-pro":        "fal-ai/flux-2-pro",
  "flux-klein":      "fal-ai/flux-2-klein",
  "nano-banana-pro": "fal-ai/nano-banana-pro",    // NEW
  "gpt-image-2":     "fal-ai/gpt-image-2"         // NEW
};
```

GPT Image 2 charges by quality tier — **`medium`** is the one costed above ($0.053 at 1024×1024).
`high` is $0.211, four times the price. Set it explicitly rather than taking the endpoint default:

```js
if (endpoint === "fal-ai/gpt-image-2") input.quality = "medium";
```

## 2. The aspect ratio is currently ignored — worth fixing while you are in there

Measured on the real stored files: **every render comes back 1376×768**, including the views the app
requests as `1:1`. A front elevation asked for as square arrived at 1.79:1. So `aspect` is being
dropped somewhere between the app and fal.

Each fal endpoint names this differently. The app now sends `aspect`, `size`, `aspect_ratio` and
`image_size` together so that whichever one an endpoint understands gets through, but the worker has
to pass them on. Roughly:

```js
if (body.aspect)      input.aspect_ratio = body.aspect;   // nano / gemini family
if (body.image_size)  input.image_size   = body.image_size; // flux family: square_hd, landscape_4_3 …
```

Fixing this is worth more than it sounds: square elevations would stop being letterboxed in the spec
card, and the stored files would get bigger at no extra cost, since fal's price for nano-2 is flat
per image rather than per pixel.

## 3. Later, for bulk: go direct to Google

fal resells Google's Gemini image models. For a large sweep, calling Google directly is
substantially cheaper — and their **batch tier is half price**, which suits a library render because
it does not need to be real-time.

| | 1K | 2K | Batch |
|---|---|---|---|
| fal, Nano Banana 2 | $0.08 flat | $0.08 | — |
| Google direct, Nano Banana 2 | $0.067 | $0.101 | ~$0.034 |
| Google direct, Nano Banana Pro | $0.134 | $0.134 | $0.067 |

Note that **batch Nano Banana Pro costs the same as standard Nano Banana 2** — the higher tier for
the price of the lower one, if asynchronous is acceptable.

Not worth doing yet: the whole Kornegay line at hero + cut-out is about $6. This matters at
thousands of images, not tens.

Source: <https://ai.google.dev/gemini-api/docs/pricing>
