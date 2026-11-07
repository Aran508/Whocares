const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:2560,height:1440}});p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('http://127.0.0.1:8765/profile.html');await p.waitForFunction(()=>window.DONE);
for(const id of ['a','b']){const d=await p.evaluate(id=>document.getElementById(id).toDataURL('image/png'),id);fs.writeFileSync(`prev/profile_${id}.png`,Buffer.from(d.split(',')[1],'base64'));}
await b.close();})();
