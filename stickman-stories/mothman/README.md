# Stickman Stories — The Mothman (vertical short)

1080x1920, 30 fps, ~1:58. Code-drawn scrapbook animation synced to the narration.

- `narrate.py`: narration with Piper TTS (LibriTTS speaker 846, CC BY 4.0) → `audio/narration_22k.wav` + `timeline_narration.json`
- `kit.js`, `art.js`, `scenes.js`: drawing kit, illustrations, 38-shot timeline
- `audio.py`: 3 stems (narration / music / sfx) + ducked mix → `audio/*.flac`
- `render.js`: renders frames (serve this folder: `python3 -m http.server 8765`)
- `timeline.json`: scene start/end times, captions, mascot mood, audio track list
- `scene_images/`: one still per scene; `CREDITS.md`: sources, licences, labels
