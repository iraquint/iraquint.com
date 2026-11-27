"use client";

import { useEffect, useRef } from "react";

// The sprint, as a silent full-bleed loop under the headline. It's footage,
// not a player: no controls, no sound. Reduced motion gets the still frame.
export default function SprintStrip() {
  const ref = useRef(null);

  useEffect(() => {
    const video = ref.current;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      if (mq.matches) { video.pause(); video.currentTime = 0; }
      else video.play().catch(() => {});
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <div className="sprint">
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="auto"
        poster="/assets/train-sprint-poster.jpg"
        aria-label="Ira sprinting across a football field"
      >
        <source src="/assets/train-sprint.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
