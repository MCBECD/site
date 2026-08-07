export type Locale = "zh-CN" | "en" | "zh-TW" | "ja" | "ko" | "de" | "fr";

export const LOCALES: Locale[] = ["zh-CN", "en", "zh-TW", "ja", "ko", "de", "fr"];

export const NATIVE_NAMES: Record<Locale, string> = {
  "zh-CN": "简体中文",
  en: "English",
  "zh-TW": "繁體中文",
  ja: "日本語",
  ko: "한국어",
  de: "Deutsch",
  fr: "Français",
};

export interface Messages {
  common: {
    loading: string;
    notFound: string;
    backToList: string;
  };
  nav: {
    settings: string;
    github: string;
  };
  settings: {
    title: string;
    theme: string;
    themeLight: string;
    themeDark: string;
    themeSystem: string;
    fontSize: string;
    fontSizeSmall: string;
    fontSizeMedium: string;
    fontSizeLarge: string;
    language: string;
  };
  code: {
    copy: string;
    copied: string;
    copyMd: string;
    copyPlain: string;
    copiedMd: string;
    copiedPlain: string;
    download: string;
  };
  doc: {
    searchPlaceholder: string;
    resultCount: string;
    noResults: string;
    home: string;
    updatedAt: string;
  };
}
