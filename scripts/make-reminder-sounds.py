"""Synthesises the reminder notification sounds into android/app/src/main/res/raw.

The sounds are generated rather than downloaded, so they carry no licence
terms. Run from the repo root after `pip install numpy soundfile`:

    python scripts/make-reminder-sounds.py

The bell is a sum of decaying sine partials (bell ratios) through a light
Schroeder reverb; the birdsong is pure-tone syllables with fast pitch sweeps,
which is close to how small songbirds actually sound. Android plays
notification sounds once, so keep them short (under ~3 s) with the attack
right at the start.
"""

from pathlib import Path

import numpy as np
import soundfile as sf

SR = 44100
OUT = Path(__file__).resolve().parent.parent / "android" / "app" / "src" / "main" / "res" / "raw"


def timeline(seconds):
    return np.arange(int(seconds * SR)) / SR


def taper(x, seconds):
    n = min(len(x), int(seconds * SR))
    x[-n:] *= np.cos(np.linspace(0, np.pi / 2, n)) ** 2
    return x


def strike(rng, freq, partials, length, attack=0.003):
    """One struck note: (ratio, amplitude, decay seconds) partials with a soft attack."""
    t = timeline(length)
    out = np.zeros_like(t)
    for ratio, amp, tau in partials:
        f = freq * ratio
        if f >= SR / 2:
            continue
        out += amp * np.exp(-t / tau) * np.sin(2 * np.pi * f * t + rng.uniform(0, 2 * np.pi))
    # Taper the end too: a note cut off while still ringing clicks.
    return taper(out * (1 - np.exp(-t / attack)), 0.4 * length)


def place(buffer, sound, at):
    i = int(at * SR)
    end = min(len(buffer), i + len(sound))
    buffer[i:end] += sound[: end - i]


def comb(x, delay_ms, gain):
    d = int(SR * delay_ms / 1000)
    y = x.copy()
    for k in range(d, len(y), d):
        y[k : k + d] += gain * y[k - d : k - d + len(y[k : k + d])]
    return y


def allpass(x, delay_ms, gain):
    d = int(SR * delay_ms / 1000)
    y = np.zeros_like(x)
    xd = np.concatenate([np.zeros(d), x[:-d]])
    y[:d] = -gain * x[:d] + xd[:d]
    for k in range(d, len(y), d):
        n = len(y[k : k + d])
        y[k : k + n] = -gain * x[k : k + n] + xd[k : k + n] + gain * y[k - d : k - d + n]
    return y


def reverb(x, wet, size=1.0):
    # Soften the input so the tail is warmer than the strike.
    soft = np.convolve(x, np.ones(6) / 6, mode="same")
    tail = sum(comb(soft, ms * size, g) for ms, g in [(29.7, 0.78), (37.1, 0.76), (41.1, 0.75), (43.7, 0.73)]) / 4
    tail = allpass(allpass(tail, 5.0, 0.7), 1.7, 0.7)
    return x + wet * tail


def finish(x, peak_db=-1.0, floor_db=-60.0, fade=0.25):
    x = x - np.mean(x)
    x *= 10 ** (peak_db / 20) / np.max(np.abs(x))
    # Trim the silent tail, and fade both ends so neither clicks.
    loud = np.nonzero(np.abs(x) > 10 ** (floor_db / 20))[0]
    x = taper(x[: loud[-1] + 1], fade)
    n = int(0.002 * SR)
    x[:n] *= np.linspace(0, 1, n)
    return x


def bell(rng):
    """A single warm bell (D5) whose paired partials beat gently, like a struck bowl."""
    # Each weak twin sits ~1 Hz off its partner: a slow shimmer of about 3 dB.
    partials = [
        (1.0, 1.0, 1.6),
        (1.0018, 0.18, 1.6),
        (2.76, 0.50, 0.9),
        (2.7615, 0.09, 0.9),
        (5.40, 0.18, 0.38),
        (8.93, 0.06, 0.18),
    ]
    out = np.zeros(int(3.4 * SR))
    place(out, strike(rng, 587.33, partials, 3.4, attack=0.004), 0.0)
    # A faint, short "tink" of the striker on top of the attack.
    click = rng.normal(0, 1, int(0.012 * SR)) * np.exp(-np.arange(int(0.012 * SR)) / (0.002 * SR))
    place(out, 0.08 * np.convolve(click, [1, -1], mode="same"), 0.0)
    return finish(reverb(out, 0.22, size=1.2))


def syllable(contour, length, warble=0.0, skew=(0.6, 1.6)):
    """One bird note: a pure tone gliding through (position 0–1, Hz) points.

    The glide is interpolated in log-frequency, which is how pitch is heard.
    `warble` adds a fast flutter (fraction of the pitch); `skew` shapes the
    envelope (attack, decay exponents) — quick to speak, slower to fade.
    """
    t = timeline(length)
    u = t / length
    at, hz = zip(*contour)
    f = np.exp(np.interp(u, at, np.log(hz)))
    if warble:
        f *= 1 + warble * np.sin(2 * np.pi * 70 * t)
    phase = 2 * np.pi * np.cumsum(f) / SR
    a, b = skew
    env = u**a * (1 - u) ** b
    env /= env.max()
    # A 4 ms raised-cosine onset: a steep attack on a pure tone clicks.
    n = int(0.004 * SR)
    env[:n] *= np.sin(np.linspace(0, np.pi / 2, n)) ** 2
    # Mostly a pure whistle, with a faint second harmonic for body.
    return env * (np.sin(phase) + 0.06 * np.sin(2 * phase))


def birds(rng):
    """A small songbird: two bright chirps, a quick trill and a rising whistle, then a softer reply."""
    out = np.zeros(int(2.0 * SR))
    tsip = [(0.0, 4000), (0.15, 5600), (1.0, 3400)]
    place(out, 0.85 * syllable(tsip, 0.075), 0.00)
    place(out, 1.00 * syllable(tsip, 0.075), 0.13)
    for i in range(6):
        drop = 0.985**i  # each trill note starts a little lower
        jitter = rng.uniform(0.97, 1.03)  # and not quite evenly, like a real bird
        note = syllable([(0.0, 4800 * drop * jitter), (1.0, 3600 * drop)], 0.038, warble=0.012, skew=(0.8, 1.2))
        place(out, (0.8 - 0.04 * i) * note, 0.34 + 0.052 * i)
    place(out, 0.8 * syllable([(0.0, 2900), (0.7, 4400), (1.0, 4700)], 0.14, skew=(1.0, 1.5)), 0.72)
    # A second bird answers from further away: lower, quieter, with a little room on it.
    # (Only a little: the comb reverb rings metallically on pure tones.)
    reply = np.zeros_like(out)
    place(reply, syllable([(p, f * 0.86) for p, f in tsip], 0.07), 1.05)
    place(reply, syllable([(p, f * 0.86) for p, f in tsip], 0.07), 1.17)
    out += 0.32 * reverb(reply, 0.12, size=0.8)
    # Birdsong sits where phone speakers (and ears) are most sensitive, so leave it a little lower than the bell.
    return finish(out, peak_db=-3.0, fade=0.1)


def seeded(seed, skip=0):
    rng = np.random.default_rng(seed)
    rng.uniform(size=skip)
    return rng


SOUNDS = [
    # (file, recipe, random generator, Vorbis compression level: 0 = best, None = libsndfile's default)
    # The bell once followed a chime that used the first 15 draws; skipping them keeps it identical.
    ("reminder_bell", bell, seeded(7, skip=15), None),
    # Pure whistles need more bits: at the default level the codec error is only 15 dB down.
    ("reminder_birds", birds, seeded(11), 0.2),
]

if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for name, make, rng, level in SOUNDS:
        audio = make(rng)
        path = OUT / f"{name}.ogg"
        quality = {} if level is None else {"compression_level": level}
        sf.write(path, audio.astype(np.float32), SR, format="OGG", subtype="VORBIS", **quality)
        rms = 20 * np.log10(np.sqrt(np.mean(audio[: SR // 2] ** 2)))
        print(f"{path.name}: {len(audio) / SR:.2f} s, first-half-second RMS {rms:.1f} dBFS, {path.stat().st_size // 1024} KB")
