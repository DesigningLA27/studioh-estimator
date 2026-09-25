"""Generate the isolated V2 engine from the unchanged V1 source."""
from pathlib import Path
import hashlib,json,re,base64
root=Path(__file__).resolve().parent
src=(root.parent/'index.html').read_text()
# Adapt only iframe boundaries for opaque-origin isolation; questionnaire logic stays.
for name in ['Q_FRAME_HTML','Q_DESIGNER_HTML']:
    pattern=r'const '+name+r'\s*=\s*"([^"]+)"'
    match=re.search(pattern,src)
    q=base64.b64decode(match[1]).decode()
    q=q.replace('parent.location.origin',"'*'")
    q=q.replace("||e.origin!=='*'",'').replace("&&e.origin==='*'",'')
    q=q.replace('parent.qSelectionAssets()','window.V2_Q_ASSETS')
    q=q.replace('parent.document','document').replace('parent.getComputedStyle','getComputedStyle').replace('parent.google','window.google')
    src=src[:match.start(1)]+base64.b64encode(q.encode()).decode()+src[match.end(1):]
src=src.replace('e.origin!==location.origin||_qSession','_qSession')
src=src.replace('token:_qToken,...data},location.origin)','token:_qToken,...data},"*")')
expr="new TextDecoder().decode(Uint8Array.from(atob(_qMode==='designer'?Q_DESIGNER_HTML:Q_FRAME_HTML),c=>c.charCodeAt(0)))"
assert expr in src
src=src.replace(expr,'v2QuestionnaireHTML('+expr+')')
guard=(root/'src/guard.js').read_text();bridge=(root/'src/bridge.js').read_text()+'\n'+(root/'src/programming.js').read_text()+'\n'+(root/'src/photos.js').read_text()+'\n'+(root/'src/insights.js').read_text()+'\n'+(root/'src/project-files.js').read_text();css=(root/'src/engine.css').read_text()
# These restrictions are parsed before any original scripts. Production APIs,
# forms, object plugins and workers cannot write to live services.
csp="connect-src https://maps.googleapis.com https://maps.gstatic.com https://*.googleapis.com; form-action 'none'; object-src 'none'; worker-src blob:; frame-src 'self' about: blob:; base-uri 'none'"
boot='<meta http-equiv="Content-Security-Policy" content="'+csp+'"><script>'+guard+'</script>'
engine=src.replace('<head>','<head>'+boot,1).replace('</head>','<style>'+css+'</style></head>',1)
pos=engine.rfind('</body>');assert pos>0
engine=engine[:pos]+'<script>'+bridge+'</script>'+engine[pos:]
(root/'engine.html').write_text(engine)
(root/'engine-source.json').write_text(json.dumps({'source':'../index.html','sha256':hashlib.sha256((root.parent/'index.html').read_bytes()).hexdigest(),'baseVersion':'v1571','isolation':'sandboxed opaque origin; Google Maps connections only; project reads through parent; separate IndexedDB storage'},indent=2)+'\n')
