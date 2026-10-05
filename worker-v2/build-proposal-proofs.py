from reportlab.pdfbase.pdfmetrics import stringWidth
from pathlib import Path
import json,re,shutil,os
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor,Color
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
root=Path(__file__).resolve().parents[1];out=root/'output/pdf';web=root/'v2/assets/reviews/proposal-signing-r2';fontbase=Path(os.environ.get('STUDIOH_SANS_FONTS',Path.home()/'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pdfjs-dist/standard_fonts'))
out.mkdir(parents=True,exist_ok=True)
web.mkdir(parents=True,exist_ok=True)
for name,file in [('Sans','LiberationSans-Regular.ttf'),('Bold','LiberationSans-Bold.ttf')]:pdfmetrics.registerFont(TTFont(name,str(fontbase/file)))
serif=Path(os.environ.get('STUDIOH_SERIF_FONT',Path.home()/'.cache/codex-runtimes/codex-primary-runtime/dependencies/native/libreoffice-headless/libreoffice/LibreOfficeDev.app/Contents/Resources/fonts/truetype/LiberationSerif-Regular.ttf'));pdfmetrics.registerFont(TTFont('Serif',str(serif)))
ink='#293a32';sage='#eaf0e3';blue='#e7f0f5';pink='#fcecf7';muted='#6d776f';green='#527444';paper='#fafaf6';img=ImageReader(str(root/'v2/assets/proposals/garden.png'))
x=json.load(open(root/'v2/assets/proposals/proposal-template.json'));terms=next(s['markdown'] for s in x['sections'] if s['id']=='K').replace('\\n','\n');terms=re.sub(r'^> ?', '',terms,flags=re.M);terms=terms.replace('**','').replace('{{client_name}}','Jordan and Taylor Morgan').replace('{{cap}}','$250,000').replace('{{date}}','October 5, 2026');terms=re.findall(r'(?m)^\d+\. (.*?)(?=^\d+\. |^Signed as accepted|\Z)',terms,re.S);terms=[' '.join(t.split()) for t in terms]
# Preserve source text for layout review; the proof is expressly not executable.
ex=next(s['markdown'] for s in x['sections'] if s['id']=='G').replace('\\n','\n');ex=re.sub(r'^> ?', '',ex,flags=re.M);ex=[' '.join(t.split()) for t in re.findall(r'(?m)^\d+\. (.*?)(?=^\d+\. |\Z)',ex,re.S)]
scopes=[['Conceptual / Schematic Phase','3–4 weeks','A clear direction before the details.','Site and brief review; spatial planning; landscape concept; materials direction; two coordinated client review rounds.'],['Construction Documents Phase','4–6 weeks','Turn the vision into buildable information.','Construction plan; construction details and specifications; planting plan and specifications; lighting plan.'],['Construction Observation','Hourly, as requested','Keep the design intent in view.','Site observations, responses to design questions and coordination with the selected contractor. Construction supervision and contractor means and methods are excluded.']]
fees=[['Conceptual Plan',18000],['Construction Plan & Details',11000],['Planting Plan, Details & Specs',4500],['Lighting Plan',2500]]
options=[['3D Rendering',2500],['Irrigation Plan',1500],['Pottery & Plants Plan',1200],['Furnishings Plan',1800]]
milestones=['Confirm construction allowance and brief','Present the conceptual landscape plan','Approve the revised concept','Commence construction documents','Review the proposed plant palette','Review the coordinated drawing set','Prepare agreed HOA submission copies','Issue approved plans for contractor pricing','Review contractor proposals with the client','Provide requested construction observation']
data={'name':'Oak Terrace residence','client':'Jordan & Taylor Morgan','location':'San Marino, California','date':'October 5, 2026','id':'SH-DEMO-026','budget':200000,'cap':250000,'fees':fees,'options':options,'scopes':scopes,'milestones':milestones,'terms':terms,'exclusions':ex,'proof':'Fictional design proof. Reference imagery, not a project-specific design. Not for execution.'}
(web/'sample.json').write_text(json.dumps(data,ensure_ascii=False))
def clean(t):return str(t).replace('—','-').replace('–','-').replace('’',"'").replace('“','"').replace('”','"').replace('×','x').replace('→','>')
for variant,title in [('a','Studio portfolio'),('b','Clear agreement'),('c','Guided proposal')]:
 c=canvas.Canvas(str(out/f'{variant.upper()}-{title.lower().replace(" ","-")}.pdf'),pagesize=(612,792));c.setTitle('Studio H | '+title+' | complete design proof');c.setAuthor('Studio H');page=0;head='Serif' if variant=='b' else 'Bold'
 def txt(text,x,y,size=10,font='Sans',color=ink):c.setFillColor(HexColor(color));c.setFont(font,size);c.drawString(x,y,clean(text))
 def para(text,x,y,w=516,size=10.5,color=ink,leading=None,font='Sans'):
  text=clean(text).replace('&','&amp;');p=Paragraph(text,ParagraphStyle('body',fontName=font,fontSize=size,leading=leading or size*1.48,textColor=HexColor(color)));_,h=p.wrap(w,1000);p.drawOn(c,x,y-h);return y-h
 def box(x,y,w,h,color=sage,r=14):c.setFillColor(HexColor(color));c.roundRect(x,y,w,h,r,fill=1,stroke=0)
 def photo(tile,x,y,w,h):
  # Lay out one view from the existing reference-image sheet, without creating altered source images.
  tw,th=384,512;scale=max(w/tw,h/th);col,row=tile%4,tile//4;c.saveState();path=c.beginPath();path.roundRect(x,y,w,h,14);c.clipPath(path,stroke=0);c.drawImage(img,x-(col*tw*scale)+(w-tw*scale)/2,y-(1-row)*th*scale+(h-th*scale)/2,width=1536*scale,height=1024*scale,mask='auto');c.restoreState()
 def start(section):
  nonlocal_dummy=None
  global page
  page+=1;c.setFillColor(HexColor(paper if variant=='b' else '#ffffff'));c.rect(0,0,612,792,fill=1,stroke=0)
  if variant=='c':box(0,0,15,792,green,0)
  txt('Studio H',48,752,17,'Bold');txt('LANDSCAPE ARCHITECTURE',48,738,7,'Sans',muted);txt(title.upper(),360,752,8,'Sans',muted)
  c.setStrokeColor(HexColor('#e4e9df'));c.line(48,58,564,58);txt('OAK TERRACE / SH-DEMO-026',48,42,7,'Sans',muted);txt('DESIGN PROOF - NOT FOR EXECUTION',241,42,6.7,'Sans',muted);txt(f'{page:02d} / 09',530,42,8,'Bold',muted)
  if section:txt(section.upper(),48,702,8,'Bold',green)
 def heading(text,sub=''):
  txt(text,48,667,30,head)
  if sub:para(sub,48,642,510,10.5,muted)
 def end():c.showPage()
 start('DESIGN SERVICES PROPOSAL')
 if variant=='a':
  txt('A place that feels',48,648,38,head);txt('like you.',48,604,38,head);para('Oak Terrace residence / San Marino, California',48,575,510,12,muted);photo(0,48,212,327,328);box(391,212,173,328,sage);txt('YOUR DESIGN FEE',408,500,8,'Bold',muted);txt('$35,000',408,463,30,'Bold');para('Two design phases.\nA complete landscape vision.',408,439,137,10);txt('PREPARED FOR',408,342,8,'Bold',muted);para('Jordan & Taylor Morgan',408,325,135,12);para('October 5, 2026<br/>Proposal SH-DEMO-026',408,266,135,9,muted)
 elif variant=='b':
  txt('Landscape,',48,650,46,head);txt('considered.',48,599,46,head);para('Oak Terrace residence',48,558,510,17);photo(5,48,309,516,213);box(48,178,516,107,sage);txt('JORDAN & TAYLOR MORGAN',67,258,10,'Bold');txt('San Marino, California',67,236,10);txt('October 5, 2026 / SH-DEMO-026',67,209,9,'Sans',muted);txt('$35,000',407,231,29,'Bold');txt('FIXED DESIGN FEE',407,212,7,'Sans',muted)
 else:
  photo(4,48,211,516,465);box(48,211,516,178,green);txt('Make room',70,342,42,'Bold','#ffffff');txt('for living.',70,295,42,'Bold','#ffffff');txt('OAK TERRACE RESIDENCE',71,252,9,'Sans','#ffffff');txt('$35,000',413,261,27,'Bold','#ffffff');para('Prepared for Jordan & Taylor Morgan<br/>San Marino, California / October 5, 2026',48,181,516,11)
 para('A thoughtful design. A shared direction. From the first sketch to the final detail.',48,151 if variant!='c' else 128,510,11);para(data['proof'],48,101,516,8,muted);end()
 start('01 / OUR APPROACH');heading('Outside, beautifully lived.','A landscape for unhurried mornings, generous gatherings and everyday life.')
 photo(1,48,354,246,246);photo(6,310,354,254,246)
 y=para('The garden is an extension of the way you live. We begin with how you move through the site, what you want to see from inside and where you naturally gather. Then we bring the spaces, planting and materials into a coherent whole.',48,329,516,12)
 for j,(h,t) in enumerate([('Space to gather','A comfortable dining terrace, shade and room for conversation.'),('A calmer palette','Natural stone, warm timber and a restrained planting vocabulary.'),('A clear process','Thoughtful decisions at each phase, with scope and fees visible.')]):
  xx=48+j*177;box(xx,136,161,94,blue if j==1 else sage);txt(h,xx+13,209,11,'Bold');para(t,xx+13,192,135,9.5)
 para('Images communicate atmosphere and material direction. They are illustrative references, not drawings of the proposed works.',48,111,516,8,muted);end()
 start('02 / SCOPE & PHASES');heading('The work we will do.','A focused scope, with optional services kept clear and separate.')
 y=592
 for i,(h,d,k,t) in enumerate(scopes):
  height=137 if i<2 else 142;box(48,y-height,516,height, sage if i==0 else blue if i==1 else '#f5f6f1');txt(f'0{i+1}',64,y-25,11,'Bold',green);txt(h,100,y-26,16,head);txt(d,100,y-48,9,'Sans',muted);para(k,64,y-70,475,11,'Bold' if False else ink,font='Bold');para(t,64,y-91,475,10);y-=height+17
 para('Optional additions: 3D rendering, irrigation, pottery and planting, and furnishings may be added through a separately approved scope and fee.',48,114,516,9.5,muted);end()
 start('03 / YOUR INVESTMENT');heading('A clear fee. A complete view.','Construction allowance: $200,000. Contractual maximum for this design scope: $250,000.')
 box(48,515,516,83,sage);txt('COMPLETE DESIGN PACKAGE',68,573,8,'Bold',muted);txt('$35,000',68,535,33,'Bold');para('Your fixed design fee<br/>Hourly and optional work are separate.',330,567,210,11)
 y=484
 for label,fee in fees:
  txt(label,56,y,11);txt('${:,.0f}'.format(fee),548-stringWidth('${:,.0f}'.format(fee),'Bold',12),y,12,'Bold');c.setStrokeColor(HexColor('#e4e9df'));c.line(48,y-14,564,y-14);y-=42
 txt('Services subtotal',56,300,11);txt('$36,000',548-stringWidth('$36,000','Bold',12),300,12,'Bold');box(48,239,516,40,pink);txt('Package saving',64,254,11);txt('-$1,000',548-stringWidth('-$1,000','Bold',12),254,12,'Bold','#982265');txt('TOTAL FIXED DESIGN FEE',56,212,10,'Bold');txt('$35,000',548-stringWidth('$35,000','Bold',22),208,22,'Bold')
 txt('OPTIONAL SERVICES',48,171,8,'Bold',muted)
 for j,(name,fee) in enumerate(options):txt(name,48+(j%2)*264,150-(j//2)*23,9.5);txt('${:,.0f}'.format(fee),238+(j%2)*264,150-(j//2)*23,9.5,'Bold')
 para('Optional services are excluded from the total above. Internal staff costs, allowed hours and profitability are never included in the client proposal.',48,92,516,8,muted);end()
 start('04 / TIMING & PAYMENT');heading('A clear path forward.','The phase clock starts after payment and the required project information are received.')
 y=590
 for i,m in enumerate(milestones):
  box(48,y-24,27,27,sage,9);txt(f'{i+1:02d}',55,y-14,9,'Bold',green);para(m,89,y-3,468,10);y-=34
 box(48,132,516,98,blue);txt('PHASE 01',66,208,8,'Bold',muted);txt('$17,500',66,181,23,'Bold');txt('Before commencement / 3–4 weeks',66,157,8.5);txt('PHASE 02',327,208,8,'Bold',muted);txt('$17,500',327,181,23,'Bold');txt('Before commencement / 4–6 weeks',327,157,8.5)
 para('Commencement requires a signed agreement, payment, completed questionnaire, site survey or plot plan, HOA guidelines where applicable, and approval of the preliminary construction allowance. Dates are estimates; agency review and client response time affect the schedule.',48,111,516,9);end()
 start('05 / WORKING TOGETHER');heading('What is included. What is separate.','An agreement works best when the responsibilities are easy to find.')
 txt('MEETINGS & ADDITIONAL SERVICES',48,597,9,'Bold',green);para('Remote meetings within the agreed scope are included. On-site meetings and requested construction observation are billed hourly, without a preset site-hours limit. Travel time is included in this illustrative proposal. Reimbursable project expenses require approval.',48,579,516,10)
 box(48,446,516,51,sage)
 for j,(role,rate) in enumerate([('Principal',295),('Landscape architect',250),('Designer',195),('Admin',100)]):txt(role,61+j*130,480,8,'Sans',muted);txt(f'${rate}/hr',61+j*130,460,14,'Bold')
 txt('EXCLUDED SERVICES',48,421,9,'Bold',green);y=399
 for i,t in enumerate(ex):y=para(f'{i+1:02d}  {t}',48,y,516,9.3,leading=13)-9
 para('Media in the live proposal can include an image slideshow and a video walkthrough. The signing PDF preserves still reference images and a link back to the live presentation.',48,125,516,9.3);c.linkURL('https://app.warwick.design/app/assets/reviews/proposal-signing-r2/#'+variant,(48,77,380,98),relative=0);txt('VIEW THE LIVE PRESENTATION >',48,84,9,'Bold',green);end()
 for chunk in range(2):
  start('06 / TERMS & CONDITIONS');heading('Our agreement, clearly stated.',f'Clauses {chunk*12+1}–{chunk*12+12} of 24. Studio H reference wording for layout review.')
  texts=terms[chunk*12:(chunk+1)*12];size=10
  while True:
   hs=[]
   for i,t in enumerate(texts):
    p=Paragraph(clean(f'{chunk*12+i+1}. '+t).replace('&','&amp;'),ParagraphStyle('t',fontName='Sans',fontSize=size,leading=size*1.4));hs.append(p.wrap(516,1000)[1]+10)
   if sum(hs)<490 or size<=8.8:break
   size-=.2
  y=593
  for i,t in enumerate(texts):y=para(f'{chunk*12+i+1:02d}  '+t,48,y,516,size,leading=size*1.4)-10
  para('Design proof only. Source: Studio H proposal reference library. Conflicting legacy payment/cancellation provisions require studio review before this template is issued for signature.',48,104,516,8,muted);end()
 start('07 / ACCEPTANCE');heading('Ready for the next chapter.','Review the scope, pricing and complete terms before accepting the agreement.')
 photo(7,48,424,243,177);box(309,424,255,177,sage);txt('FIXED DESIGN FEE',329,573,8,'Bold',muted);txt('$35,000',329,534,32,'Bold');para('Oak Terrace residence<br/>Jordan & Taylor Morgan<br/>Proposal SH-DEMO-026',329,499,211,10)
 para('By signing the final agreement, the parties confirm the selected scope, agreed fees, billing arrangements and terms. This mockup is a design proof and cannot be executed.',48,399,516,10.5)
 for i,(role,name) in enumerate([('CLIENT 01','Jordan Morgan'),('CLIENT 02','Taylor Morgan'),('DESIGNER','Studio H authorized representative')]):
  y=325-i*76;txt(role,48,y,8,'Bold',muted);txt(name,48,y-17,10);c.setStrokeColor(HexColor('#b6c4af'));c.line(48,y-43,365,y-43);c.line(399,y-43,564,y-43);txt('Signature',48,y-56,8,'Sans',muted);txt('Date',399,y-56,8,'Sans',muted)
 para('E-signing handoff: place each signer’s signature and date fields on the lines above. Identity verification, consent, audit trail and completion certificate are supplied by the selected signing provider.',48,90,516,8,muted);end();c.save()
 shutil.copy2(out/f'{variant.upper()}-{title.lower().replace(" ","-")}.pdf',web/f'{variant}.pdf')
print('Created 3 full nine-page PDF proofs.')
