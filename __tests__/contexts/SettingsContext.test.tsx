import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { SettingsProvider, useSettings } from "@/contexts/SettingsContext";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

function wrapper({ children }: { children: React.ReactNode }) {
  // Need to also provide ThemeProvider and LocaleProvider which SettingsContext expects
  return <SettingsProvider>{children}</SettingsProvider>;
}

describe("SettingsContext", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe("default settings", () => {
    it("provides default settings when localStorage is empty", () => {
      const { result } = renderHook(() => useSettings(), { wrapper });
      expect(result.current.settings.theme).toBe("system");
      expect(result.current.settings.fontSize).toBe("medium");
      expect(result.current.settings.locale).toBe("zh-CN");
      expect(result.current.settings.colorTheme).toBe("default");
      expect(result.current.settings.customColor).toBe("#3b82f6");
      expect(result.current.settings.plugins).toEqual({});
      expect(result.current.settings.bgImage).toBe("");
      expect(result.current.settings.bgOverlayOpacity).toBe(60);
      expect(result.current.settings.bgOverlayBlur).toBe(0);
      expect(result.current.settings.bgParallax).toBe(false);
    });

    it("loads settings from localStorage when available", () => {
      localStorageMock.setItem("mcbecd-settings", JSON.stringify({
        theme: "dark",
        fontSize: "large",
        locale: "en",
      }));

      const { result } = renderHook(() => useSettings(), { wrapper });
      expect(result.current.settings.theme).toBe("dark");
      expect(result.current.settings.fontSize).toBe("large");
      expect(result.current.settings.locale).toBe("en");
    });

    it("falls back to defaults on corrupt localStorage", () => {
      localStorageMock.setItem("mcbecd-settings", "not-json{{{");

      const { result } = renderHook(() => useSettings(), { wrapper });
      expect(result.current.settings.theme).toBe("system");
      expect(result.current.settings.fontSize).toBe("medium");
    });
  });

  describe("theme", () => {
    it("updates theme and persists", () => {
      const { result } = renderHook(() => useSettings(), { wrapper });

      act(() => result.current.updateTheme("dark"));
      expect(result.current.settings.theme).toBe("dark");

      const stored = JSON.parse(localStorageMock.getItem("mcbecd-settings")!);
      expect(stored.theme).toBe("dark");
    });
  });

  describe("fontSize", () => {
    it("updates font size", () => {
      const { result } = renderHook(() => useSettings(), { wrapper });

      act(() => result.current.updateFontSize("small"));
      expect(result.current.settings.fontSize).toBe("small");

      act(() => result.current.updateFontSize("large"));
      expect(result.current.settings.fontSize).toBe("large");
    });
  });

  describe("locale", () => {
    it("updates locale", () => {
      const { result } = renderHook(() => useSettings(), { wrapper });

      act(() => result.current.updateLocale("ja"));
      expect(result.current.settings.locale).toBe("ja");
    });
  });

  describe("color theme", () => {
    it("updates color theme", () => {
      const { result } = renderHook(() => useSettings(), { wrapper });

      act(() => result.current.updateColorTheme("red"));
      expect(result.current.settings.colorTheme).toBe("red");
    });

    it("updates custom color", () => {
      const { result } = renderHook(() => useSettings(), { wrapper });

      act(() => result.current.updateCustomColor("#ff0000"));
      expect(result.current.settings.customColor).toBe("#ff0000");
    });
  });

  describe("plugins", () => {
    it("isPluginEnabled returns false for unknown plugin", () => {
      const { result } = renderHook(() => useSettings(), { wrapper });
      expect(result.current.isPluginEnabled("nonexistent")).toBe(false);
    });

    it("toggles plugin on", () => {
      const { result } = renderHook(() => useSettings(), { wrapper });

      act(() => result.current.togglePlugin("color-theme", true));
      expect(result.current.isPluginEnabled("color-theme")).toBe(true);
      expect(result.current.settings.plugins["color-theme"]).toBe(true);
    });

    it("toggles plugin off", () => {
      const { result } = renderHook(() => useSettings(), { wrapper });

      act(() => result.current.togglePlugin("color-theme", true));
      act(() => result.current.togglePlugin("color-theme", false));
      expect(result.current.isPluginEnabled("color-theme")).toBe(false);
    });

    it("toggle without explicit value toggles state", () => {
      const { result } = renderHook(() => useSettings(), { wrapper });

      act(() => result.current.togglePlugin("bg"));
      expect(result.current.isPluginEnabled("bg")).toBe(true);

      act(() => result.current.togglePlugin("bg"));
      expect(result.current.isPluginEnabled("bg")).toBe(false);
    });

    it("persists plugin state", () => {
      const { result } = renderHook(() => useSettings(), { wrapper });

      act(() => result.current.togglePlugin("color-theme", true));
      const stored = JSON.parse(localStorageMock.getItem("mcbecd-settings")!);
      expect(stored.plugins["color-theme"]).toBe(true);
    });
  });

  describe("background image", () => {
    it("updates bg image URL", () => {
      const { result } = renderHook(() => useSettings(), { wrapper });
      const url = "/bg/test.png";

      act(() => result.current.updateBgImage(url));
      expect(result.current.settings.bgImage).toBe(url);
    });

    it("updates overlay opacity", () => {
      const { result } = renderHook(() => useSettings(), { wrapper });

      act(() => result.current.updateBgOverlayOpacity(80));
      expect(result.current.settings.bgOverlayOpacity).toBe(80);
    });

    it("updates overlay blur", () => {
      const { result } = renderHook(() => useSettings(), { wrapper });

      act(() => result.current.updateBgOverlayBlur(10));
      expect(result.current.settings.bgOverlayBlur).toBe(10);
    });

    it("toggles parallax", () => {
      const { result } = renderHook(() => useSettings(), { wrapper });

      act(() => result.current.updateBgParallax(true));
      expect(result.current.settings.bgParallax).toBe(true);

      act(() => result.current.updateBgParallax(false));
      expect(result.current.settings.bgParallax).toBe(false);
    });
  });

  describe("error boundary", () => {
    it("throws when used outside provider", () => {
      // Suppress console.error for this test
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});
      expect(() => renderHook(() => useSettings())).toThrow("useSettings must be used within SettingsProvider");
      spy.mockRestore();
    });
  });
});
