export const locales = ["zh-CN", "en", "zh-TW", "ja", "ko", "de", "fr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "zh-CN";
export const docLocales = ["zh-CN", "en", "zh-TW"] as const;
export type DocLocale = (typeof docLocales)[number];
