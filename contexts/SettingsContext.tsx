/**
 * SettingsContext — 全局设置状态管理
 *
 * 职责：
 *   - 设置状态 + localStorage 持久化（通过 lib/storage.ts）
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
import { storageRead, storageWrite } from "@/lib/storage";
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

const SETTINGS_KEY = "settings";

// ---- State helpers (pure) ----

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

/**
 * 从 localStorage 读取设置，与默认值合并。
 * 使用 lib/storage.ts 的统一存储层。
 */
function loadSettings(): Settings {
  const saved = storageRead<Partial<Settings>>(SETTINGS_KEY, {});
  return { ...defaultSettings(), ...saved };
}

// ---- Context ----

interface SettingsContextValue {
  settings: Settings;
  updateSettings: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  isPluginEnabled: (id: string) => boolean;
  togglePlugin: (id: string, enabled?: boolean) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());

  const persist = useCallback((s: Settings) => {
    storageWrite(SETTINGS_KEY, s);
  }, []);

  const updateSettings = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      persist(next);
      return next;
    });
  }, [persist]);

  // ---- Effects ----

  /* font size → CSS variable */
  useEffect(() => {
    const mul = FONT_SIZE_MAP[settings.fontSize];
    document.documentElement.style.setProperty("--font-size-multiplier", String(mul));
  }, [settings.fontSize]);

  /* color theme → apply to document */
  useEffect(() => {
    const el = document.documentElement;
    if (settings.colorTheme !== "custom") {
      clearCustomPalette(el);
      el.setAttribute("data-color-theme", settings.colorTheme);
    } else {
      el.removeAttribute("data-color-theme");
    }
  }, [settings.colorTheme]);

  /* custom palette → apply + re-apply on dark class change */
  useEffect(() => {
    if (settings.colorTheme !== "custom") return;

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
  }, [settings.colorTheme, settings.customColor]);

  const isPluginEnabledFn = useCallback(
    (id: string) => !!settings.plugins[id],
    [settings.plugins],
  );

  const togglePlugin = createTogglePlugin(setSettings, persist);

  return (
    <SettingsContext
      value={{
        settings,
        updateSettings,
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