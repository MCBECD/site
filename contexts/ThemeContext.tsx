"use client";

import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
import { useSettings, type Theme } from "./SettingsContext";

interface ThemeContextValue {
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextValue>({ resolvedTheme: "light" });

function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}

/**
 * 独立 ThemeContext 负责主题的 DOM 操作：dark class 和 color-scheme。
 * 监听系统主题变化，避免切换闪烁。
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const { theme } = settings;
  const resolvedTheme = useMemo(() => resolveTheme(theme), [theme]);
  const prevResolved = useRef(resolvedTheme);

  /* 同步 dark class + color-scheme */
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", resolvedTheme === "dark");
    root.style.colorScheme = resolvedTheme;
    prevResolved.current = resolvedTheme;
  }, [resolvedTheme]);

  /* 监听系统主题变化 */
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

  return (
    <ThemeContext value={{ resolvedTheme }}>
      {children}
    </ThemeContext>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
