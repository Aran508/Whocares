// Stickman History Ep.001 — scene definitions. Times are video seconds; narration starts at OFF.
const OFF = 3.0;
const N = x => x + OFF; // narration time -> video time

// ---------- shared environment pieces
function pass_bg(c, u, opt = {}) {
  // mountains on left, sea on right, warm dusk light
  sky(c, opt.sky || [[0, '#2b2f3e'], [0.45, '#8a5a3c'], [0.62, '#e0a060'], [1, '#3a2a22']]);
  if (opt.sun !== false) sun(c, opt.sunX ?? 1500, opt.sunY ?? 520, 46);
  ridge(c, 11, -800, 3000, 600, 220, 0.0025, 'rgba(70,52,58,0.9)', true);
  ridge(c, 12, -800, 3000, 680, 260, 0.0035, '#3c2e30', true);
  ridge(c, 13, -800, 3000, 780, 160, 0.006, '#2a2024');
}

function persianMarchScene(c, u, opt) {
  // side tracking shot of a Persian column marching right->left (toward Greece/west)
  const pan = u * (opt.pan || 60);
  cam(c, W / 2 + pan, H / 2, opt.zoom || 1);
  sky(c, opt.sky || [[0, '#40372f'], [0.55, '#c68a4c'], [1, '#5a4030']]);
  sun(c, 1400 + pan * 0.9, 380, 40);
  ridge(c, 21, -600 + pan * 0.5, 2600 + pan, 640, 160, 0.003, 'rgba(110,80,60,0.8)', true);
  ridge(c, 22, -600 + pan * 0.3, 2600 + pan, 720, 120, 0.004, '#5a4033');
  if (opt.sea) sea(c, -600 + pan, 2600 + pan, 700, 780, '#4a6a7a', '#2a3e48', u);
  if (opt.ships) {
    for (let i = 0; i < 9; i++) {
      const x = (i * 260 + 100 - u * 25) + pan * 0.6, y = 725 + (i % 3) * 14;
      c.fillStyle = '#20160f'; c.beginPath(); c.moveTo(x - 40, y); c.lineTo(x + 40, y); c.lineTo(x + 30, y + 9); c.lineTo(x - 30, y + 9); c.fill();
      c.strokeStyle = '#20160f'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - 40); c.stroke();
      c.fillStyle = 'rgba(230,210,170,0.9)'; c.fillRect(x - 16, y - 38, 32, 24);
    }
  }
  c.fillStyle = '#6a4a30'; c.fillRect(-1000 + pan, 780, 5000, 400);
  // dusty road
  const g = c.createLinearGradient(0, 780, 0, 1080); g.addColorStop(0, '#8a6440'); g.addColorStop(1, '#4a3220'); c.fillStyle = g; c.fillRect(-1000 + pan, 790, 5000, 300);
  // back rows (small), front rows (big)
  const rowsDef = opt.rows || [[820, 7, 70], [880, 9, 85], [960, 12, 105], [1060, 15, 125]];
  rowsDef.forEach(([y, s, spc], ri) => {
    const kinds = ['persian', 'immortal', 'persian', 'persian'];
    const startX = -400 + pan - ((u * 55) % spc);
    for (let x = startX; x < startX + W + 900; x += spc) {
      const idx = Math.round((x + u * 55) / spc);
      const k = kinds[(idx + ri) & 3];
      const hat = (idx * 7 + ri) % 9 === 0 ? 'hood' : (idx * 5 + ri) % 11 === 0 ? 'turban' : undefined;
      fig(c, { x, y, s, kind: k, hat, face: -1, pose: 'walk', ph: u * 5.2 + idx * 0.9 + ri, t: u, shield: k === 'immortal', bow: k === 'persian' && idx % 3 === 0, spearTilt: 0.12, wind: 0.6 });
    }
    if (ri === 1) for (let b = 0; b < 6; b++) banner(c, -300 + pan + b * 420 - ((u * 55) % 420), y - 4, 260, b % 2 ? P.red : P.gold, u, b);
  });
  particles(c, 31, 90, -600 + pan, 700, 3000, 400, u, 'rgba(210,170,120,0.35)', 6, -40, -6);
}

function hellespontMap(c) { }

// ---------- MAP
const MAPBOX = { lon0: 8, lon1: 80, lat0: 12, lat1: 50 };
const mx = lon => (lon - MAPBOX.lon0) / (MAPBOX.lon1 - MAPBOX.lon0) * W;
const my = lat => (MAPBOX.lat1 - lat) / (MAPBOX.lat1 - MAPBOX.lat0) * H;
const MAP = {
  med: [[0, 38], [10, 37.5], [12, 38], [15, 40], [16, 38.5], [18, 40], [19.5, 40], [20, 39], [21, 38], [21.8, 36.5], [22.8, 37.5], [23.5, 38], [23.2, 39.2], [22.8, 40.5], [24, 40.8], [26, 40.8], [26.3, 40.1], [26.2, 39.5], [26.8, 38.5], [27.2, 37.2], [28, 36.7], [30, 36.3], [32, 36.5], [34, 36.8], [36, 36.6], [35.8, 35], [35, 33], [34.3, 31.5], [32.5, 31.2], [30, 31.4], [28, 31], [25, 31.8], [23, 32.6], [20, 32], [19, 30.5], [15.5, 31.5], [11, 33.5], [10, 35], [0, 35]],
  black: [[28, 41.2], [28, 43], [28.6, 44.5], [30, 45.5], [31.5, 46.6], [33.5, 46], [33, 45], [35, 45], [36.5, 45.3], [38, 47], [39.5, 47], [38, 45], [40, 43.5], [41.5, 42], [41.5, 41.5], [40, 41], [37, 41.2], [35, 42], [33, 41.8], [31, 41.2], [29, 41.1]],
  caspian: [[47, 44.5], [49, 46.5], [51.5, 47], [53, 45.5], [51, 43], [52, 41.5], [53, 40], [53.8, 37.5], [51, 36.6], [49, 37.5], [49.5, 40], [48, 42.5]],
  red: [[32.5, 30], [34, 27.5], [36, 25], [38, 22], [40, 19], [42, 16], [43.5, 12.5], [43, 12], [41.5, 14], [39, 17], [37, 20], [35.5, 23.5], [33.5, 27]],
  gulf: [[48, 30], [50, 29.5], [51, 27.5], [53, 26.5], [56, 27], [56.5, 26], [57.5, 24.5], [56, 24.5], [54, 24], [52, 24.2], [51.5, 25.5], [50.5, 25.7], [50, 26.5], [49, 27.5], [48, 29]],
  arab: [[56.5, 26.2], [58, 23.8], [59.8, 22.5], [62, 25.2], [66, 25.3], [67.5, 24], [70, 21], [72.8, 20], [73.5, 12], [43, 11], [44, 12.8], [52, 16.5], [55, 17.5], [57.5, 19], [59.8, 22.4], [58.5, 23.4], [57.5, 24.5]],
  persia: [[22.5, 41], [24, 42.3], [26, 42.6], [28, 42.5], [28.3, 41.4], [29, 41.1], [31, 41.2], [33, 41.8], [35, 42], [37, 41.2], [40, 41], [41.5, 41.5], [44, 43], [47, 42.5], [48.5, 41], [49.5, 40], [49, 37.5], [51, 36.6], [53.8, 37.5], [58, 38.5], [62, 41], [66, 43], [70, 42], [72, 39], [73.5, 35], [74.5, 31], [72, 27], [69, 24], [66, 25.3], [62, 25.2], [58.5, 25.5], [56.5, 26.5], [53, 26.8], [51, 27.8], [50, 29.5], [48, 30], [46, 31.5], [43, 32], [38.5, 30.5], [36, 28.5], [34.3, 27.2], [33.2, 25], [32.5, 22], [30, 22], [28, 24], [26.5, 27], [25, 30], [25, 31.8], [28, 31], [30, 31.4], [32.5, 31.2], [34.3, 31.5], [35, 33], [35.8, 35], [36, 36.6], [34, 36.8], [32, 36.5], [30, 36.3], [28, 36.7], [27.2, 37.2], [26.8, 38.5], [26.2, 39.5], [26.3, 40.1], [26, 40.8], [24, 40.8], [22.8, 40.5]],
  greece: [[19.5, 40], [20, 41.5], [22.5, 41.2], [22.8, 40.5], [23.2, 39.2], [23.5, 38], [22.8, 37.5], [21.8, 36.5], [21, 38], [20, 39]],
};
function poly(c, pts) { c.beginPath(); pts.forEach(([lo, la], i) => i ? c.lineTo(mx(lo), my(la)) : c.moveTo(mx(lo), my(la))); c.closePath(); }
function drawMap(c, u, opt = {}) {
  // parchment
  const g = c.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 1300); g.addColorStop(0, '#d9c08a'); g.addColorStop(1, '#8a6a3a');
  c.fillStyle = g; c.fillRect(-W, -H, W * 3, H * 3);
  const water = '#3d5a66';
  c.fillStyle = water;
  ['med', 'black', 'caspian', 'red', 'gulf', 'arab'].forEach(k => { poly(c, MAP[k]); c.fill(); });
  // Hellespont / Bosporus
  c.strokeStyle = water; c.lineWidth = 7; c.beginPath(); c.moveTo(mx(26.2), my(40.1)); c.lineTo(mx(27.5), my(40.6)); c.lineTo(mx(29), my(41.1)); c.stroke();
  // persian territory, expanding from Persepolis
  const grow = opt.grow ?? 1;
  if (grow > 0) {
    c.save();
    c.beginPath(); c.arc(mx(52.9), my(29.9), grow * 1500, 0, 7); c.clip();
    poly(c, MAP.persia); c.fillStyle = 'rgba(160,30,25,0.55)'; c.fill();
    c.setLineDash([10, 6]); c.strokeStyle = '#6a0e0e'; c.lineWidth = 3; c.stroke(); c.setLineDash([]);
    c.restore();
    // keep seas on top of territory
    c.fillStyle = water; ['med', 'black', 'caspian', 'red', 'gulf', 'arab'].forEach(k => { poly(c, MAP[k]); c.fill(); });
  }
  if (opt.greece) {
    poly(c, MAP.greece); c.fillStyle = `rgba(40,90,170,${0.65 * opt.greece})`; c.fill();
    c.strokeStyle = `rgba(230,240,255,${opt.greece})`; c.lineWidth = 3; c.stroke();
  }
  // coast lines
  c.strokeStyle = 'rgba(40,30,20,0.6)'; c.lineWidth = 2;
  ['med', 'black', 'caspian', 'red', 'gulf', 'arab'].forEach(k => { poly(c, MAP[k]); c.stroke(); });
  // paper texture
  const r = mulberry(9); c.fillStyle = 'rgba(80,50,20,0.08)';
  for (let i = 0; i < 400; i++) { c.beginPath(); c.arc(r() * W, r() * H, r() * 30, 0, 7); c.fill(); }
}
function mapLabel(c, s, lon, lat, size, a, col = '#2a1a0a') {
  if (a <= 0) return;
  c.save(); c.globalAlpha = a; c.font = `700 ${size}px Cinzel`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.letterSpacing = size * 0.15 + 'px';
  c.fillStyle = 'rgba(255,240,200,0.6)'; c.fillText(s, mx(lon) + 2, my(lat) + 2); c.fillStyle = col; c.fillText(s, mx(lon), my(lat)); c.restore();
}
function mapDot(c, lon, lat, a, col = '#1a0a00') { if (a <= 0) return; c.globalAlpha = a; c.fillStyle = col; c.beginPath(); c.arc(mx(lon), my(lat), 7, 0, 7); c.fill(); c.strokeStyle = '#f3e0b0'; c.lineWidth = 2; c.stroke(); c.globalAlpha = 1; }
function mapArrow(c, pts, prog, col, w = 10) {
  if (prog <= 0) return;
  // pts in lon/lat; draw quadratic path partially
  const P0 = [mx(pts[0][0]), my(pts[0][1])], P1 = [mx(pts[1][0]), my(pts[1][1])], P2 = [mx(pts[2][0]), my(pts[2][1])];
  const q = t => [(1 - t) * (1 - t) * P0[0] + 2 * (1 - t) * t * P1[0] + t * t * P2[0], (1 - t) * (1 - t) * P0[1] + 2 * (1 - t) * t * P1[1] + t * t * P2[1]];
  c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.beginPath();
  for (let i = 0; i <= 40; i++) { const t = i / 40 * prog; const p = q(t); i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); }
  c.stroke();
  const a = q(prog), b = q(Math.max(0, prog - 0.03)); const ang = Math.atan2(a[1] - b[1], a[0] - b[0]);
  c.fillStyle = col; c.save(); c.translate(a[0], a[1]); c.rotate(ang); c.beginPath(); c.moveTo(w * 2.2, 0); c.lineTo(-w, -w * 1.8); c.lineTo(-w, w * 1.8); c.fill(); c.restore();
}

// ---------- throne room
function throneRoom(c, u, opt = {}) {
  sky(c, [[0, '#1a0f0a'], [1, '#3a1d10']]);
  // columns
  for (let i = -2; i < 9; i++) {
    const x = i * 260 + 60;
    const g = c.createLinearGradient(x - 40, 0, x + 40, 0); g.addColorStop(0, '#5a3a1e'); g.addColorStop(0.5, '#a07040'); g.addColorStop(1, '#4a2e16');
    c.fillStyle = g; c.fillRect(x - 38, 120, 76, 900);
    c.fillStyle = '#b8864a'; c.fillRect(x - 60, 100, 120, 40); c.fillRect(x - 55, 1000, 110, 30);
    // bull capital
    c.fillStyle = '#7a5530'; c.beginPath(); c.ellipse(x, 90, 80, 26, 0, 0, 7); c.fill();
  }
  // banners
  for (let i = 0; i < 4; i++) { const x = 330 + i * 420; c.fillStyle = i % 2 ? P.red : '#7a1a4a'; c.fillRect(x - 40, 150, 80, 330); c.fillStyle = P.gold; c.beginPath(); c.arc(x, 280, 26, 0, 7); c.fill(); c.fillRect(x - 40, 470, 80, 12); }
  // braziers
  for (const bx of [520, 1500]) {
    c.fillStyle = '#3a2a18'; c.fillRect(bx - 8, 820, 16, 200); c.fillStyle = '#6a4a20'; c.beginPath(); c.ellipse(bx, 820, 60, 18, 0, 0, 7); c.fill();
    for (let f = 0; f < 5; f++) { const fh = 60 + Math.sin(u * 9 + f * 2) * 18; c.fillStyle = f % 2 ? 'rgba(255,150,40,0.85)' : 'rgba(255,220,90,0.85)'; c.beginPath(); c.moveTo(bx - 40 + f * 16, 815); c.quadraticCurveTo(bx - 34 + f * 16, 815 - fh, bx - 26 + f * 16 + Math.sin(u * 7 + f) * 6, 815 - fh * 1.2); c.quadraticCurveTo(bx - 18 + f * 16, 815 - fh * 0.5, bx - 12 + f * 16, 815); c.fill(); }
    glow(c, bx, 760, 380, 'rgba(255,140,40,0.35)');
  }
  // floor
  const fg = c.createLinearGradient(0, 1000, 0, 1080); fg.addColorStop(0, '#5a3a20'); fg.addColorStop(1, '#2a180c'); c.fillStyle = fg; c.fillRect(-500, 1010, W + 1000, 200);
  // throne + steps
  const tx = opt.throneX ?? 1350;
  c.fillStyle = '#7a5528'; c.fillRect(tx - 260, 960, 520, 50); c.fillRect(tx - 200, 920, 400, 45);
  const tg = c.createLinearGradient(tx - 120, 0, tx + 120, 0); tg.addColorStop(0, '#8c6216'); tg.addColorStop(0.5, '#f0c868'); tg.addColorStop(1, '#8c6216');
  c.fillStyle = tg; c.fillRect(tx - 150, 500, 40, 420); c.fillRect(tx + 110, 640, 40, 280); c.fillRect(tx - 150, 770, 300, 40);
  c.beginPath(); c.arc(tx - 130, 495, 30, 0, 7); c.fill();
  fig(c, { x: tx - 20, y: 920, s: opt.xs ?? 36, kind: 'xerxes', pose: 'sit', mood: opt.mood || 'normal', spear: false, shield: false, t: u, face: -1, wind: 0.2 });
}

// ---------- city of Sparta
function spartaCity(c, u) {
  sky(c, [[0, '#7aa0c0'], [0.6, '#e8d2a8'], [1, '#c0a070']]);
  ridge(c, 41, -500, 2500, 560, 260, 0.0022, '#7a8a98', true);
  ridge(c, 42, -500, 2500, 650, 170, 0.0032, '#5f6e66', true);
  ridge(c, 43, -500, 2500, 760, 90, 0.005, '#6a7a4a');
  // houses
  const r = mulberry(4);
  for (let i = 0; i < 14; i++) { const x = i * 150 - 60, w = 110 + r() * 30, h = 70 + r() * 40, y = 790; c.fillStyle = '#d8c8a0'; c.fillRect(x, y - h, w, h); c.fillStyle = '#9a4a2a'; c.beginPath(); c.moveTo(x - 10, y - h); c.lineTo(x + w / 2, y - h - 35); c.lineTo(x + w + 10, y - h); c.fill(); c.fillStyle = '#5a4a3a'; c.fillRect(x + w / 2 - 12, y - 40, 24, 40); }
  const g = c.createLinearGradient(0, 790, 0, 1080); g.addColorStop(0, '#b09060'); g.addColorStop(1, '#6a5030'); c.fillStyle = g; c.fillRect(-500, 790, W + 1000, 400);
}
function well(c, x, y, s) {
  c.fillStyle = '#0a0806'; c.beginPath(); c.ellipse(x, y, 120 * s, 34 * s, 0, 0, 7); c.fill();
  c.fillStyle = '#8a7a64'; c.beginPath(); c.ellipse(x, y, 140 * s, 42 * s, 0, 0, Math.PI); c.lineTo(x - 140 * s, y); c.fill();
  c.fillStyle = '#9c8c74'; c.fillRect(x - 140 * s, y, 280 * s, 60 * s);
  c.strokeStyle = 'rgba(60,50,40,0.6)'; c.lineWidth = 3; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(x - 140 * s + i * 50 * s, y); c.lineTo(x - 140 * s + i * 50 * s, y + 60 * s); c.stroke(); }
  c.beginPath(); c.moveTo(x - 140 * s, y + 30 * s); c.lineTo(x + 140 * s, y + 30 * s); c.stroke();
}

// ---------- the scene list
const SCENES = [];
function S(start, end, draw, opt = {}) { SCENES.push({ start, end, draw, ...opt }); }

// 0. Black screen, distant marching (audio only) + slow emerge of first scene via dip
S(0, N(0), (c, u) => { fillAll(c, '#000'); }, { tin: 'cut' });

// 1. Massive Persian army reveal — "Imagine standing in front of an army so massive..."
S(N(0), N(7.7), (c, u, d) => {
  const p = easeIO(u / d);
  cam(c, W / 2, lerp(320, 560, p), lerp(1.0, 1.12, p));
  sky(c, [[0, '#14161f'], [0.35, '#3c2c34'], [0.5, '#a0603a'], [0.56, '#e09a50'], [1, '#2a1c14']]);
  sun(c, 1250, 455, 38, '#ffe2a0', 'rgba(255,140,50,0.5)');
  ridge(c, 1, -600, 2600, 470, 110, 0.003, 'rgba(60,40,45,0.95)', true);
  c.fillStyle = '#3a2a20'; c.fillRect(-600, 468, 3200, 900);
  armyMass(c, 7, -600, 2600, 470, 560, u, '#2a1e18', 'rgba(220,200,170,0.55)', { n: 5000, rise: ss(0.5, 5, u) });
  const rows = buildCrowd('army1', { seed: 3, horizon: 470, depth: 640, k: 14, x0: -700, x1: 2700, zNear: 1.15, zFar: 7.5, spacing: 3.0, rowStep: 0.05 });
  drawCrowd(c, rows, u, { rise: ss(0.5, 5, u), fog: 'rgba(160,100,60,0.9)' });
  haze(c, 440, 560, 'rgba(230,150,80,0.35)');
  particles(c, 2, 120, -600, 300, 3200, 900, u, 'rgba(220,170,120,0.25)', 5, 30, -4);
}, { tin: 'black', dip: 1.4 });

// 2. "Behind you... there is nowhere to run." — lone Spartan on the cliff edge, sea far below
S(N(7.7), N(11.1), (c, u, d) => {
  const p = u / d;
  cam(c, lerp(900, 980, p), 560, lerp(1.05, 1.15, p));
  sky(c, [[0, '#1c2433'], [0.5, '#56607a'], [1, '#a08070']]);
  sea(c, -500, 2500, 760, 1300, '#3a5468', '#14222e', u, 'rgba(200,220,240,0.25)');
  ridge(c, 51, -500, 2500, 720, 120, 0.004, '#2e3644', true);
  // cliff edge
  c.fillStyle = '#1a1614'; c.beginPath(); c.moveTo(-500, 1300); c.lineTo(-500, 820); c.lineTo(700, 830); c.lineTo(1250, 860); c.lineTo(1320, 1300); c.fill();
  c.fillStyle = '#2a2420'; c.beginPath(); c.moveTo(1250, 860); c.lineTo(1320, 1300); c.lineTo(1200, 1300); c.fill();
  fig(c, { x: 1060, y: 852, s: 34, kind: 'spartan', face: -1, t: u, mood: 'focused', wind: 1.4 });
  particles(c, 5, 60, -500, 200, 3000, 900, u, 'rgba(220,230,240,0.18)', 3, -120, 10);
});

// 3. "In front of you... an empire" — over the shoulder toward the army
S(N(11.1), N(15.7), (c, u, d) => {
  const p = easeIO(u / d);
  cam(c, W / 2, H / 2, lerp(1.0, 1.08, p));
  sky(c, [[0, '#1a1a24'], [0.4, '#6a4438'], [0.55, '#d08a4c'], [1, '#2a1a12']]);
  sun(c, 760, 480, 34);
  ridge(c, 61, -300, 2300, 500, 130, 0.003, '#3a2a2e', true);
  c.fillStyle = '#3a2a1e'; c.fillRect(-300, 498, 2600, 700);
  armyMass(c, 8, -300, 2300, 500, 640, u, '#2c1e16', 'rgba(230,210,180,0.6)', { n: 6000, march: u * 6 });
  haze(c, 470, 640, 'rgba(230,150,80,0.3)');
  // foreground rocks + over-shoulder Spartan (back view, large)
  c.fillStyle = '#120e0c'; c.beginPath(); c.moveTo(-300, 1200); c.lineTo(-300, 860); c.quadraticCurveTo(400, 820, 900, 900); c.lineTo(1100, 1200); c.fill();
  fig(c, { x: 380, y: 1400, s: 78, kind: 'spartan', view: 'back', t: u, handF: [1.6, 0.8], handB: [-1.6, 0.8], wind: 1.2 });
  // spear held up beside him
  c.save(); c.translate(380, 1400); c.scale(78, 78); spear(c, 2.6, 0, 3.4, -12); c.restore();
});

// 4. "And standing between them... just a few thousand Greek warriors" — tracking along the Greek line
S(N(15.7), N(20.2), (c, u, d) => {
  const pan = u * 70;
  cam(c, W / 2 + pan, H / 2, 1);
  pass_bg(c, u, { sunX: 1550 + pan * 0.8, sunY: 470 });
  c.fillStyle = '#4a3828'; c.fillRect(-600 + pan, 880, 4000, 400);
  const cols = [['#2a4f8a', 'ring'], ['#2f6a3a', 'star'], ['#e6e0d0', 'bar'], ['#7a2a6a', 'ring'], ['#2a4f8a', 'star']];
  // stone wall behind
  c.fillStyle = '#6a5a4a'; c.fillRect(-600 + pan, 820, 4000, 70);
  c.strokeStyle = 'rgba(30,20,10,0.5)'; c.lineWidth = 2; for (let x = -600; x < 3400; x += 60) { c.strokeRect(x, 820, 60, 35); c.strokeRect(x + 30, 855, 60, 35); }
  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < 26; i++) {
      const x = -200 + i * 120 + row * 60, y = 960 + row * 90, s = 22 + row * 5;
      const [col, mark] = cols[(i + row * 2) % cols.length];
      fig(c, { x, y, s, kind: 'greek', col, crest: (i % 3 === 0) ? col : null, shieldStyle: { face: col, faceD: shade(col, -0.5), mark, emb: '#f0e0b0' }, t: u + i, mood: 'focused', wind: 0.5 });
    }
  }
  particles(c, 6, 60, -600 + pan, 300, 3000, 800, u, 'rgba(240,200,150,0.2)', 4, -30, -5);
});

// 5. "Among them... three hundred Spartans" — Spartan phalanx, push in
S(N(20.2), N(23.3), (c, u, d) => {
  const p = easeIO(u / d);
  cam(c, W / 2, H / 2 + 60, lerp(1.0, 1.25, p));
  pass_bg(c, u, { sky: [[0, '#2a2030'], [0.5, '#a05030'], [0.7, '#e0904a'], [1, '#2a1a12']], sunX: 960, sunY: 560 });
  c.fillStyle = '#3a2a1e'; c.fillRect(-600, 860, 3200, 400);
  for (let row = 0; row < 4; row++) {
    const s = 16 + row * 7, y = 880 + row * 62, spc = 2.9 * s;
    for (let x = -300 + (row % 2) * spc / 2; x < 2300; x += spc) fig(c, { x, y, s, kind: 'spartan', t: u + x * 0.01, mood: 'angry', wind: 0.7, spearTilt: 0.02 });
  }
  embers(c, 3, 40, u, 0.6);
}, { tin: 'cut' });

// 6. "They knew they might never return home. But they had made their decision." — Leonidas close-up
S(N(23.3), N(28.2), (c, u, d) => {
  const p = easeIO(u / d);
  cam(c, lerp(960, 1010, p), lerp(520, 330, p), lerp(1.0, 2.2, p));
  sky(c, [[0, '#0e0f16'], [0.5, '#3a2830'], [0.8, '#8a4a30'], [1, '#2a160e']]);
  // sun rays
  c.save(); c.globalAlpha = 0.18; c.fillStyle = '#ffb060';
  for (let i = 0; i < 9; i++) { const a = -0.9 + i * 0.22 + Math.sin(u * 0.3) * 0.02; c.beginPath(); c.moveTo(1500, 700); c.lineTo(1500 + Math.cos(a + 3.3) * 2500, 700 + Math.sin(a + 3.3) * 2500); c.lineTo(1500 + Math.cos(a + 3.38) * 2500, 700 + Math.sin(a + 3.38) * 2500); c.fill(); }
  c.restore();
  ridge(c, 71, -500, 2500, 860, 160, 0.003, '#1c1418', true);
  fig(c, { x: 960, y: 1040, s: 70, kind: 'spartan', t: u, mood: u > d * 0.62 ? 'angry' : 'focused', wind: 1.5 });
  embers(c, 9, 50, u, 0.8);
}, { tin: 'xf' });

// 7. "The year was 480 BC. Across the sea... the largest armies..." — date card, then Persian march by the sea with fleet
S(N(28.2), N(37.8), (c, u, d) => {
  if (u < 2.6) {
    fillAll(c, '#060504');
    embers(c, 12, 40, u, 0.5);
    const a = ss(0.1, 0.9, u) * (1 - ss(2.0, 2.6, u));
    txt(c, '480 BC', W / 2, H / 2, 170, null, { grad: true, a, ls: 20 });
    txt(c, 'THE PERSIAN INVASION OF GREECE', W / 2, H / 2 + 130, 38, '#d9c9a0', { a: a * 0.9, ls: 8, w: 400 });
    return;
  }
  persianMarchScene(c, u - 2.6, { sea: true, ships: true, pan: 50, rows: [[870, 9, 80], [960, 12, 100], [1070, 16, 125]] });
  fillAll(c, `rgba(0,0,0,${1 - ss(2.6, 3.4, u)})`);
}, { tin: 'black', dip: 0.9 });

// 8. "And in a narrow pass in central Greece, a small group of men prepared to stand in its way" — aerial of Thermopylae
function aerialPass(c, u, opt = {}) {
  // top-down stylised: mountains top, sea bottom, narrow road in between
  c.fillStyle = '#5f6a48'; c.fillRect(-1500, -1500, 5000, 5000);
  // sea
  const sg = c.createLinearGradient(0, 600, 0, 1400); sg.addColorStop(0, '#3a6a80'); sg.addColorStop(1, '#1a3444'); c.fillStyle = sg;
  c.beginPath(); c.moveTo(-1500, 640); for (let x = -1500; x <= 3500; x += 20) c.lineTo(x, 640 + Math.sin(x * 0.004) * 50 + fbm(91, x * 0.01) * 30 + (Math.abs(x - 960) < 300 ? -40 * Math.cos((x - 960) / 300 * Math.PI / 2) : 0)); c.lineTo(3500, 2500); c.lineTo(-1500, 2500); c.fill();
  c.strokeStyle = 'rgba(230,240,250,0.35)'; c.lineWidth = 3; c.beginPath();
  for (let i = 0; i < 6; i++) { for (let x = -1500; x <= 3500; x += 20) { const y = 660 + i * 26 + Math.sin(x * 0.004) * 50 + fbm(91, x * 0.01) * 30 + Math.sin(u * 1.5 + x * 0.02 + i) * 4 + (Math.abs(x - 960) < 300 ? -40 * Math.cos((x - 960) / 300 * Math.PI / 2) : 0); x === -1500 ? c.moveTo(x, y) : c.lineTo(x, y); } }
  c.stroke();
  // coastal strip (road)
  c.fillStyle = '#b89a6a'; c.beginPath(); c.moveTo(-1500, 560); for (let x = -1500; x <= 3500; x += 20) c.lineTo(x, 575 + Math.sin(x * 0.004) * 50 + (Math.abs(x - 960) < 300 ? -45 * Math.cos((x - 960) / 300 * Math.PI / 2) : 0)); for (let x = 3500; x >= -1500; x -= 20) c.lineTo(x, 650 + Math.sin(x * 0.004) * 50 + fbm(91, x * 0.01) * 30 + (Math.abs(x - 960) < 300 ? -40 * Math.cos((x - 960) / 300 * Math.PI / 2) : 0)); c.fill();
  // mountains (layered blobs with shading)
  const r = mulberry(17);
  for (let i = 0; i < 260; i++) {
    const x = -1500 + r() * 5000; const yb = 560 + Math.sin(x * 0.004) * 50 + (Math.abs(x - 960) < 300 ? -45 * Math.cos((x - 960) / 300 * Math.PI / 2) : 0);
    const y = yb - 40 - r() * 1600; const s = 60 + r() * 150;
    c.fillStyle = `rgb(${70 + r() * 30},${80 + r() * 25},${60 + r() * 20})`;
    c.beginPath(); c.moveTo(x - s, y + s * 0.5); c.lineTo(x, y - s * 0.6); c.lineTo(x + s, y + s * 0.5); c.fill();
    c.fillStyle = 'rgba(0,0,0,0.25)'; c.beginPath(); c.moveTo(x, y - s * 0.6); c.lineTo(x + s, y + s * 0.5); c.lineTo(x + s * 0.2, y + s * 0.5); c.fill();
  }
  // the wall + greek camp
  c.fillStyle = '#5a4a3a'; c.fillRect(940, 515, 14, 100);
  c.fillStyle = P.red; for (let i = 0; i < 40; i++) { c.beginPath(); c.arc(905 - (i % 5) * 9, 540 + Math.floor(i / 5) * 9, 3.2, 0, 7); c.fill(); }
  c.fillStyle = '#2a4f8a'; for (let i = 0; i < 60; i++) { c.beginPath(); c.arc(860 - (i % 6) * 9, 535 + Math.floor(i / 6) * 8, 3, 0, 7); c.fill(); }
  // persian approach from the right (west is left; Persians came from the north/east -> right)
  if (opt.persians) { c.fillStyle = '#4a2a14'; for (let i = 0; i < 600; i++) { const x = 1300 + (i % 60) * 12 + u * 10, y = 520 + Math.floor(i / 60) * 10; c.beginPath(); c.arc(x, y, 3, 0, 7); c.fill(); } }
  // clouds
  c.fillStyle = 'rgba(255,255,255,0.10)'; for (let i = 0; i < 5; i++) { const x = (i * 400 + u * 30) % 3200 - 600, y = 200 + (i * 137) % 600; c.beginPath(); c.ellipse(x, y, 260, 70, 0, 0, 7); c.fill(); }
}
S(N(37.8), N(44.5), (c, u, d) => {
  const p = easeIO(u / d);
  cam(c, lerp(960, 930, p), lerp(560, 570, p), lerp(0.55, 1.6, p));
  aerialPass(c, u);
  c.setTransform(1, 0, 0, 1, 0, 0);
  txt(c, 'THERMOPYLAE', W / 2, 120, 64, null, { grad: true, a: ss(1.5, 2.5, u), ls: 14 });
  txt(c, 'Central Greece', W / 2, 185, 30, '#f0e0c0', { a: ss(2, 3, u) * 0.9, w: 400, ls: 6 });
  txt(c, 'MOUNTAINS', 1600, 330, 30, '#f5ead0', { a: ss(3.5, 4.3, u) * 0.9, ls: 6 });
  txt(c, 'SEA', 1600, 900, 30, '#f5ead0', { a: ss(3.8, 4.6, u) * 0.9, ls: 6 });
}, { tin: 'xf' });

// 9. "What happened over the next three days would echo for more than 2000 years" — lone Spartan at sunset (thumbnail style)
S(N(44.5), N(50.4), (c, u, d) => {
  const p = easeIO(u / d);
  cam(c, lerp(900, 760, p), lerp(560, 520, p), lerp(1.0, 1.3, p));
  sky(c, [[0, '#1e2232'], [0.35, '#6a4a48'], [0.55, '#f0a050'], [0.62, '#ffd890'], [1, '#3a2418']]);
  sun(c, 1200, 590, 60);
  ridge(c, 81, -400, 2400, 600, 260, 0.0028, 'rgba(90,60,60,0.85)', true);
  ridge(c, 82, -400, 2400, 700, 180, 0.004, '#4a3030', true);
  c.fillStyle = '#2a1c16'; c.fillRect(-400, 690, 2800, 600);
  armyMass(c, 9, 900, 2400, 720, 900, u, '#21150f', 'rgba(255,210,160,0.5)', { n: 2500 });
  // campfires
  for (let i = 0; i < 30; i++) { const r = mulberry(i + 50); glow(c, 950 + r() * 1400, 740 + r() * 150, 14 + Math.sin(u * 8 + i) * 2, 'rgba(255,150,50,0.9)'); }
  // rock
  c.fillStyle = '#100b09'; c.beginPath(); c.moveTo(-400, 1300); c.lineTo(-400, 840); c.quadraticCurveTo(300, 760, 820, 800); c.quadraticCurveTo(980, 830, 1050, 1300); c.fill();
  fig(c, { x: 620, y: 795, s: 40, kind: 'spartan', t: u, mood: 'focused', wind: 1.6, spearTilt: 0.1 });
  particles(c, 8, 70, -400, 300, 2800, 900, u, 'rgba(255,200,140,0.25)', 4, -60, -5);
}, { tin: 'xf' });

// 10. Title: "This... is the story of the Battle of Thermopylae."
S(N(50.4), N(55.0), (c, u, d) => {
  fillAll(c, '#050403');
  glow(c, W / 2, H / 2, 900, 'rgba(120,50,20,0.45)');
  embers(c, 21, 90, u + 3, 0.9);
  const a1 = ss(2.0, 2.5, u), a2 = ss(2.95, 3.2, u);
  txt(c, 'THE BATTLE OF', W / 2, H / 2 - 120, 52, '#e8d8b0', { a: a1, ls: 18, w: 400 });
  const sc = lerp(1.25, 1, ss(2.95, 3.4, u));
  c.save(); c.translate(W / 2, H / 2 + 10); c.scale(sc, sc); c.translate(-W / 2, -(H / 2 + 10));
  txt(c, 'THERMOPYLAE', W / 2, H / 2 + 10, 150, null, { grad: true, a: a2, ls: 16 });
  c.restore();
  // shine sweep
  if (u > 3.3) { const sx = lerp(300, 1700, ss(3.3, 4.3, u)); c.save(); c.globalCompositeOperation = 'lighter'; glow(c, sx, H / 2 + 10, 160, 'rgba(255,240,200,0.35)'); c.restore(); }
  txt(c, '480 BC', W / 2, H / 2 + 140, 44, '#c9a860', { a: ss(3.5, 4.0, u), ls: 14 });
  c.strokeStyle = `rgba(226,173,62,${ss(3.5, 4.0, u)})`; c.lineWidth = 2; c.beginPath(); c.moveTo(W / 2 - 300, H / 2 + 100); c.lineTo(W / 2 + 300, H / 2 + 100); c.stroke();
}, { tin: 'black', dip: 0.6 });

// 11. Map — "In 480 BC, the Persian Empire was one of the most powerful empires"
S(N(55.0), N(61.5), (c, u, d) => {
  const p = easeIO(u / d);
  cam(c, lerp(1100, 1000, p), lerp(560, 540, p), lerp(1.0, 1.08, p));
  drawMap(c, u, { grow: ss(0.6, 5.5, u) });
  mapDot(c, 52.9, 29.9, ss(0.2, 0.8, u)); mapLabel(c, 'PERSEPOLIS', 52.9, 28.3, 22, ss(0.2, 0.8, u));
  mapLabel(c, 'PERSIAN EMPIRE', 50, 34.5, 54, ss(3.5, 4.5, u), '#5a0a08');
  mapLabel(c, 'ASIA', 64, 44, 30, ss(4.5, 5.5, u) * 0.8);
  c.setTransform(1, 0, 0, 1, 0, 0);
  txt(c, 'ACHAEMENID PERSIAN EMPIRE — c. 480 BC', W / 2, 1010, 30, '#f5e8c8', { a: ss(1, 2, u), w: 400, ls: 5 });
}, { tin: 'black', dip: 0.7 });

// 12. "It stretched across Asia and beyond, with soldiers from many different nations"
S(N(61.5), N(67.4), (c, u, d) => {
  const pan = u * 50;
  cam(c, W / 2 + pan, H / 2, 1);
  sky(c, [[0, '#5a4a3a'], [0.5, '#d8a868'], [1, '#7a5a3a']]);
  sun(c, 600 + pan, 380, 40, '#fff8e0', 'rgba(255,200,120,0.5)');
  ridge(c, 91, -400 + pan * 0.5, 2600 + pan, 700, 120, 0.003, '#a07a58', true);
  c.fillStyle = '#9a7448'; c.fillRect(-600 + pan, 760, 4000, 500);
  const types = [
    { kind: 'persian' }, { kind: 'persian', hat: 'hood', col: '#5a4630', spear: false, bow: true }, { kind: 'immortal' },
    { kind: 'persian', hat: 'turban', col: '#8e2a1e' }, { kind: 'persian', hat: 'pointed', col: '#4a5a3a', spear: false, bow: true },
    { kind: 'persian', col: '#2a4a6a', cap: '#3a5a7a' }, { kind: 'persian', hat: 'turban', col: '#e0d8c0', cap: '#c04a2a' },
  ];
  const spc = 140;
  [[870, 20, 0], [1000, 27, 3]].forEach(([y, s, off]) => {
    const sx = -300 + pan - ((u * 60) % spc);
    for (let x = sx; x < sx + W + 600; x += spc) {
      const idx = Math.round((x + u * 60) / spc) + off; const tp = types[((idx % types.length) + types.length) % types.length];
      fig(c, Object.assign({ x, y, s, face: -1, pose: 'walk', ph: u * 5 + idx, t: u, shield: tp.kind === 'immortal', wind: 0.5 }, tp));
    }
  });
  particles(c, 32, 80, -600 + pan, 600, 3000, 500, u, 'rgba(230,190,130,0.3)', 5, -40, -4);
}, { tin: 'xf' });

// 13. "But one region still resisted. Greece." — zoom to Greece
S(N(67.4), N(71.0), (c, u, d) => {
  const p = easeIO(ss(0, 2.4, u));
  cam(c, lerp(1000, mx(23), p), lerp(540, my(38.6), p), lerp(1.08, 3.2, p));
  drawMap(c, u, { grow: 1, greece: ss(2.3, 2.8, u) });
  mapLabel(c, 'GREECE', 21.6, 40.6, 22, ss(2.6, 3.0, u), '#0a1a3a');
  mapDot(c, 23.7, 38.0, ss(2.8, 3.2, u)); mapLabel(c, 'Athens', 24.6, 37.7, 11, ss(2.8, 3.2, u));
  mapDot(c, 22.4, 37.1, ss(2.9, 3.3, u)); mapLabel(c, 'Sparta', 22.6, 36.6, 11, ss(2.9, 3.3, u));
}, { tin: 'xf' });

// 14. "The Persian kings had built their empire by conquering kingdom after kingdom... Egypt... India"
S(N(71.0), N(80.8), (c, u, d) => {
  const p = easeIO(ss(0, 2, u));
  cam(c, lerp(mx(23), 1000, p), lerp(my(38.6), 560, p), lerp(3.2, 1.0, p));
  drawMap(c, u, { grow: 1, greece: 1 - ss(0, 1.5, u) * 0.5 });
  const pp = mx(52.9), py = my(29.9);
  mapArrow(c, [[52.9, 29.9], [45, 33], [36, 37]], ss(1.6, 3.2, u), 'rgba(110,10,10,0.85)', 8);
  mapLabel(c, 'LYDIA', 30, 39, 22, ss(3.0, 3.6, u));
  mapArrow(c, [[52.9, 29.9], [40, 33], [31, 27]], ss(4.4, 5.8, u), 'rgba(110,10,10,0.85)', 8);
  mapLabel(c, 'EGYPT', 29.5, 25.5, 30, ss(5.3, 6.0, u));
  mapArrow(c, [[52.9, 29.9], [62, 33], [70, 28]], ss(7.0, 8.4, u), 'rgba(110,10,10,0.85)', 8);
  mapLabel(c, 'INDIA', 72, 25.5, 30, ss(7.9, 8.6, u));
  mapLabel(c, 'BABYLON', 44.4, 31.5, 18, ss(2.4, 3.0, u)); mapDot(c, 44.4, 32.5, ss(2.4, 3.0, u));
  mapDot(c, 52.9, 29.9, 1);
}, { tin: 'xf' });

// 15. "Conquered peoples were asked to offer earth and water... Many cities agreed."
S(N(80.8), N(89.3), (c, u, d) => {
  const p = easeIO(u / d);
  cam(c, lerp(980, 1080, p), lerp(600, 660, p), lerp(1.0, 1.2, p));
  throneRoom(c, u, { mood: 'normal' });
  // envoys approach and kneel
  const k1 = ss(0.5, 2.5, u);
  for (let i = 0; i < 3; i++) {
    const x = lerp(-150 - i * 170, 760 - i * 190, ss(0.3 + i * 0.4, 3.0 + i * 0.4, u));
    const arrived = u > 3.0 + i * 0.4;
    const kinds = [{ hat: 'turban', col: '#2a5a4a' }, { hat: 'pointed', col: '#6a4a2a' }, { hat: 'hood', col: '#4a3a5a' }];
    fig(c, Object.assign({ x, y: 1010, s: 30, kind: 'persian', pose: arrived ? 'kneel' : 'walk', ph: u * 5 + i, t: u, spear: false, shield: false, bowl: true, jar: i === 0, handF: arrived ? [1.6, 0.6] : undefined, mood: 'normal' }, kinds[i]));
  }
  c.setTransform(1, 0, 0, 1, 0, 0);
  txt(c, '“EARTH AND WATER”', W / 2, 110, 54, null, { grad: true, a: ss(2.0, 2.8, u) * (1 - ss(7.2, 8, u)), ls: 10 });
  txt(c, 'a symbol of submission to the Great King', W / 2, 170, 28, '#f0e0c0', { a: ss(2.6, 3.4, u) * (1 - ss(7.2, 8, u)), w: 400, ls: 3 });
}, { tin: 'black', dip: 0.6 });

// 16. "But years earlier, when Persian messengers came to Athens and Sparta... thrown into a pit and a well..."
S(N(89.3), N(103.4), (c, u, d) => {
  // beats (local time): messenger walks in 0-4.5; demand 4.5-8.8; push + fall 8.8-11.2; spartan points 11.2+
  const zoom = lerp(1.0, 1.15, ss(8, 12, u));
  cam(c, 980, 640, zoom);
  spartaCity(c, u);
  const wx = 1260, wy = 960;
  well(c, wx, wy, 0.9);
  // messenger
  const fallT = ss(9.8, 11.2, u);
  let mx_ = lerp(-120, 1120, ss(0.2, 3.2, u)), my_ = 1010, rot = 0, mpose = u < 3.2 ? 'walk' : 'stand';
  if (u > 6.8) { mx_ = lerp(1120, wx, ss(6.8, 7.5, u)); rot = lerp(0, Math.PI, ss(6.8, 7.6, u)); my_ = lerp(1010, wy - 200, ss(6.8, 7.4, u)) + Math.pow(ss(7.4, 8.5, u), 2) * 700; mpose = 'run'; }
  // clip the falling messenger at the well mouth
  c.save();
  if (u > 7.0) { c.beginPath(); c.rect(-1000, -1000, 4000, 1000 + wy); c.rect(wx - 105, wy - 1, 210, 56); c.clip(); }
  if (u < 8.8) fig(c, { x: mx_, y: my_, s: 28, kind: 'messenger', pose: mpose, ph: u * 5, t: u, rot, scroll: u < 6.8, mood: u > 6.6 ? 'surprised' : 'normal', face: 1 });
  c.restore();
  well(c, wx, wy, 0.9); // redraw front lip
  c.fillStyle = '#9c8c74'; c.fillRect(wx - 126, wy, 252, 54);
  // spartans
  const push = ss(6.5, 7.0, u) * (1 - ss(7.6, 8.1, u));
  const point = ss(9.8, 10.4, u);
  fig(c, { x: 1450, y: 1010, s: 30, kind: 'spartan', face: -1, t: u, mood: u > 3.8 ? 'angry' : 'focused', spear: true, shield: point < 0.5, handF: point > 0.5 ? [1.6, 1.9] : undefined, thrust: push > 0 ? push * 0.6 : undefined });
  fig(c, { x: 1620, y: 1010, s: 30, kind: 'spartan', face: -1, t: u + 1, mood: 'focused' });
  fig(c, { x: 1780, y: 1010, s: 30, kind: 'spartan', face: -1, t: u + 2, mood: 'normal' });
  // speech bubble for demand
  const b = ss(3.3, 3.7, u) * (1 - ss(5.6, 6.0, u));
  if (b > 0) {
    c.globalAlpha = b; c.fillStyle = '#f5ecd5'; c.beginPath(); c.roundRect(870, 640, 340, 120, 30); c.fill(); c.beginPath(); c.moveTo(1050, 755); c.lineTo(1110, 755); c.lineTo(1100, 820); c.fill();
    c.font = '700 30px Cinzel'; c.fillStyle = '#3a2410'; c.textAlign = 'center'; c.letterSpacing = '2px'; c.fillText('EARTH AND', 1040, 690); c.fillText('WATER!', 1040, 730); c.globalAlpha = 1;
  }
  c.setTransform(1, 0, 0, 1, 0, 0);
  txt(c, 'SPARTA — YEARS EARLIER', W / 2, 90, 40, null, { grad: true, a: ss(0.4, 1.2, u) * (1 - ss(2.6, 3.2, u)), ls: 8 });
}, { tin: 'xf' });

// 17. "Ten years earlier, the Persians had been defeated at the Battle of Marathon."
S(N(103.4), N(108.9), (c, u, d) => {
  const pan = u * 140;
  cam(c, W / 2 + pan, H / 2, 1);
  sky(c, [[0, '#6a8aa8'], [0.6, '#e0caa0'], [1, '#a08a60']]);
  sea(c, -600 + pan, 3400 + pan, 690, 760, '#4a7a96', '#2a5068', u);
  for (let i = 0; i < 6; i++) { const x = 1700 + i * 230 + pan * 0.7; c.fillStyle = '#2a1a10'; c.beginPath(); c.moveTo(x - 60, 715); c.lineTo(x + 60, 715); c.lineTo(x + 45, 728); c.lineTo(x - 45, 728); c.fill(); c.fillRect(x - 2, 670, 4, 45); }
  c.fillStyle = '#7a8a50'; c.fillRect(-600 + pan, 760, 4000, 500);
  // persians fleeing right, greeks charging right
  for (let i = 0; i < 12; i++) { const x = 900 + i * 150 + u * 250 + (i % 3) * 30, y = 900 + (i % 3) * 50; fig(c, { x, y, s: 20 + (i % 3) * 3, kind: 'persian', pose: 'run', ph: u * 9 + i, t: u, spear: false, mood: 'surprised', face: 1, shield: false }); }
  for (let i = 0; i < 14; i++) { const x = -200 + i * 120 + u * 240, y = 920 + (i % 3) * 55; const col = i % 2 ? '#2a4f8a' : '#e6e0d0'; fig(c, { x, y, s: 22 + (i % 3) * 3, kind: 'greek', col, crest: col, shieldStyle: { face: col, faceD: shade(col, -0.5), mark: 'ring', emb: P.bronzeL }, pose: 'run', ph: u * 9 + i * 1.3, t: u, mood: 'angry', thrust: 0.5 }); }
  particles(c, 33, 120, -600 + pan, 750, 3000, 400, u, 'rgba(200,180,140,0.35)', 6, -80, -8);
  c.setTransform(1, 0, 0, 1, 0, 0);
  txt(c, '490 BC — MARATHON', W / 2, 110, 64, null, { grad: true, a: ss(0.3, 1.0, u), ls: 12 });
  txt(c, 'Persian defeat', W / 2, 180, 30, '#2a1a0a', { a: ss(0.8, 1.5, u), w: 400, ls: 6, shadow: false });
}, { tin: 'black', dip: 0.7 });

// 18. "Now, King Xerxes the First wanted revenge... and control."
S(N(108.9), N(114.9), (c, u, d) => {
  const p = easeIO(u / d);
  cam(c, lerp(1100, 1330, p), lerp(640, 640, p), lerp(1.0, 2.3, p));
  throneRoom(c, u, { mood: u > 2.2 ? 'angry' : 'focused' });
  fillAll(c, `rgba(40,0,0,${0.25 * ss(2, 4, u)})`);
  c.setTransform(1, 0, 0, 1, 0, 0);
  txt(c, 'XERXES I', 360, 860, 60, null, { grad: true, a: ss(0.6, 1.4, u), ls: 12, align: 'center' });
  txt(c, 'King of Kings', 360, 920, 28, '#e8d0a0', { a: ss(1.0, 1.8, u), w: 400, ls: 5 });
}, { tin: 'black', dip: 0.6 });

// 19. "He gathered an enormous army... and marched toward Greece."
S(N(114.9), N(119.4), (c, u, d) => {
  persianMarchScene(c, u, { pan: 90, rows: [[820, 7, 60], [880, 9, 75], [960, 12, 95], [1060, 16, 120]] });
}, { tin: 'xf' });

// 20/21. Herodotus "millions" vs modern estimate
S(N(119.4), N(132.9), (c, u, d) => {
  const g = c.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, 1200); g.addColorStop(0, '#e2cc98'); g.addColorStop(1, '#7a5a30');
  fillAll(c, g); c.setTransform(1, 0, 0, 1, 0, 0);
  // silhouettes of army along bottom
  const army = buildCrowd('herod', { seed: 12, horizon: 700, depth: 260, k: 9, x0: -50, x1: 1970, zNear: 0.9, zFar: 3, spacing: 3, rowStep: 0.12 });
  const shrink = ss(5.5, 8.5, u);
  c.save(); c.globalAlpha = lerp(0.85, 0.3, shrink); drawCrowd(c, army, u, { palette: ['#3a2a1a', '#3a2a1a', '#3a2a1a'], cap: '#3a2a1a', rise: 1 }); c.restore();
  // scroll
  c.fillStyle = '#efe0b8'; c.fillRect(560, 150, 800, 420); c.fillStyle = '#c8a870'; c.fillRect(540, 140, 840, 22); c.fillRect(540, 560, 840, 22);
  txt(c, 'HERODOTUS', W / 2, 205, 40, '#4a2a10', { shadow: false, ls: 10, a: ss(0.2, 0.8, u) });
  txt(c, 'Greek historian, c. 430 BC', W / 2, 250, 24, '#6a4a2a', { shadow: false, w: 400, ls: 3, a: ss(0.4, 1.0, u) });
  const n = Math.round(2641610 * easeIO(ss(0.8, 3.6, u)));
  txt(c, n.toLocaleString('en-US'), W / 2, 360, 104, '#7a1010', { shadow: false, ls: 4, a: ss(0.6, 1.0, u) });
  txt(c, 'claimed fighting men', W / 2, 440, 28, '#5a3a1a', { shadow: false, w: 400, ls: 3, a: ss(1.2, 1.8, u) });
  // strike-through
  const st = ss(6.0, 6.8, u);
  if (st > 0) { c.strokeStyle = '#b01010'; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(650, 380); c.lineTo(650 + 620 * st, 335); c.stroke(); }
  // modern estimate
  const me = ss(10.2, 11, u);
  c.globalAlpha = me; c.fillStyle = 'rgba(30,20,10,0.88)'; c.beginPath(); c.roundRect(560, 600, 800, 150, 20); c.fill(); c.globalAlpha = 1;
  txt(c, '100,000 – 300,000', W / 2, 655, 64, null, { grad: true, a: me, ls: 4 });
  txt(c, 'modern historians’ estimate', W / 2, 715, 26, '#e8d8b0', { a: me, w: 400, ls: 4 });
  txt(c, 'GREATLY EXAGGERATED?', W / 2, 500, 34, '#8a1010', { shadow: false, a: ss(6.6, 7.2, u), ls: 6 });
}, { tin: 'black', dip: 0.6 });

// 22. "But even that was an overwhelming force."
S(N(132.9), N(135.4), (c, u, d) => {
  const p = easeIO(u / d);
  cam(c, lerp(800, 1100, p), lerp(600, 520, p), lerp(1.25, 1.05, p));
  sky(c, [[0, '#2a2a34'], [0.42, '#8a6a58'], [0.5, '#d8a070'], [1, '#3a2a1e']]);
  ridge(c, 2, -600, 2600, 470, 150, 0.0028, 'rgba(70,52,52,0.95)', true);
  c.fillStyle = '#3a2a20'; c.fillRect(-600, 468, 3200, 900);
  armyMass(c, 17, -600, 2600, 470, 560, u, '#2a1e18', 'rgba(230,210,180,0.6)', { n: 5000, march: -u * 8 });
  const rows = buildCrowd('army2', { seed: 13, horizon: 470, depth: 640, k: 14, x0: -700, x1: 2700, zNear: 1.15, zFar: 7.5, spacing: 3.0, rowStep: 0.05 });
  drawCrowd(c, rows, u, { rise: 1, fog: 'rgba(170,120,80,0.9)', walk: true, march: -u * 4 });
  for (let b = 0; b < 8; b++) banner(c, -200 + b * 330 - u * 20, 760 + (b % 3) * 40, 220, b % 2 ? P.red : P.gold, u, b);
  haze(c, 440, 560, 'rgba(230,160,100,0.35)');
  particles(c, 22, 120, -600, 300, 3200, 900, u, 'rgba(220,170,120,0.25)', 5, -30, -4);
}, { tin: 'black', dip: 0.5 });

// 23. "To move it, Xerxes built bridges of boats across the Hellespont, the narrow strait between Asia and Europe."
S(N(135.4), N(143.6), (c, u, d) => {
  const p = easeIO(u / d);
  cam(c, lerp(960, 900, p), lerp(560, 540, p), lerp(0.85, 1.25, p));
  // top-down strait: Europe left bank, Asia right bank
  c.fillStyle = '#7a8a5a'; c.fillRect(-1500, -1500, 5000, 5000);
  const sg = c.createLinearGradient(700, 0, 1250, 0); sg.addColorStop(0, '#2a5a70'); sg.addColorStop(0.5, '#3a7a92'); sg.addColorStop(1, '#2a5a70');
  c.fillStyle = sg; c.beginPath(); c.moveTo(640, -1500); for (let y = -1500; y <= 2600; y += 20) c.lineTo(700 + Math.sin(y * 0.003) * 60 + fbm(5, y * 0.01) * 30, y); for (let y = 2600; y >= -1500; y -= 20) c.lineTo(1240 + Math.sin(y * 0.003 + 1) * 60 + fbm(6, y * 0.01) * 30, y); c.fill();
  c.strokeStyle = 'rgba(230,240,250,0.3)'; c.lineWidth = 2; c.beginPath(); for (let i = 0; i < 70; i++) { const r = mulberry(i); const x = 760 + r() * 420, y = -400 + r() * 1900 + Math.sin(u + i) * 5; c.moveTo(x, y); c.lineTo(x + 30, y + 4); } c.stroke();
  // bridge of boats (two lines)
  for (const by of [470, 620]) {
    for (let i = 0; i < 13; i++) {
      const x = 690 + i * 45; const bob = Math.sin(u * 1.8 + i) * 1.5;
      c.fillStyle = '#3a2412'; c.beginPath(); c.ellipse(x, by + bob, 16, 48, 0, 0, 7); c.fill();
      c.fillStyle = '#6a4424'; c.beginPath(); c.ellipse(x, by + bob, 11, 40, 0, 0, 7); c.fill();
    }
    c.fillStyle = '#9a7448'; c.fillRect(670, by - 18, 600, 36);
    c.strokeStyle = 'rgba(60,40,20,0.6)'; c.lineWidth = 2; for (let x = 670; x < 1270; x += 14) { c.beginPath(); c.moveTo(x, by - 18); c.lineTo(x, by + 18); c.stroke(); }
    // marching dots from Asia (right) to Europe (left)
    for (let i = 0; i < 60; i++) { const x = ((1700 - i * 22 - u * 60) % 1500 + 1500) % 1500 + 200; c.fillStyle = i % 4 ? '#4a2a14' : P.red; c.beginPath(); c.arc(x, by - 8 + (i % 2) * 14, 5, 0, 7); c.fill(); }
  }
  // army masses on Asian shore
  c.fillStyle = 'rgba(60,35,20,0.85)'; for (let i = 0; i < 900; i++) { const r = mulberry(i + 900); c.beginPath(); c.arc(1300 + r() * 900, 300 + r() * 500, 4, 0, 7); c.fill(); }
  c.setTransform(1, 0, 0, 1, 0, 0);
  txt(c, 'THE HELLESPONT', W / 2, 100, 58, null, { grad: true, a: ss(0.8, 1.6, u), ls: 12 });
  txt(c, 'Bridges of boats', W / 2, 160, 28, '#f5ead0', { a: ss(1.4, 2.2, u), w: 400, ls: 5 });
  txt(c, 'EUROPE', 330, 900, 50, '#f8f0d8', { a: ss(5.4, 6.0, u), ls: 12 });
  txt(c, 'ASIA', 1600, 900, 50, '#f8f0d8', { a: ss(5.0, 5.6, u), ls: 12 });
}, { tin: 'xf' });

// 24. End card — to be continued + branding
const END = N(143.6) + 9.5;
function helmetLogo(c, x, y, s, a) {
  c.save(); c.globalAlpha = a; c.translate(x, y); c.scale(s, s);
  const g = c.createLinearGradient(0, -120, 0, 120); g.addColorStop(0, '#fff0b0'); g.addColorStop(0.5, P.gold); g.addColorStop(1, P.goldD);
  c.fillStyle = g;
  c.beginPath(); c.moveTo(-10, -95); c.bezierCurveTo(-40, -170, -150, -150, -170, -60); c.bezierCurveTo(-120, -110, -60, -110, -10, -95); c.fill(); // crest
  c.beginPath(); c.arc(0, 0, 100, Math.PI * 1.0, Math.PI * 2.0); c.lineTo(100, 60); c.lineTo(60, 120); c.lineTo(30, 120); c.lineTo(30, 30); c.lineTo(-30, 30); c.lineTo(-30, 120); c.lineTo(-60, 120); c.lineTo(-100, 60); c.closePath(); c.fill();
  c.fillStyle = '#050403'; c.beginPath(); c.moveTo(-80, -10); c.lineTo(80, -10); c.lineTo(80, 25); c.lineTo(18, 25); c.lineTo(18, 120); c.lineTo(-18, 120); c.lineTo(-18, 25); c.lineTo(-80, 25); c.closePath(); c.fill();
  c.restore();
}
S(N(143.6), END, (c, u, d) => {
  fillAll(c, '#040303');
  glow(c, W / 2, H / 2, 800, 'rgba(110,60,20,0.35)');
  embers(c, 44, 60, u, 0.7);
  const a1 = ss(0.2, 0.9, u) * (1 - ss(2.8, 3.4, u));
  txt(c, 'TO BE CONTINUED...', W / 2, H / 2, 70, null, { grad: true, a: a1, ls: 14 });
  const a2 = ss(3.6, 4.6, u) * (1 - ss(d - 0.8, d, u));
  helmetLogo(c, W / 2, H / 2 - 170, lerp(0.85, 1, ss(3.6, 5, u)), a2);
  txt(c, 'STICKMAN HISTORY', W / 2, H / 2 + 60, 110, null, { grad: true, a: ss(4.2, 5.0, u) * (1 - ss(d - 0.8, d, u)), ls: 10 });
  txt(c, 'REAL HISTORIES • BIGGER BATTLES • EPIC ANIMATIONS', W / 2, H / 2 + 160, 32, '#d8c8a0', { a: ss(5.0, 5.8, u) * (1 - ss(d - 0.8, d, u)), w: 400, ls: 6 });
}, { tin: 'black', dip: 0.8 });

// ---------- frame renderer with transitions + film look
const BUF = document.createElement('canvas'); BUF.width = W; BUF.height = H; const bctx = BUF.getContext('2d');
const GRAIN = document.createElement('canvas'); GRAIN.width = 512; GRAIN.height = 512;
{ const g = GRAIN.getContext('2d'); const id = g.createImageData(512, 512); const r = mulberry(1); for (let i = 0; i < id.data.length; i += 4) { const v = r() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } g.putImageData(id, 0, 0); }
function drawScene(c, sc, t) {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
  sc.draw(c, t - sc.start, sc.end - sc.start); c.restore();
}
const XF = 0.6;
function renderFrame(t, c) {
  let i = SCENES.findIndex(s => t >= s.start && t < s.end); if (i < 0) i = SCENES.length - 1;
  const sc = SCENES[i];
  drawScene(c, sc, t);
  const next = SCENES[i + 1];
  // crossfade into the next scene during the last XF seconds
  if (next && (next.tin || 'xf') === 'xf' && t > sc.end - XF) {
    bctx.clearRect(0, 0, W, H); drawScene(bctx, next, Math.max(next.start, t));
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = (t - (sc.end - XF)) / XF; c.drawImage(BUF, 0, 0); c.restore();
  }
  // dip to black around 'black' boundaries
  let dark = 0;
  if (sc.tin === 'black') dark = Math.max(dark, 1 - clamp((t - sc.start) / (sc.dip || 0.6), 0, 1));
  if (next && next.tin === 'black') dark = Math.max(dark, 1 - clamp((sc.end - t) / (next.dip || 0.6) * 1.6, 0, 1));
  if (t > END - 0.01) dark = 1;
  // film look: vignette + grain
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  const v = c.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 1.05); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.55)');
  c.fillStyle = v; c.fillRect(0, 0, W, H);
  c.globalAlpha = 0.045; const ox = Math.floor(t * 997) % 512, oy = Math.floor(t * 613) % 512;
  for (let x = -ox; x < W; x += 512) for (let y = -oy; y < H; y += 512) c.drawImage(GRAIN, x, y);
  c.globalAlpha = 1;
  if (dark > 0) { c.fillStyle = `rgba(0,0,0,${dark})`; c.fillRect(0, 0, W, H); }
  c.restore();
}
window.TOTAL = END;
window.renderAt = function (t) { renderFrame(t, ctx); };
