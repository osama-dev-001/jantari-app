"""Synthesises the reminder notification sounds into android/app/src/main/res/raw.

The sounds are generated rather than downloaded, so they carry no licence
terms. Run from the repo root after `pip install numpy soundfile`:

    python scripts/make-reminder-sounds.py

Each sound is a sum of decaying sine partials (bell and bar ratios for the
chime and bell, near-harmonic string partials for the harp) through a light
Schroeder reverb. Android plays notification sounds once, so keep them short
(under ~3 s) with the attack right at the start.
"""

from pathlib import Path

import numpy as np
import soundfile as sf

SR = 44100
OUT = Path(__file__).resolve().parent.parent / "android" / "app" / "src" / "main" / "res" / "raw"
rng = np.random.default_rng(7)


def timeline(seconds):
    return np.arange(int(seconds * SR)) / SR


def taper(x, seconds):
    n = min(len(x), int(seconds * SR))
    x[-n:] *= np.cos(np.linspace(0, np.pi / 2, n)) ** 2
    return x


def strike(freq, partials, length, attack=0.003):
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


def chime():
    """Three rising notes on a small glass bar, G5 → C6 → E6."""
    bar = [(1.0, 1.0, 0.9), (2.0, 0.22, 0.45), (2.756, 0.30, 0.28), (5.404, 0.10, 0.1), (8.933, 0.03, 0.05)]
    out = np.zeros(int(3.0 * SR))
    for at, freq, level, ring in [(0.0, 783.99, 0.75, 0.8), (0.13, 1046.5, 0.8, 0.9), (0.26, 1318.5, 1.0, 1.1)]:
        place(out, level * strike(freq, [(r, a, tau * ring) for r, a, tau in bar], 2.7), at)
    return finish(reverb(out, 0.18))


def bell():
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
    place(out, strike(587.33, partials, 3.4, attack=0.004), 0.0)
    # A faint, short "tink" of the striker on top of the attack.
    click = rng.normal(0, 1, int(0.012 * SR)) * np.exp(-np.arange(int(0.012 * SR)) / (0.002 * SR))
    place(out, 0.08 * np.convolve(click, [1, -1], mode="same"), 0.0)
    return finish(reverb(out, 0.22, size=1.2))


def harp():
    """A quick rising arpeggio, D5 F♯5 A5 D6, plucked."""
    def pluck(freq, length=2.6):
        pos = 0.18  # where the string is plucked: lower = brighter
        partials = []
        for n in range(1, 13):
            amp = abs(np.sin(n * np.pi * pos)) / n**2
            ratio = n * np.sqrt(1 + 0.00015 * n * n)  # slight string stiffness
            partials.append((ratio, amp, 1.2 / (1 + 0.8 * (n - 1))))
        return strike(freq, partials, length, attack=0.0012)

    out = np.zeros(int(3.0 * SR))
    for i, freq in enumerate([587.33, 739.99, 880.0, 1174.66]):
        place(out, (0.7 + 0.1 * i) * pluck(freq), 0.075 * i)
    return finish(reverb(out, 0.16))


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for name, make in [("reminder_chime", chime), ("reminder_bell", bell), ("reminder_harp", harp)]:
        audio = make()
        path = OUT / f"{name}.ogg"
        sf.write(path, audio.astype(np.float32), SR, format="OGG", subtype="VORBIS")
        rms = 20 * np.log10(np.sqrt(np.mean(audio[: SR // 2] ** 2)))
        print(f"{path.name}: {len(audio) / SR:.2f} s, first-half-second RMS {rms:.1f} dBFS, {path.stat().st_size // 1024} KB")
