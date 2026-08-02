"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { X, Sun, Moon, Monitor } from "lucide-react";
import { useSettings, type Theme, type FontSize, type CodeThemeMode, type BgSource } from "@/contexts/SettingsContext";
import { locales, type Locale } from "@/i18n/shared";
import { useState } from "react";

type Tab = "appearance" | "language";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

const THEME_OPTIONS: { value: Theme; icon: typeof Sun; labelKey: string }[] = [
  { value: "light", icon: Sun, labelKey: "settings.themeLight" },
  { value: "dark", icon: Moon, labelKey: "settings.themeDark" },
  { value: "system", icon: Monitor, labelKey: "settings.themeSystem" },
];

const FONT_OPTIONS: { value: FontSize; labelKey: string }[] = [
  { value: "small", labelKey: "settings.fontSizeSmall" },
  { value: "medium", labelKey: "settings.fontSizeMedium" },
  { value: "large", labelKey: "settings.fontSizeLarge" },
];

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const t = useTranslations();
  const locale = useLocale();
  const { settings, updateTheme, updateFontSize, updateCodeTheme, updateBackground } = useSettings();
  const router = useRouter();
  const pathname = usePathname();
  const [tab, setTab] = useState<Tab>("appearance");
  const [bgUrlInput, setBgUrlInput] = useState(settings.background.url);

  if (!open) return null;

  const handleLanguageChange = (newLocale: string) => {
    onClose();
    router.replace(pathname, { locale: newLocale as Locale });
  };

  return (
    <>
      {/* 遮罩 */}
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} aria-hidden="true" />

      {/* 面板 */}
      <div className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2
        w-[420px] rounded-xl shadow-2xl
        bg-[var(--color-bg-primary)] border border-[var(--color-border)]">

        {/* 头部 */}
        <div className="flex items-center justify-between px-6 pt-5 pb-0">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
            {t("settings.title")}
          </h2>
          <button
            onClick={onClose}
            className="p-1 -mr-1 rounded-md text-[var(--color-text-tertiary)]
              hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab 栏 */}
        <div className="flex gap-0 px-6 pt-4 pb-0 border-b border-[var(--color-border)]">
          <TabButton active={tab === "appearance"} onClick={() => setTab("appearance")}>
            {t("settings.tabAppearance")}
          </TabButton>
          <TabButton active={tab === "language"} onClick={() => setTab("language")}>
            {t("settings.tabLanguage")}
          </TabButton>
        </div>

        {/* 内容区 */}
        <div className="px-6 py-5 space-y-6 max-h-[60vh] overflow-y-auto">
          {tab === "appearance" ? (
            <>
              {/* 主题 */}
              <Section title={t("settings.theme")}>
                <div className="flex gap-1.5">
                  {THEME_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => updateTheme(opt.value)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors
                        ${settings.theme === opt.value
                          ? "bg-[var(--color-accent)] text-white"
                          : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-sidebar-hover)]"
                        }`}
                    >
                      <opt.icon className="w-4 h-4" />
                      {t(opt.labelKey)}
                    </button>
                  ))}
                </div>
              </Section>

              {/* 字体大小 */}
              <Section title={t("settings.fontSize")}>
                <div className="flex gap-1.5">
                  {FONT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => updateFontSize(opt.value)}
                      className={`px-3 py-1.5 rounded-md text-sm transition-colors
                        ${settings.fontSize === opt.value
                          ? "bg-[var(--color-accent)] text-white"
                          : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-sidebar-hover)]"
                        }`}
                    >
                      {t(opt.labelKey)}
                    </button>
                  ))}
                </div>
              </Section>

              {/* 背景图 */}
              <Section title={t("settings.background")}>
                <label className="flex items-center gap-2 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={settings.background.enabled}
                    onChange={(e) => updateBackground({ enabled: e.target.checked })}
                    className="w-4 h-4 rounded accent-[var(--color-accent)]"
                  />
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    {t("settings.backgroundEnable")}
                  </span>
                </label>

                {settings.background.enabled && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-[var(--color-text-tertiary)] mb-1 block">
                        {t("settings.backgroundSource")}
                      </label>
                      <select
                        value={settings.background.source}
                        onChange={(e) => updateBackground({ source: e.target.value as BgSource })}
                        className="w-full px-2.5 py-1.5 rounded-md text-sm bg-[var(--color-bg-tertiary)]
                          text-[var(--color-text-primary)] border border-[var(--color-border)]
                          focus:outline-none focus:border-[var(--color-accent)]"
                      >
                        <option value="bing">{t("settings.backgroundBing")}</option>
                        <option value="custom">{t("settings.backgroundCustom")}</option>
                      </select>
                    </div>

                    {settings.background.source === "custom" && (
                      <div className="flex gap-1.5">
                        <input
                          type="url"
                          value={bgUrlInput}
                          onChange={(e) => setBgUrlInput(e.target.value)}
                          placeholder={t("settings.backgroundUrlPlaceholder")}
                          className="flex-1 px-2.5 py-1.5 rounded-md text-sm bg-[var(--color-bg-tertiary)]
                            text-[var(--color-text-primary)] border border-[var(--color-border)]
                            focus:outline-none focus:border-[var(--color-accent)]
                            placeholder:text-[var(--color-text-tertiary)]"
                        />
                        <button
                          onClick={() => updateBackground({ url: bgUrlInput })}
                          className="px-3 py-1.5 rounded-md text-sm bg-[var(--color-accent)] text-white
                            hover:bg-[var(--color-accent-hover)] transition-colors shrink-0"
                        >
                          OK
                        </button>
                      </div>
                    )}

                    <div>
                      <label className="text-xs text-[var(--color-text-tertiary)] mb-1 block">
                        {t("settings.backgroundOverlayOpacity")}: {settings.background.overlayOpacity}%
                      </label>
                      <input
                        type="range"
                        min={0} max={100}
                        value={settings.background.overlayOpacity}
                        onChange={(e) => updateBackground({ overlayOpacity: Number(e.target.value) })}
                        className="w-full h-1.5 rounded-full appearance-none bg-[var(--color-bg-tertiary)]
                          accent-[var(--color-accent)] cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-[var(--color-text-tertiary)] mb-1 block">
                        {t("settings.backgroundBlur")}: {settings.background.blur}px
                      </label>
                      <input
                        type="range"
                        min={0} max={20}
                        value={settings.background.blur}
                        onChange={(e) => updateBackground({ blur: Number(e.target.value) })}
                        className="w-full h-1.5 rounded-full appearance-none bg-[var(--color-bg-tertiary)]
                          accent-[var(--color-accent)] cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </Section>
            </>
          ) : (
            <>
              {/* 界面语言 */}
              <Section title={t("settings.language")}>
                <div className="flex flex-wrap gap-1.5">
                  {locales.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => handleLanguageChange(loc)}
                      className={`px-3 py-1.5 rounded-md text-sm transition-colors
                        ${locale === loc
                          ? "bg-[var(--color-accent)] text-white"
                          : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-sidebar-hover)]"
                        }`}
                    >
                      {t(`language.${loc}`)}
                    </button>
                  ))}
                </div>
              </Section>

              {/* 代码块主题 */}
              <Section title={t("settings.codeTheme")}>
                <div className="flex gap-1.5">
                  {(["follow", "independent"] as CodeThemeMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => updateCodeTheme(mode)}
                      className={`px-3 py-1.5 rounded-md text-sm transition-colors
                        ${settings.codeTheme === mode
                          ? "bg-[var(--color-accent)] text-white"
                          : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-sidebar-hover)]"
                        }`}
                    >
                      {mode === "follow" ? t("settings.codeThemeFollow") : t("settings.codeThemeIndependent")}
                    </button>
                  ))}
                </div>
              </Section>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 text-sm font-medium transition-colors relative
        ${active
          ? "text-[var(--color-accent)]"
          : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
        }`}
    >
      {children}
      {active && (
        <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[var(--color-accent)]" />
      )}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-sm font-medium text-[var(--color-text-primary)] mb-3">{title}</div>
      {children}
    </div>
  );
}
