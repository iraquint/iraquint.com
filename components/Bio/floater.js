/**
 * The DVD-logo bounce, with a face on it.
 *
 * Constant velocity, reversing the relevant component whenever it reaches a
 * viewport edge. Hitting an exact corner — both axes flipping in the same
 * frame — is the whole point of the genre, so it gets marked when it happens.
 */

const SIZE = 96;         // px, matches the CSS box
const SPEED = 82;        // px per second
const POP_MS = 420;      // click-to-pop duration
const POP_SCALE = 0.30;  // extra swell at the peak of a click
const HOVER_SCALE = 1.4; // held-open size while the cursor is on it
const EASE = 9;          // how quickly the hover swell catches up, per second

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
  let swell = 1;   // current hover size, eased toward its target each frame

  // Hover is measured against the cursor rather than listened for on the
  // element: it is pointer-events:none so that it can never swallow a click,
  // which also means it receives no mouse events of its own.
  let mx = -1e5;
  let my = -1e5;
  const onMove = (e) => { mx = e.clientX; my = e.clientY; };
  const onOut = (e) => { if (!e.relatedTarget) { mx = -1e5; my = -1e5; } };
  window.addEventListener("mousemove", onMove, { passive: true });
  window.addEventListener("mouseout", onOut, { passive: true });
  window.addEventListener("blur", onOut, { passive: true });

  // Clicks are matched against the circle for the same reason as hover. The
  // click still reaches whatever is underneath, so this only ever adds a pop.
  let popAt = 0;
  const onClick = (e) => {
    const inside =
      Math.hypot(e.clientX - (x + SIZE / 2), e.clientY - (y + SIZE / 2)) <= (SIZE / 2) * swell;
    if (!inside) return;
    popAt = performance.now();
    el.classList.add("pop");     // set here, not in the loop, so the ring
  };                             // responds on the press rather than a frame later
  window.addEventListener("click", onClick, { passive: true });

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

    // It never stops travelling — hovering swells it instead, which reads as
    // "look at me" rather than "caught".
    x += vx * dt;
    y += vy * dt;

    let hitX = false;
    let hitY = false;
    if (x <= 0)        { x = 0;    vx = Math.abs(vx);  hitX = true; }
    else if (x >= maxX){ x = maxX; vx = -Math.abs(vx); hitX = true; }
    if (y <= 0)        { y = 0;    vy = Math.abs(vy);  hitY = true; }
    else if (y >= maxY){ y = maxY; vy = -Math.abs(vy); hitY = true; }

    if (hitX && hitY) corner();   // the one everyone waits for

    // Test against the drawn radius, so the swell keeps itself under the
    // cursor instead of flickering at the rim it just grew past.
    const hovered =
      Math.hypot(mx - (x + SIZE / 2), my - (y + SIZE / 2)) <= (SIZE / 2) * swell;
    el.classList.toggle("hovered", hovered);

    // Ease toward the hover size rather than snapping to it.
    const target = hovered ? HOVER_SCALE : 1;
    swell += (target - swell) * Math.min(1, dt * EASE);

    // The click pop rides on top of whatever the hover swell is doing. Both
    // live in this transform because the loop rewrites it every frame and
    // would overwrite a CSS animation on the same property.
    let pop = 0;
    if (popAt) {
      const k = (now - popAt) / POP_MS;
      if (k >= 1) { popAt = 0; el.classList.remove("pop"); }
      else pop = POP_SCALE * Math.sin(Math.PI * k);   // up and back
    }

    const scale = swell + pop;
    el.style.transform =
      `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
  }

  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    clearTimeout(flash);
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseout", onOut);
    window.removeEventListener("blur", onOut);
    window.removeEventListener("click", onClick);
  };
}
