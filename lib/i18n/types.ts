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
    backToTop: string;
    opensInNewTab: string;
    cmdIconAlt: string;
    errorTitle: string;
    errorDesc: string;
    errorRetry: string;
    bookmark: string;
    unbookmark: string;
    delete: string;
  };
  nav: {
    settings: string;
    github: string;
    docs: string;
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
    tabGeneral: string;
    tabPlugins: string;
    tabData: string;
    clearAll: string;
    pluginColorTheme: string;
    pluginColorThemeDesc: string;
    colorDefault: string;
    colorRed: string;
    colorBlue: string;
    colorGreen: string;
    colorCustom: string;
    colorCustomPicker: string;
    pluginBgImage: string;
    pluginBgImageDesc: string;
    bgPreset1: string;
    bgPreset2: string;
    bgPreset3: string;
    bgUpload: string;
    bgClear: string;
    bgOverlayOpacity: string;
    bgOverlayBlur: string;
    bgParallax: string;
    bgImageTooLarge: string;
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
    title: string;
    subtitle: string;
    notFound: string;
    bookmarks: string;
    recent: string;
    noBookmarks: string;
    noRecent: string;
    filterAll: string;
    filterBasics: string;
    filterCommands: string;
    filterExamples: string;
    viewCards: string;
    viewList: string;
    previousPage: string;
    nextPage: string;
    clearSearch: string;
    switchToView: string;
  };
  cmd: {
    iconAlt: string;
  };
  landing: {
    tagline: string;
    ctaPrimary: string;
    ctaSecondary: string;
    feature1Title: string;
    feature1Desc: string;
    feature2Title: string;
    feature2Desc: string;
    feature3Title: string;
    feature3Desc: string;
    statCommands: string;
    statLocales: string;
    statLicense: string;
    cmdGive: string;
    cmdExecute: string;
    cmdTellraw: string;
    cmdScoreboard: string;
    ctaSectionTitle: string;
    ctaSectionDesc: string;
    ctaSectionButton: string;
    footerCopyright: string;
    footerDisclaimer: string;
  };
  notFound: {
    errorCode: string;
    description: string;
    backHome: string;
    browseDocs: string;
  };
}

/**
 * Generate a dot-path union type from a nested object type.
 * E.g. { a: { b: string } } → "a.b"
 */
type DotPath<T, Prefix extends string = ""> = T extends string
  ? Prefix
  : {
      [K in keyof T & string]: Prefix extends ""
        ? DotPath<T[K], K>
        : DotPath<T[K], `${Prefix}.${K}`>;
    }[keyof T & string];

/** All valid i18n key paths, used as the type constraint for t() parameter */
export type MessageKey = DotPath<Messages>;
