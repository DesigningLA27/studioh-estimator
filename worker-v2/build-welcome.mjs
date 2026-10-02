// Render the public sample with the same Project Home renderer as signed-in projects.
import fs from 'node:fs';
import vm from 'node:vm';
const host={isConnected:true,innerHTML:'',querySelectorAll:()=>[]};
let source=fs.readFileSync('v2/src/project-home.js','utf8');
source=source.replace('window.v2Home={',`host=fixtureHost;ctx={data:{},save(){}};data={name:'Sample — San Marino',address:'1205 PATTON WAY · SAN MARINO',sample:true,images:[],budget:450000,estimate:384450};storage();seedSample();draw();window.v2Home={`);
vm.runInNewContext(source,{fixtureHost:host,window:{addEventListener(){}},document:{},sessionStorage:{getItem(){return null}},location:{href:'https://app.warwick.design/app/'},URL,Intl,Date,Set,clearInterval});
const markup=host.innerHTML.replaceAll('https://app.warwick.design/app/assets/','assets/').replaceAll('Sample project','Sample project · Preview');
let cloud=fs.readFileSync('v2/src/cloud.js','utf8');
cloud=cloud.replace(/\/\* PUBLIC_HOME_START \*\/[\s\S]*?\/\* PUBLIC_HOME_END \*\//, '/* PUBLIC_HOME_START */\nconst publicHome='+JSON.stringify(markup)+';\n/* PUBLIC_HOME_END */');
fs.writeFileSync('v2/src/cloud.js',cloud);
let css=fs.readFileSync('v2/src/cloud.css','utf8').replace(/\/\* PUBLIC_HOME_CSS \*\/[\s\S]*/, '');
css+='\n/* PUBLIC_HOME_CSS */\n'+fs.readFileSync('v2/src/project-home.css','utf8').replaceAll('#v2-project-home','#welcome-home');
fs.writeFileSync('v2/src/cloud.css',css);
