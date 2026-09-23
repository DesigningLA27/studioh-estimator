from pathlib import Path
import re
root=Path(__file__).resolve().parent
mock=(root/'src/layout.html').read_text()
mock=mock.replace('function save(){', "window.v2Layout={open(page){state.page=page;state.detail='';render()},financial(tab,view){state.page='financials';fee.tab=tab||'Fee builder';fee.view=view||'Designer';renderFinancials()}};function save(){")
# Keep the approved old Afternoon palette as Morning; add the two approved studies.
mock=mock.replace('Afternoon','Morning')
mock=mock.replace("['Day','Morning','Dusk','Night']","['Morning','Day','Afternoon','Dusk','Night']")
mock=re.sub(r'<div class="themebar" aria-label="Color theme">.*?</div>', '<div class="themebar" aria-label="Color theme">'+''.join('<button data-theme="'+t+'">'+t+'</button>' for t in ['Morning','Day','Afternoon','Dusk','Night'])+'</div>', mock, count=1)
mock=mock.replace('data-theme="Morning" aria-label=', 'data-theme="Day" aria-label=').replace("theme:'Morning'", "theme:'Day'")
mock=re.sub(r'<i data-lucide="[^"]*" aria-hidden="true"></i>','',mock)
mock=mock.replace("page:'financials',detail:'',theme:","page:'home',detail:'',theme:")
mock=mock.replace('V2 concept','V2 preview').replace('V2 layout proposal','Workspace preview')
mock=mock.replace('<div class="body">','''<div id="v2-global"><span id="v2-state">Loading isolated workspace…</span><button id="v2-project-button">Preview project</button><button id="v2-save">Save preview</button><button id="v2-export">Export project</button></div><div class="body">''',1)
# V2 has a working engine, but future services must remain explicitly marked.
mock=mock.replace('<div class="heading"><div class="sectionhead"><span class="tag">${project.some', '<div class="heading"><div class="sectionhead"><span class="tag">${project.some')
mock=mock.replace("if(state.detail){const item=", "if(['client','community','business','resources','assistant'].includes(state.page))content.innerHTML+='<div class=\"below\" style=\"margin-bottom:16px\"><span class=\"small\">Planned workspace · Preview only</span></div>';if(state.detail){const item=")
mock=mock.replace('Nest Pine Residence','V2 preview project').replace('6 of 9 sections reviewed','Your project questionnaire').replace('6 of 9 client sections reviewed','Open questionnaire').replace('✓ Project information entered','Open project information').replace('Illustrative progress','Continue your project').replace('Irvine, California','Local project copy')
# Preserve financial scenario locally, never in the production project payload.
mock=mock.replace('const money=n=>',"try{const prior=JSON.parse(localStorage.getItem('studioh_v2_financial_scenario')||'null');if(prior)Object.assign(fee,prior)}catch{}\nconst money=n=>")
mock=mock.replace('function renderFinancials(){let t=totals();',"function renderFinancials(){try{localStorage.setItem('studioh_v2_financial_scenario',JSON.stringify(fee))}catch{}let t=totals();")
extra='''<dialog id="v2-projects"><h2>Preview project</h2><p>Import an exported V1 project as an independent copy, or use sample data. Changes stay in V2 on this device.</p><label>Import project JSON<input id="v2-import" type="file" accept=".json,application/json"></label><button id="v2-sample">Open sample project</button><button onclick="this.closest('dialog').close()">Close</button><p>AI, online lookups, uploads and cloud sync are disconnected in this isolated preview.</p></dialog>'''
mock=mock.replace('<main id="sh-content"></main></div></div>','<main id="sh-content"></main></div>'+extra+'</div>')
(root/'index.html').write_text('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Studio H · V2 Preview</title><link rel="stylesheet" href="src/shell.css"></head><body>'+mock+'<div id="v2-notice" hidden role="status"></div><script src="src/shell.js?v=5"></script><link rel="stylesheet" href="src/workspace.css?v=5"><script src="src/icons.js"></script><link rel="stylesheet" href="src/libraries.css?v=5"><script src="src/libraries.js?v=5"></script><script src="src/workspace.js?v=5"></script></body></html>')
