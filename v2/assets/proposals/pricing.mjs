export const catalogue = {
  "version": "studio-h-2024-v1",
  "source": "PROPOSAL-BUILDER.md · 2024 rate sheet",
  "rates": [
    {
      "name": "Principal",
      "rate": 295
    },
    {
      "name": "Landscape Architect",
      "rate": 250
    },
    {
      "name": "Designer",
      "rate": 195
    },
    {
      "name": "Admin",
      "rate": 100
    }
  ],
  "caps": [
    50000,
    75000,
    125000,
    175000,
    250000,
    350000,
    500000,
    750000
  ],
  "services": [
    {
      "id": "conceptual-plan",
      "name": "Conceptual Plan",
      "fees": [
        2595,
        2995,
        3495,
        3995,
        4495,
        5495,
        7995,
        9995
      ]
    },
    {
      "id": "enhanced-conceptual-plan",
      "name": "Enhanced Conceptual Plan",
      "fees": [
        4595,
        5295,
        5895,
        6795,
        7995,
        9695,
        13395,
        15995
      ]
    },
    {
      "id": "full-cd-set-lc-1-lg-lp-ll",
      "name": "Full CD Set · LC 1+, LG, LP, LL",
      "fees": [
        3395,
        3995,
        4995,
        6395,
        8895,
        11795,
        15095,
        17995
      ]
    },
    {
      "id": "enhanced-concept-cd-upgrade",
      "name": "Enhanced Concept CD Upgrade",
      "fees": [
        1895,
        2195,
        2995,
        4195,
        5995,
        8295,
        10595,
        12995
      ]
    },
    {
      "id": "softscape-set-lp-li-ll",
      "name": "Softscape Set · LP, LI, LL",
      "fees": [
        1995,
        2385,
        2795,
        3395,
        4395,
        5795,
        7595,
        8995
      ]
    },
    {
      "id": "dd-set-lp-ll-detail-elevations",
      "name": "DD Set · LP, LL, detail elevations",
      "fees": [
        1995,
        2495,
        2995,
        3795,
        5095,
        6595,
        8495,
        10195
      ]
    },
    {
      "id": "construction-plan",
      "name": "Construction Plan",
      "fees": [
        895,
        1095,
        1395,
        1795,
        2695,
        3495,
        3995,
        4695
      ]
    },
    {
      "id": "construction-details",
      "name": "Construction Details & Specs",
      "fees": [
        1395,
        1795,
        2195,
        2895,
        3695,
        4795,
        6395,
        7995
      ]
    },
    {
      "id": "rough-grading-drainage-plan",
      "name": "Rough Grading & Drainage Plan",
      "fees": [
        250,
        350,
        395,
        395,
        495,
        695,
        795,
        895
      ]
    },
    {
      "id": "planting-plan-details-specs",
      "name": "Planting Plan, Details & Specs",
      "fees": [
        895,
        1095,
        1295,
        1595,
        2195,
        2895,
        3895,
        4595
      ]
    },
    {
      "id": "lighting-plan",
      "name": "Lighting Plan",
      "fees": [
        295,
        395,
        450,
        495,
        695,
        795,
        795,
        795
      ]
    },
    {
      "id": "3d-rendering-lumion",
      "name": "3D Rendering · Lumion",
      "fees": [
        495,
        495,
        495,
        595,
        595,
        695,
        895,
        995
      ]
    },
    {
      "id": "irrigation-plan-details-specs",
      "name": "Irrigation Plan, Details & Specs",
      "fees": [
        995,
        1095,
        1295,
        1595,
        1895,
        2495,
        3295,
        3995
      ]
    },
    {
      "id": "pottery-plants-plan",
      "name": "Pottery & Plants Plan",
      "fees": [
        395,
        395,
        495,
        495,
        595,
        595,
        695,
        795
      ]
    },
    {
      "id": "furnishings-plan",
      "name": "Furnishings Plan",
      "fees": [
        595,
        695,
        850,
        995,
        1095,
        1195,
        1395,
        1695
      ]
    },
    {
      "id": "fuel-modification-plan",
      "name": "Fuel Modification Plan",
      "fees": [
        795,
        995,
        1295,
        1495,
        1595,
        1795,
        1995,
        2395
      ]
    },
    {
      "id": "water-use-calcs-mwelo-wucols",
      "name": "Water-Use Calcs · MWELO / WUCOLS",
      "fees": [
        495,
        695,
        895,
        1095,
        1295,
        1495,
        1695,
        1895
      ]
    }
  ],
  "fullService": [
    5995,
    7495,
    8995,
    10995,
    13995,
    17995,
    23995,
    28995
  ]
};
export function bandFor(value) {
 if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return -1;
 return catalogue.caps.findIndex(cap=>value<=cap);
}
export function feeFor(id,budget) {
 const band=bandFor(budget), service=catalogue.services.find(x=>x.id===id);
 return band<0||!service?null:service.fees[band];
}
export function validateSelection(ids) {
 const selected=new Set(ids), issues=[];
 const components=['construction-plan','construction-details','rough-grading-drainage-plan','planting-plan-details-specs','lighting-plan'];
 const bundles=['full-cd-set-lc-1-lg-lp-ll','enhanced-concept-cd-upgrade'];
 if(bundles.every(x=>selected.has(x)))issues.push('Choose one CD package, not both.');
 if(selected.has(bundles[1])&&!selected.has('enhanced-conceptual-plan'))issues.push('The CD upgrade requires Enhanced Conceptual Plan.');
 if(bundles.some(x=>selected.has(x))&&components.some(x=>selected.has(x)))issues.push('The selected CD package already includes the five component plans.');
 return issues;
}
