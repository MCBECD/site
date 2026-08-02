"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { X, Sun, Moon, Monitor, Type, Code, Image } from "lucide-react";
import { useSettings, type Theme, type FontSize, type CodeThemeMode, type BgSource } from "@/contexts/SettingsContext";
import { locales, type Locale } from "@/i18n/shared";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

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
  const [bgUrlInput, setBgUrlInput] = useState(settings.background.url);

  const handleLanguageChange = (locale: string) => {
    onClose();
    router.replace(pathname, { locale: locale as Locale });
  };

  const handleBgUrlApply = () => {
    updateBackground({ url: bgUrlInput });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            aria-hidden="true"
          />

      <motion.div
            className="fixed top-1/2 left-1/2 z-50
              w-[90vw] max-w-md max-h-[85vh] overflow-y-auto rounded-xl shadow-2xl
              bg-[var(--color-bg-primary)] border border-[var(--color-border)]"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            style={{ translateX: "-50%", translateY: "-50%" }}
          >
        {/* 头部 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
            {t("settings.title")}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[var(--color-text-tertiary)]
              hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-6">
          {/* 主题 */}
          <SettingSection icon={Sun} label={t("settings.theme")}>
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
          </SettingSection>

          {/* 语言 */}
          <SettingSection icon={Type} label={t("settings.language")}>
            <select
              value={locale}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="px-2.5 py-1.5 rounded-md text-sm bg-[var(--color-bg-tertiary)]
                text-[var(--color-text-primary)] border border-[var(--color-border)]
                focus:outline-none focus:border-[var(--color-accent)]"
            >
              {locales.map((loc) => (
                <option key={loc} value={loc}>
                  {t(`language.${loc}`)}
                </option>
              ))}
            </select>
          </SettingSection>

          {/* 字体大小 */}
          <SettingSection icon={Type} label={t("settings.fontSize")}>
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
          </SettingSection>

          {/* 代码块主题 */}
          <SettingSection icon={Code} label={t("settings.codeTheme")}>
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
          </SettingSection>

          {/* 背景图 */}
          <SettingSection icon={Image} label={t("settings.background")}>
            <div className="space-y-3">
              {/* 开关 */}
              <label className="flex items-center gap-2 cursor-pointer">
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
                <>
                  {/* 图片来源 */}
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

                  {/* 自定义 URL */}
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
                        onClick={handleBgUrlApply}
                        className="px-3 py-1.5 rounded-md text-sm bg-[var(--color-accent)] text-white
                          hover:bg-[var(--color-accent-hover)] transition-colors"
                      >
                        OK
                      </button>
                    </div>
                  )}

                  {/* 遮罩透明度 */}
                  <div>
                    <label className="text-xs text-[var(--color-text-tertiary)] mb-1 block">
                      {t("settings.backgroundOverlayOpacity")}: {settings.background.overlayOpacity}%
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={settings.background.overlayOpacity}
                      onChange={(e) => updateBackground({ overlayOpacity: Number(e.target.value) })}
                      className="w-full h-1.5 rounded-full appearance-none bg-[var(--color-bg-tertiary)]
                        accent-[var(--color-accent)] cursor-pointer"
                    />
                  </div>

                  {/* 模糊度 */}
                  <div>
                    <label className="text-xs text-[var(--color-text-tertiary)] mb-1 block">
                      {t("settings.backgroundBlur")}: {settings.background.blur}px
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={20}
                      value={settings.background.blur}
                      onChange={(e) => updateBackground({ blur: Number(e.target.value) })}
                      className="w-full h-1.5 rounded-full appearance-none bg-[var(--color-bg-tertiary)]
                        accent-[var(--color-accent)] cursor-pointer"
                    />
                  </div>
                </>
              )}
            </div>
          </SettingSection>
        </div>
      </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SettingSection({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Sun;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-[var(--color-text-tertiary)]" />
        <span className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}
