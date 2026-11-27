"use client";

import { useEffect, useState } from "react";

const KEY = "ideations.theme";

// The label names the mode you'd switch to, as in the mockup.
export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  // The layout's inline script may already have applied dark; read it back.
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem(KEY, next ? "dark" : "light"); } catch (e) {}
    setDark(next);
  }

  return (
    <button
      type="button"
      className="toggle"
      onClick={toggle}
      aria-label="Toggle light and dark mode"
    >
      {dark ? "Light" : "Dark"}
    </button>
  );
}
