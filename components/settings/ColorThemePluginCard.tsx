"use client";

import { Palette } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { useSettings, type ColorTheme } from "@/contexts/SettingsContext";

const COLOR_PRESETS: { value: ColorTheme; labelKey: string; swatch: string }[] = [
  { value: "default", labelKey: "settings.colorDefault", swatch: "linear-gradient(135deg, #94a3b8, #475569)" },
  { value: "red",    labelKey: "settings.colorRed",    swatch: "linear-gradient(135deg, #fca5a5, #ef4444)" },
  { value: "blue",   labelKey: "settings.colorBlue",   swatch: "linear-gradient(135deg, #93c5fd, #3b82f6)" },
  { value: "green",  labelKey: "settings.colorGreen",  swatch: "linear-gradient(135deg, #86efac, #22c55e)" },
];

export function ColorThemePluginCard() {
  const { t } = useLocale();
  const { settings, updateSettings } = useSettings();

  return (
    <div className="rounded-lg border border-[var(--color-accent)]/30 bg-[var(--color-bg-primary)] overflow-hidden">
      <div className="flex items-center gap-3.5 px-4 py-3.5">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-[var(--color-accent-muted)] text-[var(--color-accent)]">
          <Palette className="w-[18px] h-[18px]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-medium text-[var(--color-text-primary)] leading-tight">{t("settings.pluginColorTheme")}</div>
          <div className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5 leading-snug">{t("settings.pluginColorThemeDesc")}</div>
        </div>
      </div>

      <div className="px-4 pb-4 pt-1 border-t border-[var(--color-border)]">
        <div className="pt-4 space-y-3">
          <div className="grid grid-cols-4 gap-2">
            {COLOR_PRESETS.map((p) => (
              <button
                key={p.value}
                onClick={() => updateSettings("colorTheme", p.value)}
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
                  updateSettings("customColor", e.target.value);
                  if (settings.colorTheme !== "custom") updateSettings("colorTheme", "custom");
                }}
                aria-label={t("settings.colorCustomPicker")}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <span className="w-full h-full block rounded-full" style={{ background: settings.customColor }} />
            </label>
            <span className="text-[12px] text-[var(--color-text-secondary)]">{t("settings.colorCustom")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}