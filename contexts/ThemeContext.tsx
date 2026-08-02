"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useSettings, type Theme } from "./SettingsContext";

interface ThemeContextValue {
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextValue>({ resolvedTheme: "light" });

/**
 * @why 独立 ThemeContext 专门负责 DOM 层主题应用，
 *      监听系统主题变化，避免主题切换闪烁
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const { theme } = settings;

  const resolvedTheme = resolveTheme(theme);

  /* @side-effect 同步 dark class 和 color-scheme */
  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  /* @side-effect 监听系统主题变化 */
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

function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}
