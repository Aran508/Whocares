const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto('http://127.0.0.1:8765/index.html');await p.evaluate(()=>window.READY);
const sc=await p.evaluate(()=>SC.map((s,i)=>({scene:i+1,start:+s.start.toFixed(2),end:+((i+1<SC.length?SC[i+1].start:ENDT)).toFixed(2),card:s.card||'',mascot:typeof s.mood==='function'?'dynamic':(s.mood||'')})));
fs.mkdirSync('scene_images',{recursive:true});
for(const s of sc){const t=s.start+Math.min(1.6,(s.end-s.start)*0.7);const d=await p.evaluate(t=>{renderAt(t);return document.getElementById('c').toDataURL('image/png')},t);fs.writeFileSync(`scene_images/scene_${String(s.scene).padStart(2,'0')}.png`,Buffer.from(d.split(',')[1],'base64'));}
const tl=JSON.parse(fs.readFileSync('timeline_narration.json'));
fs.writeFileSync('timeline.json',JSON.stringify({format:{width:1080,height:1920,fps:30,duration:await p.evaluate(()=>ENDT)},audio_tracks:{'1_narration':'audio/track1_narration.wav','2_music':'audio/track2_music.wav','3_sfx':'audio/track3_sfx.wav','final_mix':'audio/final_mix.wav'},narration:tl,scenes:sc},null,1));
console.log(sc.length,'scenes');await b.close();})();
