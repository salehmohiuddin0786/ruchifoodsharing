/**
 * RUCHI Platform Web Audio Synthesizer Engine
 * 
 * Generates instant, high-fidelity acoustic notification chimes with zero network latency,
 * zero audio-asset 404s, and cross-platform desktop/mobile support.
 */

let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Resume or unlock Web Audio API on first user interaction (browser autoplay policy)
 */
export function unlockAudio() {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
}

/**
 * Play a single harmonic tone
 */
function playTone(ctx, freq, startTime, duration, masterGain, type = 'sine') {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  // Attack & Exponential Decay to avoid audio pops
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(1, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(masterGain);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

/**
 * Synthesizes 3 distinct, pleasant acoustic notification alerts:
 * 1. DISH_CHIME: Bright ascending culinary chime (C5 -> E5 -> G5)
 * 2. PREORDER_BELL: Two-tone alert bell (A5 -> D6)
 * 3. FREE_FOOD_CHORD: Heartful warm resonant chord (F4 + A4 + C5)
 */
export function playNotificationSound(soundType = 'DISH_CHIME', volume = 0.8) {
  if (typeof window === 'undefined') return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().then(() => playSoundNodes(ctx, soundType, volume)).catch(() => {});
    } else {
      playSoundNodes(ctx, soundType, volume);
    }
  } catch (err) {
    console.warn('Audio alert playback error:', err);
  }
}

function playSoundNodes(ctx, soundType, volume) {
  const masterGain = ctx.createGain();
  const vol = Math.max(0, Math.min(1, Number(volume) || 0.8));
  masterGain.gain.setValueAtTime(vol * 0.45, ctx.currentTime);
  masterGain.connect(ctx.destination);

  const now = ctx.currentTime;

  switch (soundType) {
    case 'DISH_CHIME':
    case 'NEW_DISH':
      // 🍽️ Bright ascending 3-note culinary chime (C5 523Hz -> E5 659Hz -> G5 784Hz)
      playTone(ctx, 523.25, now, 0.25, masterGain, 'sine');
      playTone(ctx, 659.25, now + 0.1, 0.28, masterGain, 'triangle');
      playTone(ctx, 783.99, now + 0.22, 0.45, masterGain, 'sine');
      playTone(ctx, 1046.5, now + 0.24, 0.5, masterGain, 'sine'); // High C6 overtone
      break;

    case 'PREORDER_BELL':
    case 'NEW_PREORDER':
      // 🔔 Two-tone alert bell with rich resonance (A5 880Hz -> D6 1174Hz)
      playTone(ctx, 880.0, now, 0.35, masterGain, 'triangle');
      playTone(ctx, 1760.0, now, 0.2, masterGain, 'sine'); // chime overtone
      playTone(ctx, 1174.66, now + 0.14, 0.55, masterGain, 'sine');
      playTone(ctx, 2349.32, now + 0.14, 0.4, masterGain, 'triangle');
      break;

    case 'FREE_FOOD_CHORD':
    case 'FREE_FOOD':
      // ❤️ Heartful warm resonant chord (F4 349Hz, A4 440Hz, C5 523Hz, E5 659Hz)
      playTone(ctx, 349.23, now, 0.6, masterGain, 'sine');
      playTone(ctx, 440.0, now + 0.04, 0.6, masterGain, 'triangle');
      playTone(ctx, 523.25, now + 0.08, 0.7, masterGain, 'sine');
      playTone(ctx, 659.25, now + 0.12, 0.75, masterGain, 'sine');
      break;

    default:
      // Standard gentle double-chime
      playTone(ctx, 600, now, 0.15, masterGain, 'sine');
      playTone(ctx, 800, now + 0.1, 0.3, masterGain, 'sine');
      break;
  }
}
