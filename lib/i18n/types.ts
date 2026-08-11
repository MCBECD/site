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
    sortByName: string;
    sortByType: string;
    sortByUpdated: string;
    viewMode: string;
    viewCards: string;
    viewList: string;
    typePlayer: string;
    typeWorld: string;
    typeBuilding: string;
    typeEntity: string;
    typeUI: string;
    typeAdvanced: string;
    typeOther: string;
  };
}
