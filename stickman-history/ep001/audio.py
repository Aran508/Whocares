# Original procedural score + SFX + narration mix for Stickman History Ep.001
import numpy as np, subprocess, sys, wave
from scipy.signal import butter, sosfilt

SR = 48000
OFF = 3.0
NARR_CUT = 143.1          # narration seconds kept (ends after "...between Asia and Europe.")
END = OFF + 143.6 + 9.5   # must match scenes.js END
NS = int(END * SR) + SR
rng = np.random.default_rng(7)
L = np.zeros(NS); R = np.zeros(NS)

def N(x): return x + OFF
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b, o=2): return sosfilt(butter(o, [a, b], 'band', fs=SR, output='sos'), x)
def env_ad(n, a, d):
    t = np.arange(n) / SR; e = np.minimum(t / max(a, 1e-4), 1.0) * np.exp(-np.maximum(t - a, 0) / d); return e
def fade(n, fi, fo):
    e = np.ones(n); a = int(fi * SR); b = int(fo * SR)
    if a: e[:a] = np.linspace(0, 1, a) ** 2
    if b: e[-b:] *= np.linspace(1, 0, b) ** 2
    return e
def add(sig, t, gain=1.0, pan=0.0):
    i = int(t * SR); sig = sig * gain
    if i >= NS: return
    n = min(len(sig), NS - i)
    gl = np.sqrt(0.5 * (1 - pan)); gr = np.sqrt(0.5 * (1 + pan))
    L[i:i + n] += sig[:n] * gl * 1.414; R[i:i + n] += sig[:n] * gr * 1.414
def noise(sec): return rng.standard_normal(int(sec * SR))
def brown(sec):
    w = noise(sec); b = np.cumsum(w); b = hp(b, 15); return b / (np.abs(b).max() + 1e-9)
def hz(note):  # 'D2'
    names = {'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11}
    n, o = note[:-1], int(note[-1]); return 440 * 2 ** ((names[n] + 12 * (o + 1) - 69) / 12)

# band-limited saw wavetable
TBL = np.zeros(4096); ph = np.arange(4096) / 4096
for k in range(1, 40): TBL += np.sin(2 * np.pi * k * ph) / k
TBL /= np.abs(TBL).max()
def osc(f, sec, table=TBL, vib=0.0):
    n = int(sec * SR); t = np.arange(n) / SR
    fr = f * (1 + vib * np.sin(2 * np.pi * 5 * t))
    p = np.cumsum(fr / SR) + rng.random(); return table[((p % 1) * 4096).astype(int)]
def sine(f, sec):
    t = np.arange(int(sec * SR)) / SR; return np.sin(2 * np.pi * f * t)

# ---------------- SFX generators (original synthesis)
def low_rumble(sec): return lp(brown(sec), 70, 4) * fade(int(sec * SR), sec * 0.3, sec * 0.3)
def metallic_impact():
    sec = 4.0; n = int(sec * SR); t = np.arange(n) / SR
    s = np.zeros(n)
    for f, d, a in [(220, 1.6, 1), (347, 1.2, .7), (513, 0.9, .5), (781, 0.7, .4), (1190, 0.5, .3), (1733, 0.35, .25), (2610, 0.25, .2)]:
        s += a * np.sin(2 * np.pi * f * t + rng.random() * 6) * np.exp(-t / d)
    boom = np.sin(2 * np.pi * (55 * t + 40 * (1 - np.exp(-t * 8)) / 8)) * np.exp(-t / 0.9)
    click = hp(noise(sec), 2000) * np.exp(-t / 0.02)
    return 0.35 * s / 3 + 0.9 * boom + 0.25 * click
def dark_hit():
    sec = 3.5; n = int(sec * SR); t = np.arange(n) / SR
    boom = np.sin(2 * np.pi * (38 * t + 60 * (1 - np.exp(-t * 6)) / 6)) * np.exp(-t / 1.1)
    grit = lp(noise(sec), 400) * np.exp(-t / 0.4) * 0.6
    return boom + grit
def riser(sec):
    n = int(sec * SR); t = np.arange(n) / SR; u = t / sec
    nz = noise(sec); out = np.zeros(n); blk = 2400
    for i in range(0, n, blk):
        fc = 300 + 7000 * u[i] ** 2
        seg = nz[max(0, i - 2000):i + blk]; f = bp(seg, fc * 0.7, min(fc * 1.3, 20000))[-len(nz[i:i + blk]):]
        out[i:i + blk] = f
    tone = np.sin(2 * np.pi * np.cumsum(110 * 2 ** (2 * u)) / SR) * 0.3
    return (out * 3 + tone) * u ** 2.2
def wind(sec, strength=1.0):
    nz = noise(sec); n = len(nz); t = np.arange(n) / SR
    mod = 0.55 + 0.45 * np.sin(2 * np.pi * 0.13 * t + rng.random() * 6) * np.sin(2 * np.pi * 0.31 * t)
    s = bp(nz, 250, 900 + 600 * strength) * mod + lp(nz, 180) * 0.6 * mod
    return s * fade(n, 1.0, 1.0) * 0.8 * strength
def ocean(sec):
    nz = noise(sec); n = len(nz); t = np.arange(n) / SR
    sw = np.clip(np.sin(2 * np.pi * t / 7.0 + 1), 0, 1) ** 2 * 0.8 + 0.2
    return (lp(nz, 900) * sw + hp(lp(nz, 6000), 2500) * 0.2 * sw) * fade(n, 1.5, 1.5)
def campfire(sec):
    n = int(sec * SR); s = lp(brown(sec), 300) * 0.4
    for _ in range(int(sec * 14)):
        i = rng.integers(0, n - 2000); c = hp(noise(0.03), 1500) * np.exp(-np.arange(int(0.03 * SR)) / SR / 0.004)
        s[i:i + len(c)] += c * rng.uniform(0.2, 1)
    return s * fade(n, 0.8, 0.8)
def birds(sec):
    n = int(sec * SR); s = np.zeros(n)
    for _ in range(int(sec * 1.5)):
        i = rng.integers(0, n - SR); d = rng.uniform(0.06, 0.15); m = int(d * SR); tt = np.arange(m) / SR
        f0 = rng.uniform(2500, 4500); ch = np.sin(2 * np.pi * np.cumsum(f0 + 900 * np.sin(2 * np.pi * 18 * tt)) / SR) * np.sin(np.pi * tt / d)
        for r in range(rng.integers(1, 4)): j = i + int(r * d * 1.4 * SR); s[j:j + m] += ch * 0.3
    return s * fade(n, 1, 1)
def drum_hit(big=1.0):
    sec = 1.2; n = int(sec * SR); t = np.arange(n) / SR
    body = np.sin(2 * np.pi * (48 * t + 110 * (1 - np.exp(-t * 18)) / 18)) * np.exp(-t / (0.35 * big))
    skin = lp(noise(sec), 1200) * np.exp(-t / 0.05) * 0.5
    return (body + skin) * big
def footsteps(sec, rate, n_layers, bright=600):
    n = int(sec * SR); s = np.zeros(n)
    for L_ in range(n_layers):
        off = rng.uniform(0, 1 / rate); jitter = 0.015
        k = 0
        while True:
            tt = off + k / rate + rng.normal(0, jitter)
            if tt >= sec - 0.2: break
            i = max(0, int(tt * SR)); m = int(0.12 * SR); e = np.exp(-np.arange(m) / SR / 0.03)
            thump = lp(noise(0.12), bright) * e
            s[i:i + m] += thump * rng.uniform(0.5, 1); k += 1
    return s / max(1, np.sqrt(n_layers)) * fade(n, 0.8, 0.8)
def armor(sec, rate):
    n = int(sec * SR); s = np.zeros(n)
    for k in range(int(sec * rate)):
        i = int((k / rate + rng.uniform(0, 0.05)) * SR); m = int(0.08 * SR); tt = np.arange(m) / SR
        if i + m >= n: break
        c = sum(np.sin(2 * np.pi * f * tt) for f in rng.uniform(2000, 6000, 4)) * np.exp(-tt / 0.015)
        s[i:i + m] += c * 0.15
    return s
def war_horn(sec=3.2, f=98):
    n = int(sec * SR); t = np.arange(n) / SR
    fr = f * (1 + 0.004 * np.sin(2 * np.pi * 5 * t)) * (1 + 0.03 * np.minimum(t / 0.3, 1))
    p = np.cumsum(fr / SR); s = TBL[((p % 1) * 4096).astype(int)] + 0.5 * TBL[((p * 2.003 % 1) * 4096).astype(int)]
    s = lp(s, 900, 3) * np.minimum(t / 0.5, 1) * np.minimum((sec - t) / 0.8, 1)
    return s * 0.6
def shouts(sec):
    n = int(sec * SR); s = np.zeros(n)
    for _ in range(int(sec * 6)):
        d = rng.uniform(0.3, 0.8); m = int(d * SR); tt = np.arange(m) / SR; i = rng.integers(0, max(1, n - m))
        f0 = rng.uniform(140, 260) * (1 + 0.1 * np.sin(2 * np.pi * 3 * tt))
        v = TBL[((np.cumsum(f0 / SR) % 1) * 4096).astype(int)]
        v = bp(v, 500, 1400) + 0.5 * bp(v, 1800, 2800)
        s[i:i + m] += v * np.sin(np.pi * tt / d) ** 0.5 * rng.uniform(0.2, 0.6)
    return lp(s, 3000) * fade(n, 0.5, 0.8)
def heartbeat(sec, bpm=60):
    n = int(sec * SR); s = np.zeros(n); per = 60 / bpm
    for k in range(int(sec / per)):
        for off, a in [(0, 1), (0.28, 0.7)]:
            i = int((k * per + off) * SR); m = int(0.25 * SR); tt = np.arange(m) / SR
            if i + m < n: s[i:i + m] += np.sin(2 * np.pi * 50 * tt) * np.exp(-tt / 0.06) * a
    return s
def pulse(sec, bpm, f=73.4):
    n = int(sec * SR); s = np.zeros(n); per = 60 / bpm / 2
    for k in range(int(sec / per)):
        i = int(k * per * SR); m = int(0.18 * SR); tt = np.arange(m) / SR
        if i + m < n: s[i:i + m] += lp(osc(f, 0.18), 500) * np.exp(-tt / 0.06) * (1 if k % 2 == 0 else 0.6)
    return s

# ---------------- music
CH = {'Dm': ['D3', 'F3', 'A3', 'D4'], 'Bb': ['Bb2', 'F3', 'Bb3', 'D4'], 'Gm': ['G2', 'D3', 'G3', 'Bb3'], 'A': ['A2', 'E3', 'A3', 'C#4'],
      'F': ['F2', 'C3', 'F3', 'A3'], 'C': ['C3', 'G3', 'C4', 'E4'], 'Dm2': ['D2', 'A2', 'D3', 'F3'], 'Asus': ['A2', 'E3', 'A3', 'D4']}
def pad(chord, sec, cutoff=1200, amp=0.12, att=1.5, rel=1.5):
    s = 0
    for nt in CH[chord]:
        f = hz(nt)
        for det in (-0.006, 0, 0.007): s = s + osc(f * (1 + det), sec, vib=0.002)
    s = lp(s, cutoff, 2) * amp / 6
    return s * fade(len(s), att, rel)
def bass(note, sec, amp=0.35):
    s = sine(hz(note), sec) + 0.4 * lp(osc(hz(note), sec), 300); return s * amp * fade(len(s), 1.0, 1.0)
def ostinato(note, sec, bpm, amp=0.12):
    n = int(sec * SR); s = np.zeros(n); per = 60 / bpm / 2; m = int(per * SR)
    tone = lp(osc(hz(note), per) + 0.5 * osc(hz(note) * 2, per), 1400) * np.exp(-np.arange(m) / SR / 0.09)
    for k in range(int(sec / per)):
        i = k * m
        if i + m < n: s[i:i + m] += tone * (1.0 if k % 4 == 0 else 0.65)
    return s * amp
def drums(sec, bpm, pattern, amp=0.5, build=False):
    n = int(sec * SR); s = np.zeros(n); per = 60 / bpm / 2
    hits = [drum_hit(1.0), drum_hit(0.6)]
    for k in range(int(sec / per)):
        c = pattern[k % len(pattern)]
        if c == '.': continue
        h = hits[0] if c == 'X' else hits[1]; i = int(k * per * SR)
        g = (0.4 + 0.6 * k * per / sec) if build else 1.0
        e = min(len(h), n - i)
        if e > 0: s[i:i + e] += h[:e] * g
    return s * amp

BPM = 92
# ---- section A: intro (0-3) + hook
add(low_rumble(12), 0, 1.4)
add(lp(footsteps(14, 1.6, 40, 400), 500), 0, 2.6)               # distant massive army march
add(bass('D1', 31.5), 0.0, 0.25)
add(pad('Dm2', 8.2, 700, 0.10, 2.5), N(0) - 0.5)
add(pad('Bb', 8.3, 800, 0.10), N(7.7))
add(pad('Gm', 7.8, 900, 0.11), N(15.7))
add(pad('A', 5.6, 1100, 0.12), N(23.3))
add(wind(4.5, 1.3), N(7.7) - 0.3, 0.35, -0.3)                   # cliff wind
add(ocean(5), N(7.7) - 0.3, 0.18, 0.4)
add(wind(5, 0.8), N(11.1), 0.18)
add(dark_drone := lp(osc(hz('D2'), 9) + osc(hz('A2'), 9), 250) * 0.15 * fade(int(9 * SR), 2, 2), N(11.1))
add(drums(7.6, BPM, 'X.......x.......', 0.35, True), N(15.7))
add(armor(4.5, 6), N(15.7), 0.25, 0.2)
add(drums(3.1, BPM, 'X...x...X...x...', 0.5), N(20.2))
add(metallic_impact(), N(22.2), 0.45)                           # "...three hundred Spartans"
add(armor(2.5, 12), N(20.3), 0.35, -0.2)                        # shield movement
add(wind(5.5, 1.4), N(23.3), 0.3, 0.2)
add(riser(4.3), N(23.6), 0.12)
# ---- section B: 480 BC, march, pass, sunset
add(metallic_impact(), N(28.3), 0.35)
add(war_horn(3.4, 98), N(28.2) + 2.3, 0.45, -0.3)
add(war_horn(3.0, 73.4), N(28.2) + 3.2, 0.3, 0.4)
add(footsteps(7.6, 1.6, 30, 700), N(30.6), 0.8)
add(armor(7, 8), N(30.6), 0.2)
add(ocean(8), N(30.2), 0.12, 0.5)
add(drums(7.4, BPM, 'X..x..X.X..x..x.', 0.45), N(30.6))
add(ostinato('D2', 7.4, BPM, 0.10), N(30.6))
add(pad('Dm', 7.6, 1300, 0.10), N(30.2))
add(pad('F', 7.2, 1000, 0.09, 2.0), N(37.6))                    # aerial: airy
add(wind(7, 0.6), N(37.8), 0.2)
add(ocean(7), N(37.8), 0.2, 0.3)
add(pad('Bb', 6.4, 900, 0.10), N(44.5))
add(campfire(6), N(44.5), 0.12, 0.4)
add(wind(6, 1.0), N(44.5), 0.25, -0.3)
add(drums(5.5, BPM, 'X.......X...x...', 0.35, True), N(44.6))
add(riser(4.2), N(46.3), 0.22)
# silence before the title ("This...") then the reveal
add(metallic_impact(), N(53.35), 0.75)
add(dark_hit(), N(53.35), 0.5)
add(pad('Dm2', 4.4, 1500, 0.16, 0.05, 2.0), N(53.35))
add(bass('D1', 4.0, 0.4), N(53.35))
# ---- section C: maps
add(pad('Dm', 7.4, 700, 0.09, 1.0), N(55.0))
add(pulse(13, BPM, hz('D2')), N(55.0), 0.08)
add(pad('Gm', 6.2, 800, 0.09), N(61.4))
add(footsteps(6, 1.6, 12, 800), N(61.5), 0.5)
add(armor(6, 5), N(61.5), 0.15)
add(drums(5.9, BPM, 'X...x...X...x...', 0.3), N(61.5))
add(pad('Bb', 3.9, 900, 0.10), N(67.3))
add(metallic_impact(), N(70.1), 0.22)                           # "Greece."
add(pad('Gm', 5.2, 800, 0.09), N(71.0))
add(pad('A', 5.2, 900, 0.09), N(75.9))
add(pulse(10, BPM, hz('A1')), N(71.0), 0.07)
add(dark_hit(), N(71.0) + 3.2, 0.12); add(dark_hit(), N(71.0) + 5.4, 0.12); add(dark_hit(), N(71.0) + 7.9, 0.12)
# ---- section D: throne room + Sparta
add(lp(osc(hz('D2'), 9) + 0.6 * osc(hz('Ab2'), 9), 300) * 0.12 * fade(int(9 * SR), 1.5, 1.5), N(80.8))   # dark drone
add(campfire(8.7), N(80.8), 0.25, -0.2)
add(footsteps(3.5, 1.7, 3, 900), N(80.8) + 0.4, 0.35)
add(pad('Dm2', 8.5, 600, 0.07), N(80.8))
add(birds(14), N(89.3), 0.08, 0.3)
add(wind(14, 0.5), N(89.3), 0.15)
add(pad('Gm', 7, 900, 0.07), N(89.3))
add(footsteps(3.0, 1.8, 1, 1200), N(89.3) + 0.3, 0.4, -0.5)     # messenger footsteps
add(riser(2.4), N(89.3) + 4.3, 0.10)
add(dark_hit(), N(89.3) + 6.75, 0.6)                             # thrown into the well
add(low_rumble(3), N(89.3) + 7.0, 0.5)
add(pad('A', 6, 800, 0.08), N(96.4))
# ---- section E: Marathon
add(drums(5.6, BPM * 1.15, 'X.x.X.x.X.xxX.x.', 0.5), N(103.4))
add(shouts(5.5), N(103.4), 0.5)
add(footsteps(5.5, 3.0, 20, 900), N(103.4), 0.6)
add(armor(5.5, 15), N(103.4), 0.25)
add(ocean(5.5), N(103.4), 0.1, 0.5)
add(pad('Dm', 5.6, 1400, 0.10, 0.3), N(103.4))
# ---- section F: Xerxes wants revenge
add(lp(osc(hz('D1'), 6.3) + osc(hz('A1'), 6.3) + 0.5 * osc(hz('Eb2'), 6.3), 220) * 0.2 * fade(int(6.3 * SR), 1, 1.2), N(108.9))
add(heartbeat(6, 64), N(108.9) + 0.3, 0.6)
add(low_rumble(6.3), N(108.9), 0.6)
add(campfire(6), N(108.9), 0.15, 0.3)
add(riser(3.3), N(111.6), 0.18)
add(metallic_impact(), N(108.9) + 0.6, 0.2)
# ---- section G: the march toward Greece
add(war_horn(3.6, 98), N(114.9), 0.5, -0.2)
add(drums(4.6, BPM, 'X..x..X.X..x..x.', 0.5), N(114.9))
add(ostinato('D2', 4.6, BPM, 0.11), N(114.9))
add(footsteps(4.7, 1.6, 40, 700), N(114.9), 0.9)
add(armor(4.6, 10), N(114.9), 0.25)
add(pad('Dm', 4.8, 1400, 0.11), N(114.9))
# ---- section H: Herodotus / modern estimate
add(pad('Bb', 6.0, 900, 0.07, 0.8), N(119.4))
add(pulse(13.5, BPM, hz('Bb1')), N(119.4), 0.06)
add(armor(2.5, 30), N(119.4) + 0.8, 0.05)                       # counter ticking
add(dark_hit(), N(119.4) + 6.0, 0.35)                            # strike-through
add(pad('Gm', 7.6, 800, 0.07), N(125.3))
add(metallic_impact(), N(119.4) + 10.2, 0.2)                     # modern estimate reveal
# ---- section I: overwhelming force + Hellespont
add(low_rumble(3), N(132.9), 0.8)
add(war_horn(2.6, 73.4), N(132.9), 0.35, 0.3)
add(drums(2.5, BPM, 'X.x.X.x.X.x.', 0.5), N(132.9))
add(footsteps(3, 1.6, 40, 600), N(132.9), 0.8)
add(pad('A', 2.7, 1300, 0.11, 0.2), N(132.9))
add(pad('Dm', 4.4, 1200, 0.11), N(135.3))
add(pad('Bb', 4.6, 1400, 0.12), N(139.6))
add(ocean(8.4), N(135.4), 0.25)
add(footsteps(8.2, 1.6, 15, 900), N(135.4), 0.45)
add(drums(8.2, BPM, 'X...x...X...x.x.', 0.4, True), N(135.4))
add(ostinato('D2', 8.2, BPM, 0.08), N(135.4))
add(wind(8, 0.5), N(135.4), 0.12)
# ---- end card
add(metallic_impact(), N(143.6) + 0.2, 0.5)
add(pad('Gm', 3.6, 900, 0.10, 0.1), N(143.6) + 0.2)
add(riser(3.3), N(143.6) + 0.4, 0.2)
add(metallic_impact(), N(143.6) + 3.65, 0.7)
add(dark_hit(), N(143.6) + 3.65, 0.4)
add(pad('Dm2', 5.9, 2000, 0.16, 0.05, 2.5), N(143.6) + 3.65)
add(bass('D1', 5.8, 0.4), N(143.6) + 3.65)
add(war_horn(4.0, 73.4), N(143.6) + 3.8, 0.3)

bed = np.stack([L, R])
bed = hp(bed, 28)

# ---------------- narration
raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', sys.argv[1], '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
nar = np.frombuffer(raw, dtype=np.float32).astype(np.float64)
nar = nar[:int(NARR_CUT * SR)]; nar[-int(0.08 * SR):] *= np.linspace(1, 0, int(0.08 * SR))
nar = hp(nar, 70)
speech = np.abs(nar) > 0.01
rms = np.sqrt(np.mean(nar[speech] ** 2)); nar *= 10 ** (-17 / 20) / rms   # ~ -17 dBFS speech RMS
vo = np.zeros(NS); i0 = int(OFF * SR); vo[i0:i0 + len(nar)] = nar

# ducking from narration envelope
env = np.abs(vo); env = lp(env, 6, 1); env = env / (np.percentile(env[env > 1e-4], 90) + 1e-9)
duck = 1 - 0.55 * np.clip(env, 0, 1)
duck = lp(duck, 4, 1)
# bed level: sit well below the voice
bed_rms = np.sqrt(np.mean(bed ** 2)); bed *= 10 ** (-27 / 20) / bed_rms
bed *= duck
mix = bed + vo[None, :]
mix = mix[:, :int(END * SR)]
# soft limiter
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
out = (np.clip(mix, -1, 1) * 32767).astype(np.int16).T.copy()
with wave.open(sys.argv[2], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(out.tobytes())
print('wrote', sys.argv[2], mix.shape[1] / SR, 's')
