"use client";

import { useEffect } from "react";

export function ThemeScript() {
  useEffect(() => {
    try {
      const settings = JSON.parse(localStorage.getItem("mcbecd-settings") || "{}");
      const theme = settings.theme;
      if (theme === "dark" || (theme !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
        document.documentElement.classList.add("dark");
        document.documentElement.style.colorScheme = "dark";
      }
      const fm = settings.fontSize;
      const mul = fm === "small" ? 0.875 : fm === "large" ? 1.125 : 1;
      document.documentElement.style.setProperty("--font-size-multiplier", String(mul));
    } catch (e) {}
  }, []);

  return null;
}