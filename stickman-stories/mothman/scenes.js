// Stickman Stories — THE MOTHMAN. Scene timeline (times come from narration timeline)
const LN = TL.lines; const S0 = i => LN[i].start - 0.12; const MID = (i, f) => LN[i].start + (LN[i].end - LN[i].start) * f;
const ENDT = TL.narration_end + 8.0;
const SC = [];
// sc(start, draw(c,u,d,t), opt{card, mood, moon, dark, sub})
function sc(start, draw, opt = {}) { SC.push({ start, draw, ...opt }); }

// shared: night road
function nightRoad(c, u, t, carX, opt = {}) {
  bg(c, 0.25); moon(c);
  treeLine(c, 1180, 11, '#121a33', 300); treeLine(c, 1200, 12, '#0a1022', 220);
  if (opt.eyes) glowEyes(c, opt.ex ?? 300, opt.ey ?? 1000, 46, 11, opt.eyes, Math.sin(t * 5) * 0.4);
  road(c, 1190, t, opt.roadSpeed ?? 300);
  car(c, carX, 1340, 0.9, t, { speed: opt.speed, people: opt.people });
}
// ------------------------------------------------------------- 01 HOOK
sc(0, (c, u, d, t) => { nightRoad(c, u, t, lerp(-350, 470, ease(u / 2.0)), {}); }, { card: 'A dark road…', mood: 'normal' });
sc(S0(1), (c, u, d, t) => {
  nightRoad(c, u, t, 470 + Math.sin(u * 8) * 3, { eyes: ss(0.9, 1.8, u), ex: 210, ey: 1010, speed: u > 2.2 });
}, { card: 'SOMETHING WAS\nFOLLOWING THEM…', hi: true, size: 50, mood: u => u > 1.5 ? 'shocked' : 'normal' });
sc(S0(2), (c, u, d, t) => {
  bg(c); moon(c);
  paper(c, 540, 900, 560, 720, -0.05, 21, '#2c1d1d');
  c.save(); c.translate(540, 900); c.rotate(-0.05); text(c, 'TALES OF', 0, -250, 44, '#e9d9b0', { f: 'Elite' }); text(c, 'HORROR', 0, -170, 104, '#e9d9b0');
  mothman(c, 0, 300, 0.55, t, { sil: true, spread: 0.6, eyes: 1 }); c.restore();
  stamp(c, 'REAL REPORTS', 560, 1160, -0.22, ss(0.6, 0.9, u), 70);
}, { card: 'Not just a\nhorror story', hi: true, mood: 'worried' });
sc(S0(3), (c, u, d, t) => {
  bg(c); moon(c); folder(c, 540, 900, 1.25, 0.04, 'THE\nMOTHMAN', ss(0, 0.4, u));
  tag(c, 'AMERICA · CREATURE MYSTERY', 540, 1260, -0.03, ss(0.7, 1.0, u), { size: 32 });
}, { card: 'Case file: the Mothman', mood: 'search' });
// ------------------------------------------------------------- 02 PLACE & DATE
sc(S0(4), (c, u, d, t) => {
  bg(c); moon(c);
  const a = ss(0, 0.25, u); c.save(); c.translate(540, 900); const k = lerp(2.4, 1, back(a)); c.scale(k, k); c.globalAlpha = clamp(a * 3, 0, 1);
  paper(c, 0, 0, 620, 300, -0.04, 66); text(c, '1966', 0, 10, 220, C.red, { stroke: '#2a0805', sw: 6 }); c.restore();
}, { card: 'The year…', mood: 'normal' });
sc(S0(5), (c, u, d, t) => {
  bg(c); moon(c);
  const z = ease(ss(0.2, 1.9, u)); const sc0 = lerp(17, 120, z);
  const px = lerp(540, 540 - (-82.14 + 96) * 0.79 * 120 + 0, z), py = lerp(880, 900 + (38.84 - 38) * 120, z);
  c.save(); c.beginPath(); c.rect(60, 520, 960, 800); c.clip(); c.fillStyle = '#2a4a6a'; c.fillRect(60, 520, 960, 800);
  const P = usMap(c, px, py, sc0, { wv: ss(1.0, 1.6, u) }); const pp = P([-82.14, 38.84]);
  mapPin(c, pp[0], pp[1], ss(1.7, 2.0, u)); c.restore();
  c.save(); c.strokeStyle = '#efe3c4'; c.lineWidth = 14; c.strokeRect(60, 520, 960, 800); c.restore();
  tag(c, 'WEST VIRGINIA', 300, 1250, -0.05, ss(1.2, 1.5, u)); tag(c, 'POINT PLEASANT', 720, 600, 0.04, ss(1.8, 2.1, u), { size: 36, col: C.redD });
}, { card: 'Point Pleasant, 1966', mood: 'point' });
sc(S0(6), (c, u, d, t) => {
  bg(c); moon(c);
  calendar(c, 300, 780, 1.05, 'NOV', '15', '1966', ss(0, 0.3, u), -0.07);
  c.save(); c.translate(640, 1150); c.rotate(0.03); car(c, 0, 0, 0.62, t, { people: true, beam: false }); c.restore();
  tag(c, 'TWO YOUNG COUPLES', 700, 1230, 0.03, ss(0.9, 1.2, u));
  photo(c, 'local_map', 760, 700, 330, 330, 0.08, 'local map (today)', ss(1.6, 2.0, u), { fx: 0.55, fy: 0.15, zoom: 1.2 });
}, { card: 'November 15', mood: 'normal' });
sc(MID(6, 0.5), (c, u, d, t) => {
  bg(c, 0.2); moon(c);
  igloo(c, 220, 1240, 0.9); igloo(c, 880, 1250, 1.0);
  factory(c, 600, 1220, 1.05 + u * 0.02, {});
  tag(c, 'TNT AREA', 330, 700, -0.06, ss(1.3, 1.6, u), { size: 44, col: C.redD });
  tag(c, 'WWII EXPLOSIVES PLANT (ABANDONED)', 540, 1340, 0.02, ss(0.5, 0.8, u), { size: 28 });
  tag(c, 'ILLUSTRATION', 900, 590, 0.05, 1, { size: 22 });
}, { card: 'The TNT Area', mood: 'normal' });
sc(S0(7), (c, u, d, t) => {
  bg(c, 0.45); moon(c);
  factory(c, 640, 1150, 0.9, {}); road(c, 1190, t, 120); car(c, lerp(120, 300, ease(u / 1.5)), 1340, 0.8, t, {});
}, { card: 'Something strange…', mood: 'worried' });
sc(S0(8), (c, u, d, t) => {
  bg(c, 0.5); moon(c);
  factory(c, 640, 1150, 0.9, {});
  mothman(c, 820, 1170, lerp(0.42, 0.46, u / d), t, { spread: 0.05, eyes: ss(0.3, 0.8, u) });
  road(c, 1190, t, 0); car(c, 300, 1340, 0.8, t, { spin: 0 });
  redCircle(c, 820, 1000, 150, 230, ss(1.1, 1.7, u));
}, { card: 'A huge figure', mood: 'shocked' });
sc(S0(9), (c, u, d, t) => {
  bg(c, 0.3); moon(c);
  const sp = ss(1.6, 2.6, u);
  mothman(c, 540, 1350, lerp(0.95, 1.02, u / d), t, { spread: sp, eyes: 1 });
  tag(c, 'ALMOST HUMAN', 230, 1130, -0.06, ss(0.4, 0.7, u)); arrow(c, 300, 1100, 440, 1060, ss(0.5, 0.9, u));
  tag(c, 'ENORMOUS WINGS', 820, 620, 0.05, ss(1.9, 2.2, u)); arrow(c, 820, 660, 840, 800, ss(2.0, 2.4, u));
  tag(c, 'GLOWING RED EYES', 300, 700, -0.04, ss(3.0, 3.3, u)); arrow(c, 330, 740, 470, 900, ss(3.1, 3.5, u));
  tag(c, "ARTIST'S RECONSTRUCTION", 540, 1395, 0, 1, { size: 24, bg: '#d9c89f' });
}, { card: 'Almost human…', mood: 'shocked' });
// ------------------------------------------------------------- 03 THE CHASE
sc(S0(10), (c, u, d, t) => { nightRoad(c, u, t, 430, { speed: true, roadSpeed: 1600 }); }, { card: 'They accelerated!', mood: 'shocked' });
sc(S0(11), (c, u, d, t) => {
  if (u < 2.2) {
    nightRoad(c, u, t, 640, { speed: true, roadSpeed: 1800 });
    mothman(c, lerp(-200, 260, ease(u / 1.4)), 1010 + Math.sin(u * 4) * 20, 0.34, t, { spread: 1, flap: true, fly: true });
    tag(c, 'WITNESS ACCOUNT', 760, 640, 0.04, ss(0.5, 0.8, u));
  } else {
    bg(c); moon(c);
    photo(c, 'car_painting', 540, 960, 860, 414, -0.03, "artist's impression", ss(2.2, 2.6, u));
    tag(c, 'THEY SAID: UP TO 100 MPH', 540, 1280, 0.03, ss(2.7, 3.0, u), { col: C.redD });
  }
}, { card: 'It followed\ntheir car', hi: true, mood: 'shocked' });
sc(S0(12), (c, u, d, t) => {
  bg(c); moon(c);
  typedReport(c, 580, 1000, 740, 520, 0.03, ['MASON COUNTY SHERIFF', 'REPORT: winged figure,', '"red eyes", followed car', 'near TNT Area.', 'Witnesses: 4'], ss(0.3, 2.2, u));
  c.save(); c.globalAlpha = ss(0, 0.3, u); badge(c, 200, 650, lerp(1.4, 1, back(ss(0, 0.35, u)))); c.restore();
}, { card: 'Reported to police', mood: 'search' });
sc(S0(13), (c, u, d, t) => {
  bg(c); moon(c);
  photo(c, 'local_map', 540, 960, 820, 780, 0.02, 'local map (today)', ss(0, 0.3, u), { fx: 0.5, fy: 0.4 });
  const r = rnd(8); for (let i = 0; i < 9; i++) { const px = 250 + r() * 580, py = 650 + r() * 600; mapPin(c, px, py, ss(0.5 + i * 0.25, 0.8 + i * 0.25, u)); }
  tag(c, 'MORE SIGHTINGS', 540, 1350, -0.03, ss(0.8, 1.1, u), { size: 40, col: C.redD });
}, { card: 'More encounters', mood: 'worried' });
sc(S0(14), (c, u, d, t) => {
  bg(c, 0.2); moon(c);
  treeLine(c, 1300, 21, '#0f1830', 520); treeLine(c, 1330, 22, '#08101f', 400);
  mothman(c, lerp(1200, -200, u / d), 760 + Math.sin(u * 3) * 30, 0.36, t, { spread: 1, flap: true, fly: true });
  tag(c, 'ABOVE THE TREES', 540, 1340, 0.03, ss(0.4, 0.7, u));
}, { card: 'Above the trees', mood: 'normal' });
sc(S0(15), (c, u, d, t) => {
  bg(c, 0.3); moon(c);
  factory(c, 520, 1180, 0.85, {});
  mothman(c, 400, 860 - 2, 0.3, t, { spread: 0.1, eyes: 1 });
  road(c, 1190, t, 0);
  c.save(); c.translate(900, 1190); c.fillStyle = '#4a4a4a'; c.fillRect(-6, -230, 12, 230); c.fillStyle = '#e9b44c'; c.beginPath(); c.moveTo(0, -330); c.lineTo(70, -260); c.lineTo(0, -190); c.lineTo(-70, -260); c.closePath(); c.fill(); outline(c, 5); text(c, '!', 0, -258, 70, '#1d1a17'); c.restore();
  tag(c, 'ROADS', 860, 1260, 0.04, ss(0.3, 0.6, u)); tag(c, 'ABANDONED BUILDINGS', 430, 1300, -0.03, ss(1.3, 1.6, u));
}, { card: 'Roads & ruins', mood: 'worried' });
// ------------------------------------------------------------- 04 NEWSPAPERS & NAME
sc(S0(16), (c, u, d, t) => {
  bg(c); moon(c);
  const z = lerp(1.0, 1.45, u / d);
  photo(c, 'newspapers', 540, 940, 900, 760, -0.025, 'real newspaper clippings, 1966–67', ss(0, 0.3, u), { zoom: z, fx: lerp(0.2, 0.75, u / d), fy: lerp(0.1, 0.6, u / d), capSize: 28 });
  redCircle(c, 330, 680, 200, 90, ss(1.4, 2.0, u));
}, { card: 'In the newspapers', mood: 'search' });
sc(S0(17), (c, u, d, t) => {
  bg(c); moon(c);
  photo(c, 'ink_mothman', 540, 980, 800, 474, 0.03, "artist's impression", ss(0, 0.3, u), { pin: false });
}, { card: 'People gave it\na name…', mood: 'thinking', size: 50 });
sc(S0(18), (c, u, d, t) => {
  bg(c, 0.2); moon(c);
  photo(c, 'ink_mothman', 540, 1050, 800, 474, 0.03, "artist's impression", 1, { pin: false });
  const a = ss(0, 0.2, u); c.save(); c.translate(540, 720); c.rotate(-0.05); const k = lerp(2.2, 1, back(a)); c.scale(k, k); c.globalAlpha = clamp(a * 3, 0, 1);
  paper(c, 0, 0, 900, 220, 0, 99); text(c, 'THE MOTHMAN', 0, 8, 120, C.red, { stroke: '#2a0805', sw: 5 }); c.restore();
}, { mood: 'shocked' });
// ------------------------------------------------------------- 05 THE BRIDGE
sc(S0(19), (c, u, d, t) => {
  bg(c, ss(0, 1.2, u) * 0.6); moon(c, 930, 170, 46, 1 - ss(0, 1.2, u) * 0.7);
  c.save(); c.globalAlpha = 0.7; bridgeScene(c, t, 0); c.restore();
  c.fillStyle = `rgba(5,8,18,${ss(0, 1.5, u) * 0.5})`; c.fillRect(0, 0, W, H);
}, { card: 'A darker turn', mood: 'worried' });
sc(S0(20), (c, u, d, t) => {
  bg(c); moon(c);
  photo(c, 'silver_bridge_aerial', 540, 900, 880, 500, -0.02, 'historical photo · Silver Bridge area', ss(0, 0.3, u), { bw: true, zoom: lerp(1, 1.15, u / 3.5), fx: 0.45, fy: 0.5, capSize: 26 });
  calendar(c, 840, 1330, 0.75, 'DEC', '15', '1967', ss(0.4, 0.8, u), 0.06);
  redCircle(c, 560, 870, 260, 80, ss(1.8, 2.5, u));
  tag(c, 'SILVER BRIDGE', 300, 1260, -0.05, ss(2.2, 2.5, u), { size: 36, col: C.redD });
}, { card: 'December 15, 1967', mood: 'normal' });
sc(MID(20, 0.62), (c, u, d, t) => {
  bg(c, 0.3);
  c.save(); const sh = u > 0.4 && u < 1.6 ? Math.sin(u * 60) * 6 * (1 - ss(0.4, 1.6, u)) : 0; c.translate(sh, sh * 0.6);
  bridgeScene(c, t, ss(0.3, 2.2, u)); c.restore();
  tag(c, 'ILLUSTRATION', 900, 520, 0.05, 1, { size: 22 });
  tag(c, 'OHIO RIVER · FREEZING', 540, 1350, 0.02, ss(1.6, 1.9, u));
}, { card: 'The bridge collapsed', mood: 'shocked' });
sc(S0(21), (c, u, d, t) => {
  bg(c, 0.55);
  candle(c, 540, 1300, t);
  const a = ss(0.1, 0.5, u); text(c, '46', 540, 860, lerp(200, 260, a), `rgba(246,239,210,${a})`, { stroke: `rgba(10,12,20,${a})`, sw: 10 });
  text(c, 'LIVES LOST', 540, 1020, 56, `rgba(246,239,210,${ss(0.4, 0.8, u)})`, { f: 'Elite', ls: 10 });
}, { card: '', mood: 'worried', noCard: true });
sc(S0(22), (c, u, d, t) => {
  bg(c); moon(c);
  photo(c, 'ink_mothman', 300, 760, 420, 300, -0.07, 'the Mothman', ss(0, 0.3, u), { capSize: 26 });
  photo(c, 'silver_bridge_aerial', 760, 1180, 440, 260, 0.06, 'the bridge', ss(0.4, 0.7, u), { bw: true, capSize: 26 });
  const p = ss(1.0, 2.2, u); if (p > 0) { c.save(); c.strokeStyle = '#d6312b'; c.lineWidth = 6; c.beginPath(); c.moveTo(300, 600); const ex = lerp(300, 760, p), ey = lerp(600, 1030, p); c.quadraticCurveTo(620, 720, ex, ey); c.stroke(); c.restore(); pin(c, 300, 600); if (p >= 1) pin(c, 760, 1030); }
  tag(c, 'CONNECTED?', 650, 640, 0.06, ss(2.2, 2.5, u), { size: 44, col: C.redD });
}, { card: 'Some connected them', mood: 'thinking' });
sc(S0(23), (c, u, d, t) => {
  bg(c, 0.45); moon(c, 930, 170, 46, 0.4);
  mothman(c, 540, 1380, 0.9, t, { spread: 0.8, eyes: 1, sil: true });
  tag(c, 'A WARNING?', 540, 600, -0.04, ss(0.8, 1.1, u), { size: 54, col: C.redD });
}, { card: 'A warning?', mood: 'worried' });
// ------------------------------------------------------------- 06 THE INVESTIGATION
sc(S0(24), (c, u, d, t) => {
  bg(c); moon(c);
  folder(c, 540, 960, 1.2, -0.03, 'SILVER BRIDGE\nCOLLAPSE', ss(0, 0.35, u));
  stamp(c, 'NTSB INVESTIGATION', 540, 1230, -0.12, ss(0.9, 1.2, u), 56);
}, { card: 'What investigators found', size: 46, mood: 'search' });
sc(S0(25), (c, u, d, t) => {
  bg(c); moon(c);
  c.save(); c.beginPath(); c.rect(40, 560, 1000, 760); c.clip(); eyebar(c, 540, 940, ss(1.0, 2.2, u), ss(2.0, 2.8, u), t); c.restore();
  c.save(); c.strokeStyle = '#efe3c4'; c.lineWidth = 12; c.strokeRect(40, 560, 1000, 760); c.restore();
  redCircle(c, 540, 880, 220, 210, ss(2.6, 3.3, u));
  tag(c, 'STRUCTURAL FAILURE', 540, 1390, -0.03, ss(2.9, 3.2, u), { size: 44, col: C.redD });
  tag(c, 'DIAGRAM', 920, 600, 0.05, 1, { size: 22 });
}, { card: 'A cracked eyebar', mood: u => u > 2.4 ? 'point' : 'search' });
sc(S0(26), (c, u, d, t) => {
  bg(c); moon(c);
  photo(c, 'ink_mothman', 540, 920, 760, 450, -0.03, "artist's impression", ss(0, 0.3, u), { pin: true });
  cross(c, 540, 900, 260, ss(1.0, 1.8, u));
  stamp(c, 'NO EVIDENCE', 540, 1300, -0.1, ss(1.8, 2.1, u), 76);
}, { card: 'No evidence', mood: 'normal' });
sc(S0(27), (c, u, d, t) => {
  bg(c); moon(c);
  photo(c, (g, w, h) => { g.fillStyle = '#2a2f3a'; g.fillRect(-w / 2, -h / 2, w, h); text(g, '?', 0, 0, 300, 'rgba(255,255,255,0.25)'); }, 540, 930, 620, 620, 0.04, 'verified photo: none', ss(0, 0.3, u));
  tag(c, '1966', 230, 1380, -0.06, ss(0.8, 1.1, u), { size: 40 }); arrow(c, 340, 1380, 690, 1380, ss(1.1, 1.8, u), '#efe3c4', 7); tag(c, 'TODAY', 830, 1380, 0.05, ss(1.8, 2.1, u), { size: 40 });
  stamp(c, 'NO VERIFIED PROOF', 540, 600, 0.06, ss(3.0, 3.3, u), 54);
}, { card: 'Decades of stories', mood: 'thinking' });
// ------------------------------------------------------------- 07 THEORIES
sc(S0(28), (c, u, d, t) => {
  bg(c); moon(c);
  for (let i = 0; i < 3; i++) { const x = 220 + i * 320, y = 960 + (i % 2) * 90; photo(c, (g, w, h) => { g.fillStyle = '#e6dcc4'; g.fillRect(-w / 2, -h / 2, w, h); text(g, '?', 0, 0, 170, '#c4b898'); }, x, y, 240, 300, (i - 1) * 0.08, ['bird?', 'animal?', 'unknown?'][i], ss(i * 0.2, i * 0.2 + 0.3, u)); }
}, { card: 'So what did\nthey see?', hi: true, mood: 'thinking' });
sc(S0(29), (c, u, d, t) => {
  bg(c); moon(c);
  crane(c, 470, 1290, 1.15, t);
  tag(c, 'THEORY: SANDHILL CRANE', 540, 640, -0.03, ss(0.1, 0.4, u), { size: 36 });
  tag(c, 'RED PATCH · ~7 FT WINGSPAN', 560, 1360, 0.03, ss(0.4, 0.7, u), { size: 30 });
}, { card: 'A giant bird?', mood: 'search' });
sc(S0(30), (c, u, d, t) => {
  bg(c, 0.4); moon(c);
  const g = c.createLinearGradient(0, 1500, 0, 600); g.addColorStop(0, 'rgba(255,240,170,0.35)'); g.addColorStop(1, 'rgba(255,240,170,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(380, 1600); c.lineTo(700, 1600); c.lineTo(1000, 600); c.lineTo(80, 600); c.fill();
  owl(c, 540, 1050, 1.25, t, 1);
  tag(c, 'OWL EYESHINE IN HEADLIGHTS?', 540, 1330, -0.02, ss(0.3, 0.6, u), { size: 30 });
}, { card: 'A misidentified animal?', size: 46, mood: 'thinking' });
sc(S0(31), (c, u, d, t) => {
  bg(c, 0.4); moon(c);
  mothman(c, 540, 1380, 0.85, t, { spread: 0.5, sil: true, eyes: 1 });
  questionMark(c, 830, 700, 1, ss(0.3, 0.7, u), t);
}, { card: 'Or something else?', mood: 'worried' });
// ------------------------------------------------------------- 08 FINAL MYSTERY
sc(S0(32), (c, u, d, t) => {
  bg(c, 0.3); moon(c);
  mothman(c, 540, 1400, lerp(0.85, 0.9, u / d), t, { spread: 0.9, eyes: 1 });
}, { card: 'Still a mystery', mood: 'normal' });
sc(S0(33), (c, u, d, t) => {
  bg(c, 0.45); moon(c, 930, 170, 46, 0.6);
  mothman(c, 540, 1400, 0.9, t, { spread: 0.9, eyes: 1, sil: true, a: 1 });
}, { card: 'The legend lives on', mood: 'worried' });
sc(S0(34), (c, u, d, t) => {
  bg(c, lerp(0.45, 0.8, ss(0, 2, u)));
  mothman(c, 540, 1400, 0.9, t, { spread: 0.9, eyes: 0, sil: true, a: 1 - ss(0.2, 2.0, u) });
  glowEyes(c, 540, 1400 - 410 * 0.9, 86 * 0.9, 18, 1 - ss(3.8, 4.4, u), Math.sin(t * 5) * 0.4);
  const a = ss(1.2, 1.7, u) * (1 - ss(4.6, 5.0, u));
  c.save(); c.globalAlpha = a; c.translate(540, 820); c.rotate(-0.03); paper(c, 0, 0, 900, 300, 0, 77);
  text(c, 'WHAT WAS FLYING OVER', 0, -50, 60, '#211c16'); text(c, 'POINT PLEASANT?', 0, 40, 84, C.red); c.restore();
}, { mood: 'thinking', noCard: true, noMascotAfter: 4.6 });
// end card: STICKMAN STORIES
sc(TL.narration_end + 3.2, (c, u, d, t) => {
  bg(c, 0.3); moon(c, 930, 170, 46, ss(0, 0.6, u));
  const a = ss(0, 0.4, u); c.save(); c.translate(540, 860); c.rotate(-0.04); const k = lerp(1.8, 1, back(a)); c.scale(k, k); c.globalAlpha = clamp(a * 3, 0, 1);
  paper(c, 0, 0, 860, 360, 0, 5); text(c, 'STICKMAN', 0, -60, 120, '#211c16'); text(c, 'STORIES', 0, 70, 120, C.red); c.restore();
  tag(c, 'REAL MYSTERIES · TRUE STORIES', 540, 1120, 0.02, ss(0.5, 0.8, u), { size: 32 });
  if (OVERLAYS) chibi(c, t, 'happy', { x: 540, y: 1440, s: 1.25 });
}, { noCard: true, noMascot: true, fadeOut: true });

// ---------- frame renderer
const XF = 0.22; // quick crossfade between shots
let OVERLAYS = true;
const BUF = document.createElement('canvas'); BUF.width = W; BUF.height = H; const bctx = BUF.getContext('2d');
function drawShot(c, i, t) {
  const s = SC[i], end = i + 1 < SC.length ? SC[i + 1].start : ENDT, u = t - s.start, d = end - s.start;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1;
  // gentle push-in on every shot
  const z = 1 + 0.035 * clamp(u / d, 0, 1); c.translate(W / 2, H * 0.48); c.scale(z, z); c.translate(-W / 2, -H * 0.48);
  s.draw(c, u, d, t); c.restore();
  if (!OVERLAYS) return;
  if (!s.noCard && s.card) { c.save(); card(c, s.card, u, { hi: s.hi, size: s.size }); c.restore(); }
  const mood = typeof s.mood === 'function' ? s.mood(u) : s.mood;
  if (!s.noMascot && !(s.noMascotAfter && u > s.noMascotAfter)) chibi(c, t, mood || 'normal');
}
function renderAt(t) {
  const c = ctx; let i = SC.length - 1; while (i > 0 && SC[i].start > t) i--;
  drawShot(c, i, t);
  if (i + 1 < SC.length && t > SC[i + 1].start - XF) { bctx.clearRect(0, 0, W, H); drawShot(bctx, i + 1, SC[i + 1].start); c.save(); c.globalAlpha = (t - (SC[i + 1].start - XF)) / XF; c.drawImage(BUF, 0, 0); c.restore(); }
  if (!(SC[i].noSub)) subtitles(c, t);
  if (t < 0.3) { c.fillStyle = `rgba(0,0,0,${1 - t / 0.3})`; c.fillRect(0, 0, W, H); }
  if (t > ENDT - 0.8) { c.fillStyle = `rgba(0,0,0,${ss(ENDT - 0.8, ENDT, t)})`; c.fillRect(0, 0, W, H); }
}
window.TOTAL = ENDT;
