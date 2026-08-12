import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { SettingsProvider, useSettings } from "@/contexts/SettingsContext";

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
    });

    it("loads settings from localStorage when available", () => {
      localStorageMock.setItem("mcbecd-settings", JSON.stringify({
        theme: "dark",
        fontSize: "large",
        locale: "en",
        colorTheme: "red",
        customColor: "#ff0000",
      }));
      const { result } = renderHook(() => useSettings(), { wrapper });
      expect(result.current.settings.theme).toBe("dark");
      expect(result.current.settings.fontSize).toBe("large");
      expect(result.current.settings.locale).toBe("en");
      expect(result.current.settings.colorTheme).toBe("red");
      expect(result.current.settings.customColor).toBe("#ff0000");
    });
  });

  describe("updateSettings", () => {
    it("updates a single setting", () => {
      const { result } = renderHook(() => useSettings(), { wrapper });
      act(() => result.current.updateSettings("theme", "dark"));
      expect(result.current.settings.theme).toBe("dark");
    });

    it("persists to localStorage", () => {
      const { result } = renderHook(() => useSettings(), { wrapper });
      act(() => result.current.updateSettings("fontSize", "small"));
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });
});
