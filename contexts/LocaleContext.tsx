"use client";

import { createContext, useContext } from "react";
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

const DOT_RE = /\./g;

/** 将 "code.copiedMd" 解析为 ["code", "copiedMd"] */
function parsePath(key: string): string[] {
  return key.split(DOT_RE);
}

/** 嵌套对象按路径取值 */
function getNested(obj: unknown, path: string[], fallback: string): string {
  let cur = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== "object") return fallback;
    cur = (cur as Record<string, unknown>)[p];
  }
  return typeof cur === "string" ? cur : fallback;
}

interface LocaleContextValue {
  locale: Locale;
  messages: Messages;
  /** 按 "section.key" 路径取字符串，支持 {var} 插值 */
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

interface LocaleProviderProps {
  locale: Locale;
  children: React.ReactNode;
}

export function LocaleProvider({ locale, children }: LocaleProviderProps) {
  const messages = MSG[locale];

  const t = (key: string, vars?: Record<string, string | number>): string => {
    let result = getNested(messages, parsePath(key), key);
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        result = result.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
      }
    }
    return result;
  };

  return (
    <LocaleContext value={{ locale, messages, t }}>
      {children}
    </LocaleContext>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}