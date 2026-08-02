"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark" | "system";
export type FontSize = "small" | "medium" | "large";
export type CodeThemeMode = "follow" | "independent";
export type BgSource = "bing" | "custom";

export interface BackgroundSettings {
  enabled: boolean;
  source: BgSource;
  url: string;
  overlayOpacity: number;
  blur: number;
}

export interface Settings {
  theme: Theme;
  fontSize: FontSize;
  codeTheme: CodeThemeMode;
  background: BackgroundSettings;
}

const FONT_SIZE_MAP: Record<FontSize, number> = {
  small: 0.875,
  medium: 1,
  large: 1.125,
};

const STORAGE_KEY = "mccd-settings";

function loadSettings(): Settings {
  if (typeof window === "undefined") return defaultSettings();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings();
    const parsed = JSON.parse(raw);
    return { ...defaultSettings(), ...parsed, background: { ...defaultSettings().background, ...parsed.background } };
  } catch {
    return defaultSettings();
  }
}

function defaultSettings(): Settings {
  return {
    theme: "system",
    fontSize: "medium",
    codeTheme: "follow",
    background: {
      enabled: false,
      source: "bing",
      url: "",
      overlayOpacity: 50,
      blur: 0,
    },
  };
}

interface SettingsContextValue {
  settings: Settings;
  updateTheme: (theme: Theme) => void;
  updateFontSize: (fontSize: FontSize) => void;
  updateCodeTheme: (codeTheme: CodeThemeMode) => void;
  updateBackground: (partial: Partial<BackgroundSettings>) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  /* @why 仅在客户端初始化，避免 hydration mismatch */
  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  /* @side-effect 写入 localStorage */
  const persist = useCallback((s: Settings) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  }, []);

  /* @side-effect 同步字体大小 CSS 变量 */
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

  const updateCodeTheme = useCallback(
    (codeTheme: CodeThemeMode) => {
      setSettings((prev) => {
        const next = { ...prev, codeTheme };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const updateBackground = useCallback(
    (partial: Partial<BackgroundSettings>) => {
      setSettings((prev) => {
        const next = {
          ...prev,
          background: { ...prev.background, ...partial },
        };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  return (
    <SettingsContext value={{ settings, updateTheme, updateFontSize, updateCodeTheme, updateBackground }}>
      {children}
    </SettingsContext>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
