// Stickman Stories — flat cutout illustrations (artistic reconstructions)
function outline(c, w = 5) { c.lineWidth = w; c.strokeStyle = '#0b0f1c'; c.lineJoin = 'round'; c.stroke(); }

// 1950s sedan, side view, facing right. (x,y)= ground centre, s = scale (length ~ 520*s)
function car(c, x, y, s, t, opt = {}) {
  c.save(); c.translate(x, y); c.scale(s * (opt.face || 1), s);
  if (opt.beam !== false) { const g = c.createLinearGradient(250, 0, 900, 0); g.addColorStop(0, 'rgba(255,240,170,0.55)'); g.addColorStop(1, 'rgba(255,240,170,0)');
    c.fillStyle = g; c.beginPath(); c.moveTo(250, -70); c.lineTo(900, -170); c.lineTo(900, 40); c.lineTo(250, -40); c.fill(); }
  c.save(); c.globalAlpha = 0.35; c.fillStyle = '#000'; c.beginPath(); c.ellipse(0, 8, 270, 16, 0, 0, 7); c.fill(); c.restore();
  // body
  c.beginPath(); c.moveTo(-270, -40); c.lineTo(-262, -92); c.lineTo(-200, -100); c.lineTo(-120, -110); c.quadraticCurveTo(-80, -168, 0, -172); c.lineTo(80, -170); c.quadraticCurveTo(130, -166, 160, -118);
  c.lineTo(250, -104); c.quadraticCurveTo(272, -96, 270, -60); c.lineTo(268, -30); c.lineTo(-268, -24); c.closePath();
  c.fillStyle = opt.col || '#2f6f7a'; c.fill(); outline(c, 6);
  c.fillStyle = 'rgba(255,255,255,0.15)'; c.fillRect(-255, -86, 505, 10);
  c.fillStyle = '#e8e2cf'; c.beginPath(); c.moveTo(-270, -40); c.lineTo(268, -46); c.lineTo(268, -30); c.lineTo(-268, -24); c.fill();
  // tail fin
  c.fillStyle = opt.col || '#2f6f7a'; c.beginPath(); c.moveTo(-262, -92); c.lineTo(-282, -118); c.lineTo(-200, -100); c.fill(); outline(c, 4);
  // windows
  c.fillStyle = '#8fb3c4'; c.beginPath(); c.moveTo(-100, -112); c.quadraticCurveTo(-66, -158, -6, -160); c.lineTo(-6, -112); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(8, -160); c.lineTo(76, -158); c.quadraticCurveTo(116, -154, 138, -116); c.lineTo(8, -112); c.closePath(); c.fill();
  if (opt.people) { c.fillStyle = '#0b0f1c'; for (const px of [-60, -28, 40, 92]) { c.beginPath(); c.arc(px, -126, 15, 0, 7); c.fill(); c.fillRect(px - 12, -116, 24, 8); } }
  // wheels
  for (const wx of [-170, 165]) { c.save(); c.translate(wx, -16); c.rotate(t * (opt.spin || 8)); c.fillStyle = '#111'; c.beginPath(); c.arc(0, 0, 44, 0, 7); c.fill(); c.fillStyle = '#c9ccd0'; c.beginPath(); c.arc(0, 0, 22, 0, 7); c.fill(); c.strokeStyle = '#666'; c.lineWidth = 4; c.beginPath(); c.moveTo(-18, 0); c.lineTo(18, 0); c.moveTo(0, -18); c.lineTo(0, 18); c.stroke(); c.restore(); }
  // lights
  c.fillStyle = '#fff6c8'; c.beginPath(); c.ellipse(262, -78, 10, 14, 0, 0, 7); c.fill();
  c.fillStyle = '#ff3b2a'; c.beginPath(); c.ellipse(-266, -74, 7, 12, 0, 0, 7); c.fill();
  if (opt.speed) { c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 6; c.lineCap = 'round'; for (let i = 0; i < 5; i++) { const yy = -150 + i * 30, xx = -320 - ((t * 900 + i * 90) % 260); c.beginPath(); c.moveTo(xx, yy); c.lineTo(xx - 120, yy); c.stroke(); } }
  c.restore();
}
function treeLine(c, y, seed, col = '#0b1124', h = 260, x0 = -200, x1 = W + 200) {
  const r = rnd(seed); c.fillStyle = col;
  for (let x = x0; x < x1; x += 60 + r() * 50) { const th = h * (0.6 + r() * 0.6); c.beginPath(); c.moveTo(x - 50, y); for (let k = 0; k < 5; k++) { const yy = y - th * (k + 1) / 5; const ww = 50 * (1 - k / 5.5); c.lineTo(x - ww - 18, yy + 30); c.lineTo(x - ww * 0.4, yy + 30); } c.lineTo(x, y - th - 20); for (let k = 4; k >= 0; k--) { const yy = y - th * (k + 1) / 5; const ww = 50 * (1 - k / 5.5); c.lineTo(x + ww * 0.4, yy + 30); c.lineTo(x + ww + 18, yy + 30); } c.lineTo(x + 50, y); c.fill(); }
}
function road(c, y, t, speed = 0) {
  c.fillStyle = '#171c27'; c.fillRect(-100, y, W + 200, 230); c.fillStyle = '#0d1018'; c.fillRect(-100, y + 225, W + 200, 400);
  c.fillStyle = '#d9c36a'; for (let x = -200 - ((t * speed) % 220); x < W + 200; x += 220) c.fillRect(x, y + 110, 120, 12);
}
// abandoned factory + TNT igloos
function factory(c, x, y, s, opt = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = '#5a3a2e'; c.fillRect(-300, -260, 420, 260); outline(c, 0);
  c.fillStyle = '#6c4636'; c.beginPath(); c.moveTo(-320, -260); c.lineTo(-90, -360); c.lineTo(140, -260); c.fill(); c.lineWidth = 5; c.strokeStyle = '#0b0f1c'; c.stroke();
  c.strokeRect(-300, -260, 420, 260);
  c.fillStyle = '#3e2820'; c.fillRect(140, -470, 56, 470); c.strokeRect(140, -470, 56, 470);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { const wx = -270 + i * 130, wy = -220 + j * 110; c.fillStyle = opt.lit ? '#2a2f3a' : '#141824'; c.fillRect(wx, wy, 80, 70); c.strokeStyle = '#0b0f1c'; c.lineWidth = 4; c.strokeRect(wx, wy, 80, 70); c.beginPath(); c.moveTo(wx + 10, wy + 10); c.lineTo(wx + 40, wy + 40); c.lineTo(wx + 30, wy + 66); c.stroke(); }
  c.strokeStyle = 'rgba(30,15,10,0.5)'; c.lineWidth = 2; for (let yy = -250; yy < 0; yy += 22) { c.beginPath(); c.moveTo(-300, yy); c.lineTo(120, yy); c.stroke(); }
  c.fillStyle = '#3a4a2a'; c.fillRect(-340, -12, 600, 20);
  c.restore();
}
function igloo(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#3f5a33'; c.beginPath(); c.ellipse(0, 0, 120, 70, 0, Math.PI, 0); c.fill(); outline(c, 5); c.fillStyle = '#9a9a8a'; c.fillRect(-32, -46, 64, 46); c.strokeRect(-32, -46, 64, 46); c.fillStyle = '#5a5a50'; c.fillRect(-24, -38, 48, 38); c.restore(); }

// the Mothman (artistic reconstruction) — standing (spread=0) to wings open (spread=1), flap phase
function mothman(c, x, y, s, t, opt = {}) {
  const spread = opt.spread ?? 0.3, flap = opt.flap ? Math.sin(t * 9) * 0.35 : 0, a = opt.a ?? 1;
  c.save(); c.globalAlpha = a; c.translate(x, y); c.scale(s, s);
  const sil = opt.sil;
  const body = sil ? '#05070d' : '#1a1a22', wing = sil ? '#05070d' : '#23222c';
  // wings
  for (const sd of [-1, 1]) {
    c.save(); c.scale(sd, 1); c.translate(40, -330); c.rotate(-0.5 * spread - flap * 0.6 + 0.15);
    c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(140 + 160 * spread, -150 - 60 * spread, 260 + 200 * spread, -80 - 80 * spread);
    for (let k = 0; k < 4; k++) { const px = 260 + 200 * spread - k * (60 + 40 * spread), py = -80 - 80 * spread + 120 + k * 70; c.quadraticCurveTo(px + 20, py - 50, px - 30, py); }
    c.quadraticCurveTo(60, 260, 0, 220); c.closePath();
    const g = c.createLinearGradient(0, 0, 300, 200); g.addColorStop(0, wing); g.addColorStop(1, sil ? '#05070d' : '#3a3442'); c.fillStyle = g; c.fill();
    if (!sil) { outline(c, 5); c.strokeStyle = 'rgba(120,110,140,0.35)'; c.lineWidth = 3; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(10, 10); c.quadraticCurveTo(120, 40 + k * 50, 230 + 140 * spread - k * 60, 30 + k * 60); c.stroke(); } }
    c.restore();
  }
  // legs
  c.fillStyle = body; const lp = opt.fly ? 0.3 : 0;
  for (const sd of [-1, 1]) { c.save(); c.translate(sd * 40, -120); c.rotate(sd * lp * 0.4); c.beginPath(); c.moveTo(-22, 0); c.lineTo(22, 0); c.lineTo(16, 120); c.lineTo(36, 130); c.lineTo(-20, 132); c.lineTo(-18, 120); c.closePath(); c.fill(); if (!sil) outline(c, 4); c.restore(); }
  // torso (headless: eyes set in the upper chest, as witnesses described)
  c.beginPath(); c.moveTo(-90, -320); c.quadraticCurveTo(-110, -430, -40, -470); c.quadraticCurveTo(0, -490, 40, -470); c.quadraticCurveTo(110, -430, 90, -320);
  c.quadraticCurveTo(80, -170, 50, -110); c.lineTo(-50, -110); c.quadraticCurveTo(-80, -170, -90, -320); c.closePath();
  c.fillStyle = body; c.fill(); if (!sil) { outline(c, 6); c.strokeStyle = 'rgba(110,100,130,0.35)'; c.lineWidth = 3; for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(-60 + k * 4, -360 + k * 40); c.quadraticCurveTo(0, -350 + k * 40, 60 - k * 4, -360 + k * 40); c.stroke(); } }
  c.restore();
  glowEyes(c, x, y - 410 * s, 86 * s, 20 * s, (opt.eyes ?? 1) * (opt.eyeA ?? 1), Math.sin(t * 5) * 0.4);
}

// stylized USA map
const US = [[-124.7, 48.4], [-124.1, 46.2], [-124.4, 42.8], [-123.8, 39.8], [-122.4, 37.2], [-120.6, 34.6], [-117.1, 32.5], [-114.7, 32.7], [-111.1, 31.3], [-108.2, 31.3], [-106.5, 31.8], [-104.5, 29.6], [-103.2, 29.0], [-101.4, 29.8], [-99.5, 27.5], [-97.4, 25.9], [-97.4, 27.8], [-94.7, 29.4], [-91.3, 29.3], [-89.6, 29.0], [-89.4, 30.2], [-86.5, 30.4], [-85.0, 29.7], [-84.0, 30.1], [-82.8, 29.1], [-82.6, 27.5], [-81.8, 26.1], [-80.9, 25.2], [-80.1, 25.8], [-80.4, 27.5], [-81.3, 29.9], [-81.5, 31.5], [-79.2, 33.2], [-77.9, 33.9], [-75.5, 35.2], [-76.0, 36.9], [-75.9, 38.1], [-75.1, 38.9], [-74.0, 39.6], [-74.0, 40.6], [-71.9, 41.3], [-70.0, 41.7], [-70.7, 43.1], [-69.0, 44.1], [-67.0, 44.8], [-67.8, 47.1], [-69.2, 47.4], [-70.6, 45.5], [-74.7, 45.0], [-76.5, 44.2], [-79.0, 43.3], [-79.0, 42.9], [-82.4, 41.7], [-83.4, 42.0], [-82.5, 43.0], [-82.4, 45.3], [-84.4, 46.5], [-88.4, 48.3], [-89.6, 48.0], [-95.2, 49.0], [-123.0, 49.0]];
const WV = [[-82.6, 38.2], [-82.3, 37.7], [-81.7, 37.2], [-80.9, 37.3], [-80.3, 37.5], [-79.9, 38.3], [-79.4, 38.6], [-78.9, 39.0], [-78.3, 39.4], [-77.8, 39.3], [-77.7, 39.6], [-78.3, 39.7], [-79.5, 39.7], [-79.5, 39.2], [-80.0, 39.7], [-80.5, 39.7], [-80.5, 40.6], [-80.7, 40.0], [-80.9, 39.6], [-81.4, 39.3], [-81.9, 39.0], [-82.1, 38.8], [-82.6, 38.4]];
function usMap(c, cx, cy, sc, opt = {}) {
  const P = ([lo, la]) => [cx + (lo + 96) * sc * 0.79, cy - (la - 38) * sc];
  const poly = (pts) => { c.beginPath(); pts.forEach((p, i) => { const q = P(p); i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); }); c.closePath(); };
  c.save(); c.shadowColor = 'rgba(0,0,0,0.4)'; c.shadowBlur = 20; poly(US); c.fillStyle = '#e6d3a6'; c.fill(); c.shadowColor = 'transparent'; c.strokeStyle = '#5a4428'; c.lineWidth = 3 * Math.min(1, 10 / sc) + 1; c.stroke();
  // texture lines
  c.save(); poly(US); c.clip(); c.strokeStyle = 'rgba(120,90,50,0.15)'; c.lineWidth = 2; for (let i = -40; i < 40; i++) { const q = P([-130 + i * 2, 50]), q2 = P([-130 + i * 2, 24]); c.beginPath(); c.moveTo(q[0], q[1]); c.lineTo(q2[0], q2[1]); c.stroke(); } c.restore();
  if (opt.wv) { poly(WV); c.fillStyle = `rgba(214,49,43,${0.55 * opt.wv})`; c.fill(); c.strokeStyle = `rgba(142,23,18,${opt.wv})`; c.lineWidth = 3; c.stroke(); }
  c.restore();
  return P;
}
function mapPin(c, x, y, a, label) {
  if (a <= 0) return; const dy = -40 * (1 - ease(a));
  c.save(); c.globalAlpha = clamp(a * 2, 0, 1); c.fillStyle = C.red; c.strokeStyle = '#4a0c08'; c.lineWidth = 3;
  c.beginPath(); c.moveTo(x, y + dy); c.bezierCurveTo(x - 26, y - 40 + dy, x - 26, y - 70 + dy, x, y - 72 + dy); c.bezierCurveTo(x + 26, y - 70 + dy, x + 26, y - 40 + dy, x, y + dy); c.fill(); c.stroke();
  c.fillStyle = '#fff'; c.beginPath(); c.arc(x, y - 52 + dy, 9, 0, 7); c.fill(); c.restore();
}
function calendar(c, x, y, s, mon, day, year, a, rot = 0) {
  if (a <= 0) return; c.save(); c.translate(x, y - 60 * (1 - ease(a))); c.rotate(rot); c.scale(s, s); c.globalAlpha = clamp(a * 2, 0, 1);
  c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 20; c.shadowOffsetY = 10; c.fillStyle = '#f4efe2'; c.fillRect(-150, -170, 300, 340); c.shadowColor = 'transparent';
  c.fillStyle = C.red; c.fillRect(-150, -170, 300, 90); text(c, mon, 0, -124, 52, '#fff'); text(c, day, 0, 10, 150, '#1d1a17'); text(c, year, 0, 120, 44, '#5a4a3a', { f: 'Elite' });
  for (const rx of [-90, 90]) { c.fillStyle = '#555'; c.beginPath(); c.arc(rx, -170, 10, 0, 7); c.fill(); }
  c.restore();
}
function badge(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); for (let i = 0; i < 12; i++) { const r = i % 2 ? 70 : 130, a = i / 12 * Math.PI * 2 - Math.PI / 2; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath();
  const g = c.createLinearGradient(0, -130, 0, 130); g.addColorStop(0, '#ffe08a'); g.addColorStop(1, '#b07a1a'); c.fillStyle = g; c.fill(); outline(c, 6);
  c.fillStyle = '#7a5310'; c.beginPath(); c.arc(0, 0, 58, 0, 7); c.fill(); text(c, 'SHERIFF', 0, -10, 26, '#ffe08a'); text(c, 'MASON CO.', 0, 22, 20, '#ffe08a'); c.restore();
}
function typedReport(c, x, y, w, h, rot, lines, p) {
  c.save(); c.translate(x, y); c.rotate(rot); c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 20; c.shadowOffsetY = 10; c.fillStyle = '#f2ecdc'; c.fillRect(-w / 2, -h / 2, w, h); c.shadowColor = 'transparent';
  const all = lines.join('\n'); const n = Math.floor(all.length * clamp(p, 0, 1)); let k = 0;
  lines.forEach((l, i) => { const s = l.slice(0, Math.max(0, Math.min(l.length, n - k))); k += l.length + 1; c.font = font('Elite', 30); c.fillStyle = i === 0 ? C.redD : '#2a241c'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(s, -w / 2 + 34, -h / 2 + 60 + i * 52); });
  c.restore();
}
// Silver Bridge illustration (eyebar-chain suspension bridge) with collapse progress p
function bridgeScene(c, t, p, opt = {}) {
  const wy = 1080; // water line
  const sky = c.createLinearGradient(0, 480, 0, wy); sky.addColorStop(0, '#1a2340'); sky.addColorStop(1, '#2c3a5c'); c.fillStyle = sky; c.fillRect(0, 470, W, wy - 470);
  c.fillStyle = '#2f4a66'; c.fillRect(0, wy, W, 340); c.strokeStyle = 'rgba(200,220,240,0.25)'; c.lineWidth = 3; for (let i = 0; i < 14; i++) { const yy = wy + 20 + i * 22; const xx = (i * 137 + t * 40) % W; c.beginPath(); c.moveTo(xx, yy); c.lineTo(xx + 80, yy); c.stroke(); }
  c.fillStyle = '#1c2a1c'; c.beginPath(); c.moveTo(0, wy - 10); c.lineTo(150, wy - 20); c.lineTo(180, wy + 340); c.lineTo(0, wy + 340); c.fill(); c.beginPath(); c.moveTo(W, wy - 10); c.lineTo(W - 150, wy - 20); c.lineTo(W - 180, wy + 340); c.lineTo(W, wy + 340); c.fill();
  text(c, 'OHIO', 90, wy + 200, 34, '#f0e6c8', { f: 'Elite' }); text(c, 'W. VA', W - 90, wy + 200, 34, '#f0e6c8', { f: 'Elite' });
  const deckY = 930, T1 = 330, T2 = 750;
  // towers
  c.fillStyle = '#8a9aa6'; for (const tx of [T1, T2]) { c.fillRect(tx - 16, 640, 32, wy - 640); c.fillRect(tx - 40, 640, 80, 14); }
  const chainY = x => { if (x < T1) return lerp(640, deckY - 10, (T1 - x) / (T1 - 150)); if (x > T2) return lerp(640, deckY - 10, (x - T2) / (W - 150 - T2)); const u = (x - T1) / (T2 - T1); return 640 + 230 * 4 * u * (1 - u); };
  const fall = ss(0, 1, p);
  // segments of deck + chain; middle span falls when p>0
  for (let seg = 0; seg < 18; seg++) {
    const x0 = 150 + seg * (W - 300) / 18, x1 = x0 + (W - 300) / 18;
    const mid = x0 > T1 - 40 && x1 < T2 + 60; const fd = mid ? fall : (x0 < T1 ? fall * 0.6 : fall * 0.3);
    const drop = fd * (wy + 120 - deckY) * (0.8 + 0.4 * Math.sin(seg * 1.7)), rot = fd * (seg % 2 ? 0.5 : -0.4);
    c.save(); c.translate((x0 + x1) / 2, deckY + drop); c.rotate(rot);
    c.fillStyle = '#b9c4cc'; c.fillRect(-(x1 - x0) / 2, -8, x1 - x0 + 1, 20); c.strokeStyle = '#3a4650'; c.lineWidth = 3; c.strokeRect(-(x1 - x0) / 2, -8, x1 - x0, 20);
    c.restore();
    c.save(); c.translate(0, drop); c.strokeStyle = '#d8dee4'; c.lineWidth = 7; c.beginPath(); c.moveTo(x0, chainY(x0)); c.lineTo(x1, chainY(x1)); c.stroke();
    c.lineWidth = 3; c.beginPath(); c.moveTo((x0 + x1) / 2, chainY((x0 + x1) / 2)); c.lineTo((x0 + x1) / 2, deckY); c.stroke(); c.restore();
  }
  // cars on deck
  if (fall < 0.05) for (let i = 0; i < 5; i++) { const cx = 200 + ((i * 180 + t * 60) % 700); c.fillStyle = ['#d6312b', '#e9b44c', '#5fd0c0', '#f4efe2', '#6a7acc'][i]; c.fillRect(cx, deckY - 22, 44, 16); }
  // splash
  if (p > 0.3) { const r = rnd(5); c.fillStyle = 'rgba(230,240,250,0.8)'; for (let i = 0; i < 70; i++) { const sx = T1 + r() * (T2 - T1), k = ss(0.3, 1, p); const sy = wy - Math.sin(r() * 3.14) * 160 * k * (1 - k * 0.5) - r() * 30; c.beginPath(); c.arc(sx, sy, 4 + r() * 8, 0, 7); c.fill(); } }
}
// eyebar chain diagram, zoom z in [0,1] focusing the cracked eye
function eyebar(c, cx, cy, z, crackP, t) {
  c.save(); const S = lerp(1, 3.2, ease(z)); c.translate(cx + lerp(0, 150, ease(z)) * S, cy + lerp(0, 40, ease(z)) * S); c.scale(S, S);
  c.fillStyle = '#f3ead2'; c.fillRect(-520, -230, 1040, 460); c.strokeStyle = 'rgba(70,110,170,0.25)'; c.lineWidth = 1; for (let x = -520; x < 520; x += 26) { c.beginPath(); c.moveTo(x, -230); c.lineTo(x, 230); c.stroke(); } for (let y = -230; y < 230; y += 26) { c.beginPath(); c.moveTo(-520, y); c.lineTo(520, y); c.stroke(); }
  const bar = (x0, x1, y, hl) => { c.fillStyle = hl ? '#9aa8b4' : '#7d8a96'; c.strokeStyle = '#1d2a36'; c.lineWidth = 4;
    c.beginPath(); c.moveTo(x0, y - 22); c.lineTo(x1, y - 22); c.arc(x1, y, 46, -Math.PI / 2, Math.PI / 2); c.lineTo(x0, y + 22); c.arc(x0, y, 46, Math.PI / 2, Math.PI * 1.5); c.closePath(); c.fill(); c.stroke();
    for (const ex of [x0, x1]) { c.fillStyle = '#f3ead2'; c.beginPath(); c.arc(ex, y, 20, 0, 7); c.fill(); c.stroke(); } };
  bar(-430, -150, -40); bar(-150, 130, -40, true); bar(130, 410, -40); bar(-430, -150, 50); bar(-150, 130, 50); bar(130, 410, 50);
  for (const px of [-430, -150, 130, 410]) { c.fillStyle = '#3a4650'; c.beginPath(); c.arc(px, 5, 14, 0, 7); c.fill(); c.fillRect(px - 8, -40, 16, 90); }
  // crack at eye of highlighted bar (x=-150, y=-40)
  if (crackP > 0) { c.strokeStyle = '#d6312b'; c.lineWidth = 3.5; c.beginPath(); const pts = [[-150, -60], [-142, -70], [-147, -78], [-138, -87]]; const n = Math.max(1, Math.round(pts.length * crackP)); pts.slice(0, n).forEach((q, i) => i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); c.stroke(); }
  c.globalAlpha = 1 - ease(z); text(c, 'EYEBAR', 0, -130, 34, '#1d2a36', { f: 'Elite' }); text(c, 'PIN', -150, 120, 26, '#1d2a36', { f: 'Elite' }); c.globalAlpha = 1;
  c.restore();
}
function crane(c, x, y, s, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.strokeStyle = '#2a2a2a'; c.lineWidth = 8; c.beginPath(); c.moveTo(-10, -240); c.lineTo(-30, 0); c.moveTo(20, -240); c.lineTo(40, 0); c.stroke();
  c.fillStyle = '#8f97a0'; c.beginPath(); c.ellipse(0, -300, 140, 70, -0.15, 0, 7); c.fill(); outline(c, 5);
  c.fillStyle = '#6f7780'; c.beginPath(); c.moveTo(-60, -320); c.quadraticCurveTo(-200, -300, -240, -230); c.quadraticCurveTo(-120, -260, -20, -260); c.fill(); outline(c, 4);
  c.strokeStyle = '#8f97a0'; c.lineWidth = 26; c.lineCap = 'round'; c.beginPath(); c.moveTo(90, -330); c.quadraticCurveTo(150 + Math.sin(t * 2) * 8, -440, 120, -540); c.stroke();
  c.fillStyle = '#8f97a0'; c.beginPath(); c.ellipse(130, -560, 34, 26, 0, 0, 7); c.fill(); c.fillStyle = '#d6312b'; c.beginPath(); c.ellipse(124, -576, 20, 12, 0, 0, 7); c.fill();
  c.fillStyle = '#3a3a3a'; c.beginPath(); c.moveTo(160, -566); c.lineTo(250, -548); c.lineTo(160, -552); c.fill(); c.fillStyle = '#ffcf3a'; c.beginPath(); c.arc(140, -562, 6, 0, 7); c.fill();
  c.restore();
}
function owl(c, x, y, s, t, shine = 1) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = '#7a5a3a'; c.beginPath(); c.ellipse(0, 0, 130, 170, 0, 0, 7); c.fill(); outline(c, 5);
  c.fillStyle = '#c9a678'; c.beginPath(); c.ellipse(0, 40, 80, 110, 0, 0, 7); c.fill();
  c.strokeStyle = '#7a5a3a'; c.lineWidth = 5; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-40 + i * 10, 20 + i * 24); c.quadraticCurveTo(0, 30 + i * 24, 40 - i * 10, 20 + i * 24); c.stroke(); }
  c.fillStyle = '#e8dcc4'; c.beginPath(); c.ellipse(-48, -80, 52, 50, 0, 0, 7); c.ellipse(48, -80, 52, 50, 0, 0, 7); c.fill();
  c.fillStyle = '#e9a23a'; c.beginPath(); c.moveTo(-10, -50); c.lineTo(0, -22); c.lineTo(10, -50); c.fill();
  c.restore();
  glowEyes(c, x, y - 80 * s, 96 * s, 22 * s, shine, Math.sin(t * 4) * 0.3);
}
function folder(c, x, y, s, rot, title, a) {
  if (a <= 0) return; c.save(); c.translate(x, y + 80 * (1 - ease(a))); c.rotate(rot); c.scale(s, s); c.globalAlpha = clamp(a * 2, 0, 1);
  c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 26; c.shadowOffsetY = 12; c.fillStyle = '#c99a5a'; c.beginPath(); c.moveTo(-300, -210); c.lineTo(-120, -210); c.lineTo(-90, -240); c.lineTo(60, -240); c.lineTo(90, -210); c.lineTo(300, -210); c.lineTo(300, 210); c.lineTo(-300, 210); c.closePath(); c.fill(); c.shadowColor = 'transparent';
  c.fillStyle = '#e2b878'; c.fillRect(-300, -170, 600, 380);
  text(c, 'CASE FILE', 0, -110, 40, '#5a3a18', { f: 'Elite', ls: 6 }); title.split('\n').forEach((l, i) => text(c, l, 0, -20 + i * 84, 76, '#2a1a0a'));
  c.restore();
}
function questionMark(c, x, y, s, a, t) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(Math.sin(t * 3) * 0.08); c.scale(s * back(a), s * back(a)); text(c, '?', 0, 0, 220, '#ffd34a', { stroke: '#0a0d18', sw: 18 }); c.restore(); }
function candle(c, x, y, t) {
  c.fillStyle = '#efe6cf'; c.fillRect(x - 26, y - 160, 52, 160); outline(c, 0);
  const fl = Math.sin(t * 13) * 3; c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y - 200, 0, x, y - 200, 160); g.addColorStop(0, 'rgba(255,190,90,0.6)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(x - 160, y - 360, 320, 320); c.restore();
  c.fillStyle = '#ffcf5a'; c.beginPath(); c.moveTo(x, y - 230 + fl); c.quadraticCurveTo(x + 22, y - 190, x, y - 168); c.quadraticCurveTo(x - 22, y - 190, x, y - 230 + fl); c.fill();
}
