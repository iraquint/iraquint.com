"use client";

import { useEffect } from "react";
import mountInk from "./ink";

export default function Bio() {
  useEffect(() => mountInk(), []);

  return (
    <div className="sheet">
      {/* Name and role sit outside #doc: they are never inked, and keeping them
          here lets the control fall between them and the body on mobile. */}
      <div className="namerow">
        <h1>Ira Quint</h1>
        <div className="seg" id="seg" role="radiogroup" aria-label="Appearance">
          <span className="seg-thumb" aria-hidden="true" />
          <button className="seg-btn" role="radio" aria-checked="true" data-theme-value="light">
            Light
          </button>
          <button className="seg-btn" role="radio" aria-checked="false" data-theme-value="dark">
            Dark
          </button>
          <button className="seg-btn" role="radio" aria-checked="false" data-theme-value="rainbow">
            Rainbow
          </button>
        </div>
      </div>

      <p className="kicker">Product engineer · Washington, D.C.</p>

      <div className="wrap">
        <canvas id="ink" />
        <div id="doc">
          {/* Inside #doc so the canvas can reach it. `intro` makes it un-redact
              itself shortly after load and then stay legible — the instruction
              demonstrates the mechanic it describes. */}
          <div className="hint">
            <span className="hover-only line intro">mouse over a line to read it · hold <kbd>⌥</kbd> to reveal everything</span>
            <span className="touch-only line intro">tap a line to read it · <button className="linkish" id="revealAll">reveal everything</button></span>
          </div>

          {/* Kept on one line: .line is white-space:pre-wrap, so JSX line breaks
              here would become literal spaces in the rendered text. */}
          <div className="line">Full-stack product engineer with almost 8 years spanning product, UX, and engineering, from bootstrapped startups to Series C. I turn ambiguous customer problems into intuitive software.</div>

          <div className="gap" />

          <div className="line">
            <span className="lbl">Now</span>
            <a href="mailto:ira.j.quint@gmail.com">Your startup? Get in touch.</a>
          </div>
          <div className="line">
            <span className="lbl">Before</span>Strider · HeyTaco · GOLF+ · Curiosity Media
          </div>
          <div className="line">
            <span className="lbl">School</span>BA Computer Science, UVA
          </div>

          <div className="gap" />

          <div className="line">Off the clock: trying to dunk a basketball, teaching at <a href="https://www.downdogyoga.com/" target="_blank" rel="noopener">Down Dog Yoga</a>, cooking, or talking to strangers.</div>

          <div className="rule" />

          <div className="line">
            <span className="lbl">Resume</span>
            <a href="https://iraquint.com/resume" target="_blank" rel="noopener">
              iraquint.com/resume
            </a>
          </div>
          <div className="line">
            <span className="lbl">LinkedIn</span>
            <a href="https://www.linkedin.com/in/iraquint/" target="_blank" rel="noopener">
              linkedin.com/in/iraquint
            </a>
          </div>
          <div className="line">
            <span className="lbl">Code</span>
            <a href="https://github.com/iraquint" target="_blank" rel="noopener">
              github.com/iraquint
            </a>
          </div>
          <div className="line">
            <span className="lbl">Elsewhere</span>
            <a href="https://twitter.com/ira_quint" target="_blank" rel="noopener">
              x
            </a>{" "}
            ·{" "}
            <a href="https://instagram.com/ira.does.things" target="_blank" rel="noopener">
              instagram
            </a>
          </div>

          {/* Inside #doc so the canvas reaches it. Only the span is inked. */}
          <div className="foot">
            built with claude code 🤖 and some secret sauce:{" "}
            <span className="line gold">exquisite taste</span>
          </div>
        </div>
      </div>
    </div>
  );
}
