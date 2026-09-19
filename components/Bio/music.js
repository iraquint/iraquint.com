/**
 * A looping chiptune bed for rainbow mode.
 *
 * Synthesised with Web Audio rather than played from a file: nothing to host,
 * and nothing borrowed. The tune people associate with rainbow cats is
 * somebody's copyrighted composition, so this is an original loop — a plain
 * I–vi–IV–V progression with a square lead over a triangle bass.
 *
 * Notes are scheduled slightly ahead of the clock rather than fired from a
 * timer, because setInterval drifts and throttles; the audio clock does not.
 */

const BPM = 125;
const STEP = 60 / BPM / 4;     // seconds per sixteenth = 0.12
// Schedule a long way ahead. Browsers throttle timers in background tabs, but
// notes already queued play on the audio clock regardless — so a generous
// lookahead is what keeps the loop from stuttering when the tab loses focus.
const LOOKAHEAD = 1.0;   // seconds of music queued ahead of the clock
const TICK = 200;        // ms between scheduler wake-ups
const LEAD_PEAK = 0.035;
const BASS_PEAK = 0.045;

// C major · A minor · F major · G major, four steps each.
const LEAD = [
  659.25, 783.99, 1046.5, 783.99,   // E5  G5  C6  G5
  880.0, 1046.5, 1318.51, 1046.5,   // A5  C6  E6  C6
  698.46, 880.0, 1046.5, 880.0,     // F5  A5  C6  A5
  783.99, 987.77, 1174.66, 987.77,  // G5  B5  D6  B5
];
const BASS = [130.81, 110.0, 87.31, 98.0]; // C3 A2 F2 G2

let ctx = null;
let master = null;
let timer = null;
let step = 0;
let nextTime = 0;

function voice(time, freq, dur, type, peak) {
  if (!ctx || !master) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  // Ramped, never switched: a square wave snapped on or off clicks audibly.
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(peak, time + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
  osc.connect(gain).connect(master);
  osc.start(time);
  osc.stop(time + dur + 0.02);
}

function tick() {
  if (!ctx) return;
  // If the tab was backgrounded long enough for the timer to stall, the audio
  // clock has run on without us. Resync to the present rather than dumping
  // every overdue note into one instant.
  if (nextTime < ctx.currentTime - 0.25) nextTime = ctx.currentTime + 0.05;
  while (nextTime < ctx.currentTime + LOOKAHEAD) {
    const i = step % LEAD.length;
    voice(nextTime, LEAD[i], STEP * 0.85, "square", LEAD_PEAK);
    // Bass lands on the downbeat of each chord and rings through it.
    if (i % 4 === 0) {
      voice(nextTime, BASS[(i / 4) % BASS.length], STEP * 3.4, "triangle", BASS_PEAK);
    }
    nextTime += STEP;
    step++;
  }
}

export function start() {
  if (ctx || typeof window === "undefined") return;   // already running
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  try { ctx = new AC(); } catch (e) { ctx = null; return; }

  master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, ctx.currentTime);
  master.gain.exponentialRampToValueAtTime(1, ctx.currentTime + 0.25);
  master.connect(ctx.destination);

  step = 0;
  nextTime = ctx.currentTime + 0.06;
  timer = setInterval(tick, TICK);
  tick();
}

export function stop() {
  if (!ctx) return;
  clearInterval(timer);
  timer = null;

  // Hand the nodes to the fade-out and clear the module state immediately, so
  // a start() racing this one builds a fresh context rather than reusing a
  // context that is already closing.
  const dying = ctx;
  const gain = master;
  ctx = null;
  master = null;

  try {
    const t = dying.currentTime;
    gain.gain.cancelScheduledValues(t);
    gain.gain.setValueAtTime(gain.gain.value || 0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
  } catch (e) { /* fall through to close */ }

  setTimeout(() => { try { dying.close(); } catch (e) {} }, 400);
}

export function isPlaying() {
  return ctx !== null;
}
