"use client";

import { useEffect, type ReactNode } from "react";
import { useSettings, type Theme } from "./SettingsContext";

function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}

/**
 * ThemeSync — Syncs the theme setting from SettingsContext to the DOM.
 *
 * Single responsibility: only handles dark class and color-scheme DOM manipulation,
 * and listens for system theme changes (when user selects "system").
 */
export function ThemeSync({ children, mounted }: { children: ReactNode; mounted: boolean }) {
  const { settings } = useSettings();
  const { theme } = settings;

  const resolvedTheme = resolveTheme(theme);

  useEffect(() => {
    // Don't touch the DOM until after hydration: the inline <head> script in
    // layout.tsx has already applied the correct `dark` class pre-paint. Forcing
    // `effectiveTheme = "light"` here would strip that class on first render and
    // cause a visible light-theme flash for dark-mode users.
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.toggle("dark", resolvedTheme === "dark");
    root.style.colorScheme = resolvedTheme;
  }, [mounted, resolvedTheme]);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const sys = mq.matches ? "dark" : "light";
      document.documentElement.classList.toggle("dark", sys === "dark");
      document.documentElement.style.colorScheme = sys;
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  return children;
}
