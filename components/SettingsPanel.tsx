"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { X, Sun, Moon, Monitor, Languages } from "lucide-react";
import { useSettings, type Theme, type FontSize, type BgSource } from "@/contexts/SettingsContext";
import { locales, type Locale } from "@/i18n/shared";
import { useState } from "react";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

const THEME_OPTIONS: { value: Theme; icon: typeof Sun; labelKey: string }[] = [
  { value: "light", icon: Sun, labelKey: "settings.themeLight" },
  { value: "dark", icon: Moon, labelKey: "settings.themeDark" },
  { value: "system", icon: Monitor, labelKey: "settings.themeSystem" },
];

const FONT_SIZES: { value: FontSize; label: string }[] = [
  { value: "small", label: "A-" },
  { value: "medium", label: "A" },
  { value: "large", label: "A+" },
];

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const t = useTranslations();
  const locale = useLocale();
  const { settings, updateTheme, updateFontSize, updateBackground } = useSettings();
  const router = useRouter();
  const pathname = usePathname();
  const [bgUrlInput, setBgUrlInput] = useState(settings.background.url);

  if (!open) return null;

  const handleLanguageChange = (newLocale: string) => {
    onClose();
    router.replace(pathname, { locale: newLocale as Locale });
  };

  return (
    <>
      {/* 遮罩 */}
      <div
        className="fixed inset-0 bg-black/40 z-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 面板 */}
      <div className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2
        w-72 rounded-lg shadow-xl
        bg-[var(--color-bg-primary)] border border-[var(--color-border)]">
        {/* 头部 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
            {t("settings.title")}
          </h2>
          <button
            onClick={onClose}
            className="p-1 -mr-1 rounded text-[var(--color-text-tertiary)]
              hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 py-3 space-y-4">
          {/* 主题 */}
          <div>
            <div className="text-xs text-[var(--color-text-tertiary)] mb-2">{t("settings.theme")}</div>
            <div className="flex gap-1">
              {THEME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateTheme(opt.value)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs transition-colors
                    ${settings.theme === opt.value
                      ? "bg-[var(--color-accent)] text-white"
                      : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-sidebar-hover)]"
                    }`}
                >
                  <opt.icon className="w-3.5 h-3.5" />
                  {t(opt.labelKey)}
                </button>
              ))}
            </div>
          </div>

          {/* 语言 */}
          <div>
            <div className="text-xs text-[var(--color-text-tertiary)] mb-2">{t("settings.language")}</div>
            <div className="flex flex-wrap gap-1">
              {locales.map((loc) => (
                <button
                  key={loc}
                  onClick={() => handleLanguageChange(loc)}
                  className={`px-2 py-1 rounded text-xs transition-colors
                    ${locale === loc
                      ? "bg-[var(--color-accent)] text-white"
                      : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-sidebar-hover)]"
                    }`}
                >
                  {t(`language.${loc}`)}
                </button>
              ))}
            </div>
          </div>

          {/* 字体大小 */}
          <div>
            <div className="text-xs text-[var(--color-text-tertiary)] mb-2">{t("settings.fontSize")}</div>
            <div className="flex gap-1">
              {FONT_SIZES.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateFontSize(opt.value)}
                  className={`px-3 py-1.5 rounded text-xs font-mono transition-colors
                    ${settings.fontSize === opt.value
                      ? "bg-[var(--color-accent)] text-white"
                      : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-sidebar-hover)]"
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 背景图（精简） */}
          <div>
            <div className="text-xs text-[var(--color-text-tertiary)] mb-2">{t("settings.background")}</div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.background.enabled}
                  onChange={(e) => updateBackground({ enabled: e.target.checked })}
                  className="w-3.5 h-3.5 rounded accent-[var(--color-accent)]"
                />
                <span className="text-xs text-[var(--color-text-secondary)]">
                  {t("settings.backgroundEnable")}
                </span>
              </label>
              {settings.background.enabled && (
                <select
                  value={settings.background.source}
                  onChange={(e) => updateBackground({ source: e.target.value as BgSource })}
                  className="text-xs px-1.5 py-0.5 rounded bg-[var(--color-bg-tertiary)]
                    text-[var(--color-text-secondary)] border border-[var(--color-border)]
                    focus:outline-none focus:border-[var(--color-accent)]"
                >
                  <option value="bing">{t("settings.backgroundBing")}</option>
                  <option value="custom">{t("settings.backgroundCustom")}</option>
                </select>
              )}
            </div>
            {settings.background.enabled && settings.background.source === "custom" && (
              <div className="flex gap-1 mt-2">
                <input
                  type="url"
                  value={bgUrlInput}
                  onChange={(e) => setBgUrlInput(e.target.value)}
                  placeholder={t("settings.backgroundUrlPlaceholder")}
                  className="flex-1 px-2 py-1 rounded text-xs bg-[var(--color-bg-tertiary)]
                    text-[var(--color-text-primary)] border border-[var(--color-border)]
                    focus:outline-none focus:border-[var(--color-accent)]
                    placeholder:text-[var(--color-text-tertiary)]"
                />
                <button
                  onClick={() => updateBackground({ url: bgUrlInput })}
                  className="px-2 py-1 rounded text-xs bg-[var(--color-accent)] text-white
                    hover:bg-[var(--color-accent-hover)] transition-colors"
                >
                  OK
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
