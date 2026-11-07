// Stickman Stories — scrapbook drawing kit (1080x1920 vertical)
const W = 1080, H = 1920;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const ss = (a, b, x) => { x = clamp((x - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); };
const ease = x => { x = clamp(x, 0, 1); return 1 - Math.pow(1 - x, 3); };
const back = x => { x = clamp(x, 0, 1); const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
function rnd(seed) { let a = seed | 0; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

const C = {
  navy: '#1c2747', navyD: '#121a33', paper: '#efe3c4', paperD: '#d9c89f', ink: '#1d1a17',
  red: '#d6312b', redD: '#8e1712', tape: 'rgba(235,228,205,0.82)', white: '#f8f4ea',
  eye: '#ff2a1a', night: '#0d1428',
};
const IMG = {};
function loadImages(list) { return Promise.all(list.map(n => new Promise(r => { const i = new Image(); i.onload = () => { IMG[n] = i; r(); }; i.src = 'img/' + n + '.jpg'; }))); }

// ---------- background
let BG = null;
function makeBG() { BG = texture(W, H); }
function texture(W, H) {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
  g.fillStyle = C.navy; g.fillRect(0, 0, W, H);
  const r = rnd(3);
  for (let i = 0; i < Math.round(260 * W * H / (1080 * 1920)); i++) {
    const x = r() * W, y = r() * H, s = 40 + r() * 220, d = r() < 0.5;
    const gr = g.createRadialGradient(x, y, 0, x, y, s);
    gr.addColorStop(0, d ? 'rgba(8,12,28,0.22)' : 'rgba(70,90,140,0.12)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(x - s, y - s, s * 2, s * 2);
  }
  const id = g.getImageData(0, 0, W, H);
  for (let i = 0; i < id.data.length; i += 4) { const n = (r() - 0.5) * 16; id.data[i] += n; id.data[i + 1] += n; id.data[i + 2] += n; }
  g.putImageData(id, 0, 0);
  const v = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.45)');
  g.fillStyle = v; g.fillRect(0, 0, W, H);
  return cv;
}
function bg(c, dark = 0) { c.drawImage(BG, 0, 0); if (dark) { c.fillStyle = `rgba(4,6,14,${dark})`; c.fillRect(0, 0, W, H); } }
function moon(c, x = 930, y = 170, r = 46, a = 1) {
  c.save(); c.globalAlpha = a; const mg = c.createRadialGradient(x, y, r * 0.5, x, y, r * 2.2); mg.addColorStop(0, 'rgba(255,248,215,0.22)'); mg.addColorStop(1, 'rgba(255,248,215,0)'); c.fillStyle = mg; c.fillRect(x - r * 2.2, y - r * 2.2, r * 4.4, r * 4.4); c.fillStyle = '#f6efd2';
  c.beginPath(); c.arc(x, y, r, 0, 7); c.clip();
  c.beginPath(); c.rect(x - r - 2, y - r - 2, 2 * r + 4, 2 * r + 4); c.arc(x + r * 0.45, y - r * 0.25, r * 0.88, 0, 7, true); c.fill('evenodd'); c.restore();
}

// ---------- paper bits
function tornRect(c, x, y, w, h, seed, j = 7) {
  const r = rnd(seed); c.beginPath();
  const n = Math.max(6, Math.round(w / 22)), m = Math.max(4, Math.round(h / 22));
  c.moveTo(x, y + r() * j);
  for (let i = 1; i <= n; i++) c.lineTo(x + w * i / n, y + (r() - 0.3) * j);
  for (let i = 1; i <= m; i++) c.lineTo(x + w + (r() - 0.5) * j, y + h * i / m);
  for (let i = n - 1; i >= 0; i--) c.lineTo(x + w * i / n, y + h + (r() - 0.7) * j);
  for (let i = m - 1; i >= 1; i--) c.lineTo(x + (r() - 0.5) * j, y + h * i / m);
  c.closePath();
}
function paper(c, x, y, w, h, rot = 0, seed = 1, col = C.paper) {
  c.save(); c.translate(x, y); c.rotate(rot);
  c.shadowColor = 'rgba(0,0,0,0.45)'; c.shadowBlur = 18; c.shadowOffsetY = 8;
  tornRect(c, -w / 2, -h / 2, w, h, seed); c.fillStyle = col; c.fill(); c.shadowColor = 'transparent';
  const g = c.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2); g.addColorStop(0, 'rgba(255,255,255,0.18)'); g.addColorStop(1, 'rgba(120,90,40,0.18)'); c.fillStyle = g; c.fill();
  c.restore();
}
function tape(c, x, y, w, rot) { c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = C.tape; tornRect(c, -w / 2, -16, w, 32, Math.round(x + y), 4); c.fill(); c.restore(); }
function pin(c, x, y, col = C.red) {
  c.save(); c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 6; c.shadowOffsetY = 4;
  const g = c.createRadialGradient(x - 4, y - 4, 1, x, y, 13); g.addColorStop(0, '#ff8a7a'); g.addColorStop(1, col);
  c.fillStyle = g; c.beginPath(); c.arc(x, y, 12, 0, 7); c.fill(); c.restore();
}
function font(f, s) { return `${s}px ${f}`; }
function text(c, s, x, y, size, col, opt = {}) {
  c.save(); c.font = font(opt.f || 'Archivo', size); c.textAlign = opt.align || 'center'; c.textBaseline = 'middle'; c.letterSpacing = (opt.ls || 0) + 'px';
  if (opt.stroke) { c.lineJoin = 'round'; c.strokeStyle = opt.stroke; c.lineWidth = opt.sw || 10; c.strokeText(s, x, y); }
  c.fillStyle = col; c.fillText(s, x, y); c.restore();
}
// label tag (small paper strip with typewriter text)
function tag(c, s, x, y, rot = 0, a = 1, opt = {}) {
  if (a <= 0) return;
  const size = opt.size || 30;
  c.save(); c.globalAlpha = a; c.font = font(opt.f || 'Elite', size); const w = c.measureText(s).width + 44, h = size + 26;
  const sc = lerp(0.6, 1, back(a)); c.translate(x, y); c.scale(sc, sc);
  paper(c, 0, 0, w, h, rot, s.length * 7 + 3, opt.bg || C.paper);
  c.rotate(rot); text(c, s, 0, 2, size, opt.col || C.ink, { f: opt.f || 'Elite' }); c.restore();
}
function stamp(c, s, x, y, rot, a, size = 64, col = C.red) {
  if (a <= 0) return;
  c.save(); c.translate(x, y); c.rotate(rot); const sc = lerp(1.8, 1, ease(a)); c.scale(sc, sc); c.globalAlpha *= clamp(a * 1.4, 0, 0.92);
  c.font = font('Archivo', size); const w = c.measureText(s).width + 40;
  c.strokeStyle = col; c.lineWidth = 7; c.strokeRect(-w / 2, -size * 0.75, w, size * 1.5);
  text(c, s, 0, 4, size, col); c.restore();
}
// polaroid photo with caption
function photo(c, img, x, y, w, h, rot, caption, a = 1, opt = {}) {
  if (a <= 0) return;
  c.save(); c.globalAlpha = clamp(a * 2, 0, 1); c.translate(x + (opt.dx || 0) * (1 - ease(a)), y + (opt.dy ?? -80) * (1 - ease(a))); c.rotate(rot + (1 - ease(a)) * 0.2);
  const pad = 18, cap = caption ? 64 : pad;
  c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 24; c.shadowOffsetY = 12;
  c.fillStyle = '#f4efe2'; c.fillRect(-w / 2 - pad, -h / 2 - pad, w + pad * 2, h + pad + cap); c.shadowColor = 'transparent';
  c.save(); c.beginPath(); c.rect(-w / 2, -h / 2, w, h); c.clip();
  if (typeof img === 'function') img(c, w, h); else {
    const im = IMG[img]; const z = opt.zoom || 1; const fx = opt.fx ?? 0.5, fy = opt.fy ?? 0.5;
    const s = Math.max(w / im.width, h / im.height) * z; const iw = im.width * s, ih = im.height * s;
    c.drawImage(im, -w / 2 - (iw - w) * fx, -h / 2 - (ih - h) * fy, iw, ih);
    if (opt.bw) { c.globalCompositeOperation = 'saturation'; c.fillStyle = '#000'; c.fillRect(-w / 2, -h / 2, w, h); c.globalCompositeOperation = 'source-over'; }
  }
  c.restore();
  if (caption) text(c, caption, 0, h / 2 + cap / 2 + 2, opt.capSize || 30, '#2a241c', { f: 'Elite' });
  if (opt.pin !== false) pin(c, 0, -h / 2 - 2); else { tape(c, -w / 2 + 20, -h / 2 - 6, 110, -0.6); tape(c, w / 2 - 20, -h / 2 - 6, 110, 0.6); }
  c.restore();
}
// hand-drawn dashed red ellipse
function redCircle(c, x, y, rx, ry, p, dashed = true) {
  if (p <= 0) return;
  c.save(); c.strokeStyle = C.red; c.lineWidth = 7; c.lineCap = 'round'; if (dashed) c.setLineDash([18, 12]);
  c.beginPath(); const N = 60, k = Math.floor(N * clamp(p, 0, 1));
  for (let i = 0; i <= k; i++) { const a = -1.9 + i / N * Math.PI * 2.1; const w = 1 + 0.04 * Math.sin(i * 0.7); const px = x + Math.cos(a) * rx * w, py = y + Math.sin(a) * ry * w; i ? c.lineTo(px, py) : c.moveTo(px, py); }
  c.stroke(); c.restore();
}
function arrow(c, x0, y0, x1, y1, p, col = C.red, w = 8) {
  if (p <= 0) return;
  const x = lerp(x0, x1, ease(p)), y = lerp(y0, y1, ease(p));
  c.save(); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = w; c.lineCap = 'round';
  const mx = (x0 + x) / 2 + (y - y0) * 0.15, my = (y0 + y) / 2 - (x - x0) * 0.15;
  c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(mx, my, x, y); c.stroke();
  if (p > 0.9) { const an = Math.atan2(y - my, x - mx); c.translate(x, y); c.rotate(an); c.beginPath(); c.moveTo(8, 0); c.lineTo(-22, -15); c.lineTo(-22, 15); c.fill(); }
  c.restore();
}
function cross(c, x, y, s, p) { if (p <= 0) return; c.save(); c.strokeStyle = C.red; c.lineWidth = 16; c.lineCap = 'round'; const a = ss(0, 0.5, p), b = ss(0.5, 1, p);
  c.beginPath(); c.moveTo(x - s, y - s); c.lineTo(x - s + 2 * s * a, y - s + 2 * s * a); if (b > 0) { c.moveTo(x + s, y - s); c.lineTo(x + s - 2 * s * b, y - s + 2 * s * b); } c.stroke(); c.restore(); }
function glowEyes(c, x, y, gap, r, a = 1, pulse = 0) {
  if (a <= 0) return;
  c.save(); c.globalAlpha = a; c.globalCompositeOperation = 'lighter';
  for (const ex of [x - gap / 2, x + gap / 2]) {
    const R = r * (4 + pulse); const g = c.createRadialGradient(ex, y, 0, ex, y, R);
    g.addColorStop(0, 'rgba(255,80,40,0.9)'); g.addColorStop(0.25, 'rgba(255,30,10,0.45)'); g.addColorStop(1, 'rgba(255,0,0,0)');
    c.fillStyle = g; c.fillRect(ex - R, y - R, R * 2, R * 2);
  }
  c.globalCompositeOperation = 'source-over';
  for (const ex of [x - gap / 2, x + gap / 2]) { c.fillStyle = '#ff3b20'; c.beginPath(); c.ellipse(ex, y, r, r * 0.8, 0, 0, 7); c.fill(); c.fillStyle = '#ffd2b0'; c.beginPath(); c.ellipse(ex - r * 0.2, y - r * 0.2, r * 0.35, r * 0.28, 0, 0, 7); c.fill(); }
  c.restore();
}

// ---------- top caption card with pencil writing it
function card(c, s, u, opt = {}) {
  const y = opt.y || 270, size = opt.size || 52, rot = opt.rot ?? -0.02;
  const a = ease(u / 0.25); if (a <= 0) return;
  c.save(); c.font = font('Archivo', size); const lines = s.split('\n'); const tw = Math.max(...lines.map(l => c.measureText(l).width));
  const w = Math.min(980, tw + 110), h = size * 1.25 * lines.length + 56;
  c.translate(W / 2, y - 60 * (1 - a)); c.rotate(rot); c.globalAlpha = a;
  paper(c, 0, 0, w, h, 0, s.length * 13 + 5);
  tape(c, -w / 2 + 16, -h / 2 + 6, 90, -0.7); tape(c, w / 2 - 16, -h / 2 + 6, 90, 0.7);
  c.fillStyle = C.red; c.fillRect(w / 2 - 34, h / 2 - 34, 20, 20);
  // reveal text with pencil
  const rev = clamp((u - 0.1) / Math.max(0.35, s.length * 0.028), 0, 1);
  c.save(); c.beginPath(); c.rect(-w / 2, -h / 2, w * (0.06 + 0.94 * rev), h); c.clip();
  lines.forEach((l, i) => { const ly = (i - (lines.length - 1) / 2) * size * 1.25 + 4; const hi = opt.hi && i === lines.length - 1 && lines.length > 1; text(c, l, 0, ly, size, hi ? C.red : '#211c16'); });
  c.restore();
  if (rev < 1 && rev > 0) { const px = -w / 2 + w * (0.06 + 0.94 * rev), py = (lines.length - 1) * size * 0.6 - 10 + Math.sin(u * 40) * 6; pencil(c, px, py); }
  c.restore();
}
function pencil(c, x, y) {
  c.save(); c.translate(x, y); c.rotate(-0.75);
  c.fillStyle = '#f0b22c'; c.fillRect(0, -12, 150, 24); c.fillStyle = '#d39316'; c.fillRect(0, 4, 150, 8);
  c.fillStyle = '#e8c79a'; c.beginPath(); c.moveTo(0, -12); c.lineTo(-34, 0); c.lineTo(0, 12); c.fill();
  c.fillStyle = '#333'; c.beginPath(); c.moveTo(-24, -4); c.lineTo(-34, 0); c.lineTo(-24, 4); c.fill();
  c.fillStyle = '#b8b8b8'; c.fillRect(150, -12, 18, 24); c.fillStyle = '#e88a9a'; c.fillRect(168, -12, 20, 24); c.restore();
}

// ---------- bottom subtitles (word-chunk captions with red keyword)
const KEY = /^(red|eyes|dark|road|horror|mysteries|mystery|1966|1967|point|pleasant|november|tnt|strange|figure|human|wings|accelerated|flight|police|encounters|trees|roads|buildings|newspapers|name|mothman|darker|silver|bridge|ohio|46|died|tragedy|warning|investigation|fracture|eyebar|evidence|proof|bird|animal|understand|flying|legend|virginia|factory|couples|disaster|creature|following|famous)$/i;
let CHUNKS = [];
function buildChunks(lines) {
  CHUNKS = [];
  for (const L of lines) {
    const words = L.text.replace(/\.\.\./g, '…').split(/\s+/); const groups = []; let g = [];
    for (const w of words) { g.push(w); if (g.length >= 3 || /[,.…?!]$/.test(w) && g.length >= 2) { groups.push(g); g = []; } }
    if (g.length) groups.push(g);
    const tot = groups.reduce((s, g) => s + g.join(' ').length + 3, 0); let t = L.start; const dur = L.end - L.start;
    for (const g of groups) { const d = (g.join(' ').length + 3) / tot * dur; CHUNKS.push({ s: t, e: t + d, words: g }); t += d; }
  }
}
function subtitles(c, t, y = 1500) {
  const ch = CHUNKS.find(k => t >= k.s - 0.02 && t < k.e + 0.12); if (!ch) return;
  const u = t - ch.s; const sc = lerp(0.82, 1, back(u / 0.18));
  c.save(); c.translate(W / 2, y); c.scale(sc, sc); c.font = font('Archivo', 62);
  const parts = ch.words.map(w => w.replace(/[…]/g, '…')); const sp = 20; const ws = parts.map(w => c.measureText(w).width);
  let x = -(ws.reduce((a, b) => a + b, 0) + sp * (parts.length - 1)) / 2;
  parts.forEach((w, i) => { const key = KEY.test(w.replace(/[^A-Za-z0-9]/g, '')); text(c, w, x + ws[i] / 2, 0, 62, key ? '#ff4a3a' : '#ffffff', { stroke: '#0a0d18', sw: 14 }); x += ws[i] + sp; });
  c.restore();
}

// ---------- robot mascot (TV head)
function mascot(c, t, mood = 'normal', opt = {}) {
  const x = opt.x ?? 905, y = opt.y ?? 1735, s = opt.s ?? 1;
  const bob = Math.sin(t * 3.2) * 6, hop = mood === 'shocked' ? -Math.abs(Math.sin(t * 14)) * 10 : 0;
  c.save(); c.translate(x, y + bob + hop); c.scale(s, s);
  c.fillStyle = 'rgba(0,0,0,0.35)'; c.beginPath(); c.ellipse(0, 112 - bob, 80, 14, 0, 0, 7); c.fill();
  // legs + feet
  c.fillStyle = '#4a5060'; c.fillRect(-30, 60, 16, 44); c.fillRect(14, 60, 16, 44);
  c.fillStyle = '#2c313c'; c.beginPath(); c.roundRect(-44, 98, 36, 16, 8); c.roundRect(8, 98, 36, 16, 8); c.fill();
  // body
  c.fillStyle = '#3b4150'; c.beginPath(); c.roundRect(-52, -10, 104, 80, 14); c.fill();
  c.fillStyle = '#e9b44c'; c.beginPath(); c.arc(-22, 20, 7, 0, 7); c.fill(); c.fillStyle = '#d6312b'; c.beginPath(); c.arc(0, 20, 7, 0, 7); c.fill(); c.fillStyle = '#5fd0c0'; c.fillRect(14, 14, 24, 12);
  // arms
  c.strokeStyle = '#4a5060'; c.lineWidth = 14; c.lineCap = 'round'; c.beginPath();
  if (mood === 'point') { c.moveTo(-50, 10); c.lineTo(-96, -40 + Math.sin(t * 6) * 5); c.moveTo(50, 10); c.lineTo(70, 50); }
  else if (mood === 'shocked') { c.moveTo(-50, 5); c.lineTo(-78, -60); c.moveTo(50, 5); c.lineTo(78, -60); }
  else if (mood === 'search') { c.moveTo(-50, 10); c.lineTo(-64, 55); c.moveTo(50, 10); c.lineTo(40, -50); }
  else { c.moveTo(-50, 10); c.lineTo(-66, 55); c.moveTo(50, 10); c.lineTo(66, 55); }
  c.stroke();
  if (mood === 'search') { c.strokeStyle = '#c9a34a'; c.lineWidth = 8; c.beginPath(); c.arc(48, -86, 30, 0, 7); c.stroke(); c.fillStyle = 'rgba(190,230,255,0.35)'; c.fill(); c.beginPath(); c.moveTo(40, -58); c.lineTo(40, -48); c.stroke(); }
  // head: TV
  c.save(); c.rotate(mood === 'worried' ? Math.sin(t * 2) * 0.06 : mood === 'shocked' ? Math.sin(t * 20) * 0.04 : 0);
  c.strokeStyle = '#2c313c'; c.lineWidth = 6; c.beginPath(); c.moveTo(-18, -112); c.lineTo(-36, -158); c.moveTo(18, -112); c.lineTo(34, -160); c.stroke();
  c.fillStyle = '#5bd36a'; c.beginPath(); c.arc(-36, -162, 9, 0, 7); c.fill(); c.fillStyle = '#d6312b'; c.beginPath(); c.arc(34, -164, 9, 0, 7); c.fill();
  c.fillStyle = '#c7ccd2'; c.beginPath(); c.roundRect(-68, -118, 136, 108, 18); c.fill(); c.strokeStyle = '#7b828c'; c.lineWidth = 4; c.stroke();
  const sg = c.createLinearGradient(0, -106, 0, -24); sg.addColorStop(0, '#9fe6d8'); sg.addColorStop(1, '#5cc2b2'); c.fillStyle = sg; c.beginPath(); c.roundRect(-54, -106, 108, 82, 12); c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.18)'; c.lineWidth = 2; for (let yy = -100; yy < -26; yy += 7) { c.beginPath(); c.moveTo(-50, yy); c.lineTo(50, yy); c.stroke(); }
  // face
  const blink = (t % 3.7) < 0.12; c.fillStyle = '#10302c'; c.strokeStyle = '#10302c'; c.lineWidth = 4;
  if (mood === 'shocked') { c.beginPath(); c.arc(-20, -70, 11, 0, 7); c.arc(20, -70, 11, 0, 7); c.fill(); c.fillStyle = '#9fe6d8'; c.beginPath(); c.arc(-18, -72, 4, 0, 7); c.arc(22, -72, 4, 0, 7); c.fill(); c.fillStyle = '#10302c'; c.beginPath(); c.ellipse(0, -40, 9, 11, 0, 0, 7); c.fill(); }
  else {
    const ey = blink ? 1 : 8; c.beginPath(); c.ellipse(-20, -70, 7, ey, 0, 0, 7); c.ellipse(20, -70, 7, ey, 0, 0, 7); c.fill();
    c.beginPath();
    if (mood === 'worried') { c.moveTo(-16, -38); c.quadraticCurveTo(0, -48, 16, -38); c.moveTo(-32, -88); c.lineTo(-12, -82); c.moveTo(32, -88); c.lineTo(12, -82); }
    else if (mood === 'happy') { c.moveTo(-16, -46); c.quadraticCurveTo(0, -30, 16, -46); }
    else if (mood === 'thinking') { c.moveTo(-12, -40); c.lineTo(14, -44); }
    else { c.moveTo(-14, -42); c.quadraticCurveTo(0, -36, 14, -42); }
    c.stroke();
  }
  c.restore();
  if (mood === 'thinking') { text(c, '?', 92, -150, 80, '#ffd34a', { stroke: '#0a0d18', sw: 10 }); }
  c.restore();
}

// ---------- chibi anime detective (replaces the robot mascot). Same moods API.
function chibi(c, t, mood = 'normal', opt = {}) {
  const x = opt.x ?? 960, y = opt.y ?? 1790, s = opt.s ?? 0.62;
  const bob = Math.sin(t * 3.4) * 4, hop = mood === 'shocked' ? -Math.abs(Math.sin(t * 13)) * 8 : 0;
  const SK = '#f6d4b8', HAIR = '#1e2238', HOOD = '#c8322c', HOODD = '#8e1d19', OUT = '#0d0f1a';
  c.save(); c.translate(x, y + bob + hop); c.scale(s, s); c.lineJoin = 'round'; c.lineCap = 'round';
  c.fillStyle = 'rgba(0,0,0,0.35)'; c.beginPath(); c.ellipse(0, 118 - bob, 70, 12, 0, 0, 7); c.fill();
  // legs + shoes
  c.fillStyle = '#2a2f45'; c.fillRect(-26, 66, 20, 44); c.fillRect(6, 66, 20, 44);
  c.fillStyle = '#f4efe2'; c.beginPath(); c.roundRect(-36, 102, 32, 16, 8); c.roundRect(4, 102, 32, 16, 8); c.fill(); c.strokeStyle = OUT; c.lineWidth = 4; c.stroke();
  // arms (hoodie sleeves)
  const arm = (x0, y0, x1, y1) => { c.strokeStyle = OUT; c.lineWidth = 24; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); c.strokeStyle = HOOD; c.lineWidth = 17; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); c.fillStyle = SK; c.beginPath(); c.arc(x1, y1, 10, 0, 7); c.fill(); c.lineWidth = 3; c.strokeStyle = OUT; c.stroke(); };
  let L = [-40, 10, -54, 58], R = [40, 10, 54, 58];
  if (mood === 'point') { L = [-40, 8, -100, -30 + Math.sin(t * 6) * 4]; }
  else if (mood === 'shocked') { L = [-40, 4, -70, -54]; R = [40, 4, 70, -54]; }
  else if (mood === 'search') { R = [40, 8, 64, -40]; }
  else if (mood === 'thinking') { R = [40, 8, 30, -40]; }
  else if (mood === 'happy') { L = [-40, 4, -66, -50]; }
  arm(...L); arm(...R);
  // body (hoodie)
  c.beginPath(); c.moveTo(-44, -6); c.quadraticCurveTo(-52, 60, -40, 74); c.lineTo(40, 74); c.quadraticCurveTo(52, 60, 44, -6); c.quadraticCurveTo(0, -20, -44, -6); c.closePath();
  c.fillStyle = HOOD; c.fill(); c.strokeStyle = OUT; c.lineWidth = 4; c.stroke();
  c.fillStyle = HOODD; c.fillRect(-22, 40, 44, 18); c.strokeStyle = '#f4efe2'; c.lineWidth = 3; c.beginPath(); c.moveTo(-8, -4); c.lineTo(-10, 24); c.moveTo(8, -4); c.lineTo(10, 24); c.stroke();
  if (mood === 'search') { c.strokeStyle = '#c9a34a'; c.lineWidth = 7; c.beginPath(); c.arc(74, -74, 26, 0, 7); c.stroke(); c.fillStyle = 'rgba(190,230,255,0.35)'; c.fill(); c.beginPath(); c.moveTo(68, -50); c.lineTo(64, -40); c.stroke(); }
  // head
  c.save(); c.translate(0, -78); c.rotate(mood === 'worried' ? Math.sin(t * 2) * 0.05 : mood === 'shocked' ? Math.sin(t * 22) * 0.03 : mood === 'thinking' ? 0.08 : 0);
  // back hair
  c.fillStyle = HAIR; c.beginPath(); c.ellipse(0, -6, 74, 72, 0, 0, 7); c.fill(); c.strokeStyle = OUT; c.lineWidth = 4; c.stroke();
  // face
  c.fillStyle = SK; c.beginPath(); c.ellipse(0, 10, 62, 58, 0, 0, 7); c.fill(); c.stroke();
  // fringe spikes
  c.fillStyle = HAIR; c.beginPath(); c.moveTo(-74, 0); c.quadraticCurveTo(-70, -70, 0, -78); c.quadraticCurveTo(70, -70, 74, 0);
  const sp = [[60, -6], [44, -30], [30, 4], [12, -28], [-4, 6], [-20, -26], [-34, 2], [-50, -24], [-64, 8]];
  sp.forEach(([px, py]) => c.lineTo(px, py)); c.closePath(); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(10, -78); c.quadraticCurveTo(30, -110, 52, -104); c.quadraticCurveTo(30, -96, 26, -76); c.fill(); c.stroke(); // ahoge
  // eyes
  const blink = (t % 3.9) < 0.11;
  for (const sd of [-1, 1]) {
    const ex = sd * 26, ey = 18;
    if (mood === 'happy') { c.strokeStyle = OUT; c.lineWidth = 5; c.beginPath(); c.arc(ex, ey + 6, 12, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); continue; }
    if (blink) { c.strokeStyle = OUT; c.lineWidth = 5; c.beginPath(); c.moveTo(ex - 12, ey); c.lineTo(ex + 12, ey); c.stroke(); continue; }
    const big = mood === 'shocked' ? 1.15 : 1;
    c.fillStyle = '#fff'; c.beginPath(); c.ellipse(ex, ey, 15 * big, 19 * big, 0, 0, 7); c.fill(); c.strokeStyle = OUT; c.lineWidth = 3.5; c.stroke();
    const ir = mood === 'shocked' ? 7 : 11; const g = c.createLinearGradient(0, ey - 14, 0, ey + 14); g.addColorStop(0, '#7a3a12'); g.addColorStop(1, '#e8a33a');
    c.fillStyle = g; c.beginPath(); c.ellipse(ex + (mood === 'point' ? -4 : 0), ey + 2, ir, ir * 1.3, 0, 0, 7); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(ex - 4, ey - 6, 4.5, 0, 7); c.arc(ex + 4, ey + 6, 2, 0, 7); c.fill();
    // brows
    c.strokeStyle = HAIR; c.lineWidth = 4; c.beginPath();
    if (mood === 'worried') { c.moveTo(ex - 12 * sd, ey - 24); c.lineTo(ex + 10 * sd, ey - 30); }
    else if (mood === 'search' || mood === 'point') { c.moveTo(ex - 12 * sd, ey - 32); c.lineTo(ex + 10 * sd, ey - 26); }
    c.stroke();
  }
  // blush + mouth
  c.fillStyle = 'rgba(240,120,120,0.45)'; c.beginPath(); c.ellipse(-40, 40, 10, 6, 0, 0, 7); c.ellipse(40, 40, 10, 6, 0, 0, 7); c.fill();
  c.strokeStyle = OUT; c.fillStyle = '#7a2a2a'; c.lineWidth = 3.5; c.beginPath();
  if (mood === 'shocked') { c.ellipse(0, 46, 8, 10, 0, 0, 7); c.fill(); c.stroke(); }
  else if (mood === 'happy') { c.moveTo(-12, 40); c.quadraticCurveTo(0, 56, 12, 40); c.closePath(); c.fill(); c.stroke(); }
  else if (mood === 'worried') { c.moveTo(-9, 48); c.quadraticCurveTo(0, 42, 9, 48); c.stroke(); }
  else if (mood === 'thinking') { c.moveTo(-6, 46); c.lineTo(8, 44); c.stroke(); }
  else { c.moveTo(-8, 44); c.quadraticCurveTo(0, 49, 8, 44); c.stroke(); }
  if (mood === 'worried' || mood === 'shocked') { c.fillStyle = '#9fd8ff'; c.beginPath(); c.moveTo(62, -10); c.quadraticCurveTo(72, 8, 62, 12); c.quadraticCurveTo(52, 8, 62, -10); c.fill(); }
  c.restore();
  if (mood === 'thinking') text(c, '?', 82, -170, 64, '#ffd34a', { stroke: '#0a0d18', sw: 9 });
  if (mood === 'shocked') text(c, '!', 86, -170, 70, '#ff4a3a', { stroke: '#0a0d18', sw: 9 });
  c.restore();
}
