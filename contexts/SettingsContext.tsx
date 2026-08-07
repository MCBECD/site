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

export interface Settings {
  theme: Theme;
  fontSize: FontSize;
  locale: Locale;
}

const FONT_SIZE_MAP: Record<FontSize, number> = {
  small: 0.875,
  medium: 1,
  large: 1.125,
};

const STORAGE_KEY = "mcbecd-settings";

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
  };
}

interface SettingsContextValue {
  settings: Settings;
  updateTheme: (theme: Theme) => void;
  updateFontSize: (fontSize: FontSize) => void;
  updateLocale: (locale: Locale) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());

  const persist = useCallback((s: Settings) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  }, []);

  useEffect(() => {
    const mul = FONT_SIZE_MAP[settings.fontSize];
    document.documentElement.style.setProperty("--font-size-multiplier", String(mul));
  }, [settings.fontSize]);

  const updateTheme = useCallback(
    (theme: Theme) => {
      setSettings((prev) => {
        const next = { ...prev, theme };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const updateFontSize = useCallback(
    (fontSize: FontSize) => {
      setSettings((prev) => {
        const next = { ...prev, fontSize };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const updateLocale = useCallback(
    (locale: Locale) => {
      setSettings((prev) => {
        const next = { ...prev, locale };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  return (
    <SettingsContext value={{ settings, updateTheme, updateFontSize, updateLocale }}>
      {children}
    </SettingsContext>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}