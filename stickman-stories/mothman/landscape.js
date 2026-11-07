// Landscape 1920x1080 composition: stage (vertical scene art) in the middle, scrapbook side panels.
const LW = 1920, LH = 1080;
const STG = document.createElement('canvas'); STG.width = W; STG.height = H; const sctx = STG.getContext('2d');
const CROP = { x: 0, y: 440, w: 1080, h: 1000 }, SCL = 0.85, SW = Math.round(CROP.w * SCL), SH = Math.round(CROP.h * SCL), SX = (LW - SW) / 2, SY = 118;
const TMP = document.createElement('canvas'); TMP.width = SW; TMP.height = SH; const tctx = TMP.getContext('2d');
let MASK = null, BGL = null; const SIDE = document.createElement('canvas'); SIDE.width = LW; SIDE.height = LH;
function initLandscape() {
  MASK = document.createElement('canvas'); MASK.width = SW; MASK.height = SH; const m = MASK.getContext('2d'); const id = m.createImageData(SW, SH);
  const fx = 70, fy = 45; for (let y = 0; y < SH; y++) for (let x = 0; x < SW; x++) { const ax = Math.min(1, x / fx, (SW - 1 - x) / fx), ay = Math.min(1, y / fy, (SH - 1 - y) / fy); const a = Math.max(0, ax) * Math.max(0, ay); id.data[(y * SW + x) * 4 + 3] = Math.round(255 * a * a * (3 - 2 * a)); }
  m.putImageData(id, 0, 0);
  BGL = texture(LW, LH); const g = BGL.getContext('2d');
  const v = g.createRadialGradient(LW / 2, LH / 2, LH * 0.35, LW / 2, LH / 2, LW * 0.62); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.5)'); g.fillStyle = v; g.fillRect(0, 0, LW, LH);
}
function renderStage(t) {
  OVERLAYS = false; const c = sctx; let i = SC.length - 1; while (i > 0 && SC[i].start > t) i--;
  drawShot(c, i, t);
  if (i + 1 < SC.length && t > SC[i + 1].start - XF) { bctx.clearRect(0, 0, W, H); drawShot(bctx, i + 1, SC[i + 1].start); c.save(); c.globalAlpha = (t - (SC[i + 1].start - XF)) / XF; c.drawImage(BUF, 0, 0); c.restore(); }
  OVERLAYS = true; return i;
}
function sidePanels(c, t) {
  const sw = Math.sin(t * 0.8) * 0.01;
  // left: case note + newspaper polaroid
  c.save(); c.translate(250, 330); c.rotate(-0.06 + sw); paper(c, 0, 0, 380, 330, 0, 404); tape(c, 0, -165, 120, 0.05);
  text(c, 'CASE FILE #01', 0, -110, 30, C.redD, { f: 'Elite', ls: 3 }); text(c, 'THE MOTHMAN', 0, -55, 44, '#211c16');
  ['Point Pleasant, W. Va.', '1966 – 1967', 'Witnesses: many'].forEach((l, k) => text(c, l, 0, 5 + k * 40, 27, '#2a241c', { f: 'Elite' }));
  stamp(c, 'UNSOLVED', 0, 128, -0.12, 1, 34); c.restore();
  photo(c, 'newspapers', 255, 780, 330, 250, 0.05 - sw, 'real clippings, 1966', 1, { zoom: 1.3, fx: 0.15, fy: 0.1, capSize: 22 });
  // right: moon + artist's impression polaroid + map pin note
  moon(c, 1745, 120, 40);
  photo(c, 'ink_mothman', 1670, 400, 330, 200, -0.05 + sw, "artist's impression", 1, { capSize: 22 });
  c.save(); c.translate(1660, 700); c.rotate(0.05); paper(c, 0, 0, 300, 150, 0, 77); text(c, 'LOCATION', 0, -32, 26, C.redD, { f: 'Elite', ls: 4 }); text(c, 'Mason County, WV', 0, 22, 30, '#211c16', { f: 'Elite' }); c.restore();
}
function renderLandscape(t, c) {
  const i = renderStage(t); const s = SC[i]; const end = i + 1 < SC.length ? SC[i + 1].start : ENDT; const u = t - s.start;
  c.drawImage(BGL, 0, 0);
  const lastShot = i === SC.length - 1; const sa = lastShot ? 1 - ss(0, 0.5, u) : 1;
  if (sa > 0) { const g = SIDE.getContext('2d'); g.clearRect(0, 0, LW, LH); sidePanels(g, t); c.save(); c.globalAlpha = sa; c.drawImage(SIDE, 0, 0); c.restore(); }
  tctx.globalCompositeOperation = 'source-over'; tctx.clearRect(0, 0, SW, SH); tctx.drawImage(STG, CROP.x, CROP.y, CROP.w, CROP.h, 0, 0, SW, SH);
  tctx.globalCompositeOperation = 'destination-in'; tctx.drawImage(MASK, 0, 0); tctx.globalCompositeOperation = 'source-over';
  c.drawImage(TMP, SX, SY);
  if (!s.noCard && s.card) { c.save(); c.translate(LW / 2 - W / 2, 78 - 270); card(c, s.card, u, { hi: s.hi, size: s.size }); c.restore(); }
  c.save(); c.translate(LW / 2 - W / 2, 0); subtitles(c, t, 1012); c.restore();
  const mood = typeof s.mood === 'function' ? s.mood(u) : s.mood;
  if (!s.noMascot && !(s.noMascotAfter && u > s.noMascotAfter)) chibi(c, t, mood || 'normal', { x: 1815, y: 975, s: 0.58 });
  if (lastShot) chibi(c, t, 'happy', { x: 1420, y: 760, s: 0.95 });
  if (t < 0.3) { c.fillStyle = `rgba(0,0,0,${1 - t / 0.3})`; c.fillRect(0, 0, LW, LH); }
  if (t > ENDT - 0.8) { c.fillStyle = `rgba(0,0,0,${ss(ENDT - 0.8, ENDT, t)})`; c.fillRect(0, 0, LW, LH); }
}
