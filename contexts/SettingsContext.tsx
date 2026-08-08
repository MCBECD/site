/**
 * SettingsContext — 全局设置状态管理
 *
 * 职责：
 *   - 设置状态 + localStorage 持久化
 *   - 字体缩放 CSS 变量同步
 *   - 颜色主题 CSS 变量同步
 *   - 委托 palette.ts / plugin-system.ts 处理具体计算
 */

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
import { generatePalette, applyPalette, clearCustomPalette } from "./settings/palette";
import { createTogglePlugin } from "./settings/plugin-system";

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
  bgParallax: boolean;
}

const FONT_SIZE_MAP: Record<FontSize, number> = {
  small: 0.875,
  medium: 1,
  large: 1.125,
};

const STORAGE_KEY = "mcbecd-settings";

// ---- State helpers (pure) ----

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
    bgParallax: false,
  };
}

// ---- Updater factory ----

/** 创建通用的单一字段更新器 */
function createUpdater<K extends keyof Settings>(
  key: K,
  setSettings: React.Dispatch<React.SetStateAction<Settings>>,
  persist: (s: Settings) => void,
): (value: Settings[K]) => void {
  return useCallback(
    (value: Settings[K]) => {
      setSettings((prev) => {
        const next = { ...prev, [key]: value };
        persist(next);
        return next;
      });
    },
    [setSettings, persist, key],
  );
}

// ---- Context ----

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
  updateBgParallax: (v: boolean) => void;
  isPluginEnabled: (id: string) => boolean;
  togglePlugin: (id: string, enabled?: boolean) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());

  const persist = useCallback((s: Settings) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  }, []);

  // ---- Effects ----

  /* font size → CSS variable */
  useEffect(() => {
    const mul = FONT_SIZE_MAP[settings.fontSize];
    document.documentElement.style.setProperty("--font-size-multiplier", String(mul));
  }, [settings.fontSize]);

  /* color theme plugin toggle → clear custom vars when off */
  useEffect(() => {
    const el = document.documentElement;
    const enabled = settings.plugins["color-theme"];
    if (!enabled) {
      clearCustomPalette(el);
      el.setAttribute("data-color-theme", "default");
      return;
    }
    if (settings.colorTheme !== "custom") {
      clearCustomPalette(el);
      el.setAttribute("data-color-theme", settings.colorTheme);
    }
  }, [settings.colorTheme, settings.plugins]);

  /* custom palette → apply + re-apply on dark class change */
  useEffect(() => {
    if (settings.colorTheme !== "custom") return;
    if (!settings.plugins["color-theme"]) return;

    const el = document.documentElement;
    const apply = () => {
      const isDark = el.classList.contains("dark");
      const palette = generatePalette(settings.customColor);
      applyPalette(el, isDark ? palette.dark : palette.light);
    };

    apply();
    const obs = new MutationObserver(apply);
    obs.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, [settings.colorTheme, settings.customColor, settings.plugins]);

  // ---- Updaters (using factory) ----

  const updateTheme = createUpdater("theme", setSettings, persist);
  const updateFontSize = createUpdater("fontSize", setSettings, persist);
  const updateLocale = createUpdater("locale", setSettings, persist);
  const updateColorTheme = createUpdater("colorTheme", setSettings, persist);
  const updateCustomColor = createUpdater("customColor", setSettings, persist);
  const updateBgImage = createUpdater("bgImage", setSettings, persist);
  const updateBgOverlayOpacity = createUpdater("bgOverlayOpacity", setSettings, persist);
  const updateBgOverlayBlur = createUpdater("bgOverlayBlur", setSettings, persist);
  const updateBgParallax = createUpdater("bgParallax", setSettings, persist);

  const isPluginEnabledFn = useCallback(
    (id: string) => !!settings.plugins[id],
    [settings.plugins],
  );

  const togglePlugin = createTogglePlugin(setSettings, persist);

  return (
    <SettingsContext
      value={{
        settings,
        updateTheme, updateFontSize, updateLocale,
        updateColorTheme, updateCustomColor,
        updateBgImage, updateBgOverlayOpacity, updateBgOverlayBlur, updateBgParallax,
        isPluginEnabled: isPluginEnabledFn,
        togglePlugin,
      }}
    >
      {children}
    </SettingsContext>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
