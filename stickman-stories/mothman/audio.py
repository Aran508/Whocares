# Stickman Stories — THE MOTHMAN: three audio stems (narration, music, sfx) + ducked final mix
import numpy as np, json, wave, subprocess, sys
from scipy.signal import butter, sosfilt
SR = 48000
TL = json.load(open('timeline_narration.json'))
LN = TL['lines']; S0 = lambda i: LN[i]['start'] - 0.12; MID = lambda i, f: LN[i]['start'] + (LN[i]['end'] - LN[i]['start']) * f
END = TL['narration_end'] + 8.0
NS = int(END * SR) + SR
rng = np.random.default_rng(11)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b, o=2): return sosfilt(butter(o, [a, b], 'band', fs=SR, output='sos'), x)
def noise(sec): return rng.standard_normal(int(sec * SR))
def tt(sec): return np.arange(int(sec * SR)) / SR
def fade(n, a, b):
    e = np.ones(n); A = int(a * SR); B = int(b * SR)
    if A: e[:A] = np.linspace(0, 1, A) ** 2
    if B: e[-B:] *= np.linspace(1, 0, B) ** 2
    return e
class Track:
    def __init__(s): s.L = np.zeros(NS); s.R = np.zeros(NS)
    def add(s, x, t, g=1.0, pan=0.0):
        i = int(t * SR); n = min(len(x), NS - i)
        if n <= 0 or i < 0: return
        s.L[i:i + n] += x[:n] * g * np.sqrt(1 - pan) ; s.R[i:i + n] += x[:n] * g * np.sqrt(1 + pan)
    def arr(s): return np.stack([s.L, s.R])
TBL = np.zeros(4096); ph = np.arange(4096) / 4096
for k in range(1, 30): TBL += np.sin(2 * np.pi * k * ph) / k
TBL /= np.abs(TBL).max()
def saw(f, sec, det=0.0):
    p = np.cumsum(np.full(int(sec * SR), f * (1 + det)) / SR) + rng.random(); return TBL[((p % 1) * 4096).astype(int)]
def hz(n): names = {'C': 0, 'C#': 1, 'D': 2, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'Ab': 8, 'A': 9, 'Bb': 10, 'B': 11}; return 440 * 2 ** ((names[n[:-1]] + 12 * (int(n[-1]) + 1) - 69) / 12)

# ---------------- SFX generators (original synthesis)
def whoosh(sec=0.7, rev=False):
    n = int(sec * SR); x = noise(sec); out = np.zeros(n); blk = 1200
    for i in range(0, n, blk):
        u = i / n; fc = 300 + 3500 * (u if not rev else 1 - u) ** 1.5
        seg = x[max(0, i - 2000):i + blk]; out[i:i + blk] = bp(seg, fc * 0.6, min(fc * 1.6, 20000))[-len(x[i:i + blk]):]
    env = np.sin(np.pi * np.linspace(0, 1, n)) ** (1.5 if not rev else 0.6)
    if rev: env = np.linspace(0, 1, n) ** 2.5
    return out * env * 2.2
def paper(sec=0.35):
    x = hp(noise(sec), 1500) * np.exp(-tt(sec) / 0.12); x += bp(noise(sec), 300, 1200) * 0.4 * np.exp(-tt(sec) / 0.08); return x * 0.6
def rustle(sec=2.0):
    n = int(sec * SR); s = np.zeros(n)
    for _ in range(int(sec * 9)):
        i = rng.integers(0, n - 8000); p = paper(rng.uniform(0.08, 0.2)); s[i:i + len(p)] += p * rng.uniform(0.3, 1)
    return s * fade(n, 0.2, 0.3)
def typewriter(sec=1.8, rate=11):
    n = int(sec * SR); s = np.zeros(n); t = 0.0
    while t < sec - 0.1:
        i = int(t * SR); m = int(0.04 * SR); c = hp(noise(0.04), 2500) * np.exp(-tt(0.04) / 0.005) + np.sin(2 * np.pi * 1800 * tt(0.04)) * np.exp(-tt(0.04) / 0.004) * 0.4
        s[i:i + m] += c * rng.uniform(0.5, 1); t += rng.uniform(0.6, 1.4) / rate
    return s * 0.7
def impact(big=1.0):
    sec = 2.5; t = tt(sec)
    boom = np.sin(2 * np.pi * (45 * t + 70 * (1 - np.exp(-t * 9)) / 9)) * np.exp(-t / (0.5 * big))
    hit = lp(noise(sec), 2500) * np.exp(-t / 0.05) * 0.6
    ring = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / d) for f, d, a in [(310, 0.9, .3), (471, 0.7, .2), (733, 0.5, .15)])
    return (boom + hit + ring * 0.5) * big
def low_boom(sec=3.0): t = tt(sec); return np.sin(2 * np.pi * (32 * t + 40 * (1 - np.exp(-t * 4)) / 4)) * np.exp(-t / 1.2) + lp(noise(sec), 120) * np.exp(-t / 0.8) * 0.8
def click(): t = tt(0.12); return (hp(noise(0.12), 3000) * np.exp(-t / 0.004) + np.sin(2 * np.pi * 900 * t) * np.exp(-t / 0.01)) * 0.8
def pop(): t = tt(0.15); return np.sin(2 * np.pi * (600 + 600 * np.exp(-t * 40)) * t) * np.exp(-t / 0.03) * 0.6
def wingflap(n_flaps=3, rate=3.2):
    sec = n_flaps / rate + 0.4; s = np.zeros(int(sec * SR))
    for k in range(n_flaps):
        i = int(k / rate * SR); m = int(0.28 * SR); e = np.sin(np.pi * np.linspace(0, 1, m)) ** 2
        s[i:i + m] += (lp(noise(0.28), 700) * 1.4 + bp(noise(0.28), 200, 2000) * 0.5) * e
    return s
def heartbeat(sec, bpm=72):
    s = np.zeros(int(sec * SR)); per = 60 / bpm
    for k in range(int(sec / per)):
        for off, a in [(0, 1), (0.25, 0.7)]:
            i = int((k * per + off) * SR); t = tt(0.22)
            if i + len(t) < len(s): s[i:i + len(t)] += np.sin(2 * np.pi * 52 * t) * np.exp(-t / 0.05) * a
    return s
def engine(sec, rev=False):
    t = tt(sec); f = 38 + (60 * (t / sec) if rev else 0); p = np.cumsum(f / SR)
    x = TBL[((p % 1) * 4096).astype(int)] * 0.6 + lp(noise(sec), 300) * 0.4
    return lp(x, 400) * fade(len(t), 0.3, 0.5)
def creak(sec=2.2):
    t = tt(sec); f = 140 + 60 * np.sin(2 * np.pi * 0.7 * t) + 30 * np.sin(2 * np.pi * 3.1 * t); p = np.cumsum(f / SR)
    x = TBL[((p % 1) * 4096).astype(int)] * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 9 * t)))
    return bp(x, 300, 2500) * fade(len(t), 0.3, 0.6) * 0.8
def splash(sec=2.0): t = tt(sec); return (lp(noise(sec), 2500) * np.exp(-t / 0.5) + lp(noise(sec), 400) * np.exp(-t / 0.9)) * 0.8
def metal(sec=1.6):
    t = tt(sec); s = sum(np.sin(2 * np.pi * f * t + rng.random() * 6) * np.exp(-t / d) for f, d in [(523, .5), (811, .4), (1247, .3), (1760, .25), (2311, .2)])
    clank = hp(noise(sec), 1000) * np.exp(-t / 0.03); return (s * 0.25 + clank * 0.6)
def ratchet(sec=0.9): s = np.zeros(int(sec * SR)); [s.__setitem__(slice(int(k * 0.06 * SR), int(k * 0.06 * SR) + int(0.02 * SR)), s[int(k * 0.06 * SR):int(k * 0.06 * SR) + int(0.02 * SR)] + hp(noise(0.02), 2000) * 0.6) for k in range(int(sec / 0.06))]; return s
def hoot():
    out = np.zeros(int(1.6 * SR))
    for k, (st, d) in enumerate([(0, .25), (.4, .5)]):
        t = tt(d); f = 330 - 30 * t / d; x = np.sin(2 * np.pi * np.cumsum(np.full(len(t), 1) * f) / SR) * np.sin(np.pi * t / d) ** 0.7
        out[int(st * SR):int(st * SR) + len(t)] += x * 0.5
    return lp(out, 1200)
def scribble(sec=0.8): x = bp(noise(sec), 800, 4000) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 7 * tt(sec)))); return x * 0.5 * fade(len(x), 0.05, 0.1)
def insects(sec):
    t = tt(sec); x = np.zeros(len(t))
    for f, r in [(4200, 18), (5100, 23), (3700, 14)]: x += np.sin(2 * np.pi * f * t) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * r * t))) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.2 * t + f))
    return hp(x, 2000) * 0.08 * fade(len(t), 1, 1)
def wind(sec, s=1.0):
    x = noise(sec); t = tt(sec); m = 0.6 + 0.4 * np.sin(2 * np.pi * 0.17 * t) * np.sin(2 * np.pi * 0.29 * t + 1)
    return (bp(x, 200, 900) * m + lp(x, 150) * 0.5 * m) * 0.7 * s * fade(len(t), 1, 1)
def candle(sec): s = lp(noise(sec), 400) * 0.15; return s * fade(len(s), 0.5, 0.5)

fx = Track()
A = fx.add
# 01 hook
A(insects(6.5), 0.0, 1.0); A(engine(3.0), 0.2, 0.5, -0.4); A(whoosh(1.2), 0.3, 0.4, -0.6)
A(impact(0.6), S0(1) + 0.9, 0.5); A(heartbeat(3.0, 80), S0(1) + 1.0, 0.6); A(engine(2.0, True), S0(1) + 2.2, 0.5)
A(paper(), S0(2), 0.8); A(impact(0.5), S0(2) + 0.6, 0.5); A(paper(), S0(3), 0.9); A(paper(), S0(3) + 0.7, 0.5)
# 02 place/date
A(impact(0.8), S0(4), 0.6); A(whoosh(0.8), S0(5), 0.7); A(paper(0.5), S0(5) + 0.1, 0.5); A(pop(), S0(5) + 1.7, 0.8)
A(paper(), S0(6), 0.8); A(paper(), S0(6) + 1.6, 0.6); A(whoosh(0.6), MID(6, .5), 0.6); A(wind(4, 0.6), MID(6, .5), 0.35)
A(click(), S0(7) + 0.1, 1.0); A(impact(0.4), S0(7) + 0.2, 0.4); A(insects(5), S0(7), 0.8)
A(impact(0.7), S0(8) + 0.3, 0.6); A(heartbeat(2.5, 90), S0(8) + 0.4, 0.5); A(scribble(), S0(8) + 1.1, 0.5)
A(wingflap(3, 3), S0(9) + 1.6, 0.9); A(pop(), S0(9) + 0.4, 0.5); A(pop(), S0(9) + 1.9, 0.5); A(pop(), S0(9) + 3.0, 0.5)
# 03 chase
A(engine(2.2, True), S0(10), 0.9); A(whoosh(0.9), S0(10) + 0.1, 0.9, 0.3)
A(wingflap(7, 3.6), S0(11), 0.9, -0.3); A(whoosh(0.7), S0(11) + 0.2, 0.7, -0.5); A(paper(), S0(11) + 2.2, 0.8); A(pop(), S0(11) + 2.7, 0.5)
A(typewriter(2.0), S0(12) + 0.3, 0.9); A(impact(0.3), S0(12), 0.4)
for k in range(9): A(pop(), S0(13) + 0.5 + k * 0.25, 0.6, (k % 3 - 1) * 0.4)
A(paper(), S0(13), 0.7)
A(wingflap(5, 3.3), S0(14), 0.8, 0.5); A(wind(3, 0.8), S0(14), 0.35); A(paper(), S0(15), 0.6); A(pop(), S0(15) + 0.3, 0.5); A(pop(), S0(15) + 1.3, 0.5)
# 04 newspapers + name
A(rustle(2.6), S0(16), 0.9); A(typewriter(1.4, 13), S0(16) + 0.6, 0.6); A(scribble(), S0(16) + 1.4, 0.5)
A(paper(), S0(17), 0.8); A(scribble(0.9), S0(17) + 0.1, 0.4); A(impact(1.2), S0(18), 0.9)
# 05 bridge
A(low_boom(), S0(19), 0.8); A(wind(5, 0.7), S0(19), 0.3)
A(paper(), S0(20), 0.7); A(paper(), S0(20) + 0.4, 0.6); A(scribble(), S0(20) + 1.8, 0.4)
A(creak(2.4), MID(20, .62), 1.0); A(low_boom(3.5), MID(20, .62) + 0.4, 1.0); A(metal(), MID(20, .62) + 0.5, 0.6); A(splash(2.2), MID(20, .62) + 1.2, 0.9)
A(candle(3), S0(21) + 0.1, 0.6)
A(paper(), S0(22), 0.7); A(paper(), S0(22) + 0.4, 0.6); A(scribble(1.2), S0(22) + 1.0, 0.4)
A(impact(0.6), S0(23), 0.6); A(heartbeat(2.8, 70), S0(23), 0.6)
# 06 investigation
A(paper(), S0(24), 0.8); A(impact(0.5), S0(24) + 0.9, 0.6)
A(metal(), S0(25) + 0.2, 0.8); A(ratchet(), S0(25) + 1.0, 0.5); A(whoosh(0.8), S0(25) + 1.1, 0.5); A(metal(1.2), S0(25) + 2.1, 0.7); A(scribble(), S0(25) + 2.6, 0.5)
A(paper(), S0(26), 0.7); A(scribble(0.8), S0(26) + 1.0, 0.7); A(impact(0.5), S0(26) + 1.8, 0.6)
A(paper(), S0(27), 0.7); A(pop(), S0(27) + 0.8, 0.5); A(whoosh(0.6), S0(27) + 1.1, 0.5); A(pop(), S0(27) + 1.8, 0.5); A(impact(0.5), S0(27) + 3.0, 0.6)
# 07 theories
for k in range(3): A(paper(), S0(28) + k * 0.2, 0.6, (k - 1) * 0.5)
A(paper(), S0(29), 0.6); A(click(), S0(30), 0.8); A(hoot(), S0(30) + 0.3, 0.7); A(low_boom(2), S0(31), 0.5); A(pop(), S0(31) + 0.4, 0.6)
# 08 finale
A(wingflap(2, 2), S0(32), 0.5); A(wind(8, 0.7), S0(32), 0.3)
A(whoosh(1.2, rev=True), S0(34) - 0.9, 0.8); A(impact(1.0), S0(34) + 1.25, 0.8); A(heartbeat(3.5, 60), S0(34) + 1.5, 0.5)
A(impact(1.1), TL['narration_end'] + 3.2, 0.9); A(paper(), TL['narration_end'] + 3.3, 0.6)

# ---------------- music (original): dark mystery pulse in D minor, drops out at "46 people died"
mu = Track()
BPM = 100; beat = 60 / BPM
def pad(notes, sec, cut=900, amp=0.1, a=1.0, r=1.2):
    s = 0
    for nt in notes:
        for d in (-0.006, 0, 0.007): s = s + saw(hz(nt), sec, d)
    return lp(s, cut) * amp / 6 * fade(int(sec * SR), a, r)
def pluck(note, amp=0.12):
    d = beat / 2; x = lp(saw(hz(note), d) + 0.4 * saw(hz(note) * 2, d), 1800) * np.exp(-tt(d) / 0.12); return x * amp
def tick(): t = tt(0.05); return hp(noise(0.05), 5000) * np.exp(-t / 0.006) * 0.25
def kick(): t = tt(0.4); return np.sin(2 * np.pi * (50 * t + 80 * (1 - np.exp(-t * 25)) / 25)) * np.exp(-t / 0.18) * 0.7
prog = [['D3', 'F3', 'A3'], ['Bb2', 'D3', 'F3'], ['G2', 'Bb2', 'D3'], ['A2', 'C#3', 'E3']]
arp = [['D4', 'A3', 'F4', 'A3'], ['D4', 'Bb3', 'F4', 'Bb3'], ['D4', 'G3', 'Bb3', 'G3'], ['C#4', 'A3', 'E4', 'A3']]
def section(t0, t1, intensity, cut=900):
    bar = beat * 4; t = t0; k = 0
    while t < t1 - 0.05:
        L = min(bar, t1 - t); ch = prog[k % 4]
        mu.add(pad(ch, L + 0.4, cut, 0.10, 0.3 if k else 1.0, 0.5), t)
        mu.add(lp(saw(hz(ch[0][:-1] + '1'), L + 0.2), 220) * 0.28 * fade(int((L + 0.2) * SR), 0.05, 0.2), t)
        for i in range(int(L / (beat / 2))):
            tb = t + i * beat / 2
            if intensity >= 1: mu.add(pluck(arp[k % 4][i % 4]), tb, 0.8 if i % 2 == 0 else 0.55, 0.3 if i % 2 else -0.3)
            if intensity >= 1: mu.add(tick(), tb, 1.0, 0.5)
            if intensity >= 2 and i % 4 == 0: mu.add(kick(), tb, 0.9)
        t += bar; k += 1
section(0.0, S0(4), 1, 800)
section(S0(4), S0(10), 1, 1000)
section(S0(10), S0(16), 2, 1300)
section(S0(16), S0(19), 1, 1000)
section(S0(19), S0(21) + 0.1, 2, 1100)
# drop: silence after "46 people died", then a dark drone returns
mu.add(lp(saw(hz('D1'), 9) + saw(hz('Ab1'), 9), 200) * 0.25 * fade(int(9 * SR), 1.5, 1.5), LN[22]['start'] - 0.5)
section(S0(24), S0(28), 1, 900)
section(S0(28), S0(32), 1, 700)
mu.add(pad(['D3', 'F3', 'A3', 'D4'], 9, 700, 0.12, 2, 3), S0(32))
mu.add(lp(saw(hz('D1'), 10), 200) * 0.25 * fade(int(10 * SR), 2, 3), S0(32))
mu.add(pad(['D3', 'A3', 'D4', 'F4'], 5, 1500, 0.15, 0.05, 3), TL['narration_end'] + 3.2)

# ---------------- narration stem
raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', 'audio/narration_22k.wav', '-ar', str(SR), '-ac', '1', '-f', 'f32le', '-'], capture_output=True).stdout
nar = np.frombuffer(raw, np.float32).astype(np.float64); nar = hp(nar, 70)
sp = np.abs(nar) > 0.01; nar *= 10 ** (-16 / 20) / np.sqrt(np.mean(nar[sp] ** 2))
vo = np.zeros(NS); vo[:min(NS, len(nar))] = nar[:NS]

def norm(x, db):
    r = np.sqrt(np.mean(x ** 2)) + 1e-12; return x * 10 ** (db / 20) / r
music = norm(hp(mu.arr(), 30), -27); sfx = norm(hp(fx.arr(), 30), -27)
env = lp(np.abs(vo), 5, 1); env = env / (np.percentile(env[env > 1e-4], 90) + 1e-9); duck = lp(1 - 0.6 * np.clip(env, 0, 1), 3, 1)
fade_end = np.ones(NS); e0 = int((END - 1.5) * SR); fade_end[e0:] = np.linspace(1, 0, NS - e0).clip(0, 1) ** 2
music *= duck * fade_end; sfx *= (0.55 + 0.45 * duck) * fade_end
def write(name, x):
    x = x[..., :int(END * SR)]
    if x.ndim == 1: x = np.stack([x, x])
    y = (np.clip(x, -1, 1) * 32767).astype(np.int16).T.copy()
    with wave.open(name, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(y.tobytes())
write('audio/track1_narration.wav', vo); write('audio/track2_music.wav', music); write('audio/track3_sfx.wav', sfx)
mix = vo[None, :] + music + sfx; mix = np.tanh(mix * 1.05) / np.tanh(1.05)
write('audio/final_mix.wav', mix); print('END', END)
