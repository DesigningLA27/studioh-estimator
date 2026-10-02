"""Stage only runtime files for direct Cloudflare hosting, without publishing source to GitHub."""
from pathlib import Path
import shutil,re,json,subprocess,sys
root=Path(__file__).resolve().parent
subprocess.run([sys.executable,str(root/'build-element-cards.py')],check=True)
source=root.parent/'v2'
out=root/'.private-app'
if out.exists():shutil.rmtree(out)
out.mkdir()
for name in ['index.html','engine.html','version.json']:
 shutil.copy2(source/name,out/name)
for name in ['assets','src','presentation-board']:
 shutil.copytree(source/name,out/name)
for path in (out/'src').iterdir():
 if path.is_file() and path.suffix not in ['.js','.css','.json']:path.unlink()
old='https://designingla27.github.io/studioh-estimator/v2/'
new='https://studioh-v2-storage.warwick-cca.workers.dev/app/'
for path in out.rglob('*'):
 if path.is_file() and path.suffix in ['.html','.js','.css','.json']:
  text=path.read_text().replace(old,new)
  if path.name=='index.html':text=re.sub(r'<link rel="preload"[^>]+>','',text)
  if path.name=='cloud.js':
   text=text.replace("const endpoint='https://studioh-v2-storage.warwick-cca.workers.dev'", "const endpoint=location.origin")
   text=text.replace("endpoint+'/login?state='", "'https://studioh-v2-storage.warwick-cca.workers.dev/login?app=private&return_origin='+encodeURIComponent(location.origin)+'&state='")
   text=text.replace("let demoMode=new URLSearchParams(location.search).get('demo')==='1';","let demoMode=false;")
   text=text.replace('<button data-demo>Try the demo</button>','<button data-demo hidden>Try the demo</button>')
  path.write_text(text)
# The editor is sandboxed with an opaque origin. Embed its static runtime in
# the authenticated engine response so nested requests never require cookies.
board=out/'presentation-board/index.html'
html=board.read_text()
def inline_script(match):
 file=(board.parent/match.group(1).split('?')[0]).resolve()
 if not file.is_relative_to(out):raise ValueError('Unexpected editor script')
 return '<script>'+file.read_text().replace('</script', '<\\/script')+'</script>'
def inline_style(match):
 file=(board.parent/match.group(1).split('?')[0]).resolve()
 if not file.is_relative_to(out):raise ValueError('Unexpected editor stylesheet')
 return '<style>'+file.read_text()+'</style>'
html=re.sub(r'<script src="([^"]+)"[^>]*></script>',inline_script,html)
html=re.sub(r'<link rel="stylesheet" href="([^"]+)"[^>]*>',inline_style,html)
engine=out/'engine.html'
code=engine.read_text()
needle="frame.src='presentation-board/?v=V2.049';"
if code.count(needle)!=1:raise ValueError('Editor entry point changed')
code=code.replace(needle,'frame.srcdoc='+json.dumps(html).replace('<',r'\u003c')+';')
engine.write_text(code)
print('Private app runtime staged:',out)
