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

const MSG: Record<Locale, Messages> = {
  "zh-CN": zhCN,
  en,
  "zh-TW": zhTW,
  ja,
  ko,
  de,
  fr,
};

// 开发模式下缓存已校验的 locale，避免重复校验
const validatedLocales = new Set<Locale>();

/** 嵌套对象按路径取值 */
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
 * 开发模式下校验 JSON 消息文件的 key 是否完整。
 * 以 en.json 为基准，检查其他语言是否缺少 key。
 * 只在首次使用时校验一次。
 */
function validateMessages(locale: Locale, messages: unknown): void {
  if (process.env.NODE_ENV !== "development") return;
  if (validatedLocales.has(locale)) return;
  validatedLocales.add(locale);

  const base = MSG["en"] as Record<string, unknown>;
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
   * 按 "section.key" 路径取字符串，支持 {var} 插值。
   *
   * 优先使用 MessageKey 类型获得自动补全和拼写检查。
   * 对于动态构造的 key（如从数据派生的 i18n key），
   * 可使用 as MessageKey 断言或回退到 string 重载。
   */
  t(key: MessageKey, vars?: Record<string, string | number>): string;
  t(key: string, vars?: Record<string, string | number>): string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const messages = MSG[locale];
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
