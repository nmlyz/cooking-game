// All sound is synthesised with WebAudio: no audio files, nothing fetched.
// A tiny synth for clicks, chops, sizzles, dings and coin arpeggios, with a
// mute that survives between visits.

const MUTE_KEY = 'sizzle-and-serve.muted';

export function createAudio() {
  let context = null;
  let muted = false;
  try {
    muted = window.localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    muted = false;
  }

  function ensure() {
    if (context) return context;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    context = new AudioContext();
    return context;
  }

  /** Resume the context on the first user gesture (browsers block autoplay). */
  function unlock() {
    const ctx = ensure();
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  function tone(freq, dur, type, gain, when = 0, slideTo = 0) {
    if (muted) return;
    const ctx = ensure();
    if (!ctx) return;
    const t0 = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    amp.gain.setValueAtTime(0.0001, t0);
    amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(amp).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  function noise(dur, gain, filterFreq, when = 0) {
    if (muted) return;
    const ctx = ensure();
    if (!ctx) return;
    const t0 = ctx.currentTime + when;
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq;
    filter.Q.value = 0.8;
    const amp = ctx.createGain();
    amp.gain.setValueAtTime(gain, t0);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filter).connect(amp).connect(ctx.destination);
    src.start(t0);
  }

  return {
    get muted() {
      return muted;
    },
    toggleMuted() {
      muted = !muted;
      try {
        window.localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
      } catch {
        // Storage can be off: the mute then lasts this visit only.
      }
      return muted;
    },
    unlock,
    click() {
      tone(660, 0.07, 'triangle', 0.12);
    },
    pickup() {
      tone(520, 0.08, 'sine', 0.14, 0, 780);
    },
    place() {
      tone(392, 0.09, 'triangle', 0.14, 0, 330);
      noise(0.06, 0.08, 2400);
    },
    chop() {
      noise(0.07, 0.22, 1800);
      tone(190, 0.06, 'square', 0.08);
    },
    chopped() {
      tone(740, 0.09, 'triangle', 0.14);
      tone(988, 0.12, 'triangle', 0.12, 0.07);
    },
    sizzle() {
      noise(0.5, 0.1, 5200);
    },
    grillDone() {
      tone(880, 0.12, 'sine', 0.14);
      tone(1174, 0.16, 'sine', 0.12, 0.1);
    },
    burnt() {
      tone(220, 0.25, 'sawtooth', 0.1, 0, 110);
    },
    serve() {
      tone(1046, 0.12, 'triangle', 0.16);
      tone(1318, 0.12, 'triangle', 0.16, 0.09);
      tone(1568, 0.2, 'triangle', 0.16, 0.18);
    },
    coin() {
      tone(1318, 0.09, 'square', 0.07);
      tone(1760, 0.14, 'square', 0.07, 0.07);
    },
    error() {
      tone(160, 0.18, 'sawtooth', 0.12, 0, 120);
    },
    walkout() {
      tone(392, 0.2, 'triangle', 0.12, 0, 262);
      tone(262, 0.3, 'triangle', 0.12, 0.18);
    },
    tick() {
      tone(980, 0.05, 'square', 0.06);
    },
    rush() {
      // Rising three-note alarm for the Lunch Rush.
      tone(659, 0.14, 'square', 0.12);
      tone(880, 0.14, 'square', 0.12, 0.13);
      tone(1318, 0.24, 'square', 0.13, 0.26);
    },
    win() {
      [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.22, 'triangle', 0.15, i * 0.11));
    },
  };
}
