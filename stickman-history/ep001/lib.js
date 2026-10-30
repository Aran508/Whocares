// Stickman History — drawing library (characters, crowds, environments)
const W = 1920, H = 1080;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const ss = (a, b, x) => { x = clamp((x - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); };
const easeIO = x => { x = clamp(x, 0, 1); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// ---------- palette
const P = {
  bronzeL: '#f0c868', bronze: '#c8922f', bronzeD: '#7a4e17',
  red: '#b3201f', redD: '#6a0e0e', redL: '#d8392f',
  gold: '#e2ad3e', goldD: '#8c6216',
  brown: '#6b4423', brownD: '#3e2612', brownL: '#94622f',
  steel: '#cfd6dc', wood: '#6e4a26', black: '#0b0b0d',
};

// ---------- noise
const _noise = {};
function noiseFn(seed) {
  if (_noise[seed]) return _noise[seed];
  const r = mulberry(seed); const v = []; for (let i = 0; i < 2048; i++) v.push(r());
  const f = x => { const i = Math.floor(x), fr = x - i; const a = v[i & 2047], b = v[(i + 1) & 2047]; const u = fr * fr * (3 - 2 * fr); return a + (b - a) * u; };
  return (_noise[seed] = f);
}
function fbm(seed, x) { const n = noiseFn(seed); return n(x) * 0.55 + n(x * 2.1 + 13) * 0.27 + n(x * 4.3 + 71) * 0.13 + n(x * 9.1 + 5) * 0.05; }

// ---------- environment
function fillAll(c, style) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = style; c.fillRect(0, 0, W, H); c.restore(); }
function sky(c, stops) {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  const g = c.createLinearGradient(0, 0, 0, H); stops.forEach(([p, col]) => g.addColorStop(p, col));
  c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore();
}
function glow(c, x, y, r, col, a = 1) {
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
  c.save(); c.globalAlpha = a; c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); c.restore();
}
function sun(c, x, y, r, core = '#fff3c4', halo = 'rgba(255,170,60,0.55)') {
  glow(c, x, y, r * 9, halo, 1);
  glow(c, x, y, r * 3, 'rgba(255,220,140,0.8)', 1);
  c.fillStyle = core; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
}
function ridge(c, seed, x0, x1, base, amp, freq, col, sharp = false, step = 6) {
  c.beginPath(); c.moveTo(x0, base + 3000);
  for (let x = x0; x <= x1 + step; x += step) {
    let v = fbm(seed, x * freq);
    if (sharp) v = 1 - Math.abs(v * 2 - 1);
    c.lineTo(x, base - v * amp);
  }
  c.lineTo(x1 + step, base + 3000); c.closePath(); c.fillStyle = col; c.fill();
}
function sea(c, x0, x1, y0, y1, top, bot, t, shimmer = 'rgba(255,220,160,0.25)') {
  const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, top); g.addColorStop(1, bot);
  c.fillStyle = g; c.fillRect(x0, y0, x1 - x0, y1 - y0);
  const r = mulberry(77); c.strokeStyle = shimmer; c.lineWidth = 2;
  c.beginPath();
  for (let i = 0; i < 160; i++) {
    const yy = y0 + Math.pow(r(), 1.6) * (y1 - y0); const xx = x0 + r() * (x1 - x0);
    const len = 10 + (yy - y0) / (y1 - y0) * 60; const ph = Math.sin(t * 1.3 + i) * 12;
    c.moveTo(xx + ph, yy); c.lineTo(xx + ph + len, yy);
  }
  c.stroke();
}
function particles(c, seed, n, x0, y0, w, h, t, col, size, vx, vy) {
  const r = mulberry(seed); c.fillStyle = col;
  for (let i = 0; i < n; i++) {
    const px = x0 + ((r() * w + vx * t * (0.5 + r())) % w + w) % w;
    const py = y0 + ((r() * h + vy * t * (0.5 + r())) % h + h) % h;
    const s = size * (0.4 + r());
    c.globalAlpha = 0.3 + 0.7 * r();
    c.beginPath(); c.arc(px, py, s, 0, 7); c.fill();
  }
  c.globalAlpha = 1;
}
function embers(c, seed, n, t, a = 1) {
  const r = mulberry(seed);
  for (let i = 0; i < n; i++) {
    const sp = 40 + r() * 90, x0 = r() * W, ph = r() * 100;
    const y = H + 40 - ((t * sp + ph * 20) % (H + 80));
    const x = x0 + Math.sin(t * (0.5 + r()) + ph) * 40;
    c.globalAlpha = a * (0.4 + 0.6 * r()) * clamp(y / H, 0, 1);
    c.fillStyle = r() > 0.5 ? '#ffb347' : '#ff6a1a';
    c.beginPath(); c.arc(x, y, 1.5 + r() * 2.5, 0, 7); c.fill();
  }
  c.globalAlpha = 1;
}
function haze(c, y0, y1, col) {
  const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, col); g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g; c.fillRect(-W, y0, W * 4, y1 - y0);
}
function cam(c, cx, cy, z) { c.setTransform(z, 0, 0, z, W / 2 - cx * z, H / 2 - cy * z); }

// ---------- text
function txt(c, s, x, y, size, col, opt = {}) {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalAlpha = opt.a ?? 1;
  c.font = `${opt.w || 700} ${size}px ${opt.font || 'Cinzel'}`;
  c.textAlign = opt.align || 'center'; c.textBaseline = 'middle';
  c.letterSpacing = (opt.ls || 0) + 'px';
  if (opt.shadow !== false) { c.shadowColor = 'rgba(0,0,0,0.85)'; c.shadowBlur = opt.blur ?? 18; }
  if (opt.grad) {
    const g = c.createLinearGradient(0, y - size / 2, 0, y + size / 2);
    g.addColorStop(0, '#fff0b8'); g.addColorStop(0.45, P.gold); g.addColorStop(1, P.goldD); c.fillStyle = g;
  } else c.fillStyle = col;
  c.fillText(s, x, y);
  if (opt.stroke) { c.shadowBlur = 0; c.strokeStyle = opt.stroke; c.lineWidth = 1.5; c.strokeText(s, x, y); }
  c.restore();
}

// ---------- character drawing
function ik(sx, sy, tx, ty, L1, L2, sign) {
  let dx = tx - sx, dy = ty - sy; let d = Math.hypot(dx, dy); const md = (L1 + L2) * 0.999;
  if (d > md) { dx *= md / d; dy *= md / d; d = md; }
  const th = Math.atan2(dx, dy);
  const ph = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  const a = th + sign * ph;
  return [sx + L1 * Math.sin(a), sy + L1 * Math.cos(a), sx + dx, sy + dy];
}
function limb(c, x0, y0, x1, y1, x2, y2) { c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.lineTo(x2, y2); c.stroke(); }
function bronzeGrad(c, x0, y0, x1, y1) { const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, P.bronzeL); g.addColorStop(0.5, P.bronze); g.addColorStop(1, P.bronzeD); return g; }

function eye(c, x, y, w, h, tl, tr) {
  // flat-topped eye: tl / tr = height of top edge above centre (fraction of h)
  c.beginPath(); c.ellipse(x, y, w, h, 0, 0, Math.PI); c.lineTo(x - w, y - h * tl); c.lineTo(x + w, y - h * tr); c.closePath(); c.fill();
}
function eyes(c, hx, hy, mood, blink) {
  c.fillStyle = '#fff';
  const h = 0.2 * (blink ? 0.15 : 1);
  if (mood === 'angry') { eye(c, hx + 0.05, hy + 0.05, 0.24, h, 0.55, -0.15); eye(c, hx + 0.62, hy + 0.05, 0.2, h, -0.15, 0.5); }
  else if (mood === 'focused') { eye(c, hx + 0.05, hy + 0.05, 0.24, h * 0.8, 0.2, 0); eye(c, hx + 0.62, hy + 0.05, 0.2, h * 0.8, 0, 0.2); }
  else if (mood === 'surprised') { c.beginPath(); c.arc(hx + 0.05, hy, 0.24, 0, 7); c.arc(hx + 0.65, hy, 0.22, 0, 7); c.fill(); c.fillStyle = '#000'; c.beginPath(); c.arc(hx + 0.08, hy, 0.1, 0, 7); c.arc(hx + 0.67, hy, 0.09, 0, 7); c.fill(); }
  else { eye(c, hx + 0.05, hy + 0.05, 0.24, h, 0.75, 0.6); eye(c, hx + 0.62, hy + 0.05, 0.2, h, 0.6, 0.75); }
}
function spear(c, x0, y0, x1, y1, len = 1.1) {
  c.strokeStyle = P.wood; c.lineWidth = 0.17; c.lineCap = 'round';
  c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
  const a = Math.atan2(y1 - y0, x1 - x0);
  c.save(); c.translate(x1, y1); c.rotate(a);
  const g = c.createLinearGradient(0, -0.25, 0, 0.25); g.addColorStop(0, '#f4f7f9'); g.addColorStop(1, '#7f8a93');
  c.fillStyle = g; c.beginPath(); c.moveTo(-0.15, 0); c.quadraticCurveTo(len * 0.35, -0.32, len, 0); c.quadraticCurveTo(len * 0.35, 0.32, -0.15, 0); c.fill();
  c.restore();
}
function shieldSpartan(c, x, y, r, style) {
  c.fillStyle = bronzeGrad(c, x - r, y - r, x + r, y + r); c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
  const g = c.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r * 0.86);
  const face = style?.face || P.red, faceD = style?.faceD || P.redD;
  g.addColorStop(0, face); g.addColorStop(1, faceD); c.fillStyle = g; c.beginPath(); c.arc(x, y, r * 0.84, 0, 7); c.fill();
  c.strokeStyle = style?.emb || P.bronzeL; c.lineWidth = r * 0.16; c.lineCap = 'round'; c.lineJoin = 'round';
  if (!style || style.mark === 'lambda') { c.beginPath(); c.moveTo(x - r * 0.42, y + r * 0.45); c.lineTo(x, y - r * 0.5); c.lineTo(x + r * 0.42, y + r * 0.45); c.stroke(); }
  else if (style.mark === 'ring') { c.beginPath(); c.arc(x, y, r * 0.38, 0, 7); c.stroke(); }
  else if (style.mark === 'star') { c.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; c.moveTo(x, y); c.lineTo(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55); } c.stroke(); }
  else if (style.mark === 'bar') { c.beginPath(); c.moveTo(x - r * 0.5, y); c.lineTo(x + r * 0.5, y); c.stroke(); }
  c.strokeStyle = 'rgba(255,240,190,0.5)'; c.lineWidth = r * 0.05; c.beginPath(); c.arc(x, y, r * 0.95, -2.6, -1.2); c.stroke();
}
function shieldWicker(c, x, y, w, h) {
  c.fillStyle = '#8a6a3a'; c.beginPath(); c.roundRect(x - w / 2, y - h / 2, w, h, 0.3); c.fill();
  c.strokeStyle = 'rgba(60,40,15,0.7)'; c.lineWidth = 0.07; c.beginPath();
  for (let i = -h / 2 + 0.25; i < h / 2; i += 0.25) { c.moveTo(x - w / 2 + 0.1, y + i); c.lineTo(x + w / 2 - 0.1, y + i); } c.stroke();
  c.strokeStyle = P.red; c.lineWidth = 0.14; c.beginPath(); c.roundRect(x - w / 2, y - h / 2, w, h, 0.3); c.stroke();
}
function bow(c, x, y) {
  c.strokeStyle = '#5a3a1a'; c.lineWidth = 0.14; c.beginPath(); c.arc(x, y, 1.6, -1.2, 1.2); c.stroke();
  c.strokeStyle = 'rgba(230,230,210,0.7)'; c.lineWidth = 0.04; c.beginPath(); c.moveTo(x + 1.6 * Math.cos(-1.2), y + 1.6 * Math.sin(-1.2)); c.lineTo(x + 1.6 * Math.cos(1.2), y + 1.6 * Math.sin(1.2)); c.stroke();
}

// headgear drawn in head-local units (head radius 1, centre 0,0, facing +x)
function headgear(c, kind, o, t) {
  if (kind === 'spartan' || kind === 'greek') {
    const crest = o.crest ?? (kind === 'spartan' ? P.red : null);
    if (crest) {
      // crest: arc from forehead to back, bristly
      c.save();
      const sway = Math.sin(t * 3 + (o.x || 0)) * 0.08 * (o.wind ?? 1);
      c.fillStyle = crest; c.beginPath();
      c.moveTo(0.7, -0.75); c.bezierCurveTo(0.6, -2.0, -1.2, -2.2 + sway, -1.9, -0.7 + sway); c.bezierCurveTo(-1.3, -1.2, -0.3, -1.3, 0.7, -0.75); c.fill();
      c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 0.05; c.beginPath();
      for (let i = 0; i < 12; i++) { const u = i / 11; const bx = lerp(0.6, -1.7, u), by = -1.0 - Math.sin(u * Math.PI) * 0.75 + sway * u; c.moveTo(bx, by); c.lineTo(bx - 0.15, by + 0.45); } c.stroke();
      c.restore();
    }
    // helmet bowl + cheek guards (Corinthian), face slit left black
    c.fillStyle = bronzeGrad(c, -1, -1.2, 1, 1.2);
    c.beginPath(); c.arc(0, -0.05, 1.12, Math.PI * 0.95, Math.PI * 2.2); c.lineTo(0.95, 0.95); c.lineTo(0.55, 1.05); c.lineTo(0.5, 0.35); c.lineTo(-0.35, 0.3); c.lineTo(-0.3, 1.0); c.lineTo(-0.9, 0.9); c.closePath(); c.fill();
    c.fillStyle = P.black; c.beginPath(); c.moveTo(-0.3, -0.12); c.lineTo(1.12, -0.18); c.lineTo(1.12, 0.3); c.lineTo(0.55, 0.32); c.lineTo(0.5, 1.1); c.lineTo(0.2, 1.1); c.lineTo(0.18, 0.3); c.lineTo(-0.3, 0.28); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(255,235,170,0.55)'; c.lineWidth = 0.07; c.beginPath(); c.arc(0, -0.05, 1.0, -2.6, -1.2); c.stroke();
  } else if (kind === 'persian' || kind === 'immortal' || kind === 'messenger') {
    const capCol = o.cap || (kind === 'immortal' ? '#d9b25a' : '#8b5a2b');
    c.fillStyle = capCol; c.beginPath();
    c.moveTo(-1.05, 0.15); c.lineTo(-1.0, -0.6); c.bezierCurveTo(-1.0, -1.9, 0.4, -2.2, 0.85, -1.4); c.bezierCurveTo(1.1, -0.9, 1.05, -0.6, 1.0, -0.45); c.lineTo(-0.1, -0.5); c.lineTo(-0.3, 0.5); c.lineTo(-0.9, 1.1); c.closePath(); c.fill();
    c.fillStyle = P.gold; c.fillRect(-1.0, -0.62, 2.0, 0.18);
    if (kind === 'immortal') { c.fillStyle = P.red; c.beginPath(); c.arc(0.1, -1.25, 0.18, 0, 7); c.fill(); }
  } else if (kind === 'hood') {
    c.fillStyle = o.cap || '#4a3b2a'; c.beginPath(); c.moveTo(-1.2, 1.0); c.bezierCurveTo(-1.5, -1.2, 0.0, -2.6, 0.6, -1.8); c.bezierCurveTo(1.2, -1.2, 1.25, -0.3, 1.15, -0.2); c.lineTo(-0.2, -0.35); c.lineTo(-0.25, 0.55); c.closePath(); c.fill();
  } else if (kind === 'turban') {
    c.fillStyle = o.cap || '#e9e1cc';
    for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(-0.05, -0.55 - i * 0.32, 1.12 - i * 0.12, 0.42, -0.08, 0, 7); c.fill(); }
    c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 0.05; for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(-0.05, -0.55 - i * 0.32, 1.12 - i * 0.12, 0.42, -0.08, 0.2, 2.8); c.stroke(); }
  } else if (kind === 'pointed') {
    c.fillStyle = o.cap || '#5c4a2c'; c.beginPath(); c.moveTo(-1.1, 0.2); c.lineTo(-0.8, -1.0); c.lineTo(0.2, -2.9); c.lineTo(0.9, -0.9); c.lineTo(1.05, -0.4); c.lineTo(-0.2, -0.4); c.lineTo(-0.3, 0.6); c.closePath(); c.fill();
  } else if (kind === 'xerxes') {
    const g = c.createLinearGradient(0, -2.2, 0, -0.5); g.addColorStop(0, '#fff0a8'); g.addColorStop(1, P.goldD);
    c.fillStyle = g; c.beginPath(); c.moveTo(-0.95, -0.55); c.lineTo(-1.0, -1.7);
    for (let i = 0; i <= 6; i++) { const x = lerp(-1.0, 1.0, i / 6); c.lineTo(x, i % 2 ? -1.75 : -2.15); }
    c.lineTo(0.95, -0.55); c.closePath(); c.fill();
    c.fillStyle = P.red; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(-0.5 + i * 0.5, -1.15, 0.13, 0, 7); c.fill(); }
  }
}

// main figure. o: {x,y,s,face,kind,pose,ph,t,mood,spear,shield,cape,wind,view,lean,rot,thrust,col}
function fig(c, o) {
  const k = o.kind || 'spartan', t = o.t || 0, pose = o.pose || 'stand';
  c.save(); c.translate(o.x, o.y); if (o.rot) c.rotate(o.rot); c.scale(o.s * (o.face || 1), o.s);
  c.lineCap = 'round'; c.lineJoin = 'round';
  let hipX = 0, hipY = -3.2, lean = o.lean || 0;
  let fA = [-0.5, 0], fB = [0.5, 0]; // front/back foot targets
  const ph = o.ph || 0;
  let handF, handB;
  if (pose === 'walk' || pose === 'run') {
    const amp = pose === 'run' ? 1.55 : 0.85, lift = pose === 'run' ? 1.0 : 0.45;
    fA = [amp * Math.sin(ph), -lift * Math.max(0, Math.cos(ph))];
    fB = [amp * Math.sin(ph + Math.PI), -lift * Math.max(0, Math.cos(ph + Math.PI))];
    hipY = -3.2 + (pose === 'run' ? 0.35 : 0.12) * Math.abs(Math.sin(ph)) + (pose === 'run' ? 0.2 : 0);
    if (pose === 'run') lean += 0.35;
  } else if (pose === 'brace') { fA = [1.05, 0]; fB = [-1.15, 0]; hipY = -2.85; lean += 0.15; }
  else if (pose === 'kneel') { fA = [1.0, 0]; fB = [-1.5, 0]; hipY = -1.85; }
  else if (pose === 'sit') { fA = [1.25, 0]; fB = [1.55, 0]; hipY = -2.3; hipX = -0.4; }
  else if (pose === 'stand') { fA = [0.45, 0]; fB = [-0.45, 0]; }
  hipY += Math.sin(t * 1.7 + (o.x || 0) * 0.01) * 0.03; // breathing
  const lr = lean / 2.6;
  const neckX = hipX + lean, neckY = hipY - 2.6;
  const shX = hipX + lean * 0.88, shY = hipY - 2.3;
  const headX = hipX + lr * 3.75, headY = hipY - 3.75;
  // hands
  const swing = (pose === 'walk' || pose === 'run') ? Math.sin(ph) : 0;
  const hasSpear = o.spear ?? (k === 'spartan' || k === 'greek' || k === 'immortal' || k === 'persian');
  const hasShield = o.shield ?? (k === 'spartan' || k === 'greek' || k === 'immortal');
  handB = [shX - 0.2 + 0.0, shY + 1.6];
  if (hasShield) handB = [shX + 0.55, shY + 1.5];
  else if (pose === 'walk' || pose === 'run') handB = [shX - 1.0 * swing, shY + 2.2 - Math.abs(swing) * 0.3];
  else handB = [shX - 0.35, shY + 2.4];
  if (o.handB) handB = [shX + o.handB[0], shY + o.handB[1]];
  if (hasSpear) {
    if (o.thrust != null) handF = [shX + 1.2 + o.thrust * 1.3, shY - 0.6 + o.thrust * 0.2];
    else handF = [shX + 1.75, shY + 1.0];
  } else if (pose === 'walk' || pose === 'run') handF = [shX + 1.0 * swing, shY + 2.2 - Math.abs(swing) * 0.3];
  else handF = [shX + 0.35, shY + 2.4];
  if (o.handF) handF = [shX + o.handF[0], shY + o.handF[1]];
  if (pose === 'sit') { handF = [shX + 1.3, shY + 1.6]; handB = [shX + 1.0, shY + 1.8]; }
  const lw = 0.55;
  const robeLong = (k === 'persian' || k === 'immortal' || k === 'messenger' || k === 'xerxes' || k === 'hood' || k === 'turban' || k === 'pointed');
  const back = o.view === 'back';

  // --- cape (behind)
  if ((o.cape ?? (k === 'spartan' || k === 'xerxes')) && !back) {
    const w = o.wind ?? 1; const f1 = Math.sin(t * 2.2 + 1) * 0.35 * w, f2 = Math.sin(t * 2.9) * 0.3 * w;
    const len = pose === 'sit' ? 0.7 : (k === 'xerxes' ? 0.5 : 0);
    c.save(); c.translate(hipX, hipY); c.transform(1, 0, -lr, 1, 0, 0);
    const g = c.createLinearGradient(0, -2.6, -2, 2); g.addColorStop(0, k === 'xerxes' ? '#7a1a4a' : P.redL); g.addColorStop(1, k === 'xerxes' ? '#3a0820' : P.redD);
    c.fillStyle = g; c.beginPath(); c.moveTo(0.45, -2.6);
    c.bezierCurveTo(-0.9, -2.3 + f1 * 0.3, -1.6 * w - 0.4, -0.6 + f1, -2.3 * w - 0.5 + f2, 2.2 + f1 * 0.6 - len);
    c.lineTo(-0.8 * w - 0.3 + f2 * 0.6, 2.7 - len + f2 * 0.3);
    c.bezierCurveTo(-0.6, 1.2, -0.1, -0.8, 0.45, -2.6); c.fill();
    c.restore();
  }
  // --- back arm
  c.strokeStyle = P.black; c.lineWidth = lw;
  let [ex, ey, hx, hy] = ik(shX, shY, handB[0], handB[1], 1.3, 1.3, -1);
  if (!back) { limb(c, shX, shY, ex, ey, hx, hy); c.fillStyle = P.black; c.beginPath(); c.arc(hx, hy, 0.36, 0, 7); c.fill(); }
  const handBpos = [hx, hy];
  // --- legs
  const legs = [fB, fA];
  for (const f of legs) {
    const [kx, ky, fx, fy] = ik(hipX, hipY, f[0], f[1], 1.65, 1.65, 1);
    c.strokeStyle = P.black; c.lineWidth = lw; limb(c, hipX, hipY, kx, ky, fx, fy);
    c.fillStyle = P.black; c.beginPath(); c.ellipse(fx + 0.22, fy - 0.12, 0.42, 0.2, 0, 0, 7); c.fill();
    if (k === 'spartan' || k === 'greek') { // greaves
      c.strokeStyle = P.bronze; c.lineWidth = lw * 0.85; c.beginPath(); c.moveTo(lerp(kx, fx, 0.12), lerp(ky, fy, 0.12)); c.lineTo(lerp(kx, fx, 0.8), lerp(ky, fy, 0.8)); c.stroke();
    }
  }
  // --- torso + costume
  c.strokeStyle = P.black; c.lineWidth = lw * 1.1; c.beginPath(); c.moveTo(hipX, hipY); c.lineTo(neckX, neckY); c.stroke();
  c.save(); c.translate(hipX, hipY); c.transform(1, 0, -lr, 1, 0, 0);
  if (k === 'spartan' || k === 'greek') {
    const tunic = o.col || P.red;
    c.fillStyle = tunic; c.beginPath(); c.moveTo(-0.72, -0.35); c.lineTo(0.72, -0.35); c.lineTo(0.95, 0.75); c.lineTo(-0.95, 0.75); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 0.05; c.beginPath(); for (let i = -2; i <= 2; i++) { c.moveTo(i * 0.3, -0.3); c.lineTo(i * 0.38, 0.75); } c.stroke();
    c.fillStyle = bronzeGrad(c, -0.8, -2.6, 0.8, 0); c.beginPath(); c.moveTo(-0.8, -2.55); c.quadraticCurveTo(0, -2.8, 0.82, -2.55); c.lineTo(0.7, -0.2); c.lineTo(-0.7, -0.2); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(90,55,15,0.8)'; c.lineWidth = 0.06; c.beginPath(); c.moveTo(-0.4, -1.9); c.quadraticCurveTo(0, -1.6, 0.45, -1.9); c.moveTo(0, -1.5); c.lineTo(0, -0.5); c.stroke();
  } else if (robeLong) {
    const robe = o.col || (k === 'xerxes' ? '#5a1838' : k === 'immortal' ? '#7a4f1f' : P.brown);
    const hem = k === 'xerxes' ? 2.95 : 1.55;
    const g = c.createLinearGradient(-1, 0, 1, 0); g.addColorStop(0, robe); g.addColorStop(1, shade(robe, -0.35));
    c.fillStyle = g; c.beginPath(); c.moveTo(-0.75, -2.65); c.quadraticCurveTo(0, -2.85, 0.75, -2.65); c.lineTo(1.15, hem); c.lineTo(-1.15, hem); c.closePath(); c.fill();
    c.fillStyle = P.gold; c.fillRect(-1.15, hem - 0.22, 2.3, 0.22); c.fillRect(-0.09, -2.7, 0.18, hem + 2.5);
    if (k === 'immortal' || k === 'xerxes') { c.fillStyle = 'rgba(240,200,90,0.5)'; for (let yy = -2.2; yy < hem - 0.4; yy += 0.55) for (let xx = -0.7; xx < 0.8; xx += 0.5) { c.beginPath(); c.arc(xx + (yy * 3 % 0.5), yy, 0.07, 0, 7); c.fill(); } }
    c.fillStyle = o.sash || P.red; c.fillRect(-0.85, -0.25, 1.7, 0.3);
  }
  c.restore();
  // --- back view cape (covers body)
  if (back && (o.cape ?? true)) {
    const w = o.wind ?? 1; const f1 = Math.sin(t * 2.2) * 0.25 * w;
    const g = c.createLinearGradient(0, shY, 0, 0); g.addColorStop(0, P.redL); g.addColorStop(1, P.redD);
    c.fillStyle = g; c.beginPath(); c.moveTo(-2.0 + f1, 0.7); c.bezierCurveTo(-2.3, -2.0, -1.8, shY - 0.4, shX, shY - 0.45); c.bezierCurveTo(1.8, shY - 0.4, 2.3, -2.0, 2.0 + f1, 0.7); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 0.08; c.beginPath(); for (let i = -2; i <= 2; i++) { c.moveTo(i * 0.35, shY + 0.4); c.quadraticCurveTo(i * 0.6, -1.5, i * 0.8 + f1 * 0.5, 0.6); } c.stroke();
  }
  // --- spear (behind shield)
  let handFpos;
  {
    [ex, ey, hx, hy] = ik(shX, shY, handF[0], handF[1], 1.3, 1.3, -1);
    handFpos = [hx, hy, ex, ey];
    if (hasSpear && !back) {
      if (o.thrust != null) { const a = 0.08; spear(c, hx - 3.8 * Math.cos(a), hy - 3.8 * Math.sin(a), hx + 5.2 * Math.cos(a), hy + 5.2 * Math.sin(a)); }
      else { const tilt = o.spearTilt ?? 0.06; spear(c, hx - Math.sin(tilt) * 3.6, hy + 3.6 * Math.cos(tilt), hx + Math.sin(tilt) * 6.2, hy - 6.2 * Math.cos(tilt)); }
    }
  }
  // --- head
  c.fillStyle = P.black; c.beginPath(); c.arc(headX, headY, 1, 0, 7); c.fill();
  c.save(); c.translate(headX, headY);
  if (back) {
    if (k === 'spartan') {
      c.fillStyle = P.red; c.beginPath(); c.ellipse(0, -1.25, 0.32, 1.0, 0, 0, 7); c.fill();
      c.fillStyle = bronzeGrad(c, -1, -1, 1, 1); c.beginPath(); c.arc(0, -0.05, 1.12, Math.PI * 0.9, Math.PI * 2.1); c.lineTo(1.0, 0.9); c.lineTo(-1.0, 0.9); c.closePath(); c.fill();
    }
  } else {
    headgear(c, k === 'xerxes' ? 'xerxes' : (o.hat || k), o, t);
    const blink = ((t + (o.x || 0) * 0.003) % 4.3) < 0.12;
    eyes(c, k === 'spartan' || k === 'greek' ? 0.35 : 0.25, k === 'spartan' || k === 'greek' ? 0.04 : 0.0, o.mood || 'normal', blink);
  }
  c.restore();
  // --- front arm
  c.strokeStyle = P.black; c.lineWidth = lw;
  if (!back) { limb(c, shX, shY, handFpos[2], handFpos[3], handFpos[0], handFpos[1]);
  c.fillStyle = P.black; c.beginPath(); c.arc(handFpos[0], handFpos[1], 0.36, 0, 7); c.fill(); }
  if (o.scroll) { c.fillStyle = '#e8d9a8'; c.fillRect(handFpos[0] - 0.1, handFpos[1] - 0.9, 0.35, 1.3); c.fillStyle = '#b8a070'; c.fillRect(handFpos[0] - 0.15, handFpos[1] - 0.95, 0.45, 0.15); }
  if (o.bowl) { c.fillStyle = '#7a5530'; c.beginPath(); c.ellipse(handFpos[0] + 0.3, handFpos[1] - 0.2, 0.9, 0.3, 0, 0, Math.PI); c.fill(); c.fillStyle = '#5b3a1e'; c.beginPath(); c.ellipse(handFpos[0] + 0.3, handFpos[1] - 0.25, 0.75, 0.35, 0, Math.PI, 0); c.fill(); }
  if (o.jar) { const jx = handBpos[0] + 0.4, jy = handBpos[1]; c.fillStyle = '#b06a3a'; c.beginPath(); c.ellipse(jx, jy, 0.5, 0.65, 0, 0, 7); c.fill(); c.fillRect(jx - 0.2, jy - 1.0, 0.4, 0.5); c.fillStyle = '#5fb6e6'; c.beginPath(); c.ellipse(jx, jy - 1.0, 0.2, 0.08, 0, 0, 7); c.fill(); }
  // --- shield (front)
  if (hasShield && !back) {
    if (k === 'immortal') shieldWicker(c, handBpos[0] + 0.3, handBpos[1] - 0.6, 1.9, 3.0);
    else shieldSpartan(c, handBpos[0] + 0.15, handBpos[1] - 0.5, 1.75, o.shieldStyle);
  }
  if (o.bow) bow(c, shX - 0.8, shY + 0.6);
  c.restore();
}
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const f = amt < 0 ? 0 : 255, p = Math.abs(amt);
  r = Math.round((f - r) * p + r); g = Math.round((f - g) * p + g); b = Math.round((f - b) * p + b);
  return `rgb(${r},${g},${b})`;
}

// ---------- crowds: tiny batched figures (front-facing, used for armies)
// rows: array of {y, s, xs:[...], cols:[...]}; style: 'persian'|'greek'|'spartan'
const _crowds = {};
function buildCrowd(key, opt) {
  if (_crowds[key]) return _crowds[key];
  const r = mulberry(opt.seed || 5); const rows = [];
  let z = opt.zNear || 1.3;
  while (z < (opt.zFar || 8)) {
    const s = opt.k / z; const y = opt.horizon + opt.depth / z;
    const sp = s * (opt.spacing || 3.2); const xs = [], cols = [], jit = [];
    for (let x = opt.x0 + r() * sp; x < opt.x1; x += sp * (0.8 + r() * 0.4)) { xs.push(x); cols.push(Math.floor(r() * 3)); jit.push(r()); }
    rows.unshift({ y, s, xs, cols, jit, z });
    z *= 1 + (opt.rowStep || 0.045);
  }
  return (_crowds[key] = rows);
}
function drawCrowd(c, rows, t, opt) {
  const palette = opt.palette || ['#6b4423', '#9a7a2a', '#8e2a1e'];
  const capCol = opt.cap || '#a0773a';
  const rise = opt.rise ?? 1, march = opt.march || 0;
  for (const row of rows) {
    const s = row.s; const robes = [new Path2D(), new Path2D(), new Path2D()];
    const bodies = new Path2D(), heads = new Path2D(), spears = new Path2D(), tips = new Path2D(), caps = new Path2D();
    const rowRise = clamp(rise * 1.6 - (row.z - 1.3) / 7 * 0.6, 0, 1);
    for (let i = 0; i < row.xs.length; i++) {
      const j = row.jit[i];
      let x = row.xs[i] + march * s;
      if (opt.wrap) { x = ((x - opt.wrap[0]) % (opt.wrap[1] - opt.wrap[0]) + (opt.wrap[1] - opt.wrap[0])) % (opt.wrap[1] - opt.wrap[0]) + opt.wrap[0]; }
      const step = opt.walk ? Math.sin(t * 6 + j * 6.28) : 0;
      const y = row.y - Math.abs(step) * s * 0.25;
      const hy = y - 7 * s;
      heads.moveTo(x + s, hy); heads.arc(x, hy, s, 0, 7);
      bodies.moveTo(x, hy + s); bodies.lineTo(x, y - 3.2 * s);
      bodies.moveTo(x, y - 3.2 * s); bodies.lineTo(x - 0.6 * s + step * s * 0.6, y);
      bodies.moveTo(x, y - 3.2 * s); bodies.lineTo(x + 0.6 * s - step * s * 0.6, y);
      const rb = robes[row.cols[i]];
      if (opt.style === 'greek' || opt.style === 'spartan') {
        rb.moveTo(x + 1.6 * s, y - 4.2 * s); rb.arc(x + 0.2 * s, y - 4.2 * s, 1.6 * s, 0, 7); // shield
        caps.moveTo(x + 1.1 * s, hy); caps.arc(x, hy - 0.1 * s, 1.1 * s, Math.PI, 0);
      } else {
        rb.moveTo(x - 0.8 * s, y - 5.8 * s); rb.lineTo(x + 0.8 * s, y - 5.8 * s); rb.lineTo(x + 1.2 * s, y - 1.6 * s); rb.lineTo(x - 1.2 * s, y - 1.6 * s); rb.closePath();
        caps.moveTo(x - 1.05 * s, hy - 0.3 * s); caps.quadraticCurveTo(x - 0.9 * s, hy - 2.6 * s, x + 0.95 * s, hy - 0.6 * s); caps.closePath();
      }
      if (opt.spears !== false && j < (opt.spearFrac ?? 0.8)) {
        const ang = lerp(1.0, 0.04, ss(0, 1, rowRise * 1.2 - j * 0.2));
        const bx = x + 1.5 * s, by = y - 2 * s, len = 12 * s;
        const tx = bx + Math.sin(ang) * len, ty = by - Math.cos(ang) * len;
        spears.moveTo(bx, by); spears.lineTo(tx, ty);
        tips.moveTo(tx, ty); tips.lineTo(tx + Math.sin(ang) * 1.6 * s, ty - Math.cos(ang) * 1.6 * s);
      }
    }
    c.lineCap = 'round';
    c.strokeStyle = P.wood; c.lineWidth = Math.max(0.6, s * 0.28); c.stroke(spears);
    c.strokeStyle = '#d8dde2'; c.lineWidth = Math.max(0.8, s * 0.5); c.stroke(tips);
    c.strokeStyle = P.black; c.lineWidth = Math.max(0.7, s * 0.55); c.stroke(bodies);
    for (let q = 0; q < 3; q++) { c.fillStyle = palette[q]; c.fill(robes[q]); }
    c.fillStyle = P.black; c.fill(heads);
    c.fillStyle = capCol; c.fill(caps);
    if (opt.fog) { c.fillStyle = opt.fog; c.globalAlpha = clamp((row.z - 1.3) / 6.5, 0, 0.85); c.fillRect(opt.x0, row.y - 14 * s, opt.x1 - opt.x0, 14 * s + 2); c.globalAlpha = 1; }
  }
}
// far-away mass of soldiers as texture
function armyMass(c, seed, x0, x1, y0, y1, t, col, spearCol, opt = {}) {
  c.fillStyle = col; c.fillRect(x0, y0, x1 - x0, y1 - y0);
  const r = mulberry(seed); c.strokeStyle = spearCol; c.lineWidth = 1;
  c.beginPath();
  const n = opt.n || 2500;
  for (let i = 0; i < n; i++) {
    const u = r(); const y = y0 + Math.pow(u, 1.5) * (y1 - y0); const x = x0 + r() * (x1 - x0) + (opt.march || 0) * (0.5 + u);
    const h = 3 + u * 14; const ang = lerp(0.9, 0.05, clamp((opt.rise ?? 1) * 1.5 - r() * 0.5, 0, 1));
    c.moveTo(x, y); c.lineTo(x + Math.sin(ang) * h, y - Math.cos(ang) * h);
  }
  c.stroke();
  c.fillStyle = 'rgba(0,0,0,0.6)'; c.beginPath();
  for (let i = 0; i < n * 0.6; i++) { const u = r(); const y = y0 + Math.pow(u, 1.5) * (y1 - y0); const x = x0 + r() * (x1 - x0); c.moveTo(x, y); c.arc(x, y, 0.8 + u * 2, 0, 7); }
  c.fill();
}
function banner(c, x, y, h, col, t, ph = 0) {
  c.strokeStyle = P.wood; c.lineWidth = h * 0.02; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - h); c.stroke();
  c.fillStyle = col; c.beginPath(); c.moveTo(x, y - h);
  for (let i = 0; i <= 8; i++) { const u = i / 8; c.lineTo(x + u * h * 0.35, y - h + Math.sin(t * 3 + u * 4 + ph) * h * 0.03 * u); }
  for (let i = 8; i >= 0; i--) { const u = i / 8; c.lineTo(x + u * h * 0.35, y - h * 0.72 + Math.sin(t * 3 + u * 4 + ph) * h * 0.03 * u); }
  c.closePath(); c.fill();
  c.fillStyle = P.gold; c.beginPath(); c.arc(x + h * 0.15, y - h * 0.86, h * 0.05, 0, 7); c.fill();
}
