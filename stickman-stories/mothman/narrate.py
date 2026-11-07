# Synthesize narration line-by-line (Piper, LibriTTS speaker 846, CC BY 4.0) and write timeline.json
import wave, json, numpy as np
from piper import PiperVoice, SynthesisConfig
V='voices/lib/en-us-libritts-high.onnx'; voice=PiperVoice.load(V, config_path=V+'.json')
SID, LS = 846, 0.93
# (text spoken, caption text, pause after in seconds)
LINES = [
 ("Imagine driving down a dark road...", 0.35),
 ("When suddenly, something with glowing red eyes starts following your car.", 0.45),
 ("This isn't just a horror story.", 0.25),
 ("It's one of America's most famous creature mysteries.", 0.45),
 ("The year was nineteen sixty-six.", 0.2),
 ("The location was Point Pleasant, West Virginia.", 0.35),
 ("On November fifteenth, two young couples were driving near an abandoned wartime factory area, known as the T N T Area.", 0.35),
 ("Then they noticed something strange.", 0.3),
 ("A huge figure, standing near an old building.", 0.35),
 ("It looked almost human... but it had enormous wings, and two glowing red eyes.", 0.5),
 ("They accelerated.", 0.25),
 ("According to their account, the creature suddenly took flight, and followed their car.", 0.4),
 ("The witnesses reported the incident to the police.", 0.25),
 ("And soon, more people began describing similar encounters.", 0.3),
 ("Some claimed they saw it flying above trees.", 0.15),
 ("Others reported seeing it near roads and abandoned buildings.", 0.35),
 ("Newspapers began covering the mysterious figure.", 0.3),
 ("People gave it a name...", 0.45),
 ("The Mothman.", 0.7),
 ("But the story took a darker turn.", 0.4),
 ("On December fifteenth, nineteen sixty-seven, the Silver Bridge, connecting West Virginia and Ohio, collapsed into the freezing Ohio River.", 0.45),
 ("Forty-six people died.", 1.2),
 ("After the disaster, some residents connected the Mothman sightings to the tragedy.", 0.3),
 ("They believed the creature was a warning of what was coming.", 0.5),
 ("But here's what the investigation actually found.", 0.3),
 ("The bridge collapsed because of a fracture in a critical steel suspension eyebar.", 0.35),
 ("There was no evidence that the Mothman caused, or predicted, the disaster.", 0.3),
 ("And despite decades of stories, nobody has produced scientifically verified proof that the creature existed.", 0.45),
 ("So what did those people see?", 0.3),
 ("A giant bird?", 0.25),
 ("A misidentified animal?", 0.25),
 ("Or something we still don't understand?", 0.6),
 ("The Mothman remains a mystery.", 0.3),
 ("And the question that keeps the legend alive is simple...", 0.45),
 ("What was flying over Point Pleasant?", 0.0),
]
CAP = {4:"The year was 1966.", 6:"On November 15, two young couples were driving near an abandoned wartime factory area, known as the TNT Area.",
       20:"On December 15, 1967, the Silver Bridge, connecting West Virginia and Ohio, collapsed into the freezing Ohio River.", 21:"46 people died."}
LEAD = 0.6
sr=22050; pcm=[np.zeros(int(LEAD*sr),np.int16)]; t=LEAD; out=[]
for i,(txt,pause) in enumerate(LINES):
    with wave.open('voices/line.wav','wb') as w: voice.synthesize_wav(txt,w,syn_config=SynthesisConfig(speaker_id=SID,length_scale=LS))
    w=wave.open('voices/line.wav'); x=np.frombuffer(w.readframes(w.getnframes()),np.int16)
    # trim leading/trailing silence
    a=np.abs(x.astype(int)); idx=np.where(a>500)[0]; x=x[max(0,idx[0]-200):idx[-1]+800]
    d=len(x)/sr; out.append({"i":i,"text":CAP.get(i,txt),"start":round(t,3),"end":round(t+d,3)})
    pcm.append(x); pcm.append(np.zeros(int(pause*sr),np.int16)); t+=d+pause
pcm.append(np.zeros(int(0.5*sr),np.int16))
y=np.concatenate(pcm)
with wave.open('proj/audio/narration_22k.wav','wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(y.tobytes())
json.dump({"voice":"Piper en-us-libritts-high, speaker 846 (CC BY 4.0)","length_scale":LS,"lines":out,"narration_end":round(t,3)},open('proj/timeline_narration.json','w'),indent=1)
print('total', round(t,2)); [print(o['i'],o['start'],o['end'],o['text'][:50]) for o in out]
