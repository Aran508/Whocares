const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>console.log('console:',m.text()));
await p.goto('file://'+process.cwd()+'/index.html');await p.evaluate(()=>document.fonts.load('700 80px Cinzel'));
const ts=process.argv.slice(2).map(Number);fs.mkdirSync('prev',{recursive:true});
for(const t of ts){const t0=Date.now();const d=await p.evaluate(t=>{renderAt(t);return document.getElementById('c').toDataURL('image/jpeg',0.8)},t);
fs.writeFileSync(`prev/${t.toFixed(1)}.jpg`,Buffer.from(d.split(',')[1],'base64'));console.log(t,Date.now()-t0,'ms');}
await b.close();})();
