const {chromium}=require('/opt/node22/lib/node_modules/playwright');const {spawn}=require('child_process');
const FPS=30, WORKERS=4;
(async()=>{const b=await chromium.launch();const p0=await b.newPage({viewport:{width:1920,height:1080}});
await p0.goto('http://127.0.0.1:8765/landscape.html');await p0.evaluate(()=>window.READY);const total=await p0.evaluate(()=>TOTAL);await p0.close();
const N=Math.round(total*FPS), per=Math.ceil(N/WORKERS); console.log('frames',N);
await Promise.all([...Array(WORKERS).keys()].map(async w=>{const p=await b.newPage({viewport:{width:1920,height:1080}});p.on('pageerror',e=>console.log('ERR',e.message));
 await p.goto('http://127.0.0.1:8765/landscape.html');await p.evaluate(()=>window.READY);
 const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','medium','-crf','19','-pix_fmt','yuv420p',`../build/L_seg${w}.mp4`]);
 const s=w*per,e=Math.min(N,s+per);
 for(let f=s;f<e;f++){const d=await p.evaluate(t=>{renderAt(t);return document.getElementById('c').toDataURL('image/jpeg',0.93)},f/FPS);
  if(!ff.stdin.write(Buffer.from(d.split(',')[1],'base64')))await new Promise(r=>ff.stdin.once('drain',r)); if((f-s)%300===0)console.log('w',w,f-s,'/',e-s);}
 ff.stdin.end();await new Promise(r=>ff.on('close',r));}));
await b.close();console.log('done');})();
