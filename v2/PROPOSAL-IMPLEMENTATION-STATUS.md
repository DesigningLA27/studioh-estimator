# Proposal & Billing Settings — V2.103

The existing eight-step wizard is the home of proposals. Do not create a second settings wizard.

## Already implemented

- Private PDF/DOCX upload, AI extraction and review before applying.
- Manual setup: fixed, hourly, mixed and percentage-based fees; editable phases.
- Deliverables: selection toggles, custom additions, phase assignment, optional groups, fee allocations, hour and labour-cost allowances.
- Studio billing-rate defaults and project overrides; meetings and mileage inputs.
- Duration or duration range; invoice triggers, payment terms, deposits and deposit credits.
- Change thresholds and cancellation inputs.
- Saved draft settings and immutable snapshots of externally signed agreements.

## Added in V2.103

- Renamed the existing tab to Proposal & Billing Settings.
- Studio H role-rate defaults: Principal 295, Landscape Architect 250, Designer 195, Admin 100 USD/hour. Existing custom/signed rates are not silently rewritten; a draft can explicitly adopt the schedule.
- All 136 service prices from the 2024 rate sheet. Deliverables → Review Studio H fee schedule selects a column using the current construction estimate, falling back to the entered budget upper bound.
- Band upper limits are inclusive; a budget above the limit selects the next band. Above $750,000 requires manual pricing.
- Selected schedule services are added to the draft for review. Phase totals are not automatically changed or double counted. Known Full CD/Enhanced CD package component duplicates and upgrade prerequisites are checked.
- Verbatim, versioned Appendix 1 reference text: phase narratives, milestones, exclusions, payment text, profile and all 24 terms. Available through Proposal text library.

## Still to build here, without duplicating settings

- A composed, editable proposal document pane with client/project merge fields, cover letter, pricing tables, template version selection, PDF output and signature workflow.
- Automatic reconciliation of phase versus deliverable pricing and discounts; comprehensive bundle overlap rules, including Softscape/DD combinations.
- Historical fee comparison using Appendix 2; those proposal amounts do not contain labour costs and cannot establish profitability.
- Automated fee-change proposals across all fee methods and signed construction caps.
- Exact contractual cancellation calculation, verified mileage lookup and final document validation.

The source text has conflicting 14-day/21-day cancellation notice periods. Preserve the original reference and resolve the chosen studio term before creating a sendable proposal. The 2024 schedule is a named source, not a claim about a newly effective rate date.

## Source and deployment

The source restored here is the full current V2 application and worker, including Financials, time tracking and milestones. Financials is in assets/financials; time and milestones are in src. Authenticated worker URLs returning 401 are not a source archive.

Generated private customer design-library payloads are intentionally excluded from Git. The rendering code and generation scripts are included. Production builds require the private library evidence separately. Do not remove authentication or publish customer evidence to make source inspection easier.

V2.103 builds on production V2.102 (Cloudflare version 22b0f6aa-c52f-49f2-9764-d52f8fa84372). Use worker-v2/build-private-app.py and worker-v2/wrangler-private.toml for the current private application. The older V1 engine generator and public preview are retained but do not reconstruct the private evidence dataset.
