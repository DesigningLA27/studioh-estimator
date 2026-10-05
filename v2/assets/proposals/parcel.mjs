// The same public county parcel layers used by Project Info. No AI area estimates.
export const parcelSources=[
 {county:'Los Angeles',name:'Los Angeles County GIS',url:'https://public.gis.lacounty.gov/public/rest/services/LACounty_Cache/LACounty_Parcel/MapServer/0'},
 {county:'Orange',name:'Orange County GIS',url:'https://www.ocgis.com/arcpub/rest/services/Map_Layers/Parcels/MapServer/0'}
];
export function parcelArea(data){
 if(data.error||data.exceededTransferLimit||data.features?.length!==1)throw Error('A unique parcel could not be identified. Enter a verified lot area.');
 const f=data.features[0],rings=f.geometry?.rings;
 if(!rings?.length)throw Error('The parcel has no usable boundary.');
 // ArcGIS exterior and hole rings have opposing orientation; sum signed areas.
 let sum=0;const rad=Math.PI/180;
 for(const ring of rings){if(ring.length<4)throw Error('Incomplete parcel boundary.');for(let i=0;i<ring.length-1;i++){const [x1,y1]=ring[i],[x2,y2]=ring[i+1];if(![x1,y1,x2,y2].every(Number.isFinite)||Math.abs(x1)>180||Math.abs(y1)>90)throw Error('Invalid parcel coordinates.');sum+=(x2-x1)*rad*(2+Math.sin(y1*rad)+Math.sin(y2*rad));}}
 const area=Math.round(Math.abs(sum)*6378137**2/2*10.7639104167);
 if(area<100||area>1e9)throw Error('Parcel area needs manual verification.');
 return {area,apn:String(f.attributes?.AIN||f.attributes?.APN||'')};
}
export async function lookupParcel({lat,lng,county,country,state},fetcher=fetch){
 if(!Number.isFinite(lat)||!Number.isFinite(lng))throw Error('Select a complete street address from the suggestions.');
 const source=country==='US'&&state==='CA'&&parcelSources.find(s=>String(county).replace(/ County$/i,'').toLowerCase()===s.county.toLowerCase());
 if(!source)throw Error('Automatic parcel lookup currently covers Los Angeles and Orange counties. Enter a verified lot area for this location.');
 const q=new URLSearchParams({f:'json',geometry:JSON.stringify({x:lng,y:lat,spatialReference:{wkid:4326}}),geometryType:'esriGeometryPoint',inSR:'4326',spatialRel:'esriSpatialRelIntersects',outFields:'*',returnGeometry:'true',outSR:'4326',resultRecordCount:'2'});
 const response=await fetcher(source.url+'/query?'+q,{signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error('County parcel service is unavailable. Retry or enter a verified lot area.');
 return {...parcelArea(await response.json()),source:source.name,url:source.url,method:'Area calculated from county parcel boundary',checkedAt:new Date().toISOString()};
}
