# Stickman History — Ep. 001: Thermopylae (Part 1)

Code-generated 2D stickman animation that follows the Stickman History design sheet.

- `lib.js`: characters (Spartan, Greek hoplite, Persian, Immortal, Xerxes, messenger), crowds and environments
- `scenes.js`: the scene timeline, synced to the narration (`OFF` = 3 s intro before the voice starts)
- `audio.py`: original synthesized music and SFX, ducked under the narration and mixed to -14 LUFS
- `render.js`: renders 1920x1080 @ 24 fps with Playwright and ffmpeg

## Build
```
node render.js                          # -> seg0..3.mp4
python3 audio.py narration.mp3 mix.wav  # needs numpy + scipy
ffmpeg -f concat -safe 0 -i segs.txt -c copy video.mp4
ffmpeg -i video.mp4 -i mix.wav -map 0:v -map 1:a -c:v libx264 -b:v 10M -c:a aac -b:a 256k out.mp4
```
`node preview.js 12 40 99` renders single frames to `prev/` for checking.

Font: Cinzel (SIL Open Font License).
