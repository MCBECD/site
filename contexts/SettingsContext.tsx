/**
 * SettingsContext — Global settings state management
 *
 * Responsibilities:
 *   - Settings state + localStorage persistence (via lib/storage.ts)
 *   - Font size CSS variable synchronization
 *   - Color theme CSS variable synchronization
 *   - Delegates to palette.ts / plugin-system.ts for specific computations
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
import { LOCALES } from "@/lib/i18n/types";
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

export const DEFAULT_LOCALE: Locale = "zh-CN";

const SETTINGS_KEY = "settings";

// ---- State helpers (pure) ----

function defaultSettings(): Settings {
  return {
    theme: "system",
    fontSize: "medium",
    locale: DEFAULT_LOCALE,
    colorTheme: "default",
    customColor: "#3b82f6",
    plugins: {},
    bgImage: "",
    bgOverlayOpacity: 60,
    bgOverlayBlur: 0,
    bgParallax: false,
  };
}

const VALID_THEMES: Set<string> = new Set(["light", "dark", "system"]);
const VALID_FONT_SIZES: Set<string> = new Set(["small", "medium", "large"]);
const VALID_COLOR_THEMES: Set<string> = new Set(["default", "red", "blue", "green", "custom"]);
const VALID_LOCALES: Set<string> = new Set(LOCALES);
const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

/**
 * Read settings from localStorage, validate each field, and merge with defaults.
 * Prevents corrupted or malicious localStorage values from reaching application state.
 */
function loadSettings(): Settings {
  const saved = storageRead<Record<string, unknown>>(SETTINGS_KEY, {});
  if (typeof saved !== "object" || saved === null) return defaultSettings();

  const d = defaultSettings();
  if (VALID_THEMES.has(String(saved.theme))) d.theme = String(saved.theme) as Theme;
  if (VALID_FONT_SIZES.has(String(saved.fontSize))) d.fontSize = String(saved.fontSize) as FontSize;
  if (VALID_LOCALES.has(String(saved.locale))) d.locale = String(saved.locale) as Locale;
  if (VALID_COLOR_THEMES.has(String(saved.colorTheme))) d.colorTheme = String(saved.colorTheme) as ColorTheme;
  if (typeof saved.customColor === "string" && HEX_COLOR_RE.test(saved.customColor)) d.customColor = saved.customColor;
  if (typeof saved.plugins === "object" && saved.plugins !== null && !Array.isArray(saved.plugins)) {
    d.plugins = saved.plugins as PluginStates;
  }
  if (typeof saved.bgImage === "string") d.bgImage = saved.bgImage;
  if (typeof saved.bgOverlayOpacity === "number" && saved.bgOverlayOpacity >= 0 && saved.bgOverlayOpacity <= 100) {
    d.bgOverlayOpacity = saved.bgOverlayOpacity;
  }
  if (typeof saved.bgOverlayBlur === "number" && saved.bgOverlayBlur >= 0 && saved.bgOverlayBlur <= 20) {
    d.bgOverlayBlur = saved.bgOverlayBlur;
  }
  if (typeof saved.bgParallax === "boolean") d.bgParallax = saved.bgParallax;

  return d;
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
  // Start from defaults so the server render and first client render match.
  // Saved settings are read in a mount effect below to avoid a hydration
  // mismatch (localStorage is only available on the client).
  const [settings, setSettings] = useState<Settings>(() => defaultSettings());

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

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