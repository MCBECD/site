"use client";

import { Sun, Moon, Monitor, X } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSettings, type Theme, type FontSize } from "@/contexts/SettingsContext";
import { useLocale } from "@/contexts/LocaleContext";
import { ColorThemePluginCard } from "./settings/ColorThemePluginCard";
import { LocaleDropdown } from "./settings/LocaleDropdown";
import { Section } from "./settings/Section";

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

export function SettingsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { settings, updateSettings } = useSettings();
  const { t } = useLocale();
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleClose = useCallback(() => {
    setClosing(true);
    closeTimer.current = setTimeout(() => {
      setClosing(false);
      onClose();
    }, 180);
  }, [onClose]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  useEffect(() => {
    const shouldLock = open || closing;
    document.body.style.overflow = shouldLock ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open, closing]);

  if (!open && !closing) return null;

  return (
    <>
      <div
        className={`fixed inset-0 z-50 backdrop-blur-[2px] ${closing ? "overlay-out" : "overlay-in"}`}
        onClick={handleClose}
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className={`w-[min(440px,calc(100vw-32px))] max-h-[min(80vh,calc(100vh-48px))] rounded-xl shadow-lg flex flex-col
          bg-[var(--color-bg-primary)] border border-[var(--color-border)] pointer-events-auto ${closing ? "settings-panel-out" : "settings-panel-in"}`}>
          <div className="flex items-center justify-between px-5 pt-5 pb-0 flex-shrink-0">
            <h2 className="text-[13px] font-semibold text-[var(--color-text-primary)]">{t("settings.title")}</h2>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center -mr-1 rounded-[var(--radius)]
                text-[var(--color-text-tertiary)]
                hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="px-5 py-5 space-y-5 overflow-y-auto flex-1">
            <Section title={t("settings.theme")}>
              <div className="flex gap-1.5">
                {THEME_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateSettings("theme", opt.value)}
                    className={`flex-1 flex items-center justify-center gap-1.5 h-10 rounded-[var(--radius)] text-[13px] transition-colors
                      ${settings.theme === opt.value
                        ? "bg-[var(--color-accent)] text-white"
                        : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"}`}
                  >
                    <opt.icon className="w-3.5 h-3.5" />
                    {t(opt.labelKey)}
                  </button>
                ))}
              </div>
            </Section>

            <Section title={t("settings.fontSize")}>
              <div className="flex gap-1.5">
                {FONT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateSettings("fontSize", opt.value)}
                    className={`flex-1 h-10 rounded-[var(--radius)] text-[13px] transition-colors
                      ${settings.fontSize === opt.value
                        ? "bg-[var(--color-accent)] text-white"
                        : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"}`}
                  >
                    {t(opt.labelKey)}
                  </button>
                ))}
              </div>
            </Section>

            <Section title={t("settings.language")}>
              <LocaleDropdown value={settings.locale} onChange={(locale) => updateSettings("locale", locale)} />
            </Section>

            <Section title={t("settings.pluginColorTheme")}>
              <ColorThemePluginCard />
            </Section>
          </div>
        </div>
      </div>
    </>
  );
}