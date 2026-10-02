(()=>{'use strict';
function parse(text,work,today){
 const hours=[...text.matchAll(/(\d+(?:\.\d+)?)\s*(hours?|hrs?|h)\b/gi)].reduce((n,m)=>n+Number(m[1]),0),minutes=[...text.matchAll(/(\d+(?:\.\d+)?)\s*(minutes?|mins?|m)\b/gi)].reduce((n,m)=>n+Number(m[1]),0),duration=hours+minutes/60;
 let date=today,dateCertain=/\btoday\b/i.test(text);if(/\byesterday\b/i.test(text)){const d=new Date(today+'T12:00:00');d.setDate(d.getDate()-1);date=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');dateCertain=true}const explicit=text.match(/\b\d{4}-\d{2}-\d{2}\b/);if(explicit){date=explicit[0];dateCertain=true}
 const words=text.toLowerCase().match(/[a-z]{3,}/g)||[],stop=new Set(['the','and','for','today','yesterday','spent','hours','working','worked','minutes','hour','hrs','with','this','studio']);const tokens=words.filter(w=>!stop.has(w)).map(w=>w==='admin'?'administration':w);
 const ranked=work.map(w=>({w,score:(w.title.toLowerCase().match(/[a-z]{3,}/g)||[]).filter(t=>tokens.includes(t)).length})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
 const matches=ranked.filter(x=>x.score===ranked[0]?.score).map(x=>x.w.key);
 return {hours:duration||null,date,dateCertain,matches};
}
window.v2TimeParse=parse;
})();
