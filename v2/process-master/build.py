from pathlib import Path
import json
r=Path(__file__).parent
raw=json.loads((Path(__file__).parent/'checklist-source.json').read_text());master={n['id']:n for n in raw['master']};used=set();seq=0
phases=[('consult','Consultation'),('pre','Pre-concept'),('concept','Schematic design'),('dd','Design development · optional'),('cd','Construction documents'),('bid','Bid & permit'),('co','Construction observation · optional')]
def task(t,ph,children=None,source=None,note='',condition=''):
 global seq
 seq+=1;n={'id':(source+':check') if source else 'master-task-'+str(seq),'kind':'task','ph':ph,'t':t,'owner':'','due':'','plannedHours':None,'done':False,'completedAt':None,'mode':'person','applicable':True,'note':note,'condition':condition,'grp':''}
 if source:
  used.add(source);n['sourceId']=source;n['grp']=master[source]['grp'];n['mode']='app' if master[source].get('v') else 'person'
  if n['mode']=='app':n['evidence']='Existing app check; evaluated from project data when this draft is applied. No project evidence is being checked in this review.'
 if children:n['sub']=[task(c,ph) if isinstance(c,str) else c for c in children]
 return n
def src(id,ph=None,children=None,note=''):
 x=master[id];return task(x['t'],ph or x['ph'],children,id,note)
def deliver(t,ph,children,id=None,note='',condition=''):
 global seq
 seq+=1
 return {'id':id or 'master-deliverable-'+str(seq),'kind':'deliverable','ph':ph,'t':t,'owner':'','due':'','plannedHours':None,'done':False,'mode':'person','applicable':True,'condition':condition,'note':note,'sub':[task(c,ph) if isinstance(c,str) else c for c in children]}
steps=[]
def add(*items):steps.extend(items)
add(task('Qualify the enquiry and agree the next step','consult',['Confirm project type, location and decision-makers','Discuss priorities, broad investment range and desired timing','Confirm the consultation scope and fee']),
 deliver('Consultation record','consult',[src('c_visit',children=['Walk the site with the client','Record priorities, opportunities and constraints']),src('c_photos'),src('c_addr'),src('c_juris'),src('c_hoa')]),
 deliver('Proposal & signed scope','consult',[task('Prepare the proposal','consult',['List included phases and deliverables','Define review rounds, exclusions and optional services','Set fees, payment triggers and proposed timing']),src('c_prop'),src('c_follow'),src('c_sign'),src('c_dep')]),
 task('Start the project','consult',['Create the project record and confirm contacts','Select applicable phases and scope options','Agree the communication and review process']))
add(deliver('Verified site base','pre',[src('p_survey'),src('p_trace'),src('p_trees'),src('p_util'),src('p_slope')]),
 deliver('Agreed project brief','pre',[src('p_prog',children=['Confirm uses, users and accessibility needs','Record style, maintenance and planting preferences','Confirm elements to keep, remove or add']),src('p_budget'),task('Record the agreed brief','pre',['Resolve unanswered questionnaire items','Record the client’s agreed priorities'])]),
 task('Confirm project requirements and outside inputs','pre',['Review the jurisdiction and any attached association requirements','Identify surveys or consultant information still needed','Confirm which conditional scope items belong in the agreement']),
 task('Set the project sequence','pre',['Link deliverables to phases and review milestones','Identify decisions and information needed before each handoff']))
add(deliver('Concept layout','concept',['Develop the spatial arrangement','Coordinate circulation, terraces, pool and shaded areas','Prepare the preferred option for review',src('k_plan')],id='k_plan'),
 deliver('Concept planting palette','concept',['Define planting zones and their purpose','Select a preliminary palette for site conditions',src('k_plant'),'Review the palette with the client'],id='k_plant'),
 deliver('Concept materials palette','concept',['Compare paving, coping, wall and timber options','Record selected material references',src('k_mat'),'Record outstanding finish decisions'],id='k_mat'),
 deliver('Concept grading & drainage','concept',['Review levels, slopes and likely drainage paths','Identify areas needing consultant coordination',src('k_grade')],id='k_grade'),
 deliver('Concept lighting','concept',['Identify routes, focal points and lighting intent','Choose preliminary fixture types',src('k_light')],id='k_light'),
 deliver('Concept cost estimate','concept',['Check quantities and allowances','Compare the proposed scope with the client’s budget','Record value alternatives and exclusions',src('k_est')],id='k_est'),
 task('Review the concept drawing set','concept',[src('k_north'),src('k_scale'),src('k_title'),src('k_legend'),src('k_rev')]),
 task('Complete the concept review and commercial handoff','concept',['Present the concept and cost position','Record comments and agreed revisions',src('k_co'),src('k_signoff'),src('k_inv')],note='Proposed review gate: record client approval and unresolved items before starting the next phase.'))
add(deliver('Coordinated developed design','dd',[task('Refine the approved design','dd',['Resolve key dimensions and interfaces','Coordinate pool, structures, walls and service requirements']),task('Resolve selections','dd',['Confirm material sizes, finishes and transitions','Resolve planting, irrigation and lighting coordination']),'Update the estimate after design changes']),
 deliver('Design development review package','dd',['Assemble coordinated plans and selection references','Review with the client and record decisions','Identify unresolved items before documentation']),
 task('Review scope and authorization','dd',['Check revisions against the included allowance','Obtain approval for additional scope before proceeding','Confirm the construction-document handoff'],note='Optional phase. Where not contracted separately, allocate this work to schematic design or construction documents.'))
add(deliver('Layout & dimension plan','cd',['Coordinate the latest site base','Dimension boundaries, setbacks and key features','Coordinate interfaces with consultants',src('d_layout')],id='d_layout'),
 deliver('Grading & drainage plan','cd',['Develop proposed grades and drainage routes','Coordinate outfalls and civil input','Complete plan notes and references',src('d_grade')],id='d_grade'),
 deliver('Planting plan & schedule','cd',[task('Develop the planting layout','cd',['Refine zones, spacing and plant quantities','Confirm sizes and plant references']),'Complete the plant schedule and legend','Review site-specific planting requirements',src('d_plant')],id='d_plant'),
 deliver('Irrigation plan','cd',['Coordinate hydrozones and irrigation method','Locate valves, controller and backflow provisions','Complete schedules and installation notes',src('d_irr')],id='d_irr'),
 deliver('Lighting plan & fixture schedule','cd',['Coordinate fixture locations with the design','Confirm fixture specifications and mounting','Coordinate electrical requirements and controls',src('d_light')],id='d_light'),
 deliver('Materials & specifications','cd',['Confirm material and product selections','Prepare schedules and specification notes','Resolve substitutions and incomplete selections',src('d_spec')],id='d_spec'),
 deliver('Demolition & protection plan','cd',['Identify removals and retained features','Document protection and access requirements',src('d_demo')],id='d_demo'),
 deliver('Erosion-control information','cd',['Confirm required scope and consultant responsibility','Prepare or coordinate the relevant notes and details',src('d_ero')],id='d_ero',note='Include only when applicable to the agreed work.'),
 deliver('Construction details','cd',[task('Prepare details for included project elements','cd',['Pool and spa interfaces, where included','Walls, steps and paving transitions, where included','Shade structures and outdoor kitchen, where included','Water features, fire features and service interfaces, where included']),'Coordinate the details with the plans','Review constructability and outstanding consultant information'],note='Project elements determine the details required; do not treat every element as included on every project.'),
 deliver('Coordinated issue set','cd',[src('d_index'),src('d_xref'),'Check dimensions, schedules, notes and revisions','Complete internal issue review','Record outstanding items and issue authorization']),
 deliver('Updated construction estimate','cd',['Reconcile quantities and specifications','Review current allowances and exclusions',src('d_est')],id='d_est'))
add(deliver('Permit submission & responses','bid',['Confirm submission requirements and responsible party','Assemble the agreed documents',src('b_permit'),'Log comments and coordinate responses','Record the latest submission status'],id='b_permit',note='Submission is not permit approval. Track the authority’s actual response.'),
 deliver('HOA / design review submission','bid',[src('b_hoa'),'Confirm required forms and owner authorizations','Record submission, comments and resubmissions'],id='b_hoa',condition='hoa'),
 deliver('Contractor bid package','bid',['Confirm the bid scope, alternates and exclusions','Identify invited contractors and response dates',src('b_bid'),'Log bidder questions'],id='b_bid'),
 deliver('Bid comparison & recommendation','bid',['Import bids and confirm the source documents','Reconcile scope, allowances and exclusions','Review confidence checks and contractor information','Review the AI comparison against the underlying records',src('b_cmp'),'Record the client’s decision and outstanding questions'],id='b_cmp'),
 deliver('Addenda & final cost position','bid',[src('b_add'),'Record which documents each bidder received',src('b_est')],id='b_add'),
 task('Complete the design handoff','bid',[src('b_pre'),'Issue the agreed current document set','Record responsibilities, exclusions and open items','Confirm whether construction observation is included','Review outstanding invoices and archive the issued set']))
add(task('Agree the construction-observation scope','co',['Confirm the site-visit allowance and communication process','Record contractor contacts and expected programme'],note='Optional service; confirm the signed scope before starting.'),
 deliver('Construction observation records','co',[task('Prepare for each agreed visit','co',['Review relevant drawings and open questions','Confirm the purpose and timing of the visit']),task('Record the visit','co',['Document observations and photographs','Identify questions requiring a response','Issue the agreed visit note and follow-up actions'])]),
 deliver('Design clarifications & changes','co',['Log design questions and agreed responses','Review substitutions within the contracted scope','Obtain authorization for additional design work','Keep revisions and recipients traceable']),
 deliver('Project closeout record','co',['Complete the agreed final review','Record outstanding items and responsible parties','Collect agreed handover information','Confirm final fee and invoice status','Archive the project and record process lessons']))
assert used==set(master),(set(master)-used)
conditions=[{'key':k,'title':label,'state':'review','evidence':'Review applicability from the project facts and agreed scope. This master draft makes no jurisdiction determination.','scope':'Confirm inclusion, responsibility and any additional fee.'} for k,label in raw['conditions']]
# Optional scope packs remain separate from the core sequence for review.
packs={
 'hoa':['Obtain current association guidelines and submission requirements','Check design against applicable guidelines','Prepare the submission and record responses'],
 'fire':['Confirm applicable fire-related requirements with the responsible authority or consultant','Confirm design responsibility and any additional fee','Coordinate planting / fuel-modification documentation where required'],
 'mwelo':['Confirm applicability using project area, type and jurisdiction requirements','Confirm responsibility for water-budget documentation','Prepare and review the agreed compliance package'],
 'coastal':['Confirm whether coastal review applies','Agree submission responsibility, scope and timing','Track authority comments and responses'],
 'hillside':['Confirm grading and hillside review requirements','Coordinate survey, civil and structural inputs','Track required submissions and responses'],
 'historic':['Confirm historic-review applicability','Coordinate design constraints and required supporting material','Track review comments and responses'],
 'trees':['Confirm protected-tree requirements','Coordinate arborist information and protection details','Track any required removal or work approvals'],
 'geotech':['Confirm the need for geotechnical input','Obtain the report from the responsible consultant','Coordinate recommendations within the design scope'],
 'septic':['Confirm existing or proposed septic constraints','Coordinate with the responsible specialist','Resolve design interfaces before issue']}
data={'schema':1,'revision':0,'phase':'consult','projectName':'Studio H · Master process draft','phases':[{'id':id,'t':t} for id,t in phases],'steps':steps,'conditions':conditions,'removedSourceIds':[],'readOnly':False,'demo':True,'draft':True,'optionalPhases':['dd','co'],'scopePacks':packs}
(r/'master.json').write_text(json.dumps(data,ensure_ascii=False,indent=2))
def walk(a):
 for n in a:
  yield n
  yield from walk(n.get('sub',[]))
allnodes=list(walk(steps));assert len({n['id'] for n in allnodes})==len(allnodes),'duplicate ids'
assert all(n['owner']=='' and n['plannedHours'] is None and not n['done'] for n in allnodes)
print(json.dumps({'phases':len(phases),'deliverables':sum(n['kind']=='deliverable' for n in steps),'tasksAndSubtasks':sum(n['kind']=='task' for n in allnodes),'existingChecksRetained':len(used),'conditionalPacks':len(packs)}))
