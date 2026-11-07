const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>{if(m.type()==='error')console.log('console:',m.text())});
await p.goto('http://127.0.0.1:8765/index.html');await p.evaluate(()=>window.READY);
const ts=process.argv.slice(2).map(Number);fs.mkdirSync('prev',{recursive:true});
for(const t of ts){const d=await p.evaluate(t=>{renderAt(t);return document.getElementById('c').toDataURL('image/jpeg',0.8)},t);fs.writeFileSync(`prev/${t.toFixed(1)}.jpg`,Buffer.from(d.split(',')[1],'base64'));}
console.log('TOTAL',await p.evaluate(()=>TOTAL));await b.close();})();
