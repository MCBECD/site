"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from "react";
import type { Locale, MessageKey, Messages } from "@/lib/i18n/types";
import zhCN from "@/messages/zh-CN.json";
import en from "@/messages/en.json";
import zhTW from "@/messages/zh-TW.json";
import ja from "@/messages/ja.json";
import ko from "@/messages/ko.json";
import de from "@/messages/de.json";
import fr from "@/messages/fr.json";

const MESSAGES: Record<Locale, Messages> = {
  "zh-CN": zhCN,
  en,
  "zh-TW": zhTW,
  ja,
  ko,
  de,
  fr,
};

// Cache validated locales in development mode to avoid repeated validation
const validatedLocales = new Set<Locale>();

/** Get a value from a nested object by dot-separated path */
function getNested(obj: unknown, path: string[], fallback: string): string {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== "object") return fallback;
    cur = (cur as Record<string, unknown>)[p];
  }
  return typeof cur === "string" ? cur : fallback;
}

const VAR_RE_CACHE = new Map<string, RegExp>();

function getVarRe(key: string): RegExp {
  let re = VAR_RE_CACHE.get(key);
  if (!re) {
    re = new RegExp(`\\{${key}\\}`, "g");
    VAR_RE_CACHE.set(key, re);
  }
  return re;
}

/**
 * Validate JSON message file keys for completeness in development mode.
 * Uses en.json as the baseline to check if other locales are missing keys.
 * Only validates once on first use.
 */
function validateMessages(locale: Locale, messages: unknown): void {
  if (process.env.NODE_ENV !== "development") return;
  if (validatedLocales.has(locale)) return;
  validatedLocales.add(locale);

  const base = MESSAGES["en"] as unknown as Record<string, unknown>;
  const target = messages as Record<string, unknown>;
  const missing: string[] = [];

  function walk(baseObj: unknown, targetObj: unknown, prefix: string): void {
    if (typeof baseObj === "string") {
      if (targetObj === undefined || targetObj === null) {
        missing.push(prefix);
      }
      return;
    }
    if (typeof baseObj !== "object" || baseObj === null) return;
    if (typeof targetObj !== "object" || targetObj === null) return;
    for (const key of Object.keys(baseObj as Record<string, unknown>)) {
      const bp = prefix ? `${prefix}.${key}` : key;
      walk(
        (baseObj as Record<string, unknown>)[key],
        (targetObj as Record<string, unknown>)[key],
        bp,
      );
    }
  }

  walk(base, target, "");
  if (missing.length > 0) {
    console.warn(
      `[i18n] ${locale} is missing keys compared to en.json:\n  ${missing.join("\n  ")}`,
    );
  }
}

interface LocaleContextValue {
  locale: Locale;
  /**
   * Get a string by "section.key" path, supporting {var} interpolation.
   *
   * Prefer using the MessageKey type for autocomplete and type checking.
   * For dynamically constructed keys (e.g., i18n keys derived from data),
   * use `as MessageKey` assertion or fall back to the string overload.
   */
  t(key: MessageKey, vars?: Record<string, string | number>): string;
  t(key: string, vars?: Record<string, string | number>): string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const messages = MESSAGES[locale];
  validateMessages(locale, messages);

  // Keep the <html lang> attribute in sync with the active locale for SEO
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      let result = getNested(messages, key.split("."), key);
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          result = result.replace(getVarRe(k), String(v));
        }
      }
      return result;
    },
    [messages],
  );

  const value = useMemo(() => ({ locale, t }), [locale, t]);

  return (
    <LocaleContext value={value}>
      {children}
    </LocaleContext>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}