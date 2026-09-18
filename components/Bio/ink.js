/**
 * Invisible-ink redaction engine for the bio sheet.
 *
 * Paints a cover in the shape of each word onto a canvas laid over the text,
 * with sparkles on top. Hovering (or tapping) a line clears the cover from a
 * disc that grows out of the pointer; after a hold it fills back in the same
 * way. Called once on mount; returns a teardown for React.
 */
export default function mountInk() {
  let rafId = 0;

  const doc    = document.getElementById("doc");
  const canvas = document.getElementById("ink");
  const ctx    = canvas.getContext("2d");
  const lines  = [...doc.querySelectorAll(".line")];

  const REVEAL  = 600;    // ms for the reveal disc to clear the whole line
  const HOLD    = 5000;   // ms legible after the pointer leaves
  const FADE    = 3000;   // ms for the redaction disc to swallow the line
  const RESET   = 240;    // ms to collapse a redaction when the pointer comes back
  const FEATHER = 0.74;   // inner fraction of a disc that is fully solid
  const MAXP    = 4000;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let rects = [], particles = [], dirty = true;
  let byLine = new Map();
  let hoverLine = null, altHeld = false, lastT = 0;
  let mouse = { x: 0, y: 0 };

  // mode: hidden | revealing | shown | redacting
  // r is a radius around (ox,oy): the REVEALED disc while revealing,
  // the REDACTED disc while redacting. Both grow outward from the cursor.
  const st = new Map();
  for (const l of lines) {
    st.set(l, { mode: reduce ? "shown" : "hidden", r: 0, maxR: 0, ox: 0, oy: 0, hold: 0, pt: null });
  }

  /* ---------- geometry: one box per word ---------- */

  function computeRects() {
    const out = [];
    const base = doc.getBoundingClientRect();
    for (const line of lines) {
      const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        const text = node.nodeValue;
        const re = /\S+/g; let m;
        while ((m = re.exec(text))) {
          const r = document.createRange();
          r.setStart(node, m.index);
          r.setEnd(node, m.index + m[0].length);
          for (const b of r.getClientRects()) {
            if (b.width < .5 || b.height < .5) continue;
            const padY = b.height * 0.2;
            out.push({
              x: b.left - base.left,
              y: b.top - base.top + padY,
              w: b.width,
              h: Math.max(2, b.height - padY * 2),
              line
            });
          }
        }
      }
    }
    return out;
  }

  function index() {
    byLine = new Map();
    for (const r of rects) {
      let e = byLine.get(r.line);
      if (!e) { e = { rects: [], bbox: null }; byLine.set(r.line, e); }
      e.rects.push(r);
    }
    for (const e of byLine.values()) {
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const r of e.rects) {
        x0 = Math.min(x0, r.x); y0 = Math.min(y0, r.y);
        x1 = Math.max(x1, r.x + r.w); y1 = Math.max(y1, r.y + r.h);
      }
      e.bbox = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };

      // Hover targets: one span per visual row, ending where the text ends.
      // Gaps between words on a row stay active; trailing whitespace does not.
      const sorted = [...e.rects].sort((a, b) => (a.y - b.y) || (a.x - b.x));
      const rows = [];
      for (const r of sorted) {
        const last = rows[rows.length - 1];
        if (last && Math.abs(r.y - last.y0) < r.h * 0.6) {
          last.x0 = Math.min(last.x0, r.x);
          last.x1 = Math.max(last.x1, r.x + r.w);
          last.y0 = Math.min(last.y0, r.y);
          last.y1 = Math.max(last.y1, r.y + r.h);
        } else {
          rows.push({ x0: r.x, x1: r.x + r.w, y0: r.y, y1: r.y + r.h });
        }
      }
      // Give back the vertical inset the word boxes were trimmed by.
      for (const row of rows) {
        const pad = (row.y1 - row.y0) * 0.33;
        row.y0 -= pad; row.y1 += pad;
      }
      e.rows = rows;
    }
  }

  /* ---------- theme ---------- */

  const THEME_KEY = "ideations.theme";
  const THEMES = ["light", "dark", "rainbow"];
  const seg = document.getElementById("seg");
  const segBtns = [...seg.querySelectorAll(".seg-btn")];
  const NYAN = ["#ff0000", "#ff9900", "#ffff00", "#33ff00", "#0099ff", "#6633ff"];
  let pal = null;
  let rainbow = false;

  // One palette per line, read once per theme change rather than once per frame.
  // Custom properties inherit, so a line carrying .gold reports its own colours.
  function readPalette() {
    const m = new Map();
    for (const line of lines) {
      const cs = getComputedStyle(line);
      m.set(line, {
        cover: cs.getPropertyValue("--cover").trim(),
        dust:  "rgba(" + cs.getPropertyValue("--dust").trim() + ",1)",
        glint: "rgb(" + cs.getPropertyValue("--glint").trim() + ")",
        // Rainbow paints every line except the gold easter egg, which keeps
        // its own colours so it stays a distinct find.
        nyan:  rainbow && !line.classList.contains("gold")
      });
    }
    return m;
  }

  // Hard-stopped bands across a word box, so each word reads as a nyan trail.
  function nyanGrad(y, h) {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    for (let i = 0; i < NYAN.length; i++) {
      g.addColorStop(i / NYAN.length, NYAN[i]);
      g.addColorStop((i + 1) / NYAN.length, NYAN[i]);
    }
    return g;
  }

  function applyTheme(t) {
    if (!THEMES.includes(t)) t = "light";
    if (t === "light") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = t;
    rainbow = t === "rainbow";
    // Light and dark are preferences worth remembering. Rainbow is a gag —
    // never restore into it, so the page always reopens in light.
    try {
      if (t === "rainbow") localStorage.removeItem(THEME_KEY);
      else localStorage.setItem(THEME_KEY, t);
    } catch (e) {}
    pal = readPalette();
    dirty = true;                       // gradients are rebuilt with the rects
    seg.dataset.i = String(THEMES.indexOf(t));
    segBtns.forEach(b =>
      b.setAttribute("aria-checked", String(b.dataset.themeValue === t)));
  }

  segBtns.forEach(b =>
    b.addEventListener("click", () => applyTheme(b.dataset.themeValue)));

  // Light is the default; another mode only if explicitly chosen before.
  let saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
  applyTheme(THEMES.includes(saved) ? saved : "light");

  const HIT_X = 3;   // px of horizontal slack at the text edges

  function hitTest(x, y) {
    for (const line of lines) {
      const e = byLine.get(line);
      if (!e || !e.rows) continue;
      for (const row of e.rows) {
        if (x >= row.x0 - HIT_X && x <= row.x1 + HIT_X && y >= row.y0 && y <= row.y1)
          return line;
      }
    }
    return null;
  }

  function buildParticles() {
    rects = computeRects();
    index();
    particles = [];
    if (!rects.length) return;
    // Built once per layout, not per frame.
    if (rainbow) for (const r of rects) r.grad = nyanGrad(r.y, r.h);
    const area = rects.reduce((s, r) => s + r.w * r.h, 0);
    const budget = Math.min(MAXP, Math.round(area * 0.05));
    for (const r of rects) {
      const n = Math.max(4, Math.round(budget * (r.w * r.h) / area));
      for (let i = 0; i < n; i++) {
        const kind = Math.random();
        particles.push({
          hx: r.x + Math.random() * r.w,
          hy: r.y + Math.random() * r.h,
          line: r.line,
          glint: kind > 0.90,
          s: kind > 0.74 ? 2 : 1,
          a: 0.26 + Math.random() * 0.64,
          ph: Math.random() * Math.PI * 2,
          sp: 2.2 + Math.random() * 5.4,
          ax: 0.5 + Math.random() * 1.4,
          ay: 0.3 + Math.random() * 0.9
        });
      }
    }
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = doc.offsetWidth, h = Math.max(doc.offsetHeight, 10);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dirty = true;
  }

  function farthestCorner(bb, ox, oy) {
    let m = 0;
    for (const x of [bb.x, bb.x + bb.w])
      for (const y of [bb.y, bb.y + bb.h])
        m = Math.max(m, Math.hypot(x - ox, y - oy));
    return m;
  }

  // Anchor a disc at a point on this line and size it to cover the line.
  function anchor(s, e, pt) {
    const o = pt || { x: e.bbox.x + e.bbox.w / 2, y: e.bbox.y + e.bbox.h / 2 };
    s.ox = o.x; s.oy = o.y;
    s.maxR = farthestCorner(e.bbox, s.ox, s.oy) + 12;
    s.r = 0;
  }

  /* ---------- per-line state machine ---------- */

  function update(now, dt) {
    for (const line of lines) {
      const s = st.get(line);
      const hovered = !reduce && (line === hoverLine || altHeld);
      const e = byLine.get(line);
      if (!e) continue;

      switch (s.mode) {
        case "hidden":
          if (hovered) { anchor(s, e, s.pt || mouse); s.mode = "revealing"; }
          break;

        case "revealing": {
          // Grows outward from where the cursor entered. A brushed line finishes.
          s.r += (s.maxR / (REVEAL / 1000)) * dt;
          if (s.r >= s.maxR) { s.r = s.maxR; s.mode = "shown"; s.hold = now + HOLD; }
          break;
        }

        case "shown":
          if (hovered) s.hold = now + HOLD;
          if (now > s.hold) { anchor(s, e, s.pt); s.mode = "redacting"; }
          break;

        case "redacting": {
          if (hovered) {
            // Coming back resets the line: the redaction collapses quickly and
            // the full HOLD starts over, rather than easing back at fade speed.
            s.r -= (s.maxR / (RESET / 1000)) * dt;
            if (s.r <= 0) { s.r = 0; s.mode = "shown"; s.hold = now + HOLD; }
          } else {
            s.r += (s.maxR / (FADE / 1000)) * dt;
            if (s.r >= s.maxR) { s.mode = "hidden"; s.r = 0; }
          }
          break;
        }
      }
      line.classList.toggle("hidden", s.mode !== "shown");
    }
  }

  /* ---------- render ---------- */

  function frame(now) {
    rafId = requestAnimationFrame(frame);
    const dt = lastT ? Math.min(0.05, (now - lastT) / 1000) : 0.016;
    lastT = now;

    if (dirty) { buildParticles(); dirty = false; }
    update(now, dt);

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    if (!rects.length) return;

    const t = now / 1000;

    // 1 — cover, per line
    for (const line of lines) {
      const s = st.get(line);
      if (s.mode === "shown") continue;
      const e = byLine.get(line);
      if (!e) continue;

      const pad = { x: e.bbox.x - 2, y: e.bbox.y - 2, w: e.bbox.w + 4, h: e.bbox.h + 4 };

      ctx.save();
      ctx.beginPath();
      ctx.rect(pad.x, pad.y, pad.w, pad.h);
      ctx.clip();
      ctx.globalAlpha = 1;
      const cp = pal.get(line);
      if (cp.nyan) {
        for (const r of e.rects) {
          ctx.fillStyle = r.grad || cp.cover;
          ctx.fillRect(r.x, r.y, r.w, r.h);
        }
      } else {
        ctx.fillStyle = cp.cover;
        for (const r of e.rects) ctx.fillRect(r.x, r.y, r.w, r.h);
      }

      if (s.mode !== "hidden") {
        const R = Math.max(1, s.r);
        const g = ctx.createRadialGradient(s.ox, s.oy, 0, s.ox, s.oy, R);
        if (s.mode === "revealing") {
          // erase INSIDE the disc — the clear patch spreads out from the cursor
          g.addColorStop(0, "rgba(0,0,0,1)");
          g.addColorStop(FEATHER, "rgba(0,0,0,1)");
          g.addColorStop(1, "rgba(0,0,0,0)");
        } else {
          // erase OUTSIDE the disc — the redaction spreads out from the cursor
          g.addColorStop(0, "rgba(0,0,0,0)");
          g.addColorStop(FEATHER, "rgba(0,0,0,0)");
          g.addColorStop(1, "rgba(0,0,0,1)");
        }
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = g;
        ctx.fillRect(pad.x, pad.y, pad.w, pad.h);
        ctx.globalCompositeOperation = "source-over";
      }
      ctx.restore();
    }

    // 2 — sparkle, matching the cover beneath it
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const s = st.get(p.line);
      if (s.mode === "shown") continue;

      let vis = 1;
      if (s.mode !== "hidden") {
        const d = Math.hypot(p.hx - s.ox, p.hy - s.oy);
        const inner = s.r * FEATHER;
        const band = Math.max(1, s.r - inner);
        if (s.mode === "revealing") {
          if (d <= inner) continue;                       // inside the clear patch
          vis = d >= s.r ? 1 : (d - inner) / band;
        } else {
          if (d >= s.r) continue;                         // outside the redacted patch
          vis = d <= inner ? 1 : 1 - (d - inner) / band;
        }
      }

      const x = p.hx + Math.sin(t * p.sp * 0.5 + p.ph) * p.ax;
      const y = p.hy + Math.cos(t * p.sp * 0.4 + p.ph) * p.ay;
      const cp = pal.get(p.line);

      if (p.glint) {
        const k = Math.pow(Math.max(0, Math.sin(t * p.sp * 0.8 + p.ph)), 9);
        if (k < 0.04) continue;
        ctx.globalAlpha = Math.min(1, k * 1.2) * vis;
        ctx.fillStyle = cp.glint;
        ctx.fillRect(x - 2.4, y, 4.8, 1);
        ctx.fillRect(x, y - 2.4, 1, 4.8);
      } else {
        ctx.globalAlpha = p.a * (0.34 + 0.66 * (0.5 + 0.5 * Math.sin(t * p.sp + p.ph))) * vis;
        ctx.fillStyle = cp.dust;
        ctx.fillRect(x, y, p.s, p.s);
      }
    }
    ctx.globalAlpha = 1;
  }

  /* ---------- interaction ---------- */

  doc.addEventListener("mousemove", (e) => {
    const base = doc.getBoundingClientRect();
    mouse = { x: e.clientX - base.left, y: e.clientY - base.top };
    // Geometry decides the hover, not the element box — so the empty space
    // after a short line is dead, and the cursor must be on the text itself.
    const line = hitTest(mouse.x, mouse.y);
    hoverLine = line;
    if (line) st.get(line).pt = { x: mouse.x, y: mouse.y };
  });
  doc.addEventListener("mouseleave", () => { hoverLine = null; });

  // Touch has no hover, so a tap stands in for it: reveal from the tap point,
  // then let the usual hold-and-redact cycle run. Links inside a hidden line
  // are pointer-events:none, so the first tap reveals and the second follows.
  doc.addEventListener("pointerdown", (e) => {
    const base = doc.getBoundingClientRect();
    const x = e.clientX - base.left, y = e.clientY - base.top;
    const line = hitTest(x, y);
    if (!line) return;
    const s = st.get(line), en = byLine.get(line);
    if (!en) return;
    s.pt = { x, y };
    const now = performance.now();
    if (s.mode === "hidden") { anchor(s, en, s.pt); s.mode = "revealing"; }
    else if (s.mode === "redacting") { s.r = 0; s.mode = "shown"; s.hold = now + HOLD; }
    else if (s.mode === "shown") { s.hold = now + HOLD; }
  });

  const revealAllBtn = document.getElementById("revealAll");
  revealAllBtn.addEventListener("click", () => {
    altHeld = !altHeld;                  // same flag the ⌥ key drives
    revealAllBtn.textContent = altHeld ? "hide everything" : "reveal everything";
  });

  // Named so they can be detached again — listeners on `doc` and its children
  // die with the DOM on unmount, but window-level ones would outlive it.
  const onKeyDown = (e) => { if (e.key === "Alt") altHeld = true; };
  const onKeyUp   = (e) => { if (e.key === "Alt") altHeld = false; };
  const onBlur    = () => { altHeld = false; };

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", onBlur);
  window.addEventListener("resize", resize);

  const ro = new ResizeObserver(resize);
  ro.observe(doc);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(resize);

  resize();
  rafId = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(rafId);
    ro.disconnect();
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    window.removeEventListener("blur", onBlur);
    window.removeEventListener("resize", resize);
  };
}
