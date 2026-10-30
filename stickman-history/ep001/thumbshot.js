const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+process.cwd()+'/thumb.html');await p.evaluate(()=>document.fonts.load('900 80px Cinzel'));
for(const v of ['A','B']){await p.evaluate(v=>draw(v),v);await p.locator('canvas').screenshot({path:`thumb_${v}.png`});}
await b.close();})();
