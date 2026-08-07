"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Sun, Moon, Monitor, ChevronDown, Check } from "lucide-react";
import { useSettings, type Theme, type FontSize } from "@/contexts/SettingsContext";
import { useLocale } from "@/contexts/LocaleContext";
import { LOCALES, NATIVE_NAMES, type Locale } from "@/lib/i18n/types";

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
  const { settings, updateTheme, updateFontSize, updateLocale } = useSettings();
  const { t } = useLocale();

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} aria-hidden="true" />
      <div className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2
        w-[min(400px,calc(100vw-32px))] rounded-xl shadow-2xl
        bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">

        <div className="flex items-center justify-between px-6 pt-5 pb-0">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">{t("settings.title")}</h2>
          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2 rounded-md
              text-[var(--color-text-tertiary)]
              hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* 主题 */}
          <Section title={t("settings.theme")}>
            <div className="flex gap-1.5">
              {THEME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateTheme(opt.value)}
                  className={`flex-1 flex items-center justify-center gap-1.5 min-h-[44px] rounded-lg text-sm transition-colors
                    ${settings.theme === opt.value
                      ? "bg-[var(--color-accent)] text-white"
                      : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-primary)]" }
                  `}
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
                  className={`flex-1 min-h-[44px] rounded-lg text-sm transition-colors
                    ${settings.fontSize === opt.value
                      ? "bg-[var(--color-accent)] text-white"
                      : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-primary)]" }
                  `}
                >
                  {t(opt.labelKey)}
                </button>
              ))}
            </div>
          </Section>

          {/* 语言 - 自定义下拉菜单 */}
          <Section title={t("settings.language")}>
            <LocaleDropdown
              value={settings.locale}
              onChange={updateLocale}
            />
          </Section>
        </div>
      </div>
    </>
  );
}

/* ----------------------------------------------------------
 * 自定义语言下拉菜单（非原生 <select>）
 * ---------------------------------------------------------- */
function LocaleDropdown({
  value,
  onChange,
}: {
  value: Locale;
  onChange: (v: Locale) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const select = useCallback(
    (v: Locale) => {
      onChange(v);
      setOpen(false);
    },
    [onChange],
  );

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full min-h-[44px] flex items-center justify-between px-3 rounded-lg text-sm
          bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]
          border border-[var(--color-border)]
          hover:border-[var(--color-accent)]
          transition-colors text-left"
      >
        <span>{NATIVE_NAMES[value]}</span>
        <ChevronDown
          className={`w-4 h-4 text-[var(--color-text-tertiary)] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 top-full mt-1 py-1 rounded-lg border border-[var(--color-border)]
            bg-[var(--color-bg-primary)] shadow-lg z-50 max-h-60 overflow-y-auto"
        >
          {LOCALES.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => select(loc)}
              className={`w-full text-left px-3 py-2.5 text-sm flex items-center justify-between
                transition-colors
                ${loc === value
                  ? "text-[var(--color-accent)] bg-[var(--color-accent)]/5"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]"}
              `}
            >
              <span>{NATIVE_NAMES[loc]}</span>
              {loc === value && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
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
