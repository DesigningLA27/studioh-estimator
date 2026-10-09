/* Historical V1 records: real 2018 arithmetic; anonymized names; no original private PDFs. */
const V2_BID_SAMPLE_EST={
  genconds:3000,    // portable toilet, soils/structural engineering, permits & HOA fees
  drainage:4315,    // 310 lf SDR35, brass inlets, atrium drains, catch basins
  firepit:800,      // stub-out for a future fire table
  paving:13400,     // entry walk, steps, pedestrian paving, precast pavers, pebble, steppers
  woodMetal:8000,   // two access gates, portico entry gate
  pool:60000,       // plunge pool and spa with water effect, carried as an allowance
  irrigation:5125,  // mainline, 4 valves, controller with rain sensor
  lighting:5250,    // 25 low-voltage fixtures, one transformer
  planting:26700    // turf, header, weed barrier, trees, 1,450 sf of shrub
};
const V2_BID_SAMPLE_BUDGET=125000;   // the client's approved construction budget

function v2HistoricalBids(){
  var L=function(desc,cat,amount,o){
    return Object.assign({desc:desc,cat:cat,amount:amount,qty:0,unit:"LS",rate:0,
      kind:"line",matBasis:"named",matName:"",matRate:0,allowIncl:"",installRate:0},o||{}); };
  return [
    // ── Bid 1 · itemised to ~70 lines, allowances declared with their basis ──
    { id:"bs_alta", name:"Alta Landscape Inc.", contractor:"Alta Landscape Inc.",
      lic:"1021012", total:145200, date:"22 Feb 2018", file:"", readAt:"2018-02-22",
      note:"Base bid, valid 45 days. Permits, engineering, soil reports and HOA fees excluded — "
          +"the bid estimates a further $4,500 for them. Material allowances include up to 30% for "
          +"selection, delivery, staging and mark-up, and 5–10% for waste.",
      exclusions:["City permits, engineering, soil reports and HOA fees (est. $4,500)",
                  "Soil exportation, charged separately if required",
                  "Fire pit unit — provided by the customer",
                  "Pottery — provided by the customer",
                  "Gate hardware — selected by owner"],
      lines:[
        L("Demolition, site preparation, grading and portable toilet","sitework",2690),
        L("Gas lines for pool, BBQ and fire element","electrical",2900),
        L("Pool subpanel, conduit, outlets, low-voltage and irrigation timers","electrical",2745),
        L("300 lf of 4\" drain system with 22 inlets","drainage",4684,
          {qty:300,unit:"LF",rate:14,matName:"4\" SDR perforated"}),
        L("Fire pit installation — unit provided by customer","firepit",750,{matBasis:"unstated"}),
        L("CMU walls to match existing wall at entrance","walls",2100,{qty:14,unit:"SF",rate:150}),
        L("Pedestrian concrete field at trash area","paving",3060,{qty:170,unit:"SF",rate:18}),
        L("Linear concrete pavers — Stepstone allowance plus 10% waste, set on concrete","paving",5960,
          {qty:220,unit:"SF",rate:27.09,matBasis:"allowance",matRate:12,matUnit:"SF",matQty:240,allowAmt:2880,
           allowIncl:"10% waste, and up to 30% for selection, delivery, staging and mark-up"}),
        L("Steppers per plan — Stepstone allowance, with reinforced CMU bench","paving",2330,
          {qty:75,unit:"SF",matBasis:"allowance",matRate:12,matUnit:"SF",matQty:75,allowAmt:900,
           allowIncl:"selection, delivery, staging and mark-up"}),
        L("New concrete steppers at entrance","paving",900,{matBasis:"unstated"}),
        L("Pool and spa — excavation, plumbing, steel, shotcrete, Pebble Sheen, Hayward equipment, "
          +"Stepstone coping, waterline tile allowance","pool",67675,
          {matBasis:"allowance",matRate:25,matUnit:"SF",matQty:60,allowAmt:1500,allowIncl:"glass waterline tile at $25/sf, 60 sf of 140"}),
        L("Pebble mulch — material allowance, laid on weed barrier","planting",1925,
          {matBasis:"allowance",matRate:450,matUnit:"CY",matQty:3,allowAmt:1350,allowIncl:"delivery; $450 per yard, 3 yards"}),
        L("Artificial turf — TigerTurf, pet grade","planting",4200,{qty:300,unit:"SF",rate:14,
          matName:"TigerTurf, lead-free with antibacterial infill"}),
        L("Steel headers per plan","planting",720,{qty:60,unit:"LF",rate:12}),
        L("Boulders — material allowance and installation","planting",1200,
          {matBasis:"allowance",matRate:600,matUnit:"EA",matQty:1,allowAmt:600,allowIncl:""}),
        L("Trees — 2 no. 36\" Swan Hill olive, citrus and bay in pottery, with soil prep and crane",
          "planting",4090,{matName:"Olea europaea Swan Hill, Citrus, Laurus nobilis"}),
        L("Shrubs and groundcover — 20 species, 1–15 gallon, with amendment and top dressing",
          "planting",12871,{matName:"per planting plan"}),
        L("Wood bench — open lattice per plan","woodMetal",5000,{qty:20,unit:"SF",rate:250}),
        L("Two gates at 5–6' and 3' — allowance, construction and installation","woodMetal",3700,
          {matBasis:"allowance",matRate:0,allowIncl:"construction and installation; hardware excluded"}),
        L("Portico gate — allowance, construction and installation","woodMetal",3000,
          {matBasis:"allowance",matRate:0,allowIncl:"construction and installation; hardware excluded"}),
        L("Pilaster pots — installation with dedicated irrigation, drainage and soil","furnish",1800,
          {qty:10,unit:"EA",rate:180,matBasis:"unstated"}),
        L("Irrigation — new mainline, 5 drip zones, smart controller","irrigation",6950),
        L("Lighting — 22 bronze fixtures and a 300W stainless transformer","lighting",3950,
          {qty:22,unit:"EA",rate:150,matName:"DSE matte bronze"})
      ]},

    // ── Bid 2 · four lump lines. Detailed in prose, itemised nowhere. ──
    { id:"bs_verde", name:"Verde Outdoors", contractor:"Verde Outdoors",
      lic:"656128", total:148541, date:"4 Mar 2018", file:"", readAt:"2018-03-04",
      note:"Priced against the drawings dated 25 Jan 2018. The proposal describes materials at length "
          +"in prose — coping, tile, pool equipment, interior finish — but prices the whole job in "
          +"four lines, so no quantity or rate can be checked against anything.",
      exclusions:["Soil reports, addenda and considerations if required","Pottery"],
      lines:[
        L("Swimming pool with water feature — engineering, form, excavation, steel, shotcrete, "
          +"plumbing, automation and equipment, LED lights, waterline tile allowance, "
          +"pebble interior finish, start-up","pool",69850,
          {matBasis:"allowance",matRate:7,matUnit:"SF",matQty:0,allowAmt:900,
           allowIncl:"$7 per 6\" lineal foot of waterline tile; $7/sf on the raised feature wall; "
                    +"$900 for scupper fixtures"}),
        L("Hardscape — per plan","paving",30853,{matBasis:"unstated"}),
        L("Landscape — per plan","planting",35238,{matBasis:"unstated"}),
        L("Carpentry — gates and bench, with a gate allowance","woodMetal",12599,
          {matBasis:"allowance",matRate:2500,matUnit:"EA",matQty:1,allowAmt:2500,allowIncl:"$2,500 on the new front entry gate; "
            +"final design selected by owner and landscape architect"})
      ]},

    // ── Bid 3 · itemised, and the only one that prices permits and engineering ──
    { id:"bs_coast", name:"Coastline Pools & Landscape", contractor:"Coastline Pools & Landscape",
      lic:"869134", total:176842, date:"14 Feb 2018", file:"", readAt:"2018-02-14",
      note:"Prices permits, soils engineering and structural engineering inside the bid rather than "
          +"excluding them — $8,725 the other two leave to the owner. Pool structural pending soils.",
      exclusions:["No demolition is bid into this project"],
      lines:[
        L("Mobilisation — portable toilet, soils engineering, permits and city fees, "
          +"structural engineering for pool, spa and patio cover","genconds",8725),
        L("Rough grading preparation","sitework",3200,{qty:1600,unit:"SF",rate:2}),
        L("500 lf of 4\" SDR 35 drain line, 15 pour-lid drains, 30 atrium drains","drainage",7780,
          {qty:500,unit:"LF",rate:14,matName:"4\" SDR 35 PVC"}),
        L("CMU privacy wall to match existing lot line wall","walls",750,{qty:3,unit:"LF",rate:250}),
        L("Pedestrian concrete, linear paver field, steppers, cantilevered steps, pebble mulch, "
          +"steel header","paving",17128,{matName:"concrete pavers"}),
        L("Synthetic turf and boulders","planting",6800,{qty:325,unit:"SF",rate:14,
          matName:"synthetic turf, 9 boulders"}),
        L("Built-in wood bench with water effect, two self-locking latches, side gate, "
          +"new wood portico gate","woodMetal",16660,{qty:40,unit:"LF",rate:277.5}),
        L("Pool and spa — excavation, steel, mechanicals, shotcrete, precast coping, pebble "
          +"plaster, variable-speed equipment, waterline tile at a $20/sf allowance","pool",80073,
          {matBasis:"allowance",matRate:20,matUnit:"SF",matQty:50,allowAmt:1000,allowIncl:"setting material and grout included, 50 sf"}),
        L("Irrigation — mainline, 7 remote control valves, timer and controller","irrigation",9900,
          {qty:7,unit:"EA",rate:1250}),
        L("Lighting — 20 fixtures on an $85 allowance, tape lights, pool-rated transformer",
          "lighting",5950,{qty:20,unit:"EA",rate:200,matBasis:"allowance",matRate:85,matUnit:"EA",matQty:20,allowAmt:1700,
          allowIncl:"fixture only; installation priced separately at $115 each"}),
        L("Trees — 2 no. 36\" Swan Hill olive, 3 citrus, 3 bay, with crane and root guards",
          "planting",4545,{matName:"Olive Multi Swan Hill 36\" box"}),
        L("Shrubs and groundcover — 20 species matching the planting plan","planting",15331,
          {matName:"per planting plan"})
      ]}
  ];
}
(()=>{
const original=v2PlantRequest;
let job={busy:false,error:''};
const clone=x=>JSON.parse(JSON.stringify(x));
function historical(){return bcState().comparisonBasis?.source==='v1-2018'}
function basis(fn){
 const prior={sections:bcSections,rate:bcInstalledRate,spec:_bcOurSpec,bench:BC_MATB,floors:BC_FLOORS};
 if(historical()){
  bcSections=()=>Object.entries(bcState().comparisonBasis.sections).map(([id,est])=>({id,name:bcCatName(id),est}));
  _bcOurSpec=()=>null;BC_MATB={};BC_FLOORS={};
  bcInstalledRate=(b,l)=>Number(l.installRate)>0?+l.installRate:String(l.unit).toUpperCase()==='SF'?(+l.rate||(+l.qty>0?+l.amount/+l.qty:0)):0;
 }
 try{return fn()}finally{bcSections=prior.sections;bcInstalledRate=prior.rate;_bcOurSpec=prior.spec;BC_MATB=prior.bench;BC_FLOORS=prior.floors}
}
function fingerprint(){return JSON.stringify({bids:bcBids(),sections:bcSections(),cons:bcState().cons,bench:BC_MATB,floors:BC_FLOORS,assumptions:bcState().comparisonBasis})}
function read(){return basis(()=>{
 const sig=fingerprint(),state=bcState();
 return clone({sample:historical(),basis:state.comparisonBasis||null,sections:bcSections(),estimate:bcEstTotal(),categories:PB.map(c=>({id:c.id,name:c.name})),bids:bcBids().map(b=>({id:b.id,name:b.contractor||b.name,date:b.date,lic:historical()?'':b.lic,note:b.note,exclusions:b.exclusions||[],lines:bcLines(b),price:bcActual(b),score:bcScore(b),questions:bcQuestions(b),allowances:bcAllowNorm(b),allowanceTotal:bcLines(b).reduce((n,l)=>n+bcAllowanceOf(l),0),contractor:historical()?null:state.cons[b.lic]||null})),ai:{...state.v2Recommendation,busy:job.busy,error:job.error,stale:!!state.v2Recommendation&&state.v2Recommendation.signature!==sig}});
})}
function seed(){
 const name=String(S.pi?.project||S.projName||'');
 if(!/sample.*san\s*marino|san\s*marino.*sample/i.test(name))return false;
 const st=bcState();if(st.v2HistoricalLoaded||st.bids.length)return false;
 st.bids=v2HistoricalBids();st.comparisonBasis={source:'v1-2018',label:'V1 historical estimate · 2018',sections:clone(V2_BID_SAMPLE_EST),documentedTotal:129590,itemisedTotal:126590,note:'Real V1 bid line items with anonymized contractor names. Original PDFs are not included. Historical comparison only; current project estimate is unchanged.'};st.v2HistoricalLoaded=true;_bidSchedule();return true;
}
v2PlantRequest=function(m){
 if(!String(m.action).startsWith('bid-v2-'))return original(m);
 if(m.action==='bid-v2-read')return read();
 if(m.action==='bid-v2-seed'){const seeded=seed();return {...read(),seeded}}
 if(m.action==='bid-v2-ai-brief')return basis(()=>{const brief=bcBrief();if(brief){brief.project.historicalAnonymizedSample=historical();brief.project.note=historical()?'Historical 2018 sample. Names and licence numbers are fictional aliases; no real contractor lookup is possible from these names. Original PDFs are not attached.':'Current comparison';brief.bids.forEach(x=>{const b=bcFind(x.id);x.questions=bcQuestions(b);x.exclusions=b.exclusions||[];x.note=b.note||''})}return {signature:fingerprint(),brief}});
 if(m.action==='bid-v2-ai-save'){
  const out=m.result,ids=bcBids().map(b=>b.id);if(!out?.overall?.headline||!out.overall.body||!Array.isArray(out.bids)||out.bids.length!==ids.length||new Set(out.bids.map(b=>b.id)).size!==ids.length||out.bids.some(b=>!ids.includes(b.id)||!b.headline||!b.body)||typeof m.signature!=='string'||m.signature.length>250000)throw Error('The AI response was incomplete. Please try again.');
  const clean=x=>({headline:String(x.headline).slice(0,240),body:String(x.body).slice(0,2000)});
  bcState().v2Recommendation={overall:clean(out.overall),bids:out.bids.map(x=>({id:x.id,...clean(x)})),at:new Date().toISOString(),signature:m.signature};_bidSchedule();return read();
 }
 if(m.action==='bid-v2-line'){
  const b=bcFind(m.id),line=b?.lines?.[m.index];if(!line||!PB.some(c=>c.id===m.category)&&m.category!=='')throw Error('Choose a valid bid line and section.');line.cat=m.category;_bidSchedule();return read();
 }
 if(m.action==='bid-v2-question'){
  const b=bcFind(m.id);if(!b||typeof m.question!=='string'||m.question.length>3000||typeof m.note!=='string'||m.note.length>5000||!['Open','Awaiting reply','Answered','Resolved'].includes(m.status))throw Error('Check the clarification.');
  bcState().v2Replies||={};bcState().v2Replies[m.id+'|'+m.question]={note:m.note,status:m.status,at:new Date().toISOString()};_bidSchedule();return {saved:true};
 }
 if(m.action==='bid-v2-reply')return bcState().v2Replies?.[m.id+'|'+m.question]||{note:'',status:'Open'};
 if(m.action==='bid-v2-add'){
  const b=m.bid;if(!b||typeof b.name!=='string'||!b.name.trim()||b.name.length>200||!Number.isFinite(b.total)||b.total<=0||b.total>1e10||!Array.isArray(b.lines)||b.lines.length>500)throw Error('Enter a contractor, positive total and valid line items.');
  if(b.lines.some(l=>typeof l.desc!=='string'||l.desc.length>2000||!Number.isFinite(l.amount)||l.amount<0||(!PB.some(c=>c.id===l.cat)&&l.cat!=='')))throw Error('Check the line items.');
  if(historical())throw Error('The historical sample has a fixed comparison basis. Add current bids to a current project.');
  bcBids().push({id:'bid_'+crypto.randomUUID(),name:b.name,contractor:b.name,total:b.total,date:b.date||'',lic:'',note:'Manually entered; confirm against the contractor proposal.',exclusions:[],lines:b.lines.map(l=>({desc:l.desc,cat:l.cat,amount:l.amount,matBasis:'unstated',qty:0,unit:'LS'}))});_bidSchedule();return read();
 }
 throw Error('Unknown bid action.');
};
})();
