"use client";

import { useEffect, useState, useMemo, type ReactNode } from "react";
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
 *
 * Not a Context Provider, just a side-effect component.
 */
export function ThemeSync({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const { theme } = settings;

  // Always match SSR default during first render to avoid hydration mismatch.
  // SSR: theme defaults to "system" + resolveSystemTheme() returns "light".
  // Client: user persisted theme may differ — we apply it only after mount.
  const [mounted, setMounted] = useState(false);
  const resolvedTheme = useMemo(() => resolveTheme(theme), [theme]);
  const effectiveTheme = mounted ? resolvedTheme : "light";

  useEffect(() => {
    setMounted(true);
  }, []);

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
