import { useState, useEffect, useCallback } from "react";
import type { ThemeMode } from "@/components/ThemeSelectorModal";

export function applyThemeToDOM(theme: ThemeMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("theme-white", "theme-black-piano", "dark");
  if (theme === "black-piano") {
    root.classList.add("theme-black-piano", "dark");
  } else {
    root.classList.add("theme-white");
  }
}

export function useHabittatTheme() {
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>(() => {
    if (typeof window !== "undefined") {
      const saved = (localStorage.getItem("habittat_theme") ||
        localStorage.getItem("terephones_theme")) as ThemeMode | null;
      if (saved === "black-piano" || saved === "white") {
        return saved;
      }
    }
    return "white";
  });

  useEffect(() => {
    applyThemeToDOM(currentTheme);

    const handleThemeChanged = (e: any) => {
      const nextTheme = e.detail?.theme;
      if (nextTheme && (nextTheme === "white" || nextTheme === "black-piano")) {
        setCurrentTheme(nextTheme);
        applyThemeToDOM(nextTheme);
      }
    };

    window.addEventListener("theme-changed", handleThemeChanged);
    return () => window.removeEventListener("theme-changed", handleThemeChanged);
  }, [currentTheme]);

  const setTheme = useCallback((theme: ThemeMode) => {
    setCurrentTheme(theme);
    applyThemeToDOM(theme);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("habittat_theme", theme);
      } catch (_) {}
      window.dispatchEvent(new CustomEvent("theme-changed", { detail: { theme } }));
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const next: ThemeMode = currentTheme === "black-piano" ? "white" : "black-piano";
    setTheme(next);
  }, [currentTheme, setTheme]);

  return {
    currentTheme,
    setCurrentTheme: setTheme,
    toggleTheme,
    isDark: currentTheme === "black-piano",
  };
}
