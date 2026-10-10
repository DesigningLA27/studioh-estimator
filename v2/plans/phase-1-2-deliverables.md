# Phase 1 and 2 — V2.172

Consultation has three output records; Programming & Site Analysis has seven standard outputs and a conditional fee change order. Existing source IDs, completion, owners, due dates and effort survive migration. New work is unassigned and has no invented effort.

- Inbound records have requested/chased/received states. Agreement and deposit receipt reuse their original checklist IDs.
- The questionnaire blocks completing and issuing programming work (layout onward), including source tasks moved elsewhere. Base plan and restriction work remain available.
- Deliverables record form, recipient, issued date, revision and a file link. The link points to an existing file; this does not upload or send documents.
- Contracted maximum is a project Process field. Current scope budget may be explicitly entered; otherwise comparison uses the saved Programming estimate total. Missing numbers are unknown, not zero. A required fee change order appears above the maximum; no fee or agreement is changed automatically.
- Estimating now includes p_est and the existing phase-specific estimate checks.
- Receipt confirmation is manual; this release does not pretend to parse signed agreements or confirm that a questionnaire was received from an integration.
- The original green visual journey and horizontal-only bounded scrolling are retained.

Validation: model migration, receipt persistence, questionnaire gate (including moving work), budget thresholds/fallback, transmittal persistence, automatic evidence, and existing bid/settings checks. Browser exercised receipt unlocking and budget-triggered change order in an isolated local review. Authenticated cloud saves are covered by the existing bridge and adapter tests, not a production account mutation.
