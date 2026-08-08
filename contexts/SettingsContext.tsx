"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Locale } from "@/lib/i18n/types";

export type Theme = "light" | "dark" | "system";
export type FontSize = "small" | "medium" | "large";
export type ColorTheme = "default" | "red" | "blue" | "green" | "custom";

export interface PluginStates {
  [pluginId: string]: boolean;
}

export interface Settings {
  theme: Theme;
  fontSize: FontSize;
  locale: Locale;
  colorTheme: ColorTheme;
  customColor: string;
  plugins: PluginStates;
  bgImage: string;
  bgOverlayOpacity: number;
  bgOverlayBlur: number;
}

const FONT_SIZE_MAP: Record<FontSize, number> = {
  small: 0.875,
  medium: 1,
  large: 1.125,
};

const STORAGE_KEY = "mcbecd-settings";

/* ---------- Color utility ---------- */

function hexToHSL(hex: string): [number, number, number] {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hsl(h: number, s: number, l: number) {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

function hsla(h: number, s: number, l: number, a: number) {
  return `hsla(${h}, ${s}%, ${l}%, ${a})`;
}

/** 所有会被自定义色盘覆盖的 CSS 变量名 */
const CUSTOM_VARS = [
  "--color-bg-primary", "--color-bg-secondary", "--color-bg-tertiary",
  "--color-text-primary", "--color-text-secondary", "--color-text-tertiary",
  "--color-border", "--color-accent", "--color-accent-hover", "--color-accent-muted",
  "--color-code-bg", "--color-card-bg",
  "--color-card-shadow", "--color-card-hover-shadow",
  "--color-navbar-bg",
  "--color-kbd-bg", "--color-kbd-border", "--color-kbd-text",
  "--color-toast-bg",
] as const;

/**
 * 从一个主色推导完整调色板并应用到 :root
 * isDark 控制亮/暗两套色板
 */
function applyCustomPalette(hex: string, isDark: boolean) {
  const el = document.documentElement;
  const [h, s] = hexToHSL(hex);
  const sc = s * 0.4;   // 背景饱和度缩放
  const tc = s * 0.15;  // 文字饱和度缩放

  if (!isDark) {
    el.style.setProperty("--color-bg-primary",      hsl(h, sc * 0.2, 100));
    el.style.setProperty("--color-bg-secondary",    hsl(h, sc, 97));
    el.style.setProperty("--color-bg-tertiary",     hsl(h, sc * 1.2, 93));
    el.style.setProperty("--color-text-primary",    hsl(h, tc * 1.3, 10));
    el.style.setProperty("--color-text-secondary",  hsl(h, tc, 40));
    el.style.setProperty("--color-text-tertiary",   hsl(h, tc * 0.6, 60));
    el.style.setProperty("--color-border",          hsl(h, sc, 88));
    el.style.setProperty("--color-accent",          hex);
    el.style.setProperty("--color-accent-hover",    hsl(h, Math.min(s + 5, 100), Math.max(s > 50 ? 38 : 35, 20)));
    el.style.setProperty("--color-accent-muted",    hsla(h, s, 50, 0.08));
    el.style.setProperty("--color-code-bg",         hsl(h, sc * 0.8, 98));
    el.style.setProperty("--color-card-bg",         "#ffffff");
    el.style.setProperty("--color-card-shadow",     `0 1px 2px ${hsla(h, s, 20, 0.04)}`);
    el.style.setProperty("--color-card-hover-shadow", `0 4px 12px ${hsla(h, s, 20, 0.08)}, 0 1px 3px ${hsla(h, s, 20, 0.06)}`);
    el.style.setProperty("--color-navbar-bg",       hsla(h, sc * 0.5, 100, 0.82));
    el.style.setProperty("--color-kbd-bg",          hsl(h, sc * 1.2, 93));
    el.style.setProperty("--color-kbd-border",      hsl(h, sc, 88));
    el.style.setProperty("--color-kbd-text",        hsl(h, tc * 0.6, 60));
    el.style.setProperty("--color-toast-bg",        hsl(h, tc * 1.3, 10));
  } else {
    el.style.setProperty("--color-bg-primary",      hsl(h, sc * 0.8, 7));
    el.style.setProperty("--color-bg-secondary",    hsl(h, sc * 0.8, 11));
    el.style.setProperty("--color-bg-tertiary",     hsl(h, sc * 0.7, 16));
    el.style.setProperty("--color-text-primary",    hsl(h, tc * 0.8, 92));
    el.style.setProperty("--color-text-secondary",  hsl(h, tc * 0.7, 65));
    el.style.setProperty("--color-text-tertiary",   hsl(h, tc * 0.5, 42));
    el.style.setProperty("--color-border",          hsl(h, sc * 0.8, 22));
    el.style.setProperty("--color-accent",          hsl(h, Math.min(s + 10, 100), 68));
    el.style.setProperty("--color-accent-hover",    hsl(h, Math.min(s + 10, 100), 78));
    el.style.setProperty("--color-accent-muted",    hsla(h, s, 50, 0.08));
    el.style.setProperty("--color-code-bg",         hsl(h, sc * 0.8, 11));
    el.style.setProperty("--color-card-bg",         hsl(h, sc * 0.8, 11));
    el.style.setProperty("--color-card-shadow",     "0 1px 2px rgba(0,0,0,0.2)");
    el.style.setProperty("--color-card-hover-shadow", `0 4px 16px rgba(0,0,0,0.3), 0 0 0 1px ${hsla(h, s, 50, 0.06)}`);
    el.style.setProperty("--color-navbar-bg",       hsla(h, sc * 0.6, 7, 0.82));
    el.style.setProperty("--color-kbd-bg",          hsl(h, sc * 0.7, 16));
    el.style.setProperty("--color-kbd-border",      hsl(h, sc * 0.8, 22));
    el.style.setProperty("--color-kbd-text",        hsl(h, tc * 0.5, 42));
    el.style.setProperty("--color-toast-bg",        hsl(h, sc * 0.6, 22));
  }
}

/* ---------- Settings ---------- */

function loadSettings(): Settings {
  if (typeof window === "undefined") return defaultSettings();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings();
    const parsed = JSON.parse(raw);
    return { ...defaultSettings(), ...parsed };
  } catch {
    return defaultSettings();
  }
}

function defaultSettings(): Settings {
  return {
    theme: "system",
    fontSize: "medium",
    locale: "zh-CN",
    colorTheme: "default",
    customColor: "#3b82f6",
    plugins: {},
    bgImage: "",
    bgOverlayOpacity: 60,
    bgOverlayBlur: 0,
  };
}

interface SettingsContextValue {
  settings: Settings;
  updateTheme: (theme: Theme) => void;
  updateFontSize: (fontSize: FontSize) => void;
  updateLocale: (locale: Locale) => void;
  updateColorTheme: (colorTheme: ColorTheme) => void;
  updateCustomColor: (color: string) => void;
  updateBgImage: (url: string) => void;
  updateBgOverlayOpacity: (v: number) => void;
  updateBgOverlayBlur: (v: number) => void;
  isPluginEnabled: (id: string) => boolean;
  togglePlugin: (id: string, enabled?: boolean) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());

  const persist = useCallback((s: Settings) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  }, []);

  /* font size */
  useEffect(() => {
    const mul = FONT_SIZE_MAP[settings.fontSize];
    document.documentElement.style.setProperty("--font-size-multiplier", String(mul));
  }, [settings.fontSize]);

  /* color theme: only apply when color-theme plugin is enabled */
  useEffect(() => {
    const el = document.documentElement;
    const enabled = settings.plugins["color-theme"];
    if (!enabled) {
      CUSTOM_VARS.forEach((v) => el.style.removeProperty(v));
      el.setAttribute("data-color-theme", "default");
      return;
    }
    if (settings.colorTheme === "custom") {
      el.removeAttribute("data-color-theme");
    } else {
      CUSTOM_VARS.forEach((v) => el.style.removeProperty(v));
      el.setAttribute("data-color-theme", settings.colorTheme);
    }
  }, [settings.colorTheme, settings.plugins]);

  /* custom palette: apply + re-apply on dark class change */
  useEffect(() => {
    if (settings.colorTheme !== "custom") return;
    if (!settings.plugins["color-theme"]) return;
    const el = document.documentElement;
    const apply = () => applyCustomPalette(settings.customColor, el.classList.contains("dark"));
    apply();
    const obs = new MutationObserver(apply);
    obs.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, [settings.colorTheme, settings.customColor, settings.plugins]);

  /* background image state is applied directly in AppShell via style props */

  const updateTheme = useCallback(
    (theme: Theme) => {
      setSettings((prev) => { const next = { ...prev, theme }; persist(next); return next; });
    },
    [persist],
  );

  const updateFontSize = useCallback(
    (fontSize: FontSize) => {
      setSettings((prev) => { const next = { ...prev, fontSize }; persist(next); return next; });
    },
    [persist],
  );

  const updateLocale = useCallback(
    (locale: Locale) => {
      setSettings((prev) => { const next = { ...prev, locale }; persist(next); return next; });
    },
    [persist],
  );

  const updateColorTheme = useCallback(
    (colorTheme: ColorTheme) => {
      setSettings((prev) => { const next = { ...prev, colorTheme }; persist(next); return next; });
    },
    [persist],
  );

  const updateCustomColor = useCallback(
    (customColor: string) => {
      setSettings((prev) => { const next = { ...prev, customColor }; persist(next); return next; });
    },
    [persist],
  );

  const updateBgImage = useCallback(
    (bgImage: string) => {
      setSettings((prev) => { const next = { ...prev, bgImage }; persist(next); return next; });
    },
    [persist],
  );

  const updateBgOverlayOpacity = useCallback(
    (bgOverlayOpacity: number) => {
      setSettings((prev) => { const next = { ...prev, bgOverlayOpacity }; persist(next); return next; });
    },
    [persist],
  );

  const updateBgOverlayBlur = useCallback(
    (bgOverlayBlur: number) => {
      setSettings((prev) => { const next = { ...prev, bgOverlayBlur }; persist(next); return next; });
    },
    [persist],
  );

  const isPluginEnabled = useCallback(
    (id: string) => !!settings.plugins[id],
    [settings.plugins],
  );

  const togglePlugin = useCallback(
    (id: string, enabled?: boolean) => {
      setSettings((prev) => {
        const next = { ...prev, plugins: { ...prev.plugins } };
        next.plugins[id] = enabled ?? !next.plugins[id];
        persist(next);
        return next;
      });
    },
    [persist],
  );

  return (
    <SettingsContext value={{ settings, updateTheme, updateFontSize, updateLocale, updateColorTheme, updateCustomColor, updateBgImage, updateBgOverlayOpacity, updateBgOverlayBlur, isPluginEnabled, togglePlugin }}>
      {children}
    </SettingsContext>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
