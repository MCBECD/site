"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Sun, Moon, Monitor, ChevronDown, Check, ChevronUp, Palette } from "lucide-react";
import { useSettings, type Theme, type FontSize, type ColorTheme } from "@/contexts/SettingsContext";
import { useLocale } from "@/contexts/LocaleContext";
import { LOCALES, NATIVE_NAMES, type Locale } from "@/lib/i18n/types";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

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

const COLOR_PRESETS: { value: ColorTheme; labelKey: string; swatch: string }[] = [
  { value: "default", labelKey: "settings.colorDefault", swatch: "linear-gradient(135deg, #94a3b8, #475569)" },
  { value: "red",    labelKey: "settings.colorRed",    swatch: "linear-gradient(135deg, #fca5a5, #ef4444)" },
  { value: "blue",   labelKey: "settings.colorBlue",   swatch: "linear-gradient(135deg, #93c5fd, #3b82f6)" },
  { value: "green",  labelKey: "settings.colorGreen",  swatch: "linear-gradient(135deg, #86efac, #22c55e)" },
];

type Tab = "general" | "plugins";

/* ---------- Main Panel ---------- */

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const {
    settings, updateTheme, updateFontSize, updateLocale,
    isPluginEnabled, togglePlugin,
  } = useSettings();
  const { t } = useLocale();
  const [tab, setTab] = useState<Tab>("general");

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50" onClick={onClose} aria-hidden="true" />
      <div className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2
        w-[min(440px,calc(100vw-32px))] max-h-[min(600px,calc(100vh-48px))] rounded-xl shadow-xl flex flex-col
        bg-[var(--color-bg-primary)] border border-[var(--color-border)]
        animate-[fadeIn_0.15s_ease]">

        {/* header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-0 flex-shrink-0">
          <h2 className="text-[13px] font-semibold text-[var(--color-text-primary)]">{t("settings.title")}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center -mr-1 rounded-[var(--radius)]
              text-[var(--color-text-tertiary)]
              hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
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
              {tab === key && <span className="absolute bottom-0 inset-x-0 h-[2px] bg-[var(--color-accent)] rounded-full" />}
            </button>
          ))}
        </div>

        {/* scrollable content */}
        <div className="px-5 py-5 space-y-5 overflow-y-auto flex-1">
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
                          : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]" }`}
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
                          : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]" }`}
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
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ============================================================
 * Plugin Card — toggle header + collapsible settings body
 * ============================================================ */

function PluginCard({
  name, desc, Icon, enabled, onToggle, children,
}: {
  name: string;
  desc: string;
  Icon: typeof Palette;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-lg border transition-colors ${
      enabled
        ? "border-[var(--color-accent)]/30 bg-[var(--color-bg-primary)]"
        : "border-[var(--color-border)] bg-[var(--color-bg-secondary)] opacity-60"
    }`}>
      {/* header row */}
      <div className="flex items-center gap-3.5 px-4 py-3.5">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
          enabled ? "bg-[var(--color-accent-muted)] text-[var(--color-accent)]" : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)]"
        }`}>
          <Icon className="w-[18px] h-[18px]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-medium text-[var(--color-text-primary)] leading-tight">{name}</div>
          <div className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5 leading-snug">{desc}</div>
        </div>
        {/* toggle switch */}
        <button
          role="switch"
          aria-checked={enabled}
          onClick={() => onToggle(!enabled)}
          className={`relative w-10 h-[22px] rounded-full transition-colors flex-shrink-0 ${
            enabled ? "bg-[var(--color-accent)]" : "bg-[var(--color-bg-tertiary)]"
          }`}
        >
          <span className={`absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
            enabled ? "translate-x-[18px]" : "translate-x-0"
          }`} />
        </button>
      </div>

      {/* expanded settings */}
      {enabled && (
        <div className="px-4 pb-4 pt-1 border-t border-[var(--color-border)]">
          <div className="pt-3">{children}</div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
 * Color Theme Plugin — full card with settings
 * ============================================================ */

function ColorThemePluginCard() {
  const { t } = useLocale();
  const { settings, updateColorTheme, updateCustomColor, isPluginEnabled, togglePlugin } = useSettings();
  const id = "color-theme";
  const enabled = isPluginEnabled(id);

  return (
    <PluginCard
      name={t("settings.pluginColorTheme")}
      desc={t("settings.pluginColorThemeDesc")}
      Icon={Palette}
      enabled={enabled}
      onToggle={(v) => togglePlugin(id, v)}
    >
      <div className="space-y-3">
        {/* presets grid */}
        <div className="grid grid-cols-4 gap-2">
          {COLOR_PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() => updateColorTheme(p.value)}
              className={`flex flex-col items-center gap-2 p-3 rounded-[var(--radius)] transition-colors
                ${settings.colorTheme === p.value
                  ? "bg-[var(--color-accent-muted)] ring-1 ring-[var(--color-accent)]"
                  : "bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-secondary)]"}`}
            >
              <span className="w-7 h-7 rounded-full border border-[var(--color-border)]" style={{ background: p.swatch }} />
              <span className="text-[11px] text-[var(--color-text-secondary)]">{t(p.labelKey)}</span>
            </button>
          ))}
        </div>

        {/* custom color */}
        <div
          className={`flex items-center gap-3 px-3 py-3 rounded-[var(--radius)] transition-colors
            ${settings.colorTheme === "custom"
              ? "bg-[var(--color-accent-muted)] ring-1 ring-[var(--color-accent)]"
              : "bg-[var(--color-bg-tertiary)]"}`}
        >
          <label className="relative w-8 h-8 rounded-full overflow-hidden border border-[var(--color-border)] cursor-pointer flex-shrink-0">
            <input
              type="color"
              value={settings.customColor}
              onChange={(e) => {
                updateCustomColor(e.target.value);
                if (settings.colorTheme !== "custom") updateColorTheme("custom");
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <span className="w-full h-full block rounded-full" style={{ background: settings.customColor }} />
          </label>
          <span className="text-[12px] text-[var(--color-text-secondary)]">{t("settings.colorCustom")}</span>
        </div>
      </div>
    </PluginCard>
  );
}

/* ============================================================
 * Locale Dropdown
 * ============================================================ */

function LocaleDropdown({ value, onChange }: { value: Locale; onChange: (v: Locale) => void }) {
  const [open, setOpen] = useState(false);
  const [flipUp, setFlipUp] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const select = useCallback(
    (v: Locale) => { onChange(v); setOpen(false); },
    [onChange],
  );

  useEffect(() => {
    if (!open) return;
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const below = window.innerHeight - rect.bottom;
    setFlipUp(below < 240 && rect.top > below);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (listRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const ArrowIcon = open ? ChevronUp : ChevronDown;

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full h-10 flex items-center justify-between px-3 rounded-[var(--radius)] text-[13px]
          bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]
          border border-[var(--color-border)]
          hover:border-[var(--color-accent)]/30
          transition-colors text-left"
      >
        <span>{NATIVE_NAMES[value]}</span>
        <ArrowIcon className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" />
      </button>

      {open && (
        <div
          ref={listRef}
          className={`absolute left-0 right-0 py-1 rounded-[var(--radius)] border border-[var(--color-border)]
            bg-[var(--color-bg-primary)] shadow-lg z-50 overflow-y-auto
            ${flipUp ? "bottom-full mb-1.5" : "top-full mt-1.5"} max-h-[40vh]`}
        >
          {LOCALES.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => select(loc)}
              className={`w-full text-left px-3 py-2 text-[13px] flex items-center justify-between transition-colors
                ${loc === value
                  ? "text-[var(--color-accent)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]"}`}
            >
              <span>{NATIVE_NAMES[loc]}</span>
              {loc === value && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Section ---------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[13px] font-medium text-[var(--color-text-primary)] mb-2.5">{title}</div>
      {children}
    </div>
  );
}
