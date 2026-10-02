"""Build paged views of the verified library without removing any source records."""
import json,collections
from pathlib import Path
source=Path('/Users/warwick/.codex/.chatgpt-projects/g-p-685c7d5829448191b64fe9029920e949/design-library/server-release')
out=Path(__file__).parent.parent/'v2/src/design-knowledge';out.mkdir(exist_ok=True)
d=json.loads((source/'library.json').read_text());groups=collections.defaultdict(list)
for r in d['records']:groups[r['type']].append(r)
chunks={};n=0
for kind,rows in groups.items():
 chunks[kind]=[];batch=[];size=0
 for row in rows:
  data=json.dumps(row,separators=(',',':'));batch.append(row);size+=len(data)
  if size>1500000:
   name=f'records-{n}.json';n+=1;(out/name).write_text(json.dumps(batch,separators=(',',':')));chunks[kind].append(name);batch=[];size=0
 if batch:
  name=f'records-{n}.json';n+=1;(out/name).write_text(json.dumps(batch,separators=(',',':')));chunks[kind].append(name)
d['summary_counts']={p['id']:{'records':sum(r.get('project_id')==p['id'] for r in d['records']),'costs':sum(r.get('project_id')==p['id'] and r['type']=='Costs' for r in d['records'])} for p in d['projects']};d['summary_counts']['']={'records':len(d['records']),'costs':sum(r['type']=='Costs' for r in d['records'])};d['record_count']=len(d['records']);d['records']=[];d['record_chunks']=chunks
(out/'data.js').write_text('window.LIBRARY='+json.dumps(d,separators=(',',':'))+';')
s=(source/'app.js').read_text().replace('function draw(){','function drawReady(){')
s=s.replace("[rs.length,'Library records & open questions']","[D.summary_counts[project].records,'Library records & open questions']").replace("[rs.filter(r=>r.type==='Costs').length,'Historical cost rows']","[D.summary_counts[project].costs,'Historical cost rows']")
s+='''\nconst loaded=new Map();let revision=0;
async function draw(){const mine=++revision,kind=type==='Contractor price book'?'Costs':type;try{if(!loaded.has(kind)){ $('count').textContent='Loading this category…';const rows=await Promise.all((D.record_chunks[kind]||[]).map(async file=>{const r=await fetch(file);if(!r.ok)throw Error('This category could not load. Select it again to retry.');return r.json()}));loaded.set(kind,rows.flat())}if(mine!==revision)return;D.records=loaded.get(kind);drawReady()}catch(e){$('count').textContent=e.message}}
'''
# Start after loader bindings initialize.
s=s.replace('};draw();','};queueMicrotask(()=>draw());')
(out/'app.js').write_text(s)
print('Prepared',d['record_count'],'records in',n,'on-demand chunks')
