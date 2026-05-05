"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

function readTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const root = document.documentElement;
  return root.classList.contains("dark") ? "dark" : "light";
}

function applyTheme(t: Theme) {
  const root = document.documentElement;
  if (t === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
  try {
    localStorage.setItem("theme", t);
  } catch {
    /* ignore (private mode) */
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(readTheme());
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  }

  // Render a stable placeholder on the server / pre-mount so the icon
  // doesn't flash the wrong shape before hydration.
  if (!mounted) {
    return (
      <button
        aria-label="מצב כהה/בהיר"
        className="rounded-full p-2 hover:bg-surface-100 dark:hover:bg-surface-800"
      >
        <Sun className="size-5" />
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? "מצב בהיר" : "מצב כהה"}
      title={theme === "dark" ? "מעבר למצב בהיר" : "מעבר למצב כהה"}
      className="rounded-full p-2 hover:bg-surface-100 dark:hover:bg-surface-800"
    >
      {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  );
}
