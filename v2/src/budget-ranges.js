/* Shared construction-budget bands used by pricing and process planning.
   Verified against https://www.studioh-inc.com/fees on 2026-10-12. */
globalThis.StudioHBudgetRanges=Object.freeze([50000,75000,125000,175000,250000,350000,500000,750000].map((max,i,a)=>Object.freeze({min:i?a[i-1]:0,max,reference:i?(a[i-1]+max)/2:40000})));
