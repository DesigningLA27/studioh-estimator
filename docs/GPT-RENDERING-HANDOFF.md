# GPT rendering — v1545

## Scope
GPT Image 2 is the second rendering option after Nano Banana 2 across product visualizations, individual plant images, whole-book/project image fills, planting site-photo renders, custom groupings, refinements, and site-element images. Existing choices/preferences remain. Product visualizations retain their separate preference; other tools share the existing app-wide setting.

GPT is preserved when plant reference images are attached. Other selected models retain the prior Nano Banana Pro upgrade when plant identification photos are used; the UI explains this. Reference order, prompts, R2 saving and existing features remain intact.

## Billing and connection
Uses the existing FAL_KEY on studioh-ai. No separate OpenAI account/key is needed. Calls use openai/gpt-image-2 and openai/gpt-image-2/edit on fal.ai, medium quality, one image per call. ChatGPT subscription credits are not used. Listed prices are estimates; resolution, references and prompt affect actual billing. No fallback to a different model on failure.

## Backups / rollback
Pre-change Git commit: 9387be7424cf88cd30a450ca0ecc5812c3dda294 (v1544).
Local frontend backup: versions/Cost_Estimator_v1544.html.
Full repo, original live Worker, settings and deployment list backed up outside the repo at ../backups/estimator-v1544-before-gpt/.
Original live Worker version: b162698e-c368-48dd-bae9-801129a5595d. Use Cloudflare rollback to this version plus the v1544 frontend for complete rollback. Do not delete or replace KV/R2 data or secrets.

The live Worker was behind GitHub in one pre-existing change: the Anthropic output-token clamp. Deployment retains the newer GitHub fix from Claude. Existing secrets, bucket bindings, compatibility date and logging are preserved.

## Validation
Five automated tests cover GPT generation/edit routes, reference order, image dimensions, medium quality, authorization, invalid models, reference limits, errors without fallback, selector order and model persistence with references. All HTML inline JavaScript passes syntax validation. iPad-sized browser preview checks model selectors, synchronization and no page errors; existing controls/styles are reused (no new mockup). GPT appears second without enabling a new mode. Old duplicated option lists and forced-Nano calls were replaced, not duplicated.

Two real provider calls passed in an authenticated Cloudflare preview: GPT text-to-image and editing the generated image. Both returned the requested OpenAI model; editing reported usedRef=true. No client project records were changed.

Release: v1545. Backend deployment and GitHub Pages verification are performed by the release task. Claude should pull origin/main and wait for the explicit HANDOFF CLEAR message before resuming edits.
