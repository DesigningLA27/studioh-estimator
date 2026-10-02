"""Build private, source-backed data cards. Original evidence remains read-only."""
from pathlib import Path
import json,re,statistics,collections,shutil,hashlib
ROOT=Path(__file__).resolve().parent.parent
SRC=Path('/Users/warwick/.codex/.chatgpt-projects/g-p-685c7d5829448191b64fe9029920e949/design-library/server-release')
OUT=ROOT/'v2/src/design-knowledge';OUT.mkdir(exist_ok=True)
def read(p):return json.loads((SRC/p).read_text())
def write(p,v): (OUT/p).write_text(json.dumps(v,ensure_ascii=False,separators=(',',':')))
def human(v):
 if v is None:return 'Not recorded'
 if isinstance(v,bool):return 'Yes' if v else 'No'
 if isinstance(v,list):return ' / '.join(human(x) for x in v)
 if isinstance(v,dict):return '; '.join(human(k)+': '+human(x) for k,x in v.items())
 s=str(v)
 if s.startswith(('{','[')):
  try:return human(json.loads(s))
  except:pass
 return s.replace('_',' ').strip()
def finite(x):return isinstance(x,(int,float)) and not isinstance(x,bool) and abs(x)<1e12
lib=read('library.json');d=read('insights/calculated-values.json');rc=read('design-rules/catalog.json')
projects={p['id']:p for p in lib['projects']};srcmap={}
for x in lib['sources']:
 if (x.get('asset') or {}).get('url'):srcmap[x['id']]='/design-library/'+x['asset']['url']
def source(r):
 s=r.get('source') or r.get('evidence') or {}; nested=s.get('source') or {};url=s.get('url') or (nested.get('asset') or {}).get('url') or srcmap.get(s.get('source_id'))
 if url and not url.startswith('/design-library/'):url='/design-library/'+url.removeprefix('../').lstrip('/')
 return {'url':url,'label':s.get('path') or nested.get('relative_path') or 'Source drawing','page':s.get('page'),'record':r.get('id'),'revision':(r.get('version') or {}).get('label') or r.get('version_id'),'project':projects.get(r.get('project_id'),{}).get('name',r.get('project_id',''))}
catnames=[c['title'] for c in d['expanded']['categories']]
patterns=[r'pool|coping',r'spa|jacuzzi',r'kitchen|bbq|barbecue|grill',r'shade|pergola|pavilion|arbor|cabana|trellis',r'fireplace',r'firepit|fire pit|fire table',r'water feature|fountain',r'bocce|court|sport',r'paving|paver|deck|terrace|patio|concrete|flagstone',r'side.?yard|side path',r'trash|refuse|bin enclosure',r'gate|return wall|fence',r'front.*path|entry|entrance',r'driveway|parking',r'irrigation|sprinkler|drip|gpm',r'drain|runoff|stormwater',r'light|fixture|luminaire',r'plant|tree|turf|hedge|shrub|mulch|soil',r'.']
membership=collections.defaultdict(set)
for i,c in enumerate(d['expanded']['categories']):
 for k in ['dimensions','costs','relationships']:
  for r in c[k]:membership[r['id']].add(i)
def classify(text):
 hits=[i for i,p in enumerate(patterns[:-1]) if re.search(p,text,re.I)]
 return hits or [18]
normalized=[]
skip={'id','project_id','version_id','evidence_id','design_rule','source_id'}
for r in lib['records']:
 f=r.get('fields',{}); details=[{'label':human(k).capitalize(),'value':human(v)} for k,v in f.items() if k not in skip and v is not None and v!='']
 title=human(r.get('title') or f.get('description') or r['type']);text=' '.join([title]+[x['label']+' '+x['value'] for x in details])
 elements=sorted(membership.get(r['id']) or classify(title+' '+human(f.get('object_key',''))+' '+human(f.get('element_key',''))))
 if r['type'] in ['Plants','Plant preferences','Plant schedule density']:elements=[17]
 normalized.append({'id':r['id'],'title':title,'type':r['type'],'project':projects.get(r['project_id'],{}).get('name',r['project_id']),'projectId':r['project_id'],'elements':elements,'details':details,'source':source(r),'status':human(r.get('review_status') or f.get('review_status') or f.get('verification') or f.get('status') or 'Source record'),'search':text.lower()})
byid={r['id']:r for r in normalized};originals={r['id']:r for r in lib['records']}
# Explicit reviewed cohorts from the existing calculated-values report.
metrics=[[] for _ in catnames]
def add(i,label,values,unit,note,samples,kind='Measured data',key=None):
 vals=[float(v) for v in values if finite(v)]
 if not vals:return
 metrics[i].append({'id':key or 'metric-'+str(i)+'-'+str(len(metrics[i])),'label':label,'mean':statistics.mean(vals),'min':min(vals),'max':max(vals),'n':len(vals),'unit':unit,'note':note,'kind':kind,'samples':samples})
def samp(project,value,record):return {'project':project,'value':value,'source':source(record)}
nom=d['nominal']
for label,field,unit in [('Average pool size','area','sq ft'),('Average width','width','ft'),('Average length','length','ft')]:
 add(0,label,[p[field] for p in nom],unit,'Historical concept rectangles. Separate from measured CAD water area.',[samp(p['project'],p[field],p['records'][0 if field!='length' else 1]) for p in nom],key='pool-concept-'+field)
for label,field,unit in [('Measured pool water area','pool_sf','sq ft'),('Pool share of rear comparison area','pool_percent_rear','%'),('Reviewed rear paving per pool water area','rear_paving_per_pool_sf','sq ft / sq ft')]:
 add(0,label,[p[field] for p in d['pools']],unit,'Same reviewed native drawing and rear comparison zone. Rear zone is not usable/private yard or total lot. Paving is a reviewed partial subtotal.',[samp(p['project'],p[field],p['pool_record']) for p in d['pools']])
for ci,k in [(0,'pool'),(1,'spa')]:
 a=d['pool_spa_analysis']['elements'][k]
 for key,label,unit in [('area_sf','Measured '+k+' water area','sq ft'),('short_extent_ft','CAD short extent','ft'),('long_extent_ft','CAD long extent','ft')]:
  if ci==0 and key=='area_sf':continue
  rows=[r for r in a['native'] if finite(r.get(key))]
  add(ci,label,[r[key] for r in rows],unit,'Reviewed CAD water boundary. Extents are bounding dimensions, not clear swimming dimensions.',[samp(r['project_id'],r[key],r['records'][0]) for r in rows])
 for key,label,unit in [('width_ft','Concept width','ft'),('length_ft','Concept length','ft'),('nominal_area_sf','Concept rectangle area','sq ft')]:
  if ci==0:continue
  rows=[r for r in a['nominal'] if finite(r.get(key))]
  add(ci,label,[r[key] for r in rows],unit,'Historical concept dimensions, separate from CAD.',[samp(r['project_id'],r[key],r['records'][0]) for r in rows])
rows=d['light_totals'];add(16,'Lighting callouts per 1,000 outdoor sq ft',[float(r['calculated_density']) for r in rows],'callouts','Discrete callouts, not fixture heads or wattage. Gross outdoor area includes all non-enclosed land. Linear and pool lighting excluded.',[{'project':r['project'],'value':float(r['calculated_density']),'source':{'url':srcmap.get(r['source_id']),'record':r['source_id']}} for r in rows])
for group in sorted(set(r['schedule_group'] for r in d['plants'])):
 rows=[r for r in d['plants'] if r['schedule_group']==group]
 add(17,group+' per 1,000 outdoor sq ft',[float(r['calculated_density']) for r in rows],'plants','Printed schedule group, not planting-bed density or spacing guidance. Gross outdoor area includes water and HOA land; scheduled, not installed.',[{'project':r['project'],'value':float(r['calculated_density']),'source':{'url':srcmap.get(r['source_id']),'record':r['source_id']}} for r in rows])
# Conservative new summaries: exact definition, unit, basis and review state;
# each project must have one unambiguous value. No mixed revision weighting.
groups=collections.defaultdict(list)
allowed={'source_checked','reviewed_source_specific','reviewed_historical_schematic_dimension','printed_irrigation_coverage','printed_design_flow_not_measured_usage','reviewed_plan_symbol_count','reviewed_historical_approximate_schedule','CAD_count_not_installed'}
for r in lib['records']:
 f=r.get('fields',{})
 if r['type']!='Measurements & facts' or not finite(f.get('value_number')) or f.get('review_status') not in allowed or f.get('unit') in ['USD',None]:continue
 groups[tuple(str(f.get(k,'')) for k in ['object_key','attribute','unit','basis','review_status'])].append(r)
for key,rows in groups.items():
 per=collections.defaultdict(list)
 for r in rows:per[r['project_id']].append(r)
 selected=[rs[0] for rs in per.values() if len(set(x['fields']['value_number'] for x in rs))==1]
 if len(selected)<2 or re.fullmatch(r'A\d+|light_symbol_[A-Z]|native_model',key[0]):continue
 i=classify(key[0]+' '+key[1])[0]
 if i in [0,1] and key[1] in ['width','length']:continue
 label=human(key[0])+' · '+human(key[1]);samples=[samp(projects[r['project_id']]['name'],r['fields']['value_number'],r) for r in selected]
 add(i,label,[r['fields']['value_number'] for r in selected],human(key[2]),'Same recorded definition and measurement basis: '+human(key[3])+'. '+human(key[4])+'. One distinct value per project; conflicting revisions excluded.',samples)
rules=[]
for rule in rc['rule_sets'][0]['rules']:
 fields=[]
 for k,v in rule.get('parameters',{}).items():
  label=human(k);suffix=''
  for suf,u in [('_ft','ft'),('_in','in'),('_sf','sq ft'),('_pct','%')]:
   if k.endswith(suf):label=human(k[:-len(suf)]);suffix=' '+u;break
  fields.append({'label':label.capitalize(),'value':human(v)+suffix})
 rules.append({'id':rule['id'],'title':rule['title'],'description':rule['description'],'kind':{'hard':'Required','planning':'Planning guidance','preference':'Preferred'}.get(rule['category'],human(rule['category']).capitalize()),'parameters':fields,'authority':rule.get('authority',''),'implementation':rule.get('implementation',''),'elements':sorted(set([0,1]+classify(rule['title']+' '+rule['description'])))})
priority=rc['rule_sets'][1]['content']
for x in priority.get('priority_order',[]):rules.append({'id':'priority-'+str(x['rank']),'title':str(x['rank'])+'. '+x['element_group'],'description':x['guidance'],'kind':'Design sequence','parameters':[],'authority':'Studio H approved default · Adapt to project brief','implementation':priority.get('scope',''),'elements':classify(x['element_group']+' '+x['guidance'])})
for i,x in enumerate(priority.get('prerequisites',[])):rules.append({'id':'prerequisite-'+str(i),'title':'Before design · '+str(i+1),'description':x,'kind':'Prerequisite','parameters':[],'authority':'Studio H design-element priority','implementation':'Confirm before fixing design geometry.','elements':list(range(19))})
# Smaller browser pages; all source records retained and searchable.
manifest=[];search=[]
for i,title in enumerate(catnames):
 rs=[r for r in normalized if i in r['elements']]
 # sort facts and relationships before costs/text so useful data is easiest to reach
 rs.sort(key=lambda r:({'Measurements & facts':0,'Area takeoff':1,'Area ratios':2,'Design relationships':3,'Plants':4,'Materials':5,'Costs':6}.get(r['type'],7),r['project'],r['title']))
 for page in range(0,len(rs),24):write(f'knowledge-{i}-{page//24}.json',[{k:v for k,v in r.items() if k!='search'} for r in rs[page:page+24]])
 observations=[]
 for r in rs:
  original=originals.get(r['id']) if r['type'] in ['Measurements & facts','Area takeoff'] else None
  if not original:continue
  f=original['fields'];v=f.get('value_number',f.get('value'))
  if not finite(v) or f.get('unit') in ['USD',None] or f.get('object_key')=='native_model':continue
  if any(x['project']==r['project'] for x in observations):continue
  observations.append({'title':r['title'],'value':v,'unit':human(f.get('unit')),'project':r['project'],'status':r['status'],'source':r['source']})
  if len(observations)==3:break
 payload={'observations':observations,'id':i,'title':title,'description':d['expanded']['categories'][i]['requested'],'metrics':metrics[i],'rules':[r for r in rules if i in r['elements']],'count':len(rs),'pages':(len(rs)+23)//24,'projects':len(set(r['projectId'] for r in rs)),'types':dict(collections.Counter(r['type'] for r in rs))}
 if i==0:payload['yard']=[{'project':p['project'],'pool':p['pool_sf'],'rear':p['rear_sf'],'share':p['pool_percent_rear'],'source':source(p['rear_record'])} for p in d['pools']]
 write(f'knowledge-{i}.json',payload)
 manifest.append({k:payload[k] for k in ['id','title','count','pages','projects','types']})
for r in normalized:
 # All field values participate in retrieval; browser receives only matching cards.
 search.append({'id':r['id'],'title':r['title'],'project':r['project'],'projectId':r['projectId'],'type':r['type'],'elements':r['elements'],'text':r['search'],'source':r['source'],'status':r['status']})
# Search corpus remains server-loaded; never part of opening the library.
# Bounded server-only shards: no 27 MB response or full browser download.
for old in OUT.glob('knowledge-search*.json'):old.unlink()
shards=[];batch=[];size=0
for row in search:
 n=len(json.dumps(row))
 if batch and size+n>1200000:
  name=f'knowledge-search-{len(shards)}.json';write(name,batch);shards.append(name);batch=[];size=0
 batch.append(row);size+=n
if batch:
 name=f'knowledge-search-{len(shards)}.json';write(name,batch);shards.append(name)
write('knowledge-search-manifest.json',shards)
write('knowledge-rules.json',rules)
write('knowledge-metrics.json',[dict(m,element=i) for i,ms in enumerate(metrics) for m in ms])
write('knowledge-catalog.json',{'elements':manifest,'projects':[{'id':p['id'],'name':p['name'],'coverage':p.get('coverage',''),'status':p.get('status_label',''),'count':sum(r['projectId']==p['id'] for r in normalized)} for p in lib['projects']],'records':len(normalized),'metrics':sum(map(len,metrics)),'rules':len(rules),'built':d['generated_at'],'sourceHash':hashlib.sha256((SRC/'library.json').read_bytes()).hexdigest()})
for f in ['elements.html','knowledge.css','knowledge.js']:shutil.copy2(ROOT/'v2/design-knowledge'/f,OUT/f)
print('Knowledge library:',len(projects),'projects,',len(normalized),'records,',sum(map(len,metrics)),'summary cards,',len(rules),'rules;',sum((OUT/f'knowledge-{i}.json').stat().st_size for i in range(19)),'bytes of element summaries')
