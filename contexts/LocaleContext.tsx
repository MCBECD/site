"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import type { Locale, Messages } from "@/lib/i18n/types";
import zhCN from "@/messages/zh-CN.json";
import en from "@/messages/en.json";
import zhTW from "@/messages/zh-TW.json";
import ja from "@/messages/ja.json";
import ko from "@/messages/ko.json";
import de from "@/messages/de.json";
import fr from "@/messages/fr.json";

const MSG: Record<Locale, Messages> = {
  "zh-CN": zhCN as Messages,
  en: en as Messages,
  "zh-TW": zhTW as Messages,
  ja: ja as Messages,
  ko: ko as Messages,
  de: de as Messages,
  fr: fr as Messages,
};

/** 嵌套对象按路径取值 */
function getNested(obj: unknown, path: string[], fallback: string): string {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== "object") return fallback;
    cur = (cur as Record<string, unknown>)[p];
  }
  return typeof cur === "string" ? cur : fallback;
}

interface LocaleContextValue {
  locale: Locale;
  /** 按 "section.key" 路径取字符串，支持 {var} 插值 */
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const messages = MSG[locale];

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      let result = getNested(messages, key.split("."), key);
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          result = result.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
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