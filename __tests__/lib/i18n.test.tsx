import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { LocaleProvider, useLocale } from "@/contexts/LocaleContext";
import { LOCALES, NATIVE_NAMES, type Locale } from "@/lib/i18n/types";

function wrapperFactory(locale: Locale) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <LocaleProvider locale={locale}>{children}</LocaleProvider>;
  };
}

describe("LocaleContext - i18n", () => {
  describe("locale types", () => {
    it("has all 7 supported locales", () => {
      expect(LOCALES).toHaveLength(7);
      expect(LOCALES).toContain("zh-CN");
      expect(LOCALES).toContain("en");
      expect(LOCALES).toContain("zh-TW");
      expect(LOCALES).toContain("ja");
      expect(LOCALES).toContain("ko");
      expect(LOCALES).toContain("de");
      expect(LOCALES).toContain("fr");
    });

    it("has native names for all locales", () => {
      for (const loc of LOCALES) {
        expect(NATIVE_NAMES[loc]).toBeTruthy();
        expect(typeof NATIVE_NAMES[loc]).toBe("string");
      }
    });

    it("native names are all unique", () => {
      const names = Object.values(NATIVE_NAMES);
      expect(new Set(names).size).toBe(names.length);
    });
  });

  describe("translation resolution", () => {
    it("resolves simple translation key (zh-CN)", () => {
      const { result } = renderHook(() => useLocale(), {
        wrapper: wrapperFactory("zh-CN"),
      });
      expect(result.current.t("common.backToList")).toBe("首页");
    });

    it("resolves simple translation key (en)", () => {
      const { result } = renderHook(() => useLocale(), {
        wrapper: wrapperFactory("en"),
      });
      expect(result.current.t("common.backToList")).toBe("Home");
    });

    it("resolves nested translation key", () => {
      const { result } = renderHook(() => useLocale(), {
        wrapper: wrapperFactory("en"),
      });
      expect(result.current.t("settings.theme")).toBe("Theme");
      expect(result.current.t("code.copy")).toBeTruthy();
      expect(result.current.t("doc.title")).toBeTruthy();
    });
  });

  describe("variable interpolation", () => {
    it("interpolates single variable", () => {
      const { result } = renderHook(() => useLocale(), {
        wrapper: wrapperFactory("en"),
      });
      const translated = result.current.t("doc.subtitle", { count: 42 });
      expect(translated).toContain("42");
    });

    it("returns key as fallback for unknown keys", () => {
      const { result } = renderHook(() => useLocale(), {
        wrapper: wrapperFactory("en"),
      });
      expect(result.current.t("this.does.not.exist")).toBe("this.does.not.exist");
    });
  });

  describe("all locales integrity", () => {
    it("all locales provide common translations", () => {
      for (const loc of LOCALES) {
        const { result } = renderHook(() => useLocale(), {
          wrapper: wrapperFactory(loc),
        });
        expect(result.current.t("common.loading")).toBeTruthy();
        expect(result.current.t("common.notFound")).toBeTruthy();
        expect(result.current.t("common.backToList")).toBeTruthy();
      }
    });

    it("all locales provide settings translations", () => {
      for (const loc of LOCALES) {
        const { result } = renderHook(() => useLocale(), {
          wrapper: wrapperFactory(loc),
        });
        expect(result.current.t("settings.theme")).toBeTruthy();
        expect(result.current.t("settings.fontSize")).toBeTruthy();
        expect(result.current.t("settings.language")).toBeTruthy();
      }
    });
  });

  describe("error handling", () => {
    it("throws when used outside provider", () => {
      // Suppress console.error
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});
      expect(() => renderHook(() => useLocale())).toThrow(
        "useLocale must be used within LocaleProvider",
      );
      spy.mockRestore();
    });
  });
});
