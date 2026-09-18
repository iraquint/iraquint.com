/**
 * The DVD-logo bounce, with a face on it.
 *
 * Constant velocity, reversing the relevant component whenever it reaches a
 * viewport edge. Hitting an exact corner — both axes flipping in the same
 * frame — is the whole point of the genre, so it gets marked when it happens.
 */

const SIZE = 96;    // px, matches the CSS box
const SPEED = 82;   // px per second

export default function mountFloater(el) {
  if (!el || typeof window === "undefined") return () => {};

  // A thing ricocheting around the screen is precisely what this setting is
  // asking not to see.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    el.hidden = true;
    return () => {};
  }

  const bounds = () => ({
    maxX: Math.max(0, window.innerWidth - SIZE),
    maxY: Math.max(0, window.innerHeight - SIZE),
  });

  let { maxX, maxY } = bounds();
  let x = Math.random() * maxX;
  let y = Math.random() * maxY;

  // Keep the angle off the axes, or it slides along an edge and never bounces.
  const rad = ((25 + Math.random() * 40) * Math.PI) / 180;
  let vx = Math.cos(rad) * SPEED * (Math.random() < 0.5 ? -1 : 1);
  let vy = Math.sin(rad) * SPEED * (Math.random() < 0.5 ? -1 : 1);

  let raf = 0;
  let last = 0;
  let flash = 0;

  function corner() {
    el.classList.add("corner");
    clearTimeout(flash);
    flash = setTimeout(() => el.classList.remove("corner"), 1100);
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
    last = now;

    ({ maxX, maxY } = bounds());
    x += vx * dt;
    y += vy * dt;

    let hitX = false;
    let hitY = false;
    if (x <= 0)        { x = 0;    vx = Math.abs(vx);  hitX = true; }
    else if (x >= maxX){ x = maxX; vx = -Math.abs(vx); hitX = true; }
    if (y <= 0)        { y = 0;    vy = Math.abs(vy);  hitY = true; }
    else if (y >= maxY){ y = maxY; vy = -Math.abs(vy); hitY = true; }

    if (hitX && hitY) corner();   // the one everyone waits for

    el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
  }

  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    clearTimeout(flash);
  };
}
