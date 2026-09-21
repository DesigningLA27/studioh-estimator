# Sunburst rendering and Astra connection — v1546

## Models and billing
- GPT Image 2.5 Sunburst replaces GPT Image 2 as the second rendering choice after Nano Banana 2. Existing saved GPT Image 2 preferences migrate to Sunburst. All prior rendering pickers share the new choice, including reference-photo editing. Maximum quality is explicit.
- Provider routes: `openai/gpt-image-2.5/sunburst/text-to-image` and `/edit` via the existing fal.ai account and FAL_KEY. Billing is usage-based; the obsolete GPT Image 2 medium-quality price is not shown for Sunburst. ChatGPT subscriptions do not fund these requests.
- GPT-6 Astra is a separate reasoning model. The Worker uses OpenAI Responses, high reasoning, no temperature, store=false. Requires a separately billed OpenAI API project and OPENAI_API_KEY Worker secret. No credentials are in the repository.
- Original ChatGPT rendering model is not established by this integration. Do not promise identical output to that conversation.

## Astra scope and remaining activation
The existing ASK dialog offers Astra second after Claude and reports whether its server key is configured. ASK supplies the saved-project index, not the full design library. Server response identifies the actual model. Missing credentials produce a setup message; there is no silent fallback or claim of successful analysis.

`design-engine/ai-client.mjs` provides shared review/render calls for the design engine. Review requires the caller to supply questionnaire, site, rules, and a question; relevant evidence IDs and locks travel with the request. It does not load the local 21-project library automatically, generate editable geometry, or modify plans. Geometry validation and review remain required. This is a connection, not a completed autonomous design pipeline.

Activation: enable billing on an OpenAI API project and add its API key as the Cloudflare secret OPENAI_API_KEY on studioh-ai. Never paste keys into chat, browser source, or Git. Test an Astra request after activation. Key presence alone does not verify billing or model entitlement.

## Backups and rollback
Pre-change Git commit: 1711049e27bb7dc4e7c264997dad5339de0ddec0 (v1545).
Frontend backup: versions/Cost_Estimator_v1545.html (local/ignored).
Full source archive, deployed Worker and settings: ../backups/estimator-v1545-before-sunburst/.
Previous Worker version: 1521596f-bd48-4562-8e8a-289cdca9531d.
Rollback both frontend and Worker together; preserve secrets, KV, R2 and project data.

## Validation
Automated tests cover legacy GPT Image 2 compatibility, Sunburst generation/edit routing at max quality, ordered references, dimensions, authorization, errors without fallback, selector persistence, Astra credential requirements/Responses parameters/incomplete responses, and shared design-context transport without mutation. All 13 inline scripts pass syntax checking. Browser checks use iPad-sized 1280×960 viewport; no actual iPad hardware test is claimed. Existing rendering controls are reused; GPT Image 2 is replaced, not duplicated. No mockup supplied for this integration.

Two real Sunburst max-quality requests succeeded in an authenticated remote preview: text-to-image (112 seconds) and reference-image editing (75 seconds). Both reported the expected provider route; the edit reported usedRef=true. Astra live completion remains unverified until its API account is configured. Browser ASK response testing is simulated and explicitly separate from a live API test.

Claude: pull origin/main after the explicit HANDOFF CLEAR. Preserve Sunburst's model ID and max quality. Do not downgrade it silently or assume the Astra API account is activated.

## References
https://developers.openai.com/api/docs/models/gpt-image-2.5-sunburst
https://developers.openai.com/api/docs/models/gpt-6-astra
https://fal.ai/models/openai/gpt-image-2.5/sunburst/edit/api
