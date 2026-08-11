"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useSettings } from "./SettingsContext";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const { theme } = settings;

  // Always match SSR default during first render to avoid hydration mismatch.
  // SSR: theme defaults to "system" + resolveSystemTheme() returns "light".
  // Client: user persisted theme may differ — we apply it only after mount.
  const [mounted, setMounted] = useState(false);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const compute = (): "light" | "dark" => {
      if (theme !== "system") return theme;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    };

    if (!mounted) return;

    setResolvedTheme(compute());

    if (theme !== "system") return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => setResolvedTheme(mq.matches ? "dark" : "light");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme, mounted]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", resolvedTheme === "dark");
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  return children;
}