"""Package the recovered V2 runtime without regenerating it from stale V1 builders."""
from pathlib import Path
import json,os,re,shutil,sys
root=Path(__file__).resolve().parent
repo=root.parent
manifest=json.loads((root/'recovered/manifest.json').read_text())
source=repo/'v2';out=root/'.private-app'
if out.exists():shutil.rmtree(out)
out.mkdir()
for name in ['index.html','engine.html','version.json','assets','src','presentation-board']:
 p=source/name
 if p.is_dir():shutil.copytree(p,out/name)
 else:shutil.copy2(p,out/name)
key=os.environ.get('GOOGLE_MAPS_BROWSER_KEY','')
if '--deploy' in sys.argv and not re.fullmatch(r'AIza[0-9A-Za-z_-]{35}',key):
 raise SystemExit('Set GOOGLE_MAPS_BROWSER_KEY in the deployment environment before deploying.')
for p in out.rglob('*'):
 if p.is_file() and p.suffix in ('.html','.js','.mjs','.css','.json'):
  t=p.read_text()
  if key:t=t.replace('__GOOGLE_MAPS_BROWSER_KEY__',key)
  p.write_text(t)
# The saved engine baseline uses the original opaque-frame board adapter.
engine=out/'engine.html';code=engine.read_text();needle="frame.src='presentation-board/?v=V2.049';"
if needle in code:
 board=out/'presentation-board/index.html';html=board.read_text()
 def script(m):return '<script>'+(board.parent/m[1].split('?')[0]).read_text().replace('</script','<\\/script')+'</script>'
 def css(m):return '<style>'+(board.parent/m[1].split('?')[0]).read_text()+'</style>'
 html=re.sub(r'<script src="([^"]+)"[^>]*></script>',script,html)
 html=re.sub(r'<link rel="stylesheet" href="([^"]+)"[^>]*>',css,html)
 engine.write_text(code.replace(needle,'frame.srcdoc='+json.dumps(html).replace('<',r'\u003c')+';'))
assets={k:(out/k.lstrip('/')).read_text() for k in manifest['embeddedAssets']}
pages={k:((repo/k.lstrip('/')) if k.endswith('.html') else (repo/k.lstrip('/')/'index.html')).read_text() for k in manifest['reviewRoutes']}
gen=root/'generated';gen.mkdir(exist_ok=True)
(gen/'runtime-assets.mjs').write_text('export const studioInterfaceAssets = '+json.dumps(assets)+';\nexport const dashboardPreviewPages = '+json.dumps(pages)+';\n')
print('Packaged '+manifest['release']+' source: '+str(len(assets))+' overrides and '+str(len(pages))+' review routes. No deployment performed.')
