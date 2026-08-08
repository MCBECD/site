"use client";

import { Sun, Moon, Monitor, X } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSettings, type Theme, type FontSize } from "@/contexts/SettingsContext";
import { useLocale } from "@/contexts/LocaleContext";
import { ColorThemePluginCard } from "./settings/ColorThemePluginCard";
import { BackgroundImagePluginCard } from "./settings/BackgroundImagePluginCard";
import { LocaleDropdown } from "./settings/LocaleDropdown";
import { Section } from "./settings/Section";
import { Squircle } from "./Squircle";

/* ---------- Constants ---------- */

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

type Tab = "general" | "plugins";

/* ---------- Main Panel ---------- */

export function SettingsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { settings, updateTheme, updateFontSize, updateLocale } = useSettings();
  const { t } = useLocale();
  const [tab, setTab] = useState<Tab>("general");
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

  if (!open && !closing) return null;

  const panelAnim = closing ? "settings-panel-out" : "settings-panel-in";

  return (
    <>
      <div
        className={`fixed inset-0 z-50 backdrop-blur-[2px] ${closing ? "overlay-out" : "overlay-in"}`}
        onClick={handleClose}
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <Squircle
          cornerRadius={12}
          borderColor="var(--color-border)"
          shadow="0 4px 20px rgba(0,0,0,0.1)"
          className={`w-[min(440px,calc(100vw-32px))] max-h-[min(600px,calc(100vh-48px))] flex flex-col
            bg-[var(--color-bg-primary)] pointer-events-auto ${panelAnim}`}
        >
          {/* header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-0 flex-shrink-0">
            <h2 className="text-[13px] font-semibold text-[var(--color-text-primary)]">{t("settings.title")}</h2>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center -mr-1 rounded-[var(--radius)]
                text-[var(--color-text-tertiary)]
                hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
              aria-label={t("common.backToList")}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* tabs */}
          <div className="flex gap-0 mx-5 mt-4 border-b border-[var(--color-border)] flex-shrink-0">
            {(["general", "plugins"] as Tab[]).map((key) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-3 pb-2.5 text-[13px] font-medium transition-colors relative -mb-px
                  ${tab === key
                    ? "text-[var(--color-accent)]"
                    : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"}`}
              >
                {t(key === "general" ? "settings.tabGeneral" : "settings.tabPlugins")}
                {tab === key && (
                  <span className="absolute bottom-0 inset-x-0 h-[2px] bg-[var(--color-accent)] rounded-full tab-indicator" />
                )}
              </button>
            ))}
          </div>

          {/* scrollable content */}
          <div className="px-5 py-5 space-y-3 overflow-y-auto flex-1">
            {tab === "general" ? (
              <>
                <Section title={t("settings.theme")}>
                  <div className="flex gap-1.5">
                    {THEME_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updateTheme(opt.value)}
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
                        onClick={() => updateFontSize(opt.value)}
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
                  <LocaleDropdown value={settings.locale} onChange={updateLocale} />
                </Section>
              </>
            ) : (
              <div className="space-y-3">
                <ColorThemePluginCard />
                <BackgroundImagePluginCard />
              </div>
            )}
          </div>
        </Squircle>
      </div>
    </>
  );
}
