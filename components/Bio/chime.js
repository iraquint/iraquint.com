/**
 * A short original chiptune flourish for the rainbow easter egg.
 *
 * Synthesised with Web Audio rather than played from a file: no asset to ship,
 * and nothing borrowed. (The tune people associate with rainbow cats is
 * somebody's copyrighted composition — this is a plain major arpeggio.)
 */

const NOTES = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1046.5]; // C E G C E C
const STEP = 0.085;   // seconds per note
const PEAK = 0.05;    // quiet — a flourish, not an announcement

// Plays unconditionally. Whether it *should* play is the caller's call, so the
// sound control has one obvious place to live rather than being second-guessed
// from in here.
export default function chime() {
  if (typeof window === "undefined") return;

  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;

  let ctx;
  try { ctx = new AC(); } catch (e) { return; }

  const t0 = ctx.currentTime + 0.02;
  NOTES.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = freq;

    const start = t0 + i * STEP;
    const end = start + STEP * (i === NOTES.length - 1 ? 3 : 1);

    // Ramped rather than switched: a square wave snapped on and off clicks.
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(PEAK, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);

    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(end + 0.02);
  });

  // Browsers cap how many audio contexts a page may hold, so release it.
  const ms = (NOTES.length + 3) * STEP * 1000 + 400;
  setTimeout(() => { try { ctx.close(); } catch (e) {} }, ms);
}
