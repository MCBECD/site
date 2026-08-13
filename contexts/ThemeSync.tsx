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
  const effectiveTheme = mounted ? resolvedTheme : "light";

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", effectiveTheme === "dark");
    root.style.colorScheme = effectiveTheme;
  }, [effectiveTheme]);

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
