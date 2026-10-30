const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');
const FPS=24, WORKERS=4;
(async()=>{
 const b=await chromium.launch();
 const p0=await b.newPage({viewport:{width:1920,height:1080}});
 await p0.goto('file://'+process.cwd()+'/index.html');
 const total=await p0.evaluate(()=>window.TOTAL); await p0.close();
 const N=Math.ceil(total*FPS); const per=Math.ceil(N/WORKERS);
 console.log('frames',N);
 await Promise.all([...Array(WORKERS).keys()].map(async w=>{
  const p=await b.newPage({viewport:{width:1920,height:1080}});
  p.on('pageerror',e=>console.log('ERR',e.message));
  await p.goto('file://'+process.cwd()+'/index.html'); await p.evaluate(()=>document.fonts.load('700 80px Cinzel'));
  const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p',`seg${w}.mp4`]);
  const s=w*per, e=Math.min(N,s+per);
  for(let f=s;f<e;f++){
   const d=await p.evaluate(t=>{renderAt(t);return document.getElementById('c').toDataURL('image/jpeg',0.95)},f/FPS);
   const buf=Buffer.from(d.split(',')[1],'base64');
   if(!ff.stdin.write(buf)) await new Promise(r=>ff.stdin.once('drain',r));
   if((f-s)%200===0) console.log('w',w,f-s,'/',e-s);
  }
  ff.stdin.end(); await new Promise(r=>ff.on('close',r));
 }));
 await b.close(); console.log('done');
})();
