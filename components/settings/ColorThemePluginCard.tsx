"use client";

import { Palette } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { useSettings, type ColorTheme } from "@/contexts/SettingsContext";
import { PluginCard } from "./PluginCard";
import { Squircle } from "@/components/Squircle";

const COLOR_PRESETS: { value: ColorTheme; labelKey: string; swatch: string }[] = [
  { value: "default", labelKey: "settings.colorDefault", swatch: "linear-gradient(135deg, #94a3b8, #475569)" },
  { value: "red",    labelKey: "settings.colorRed",    swatch: "linear-gradient(135deg, #fca5a5, #ef4444)" },
  { value: "blue",   labelKey: "settings.colorBlue",   swatch: "linear-gradient(135deg, #93c5fd, #3b82f6)" },
  { value: "green",  labelKey: "settings.colorGreen",  swatch: "linear-gradient(135deg, #86efac, #22c55e)" },
];

export function ColorThemePluginCard() {
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
            <Squircle
              key={p.value}
              cornerRadius={10}
              borderColor={settings.colorTheme === p.value ? "var(--color-accent)" : undefined}
              className={`flex flex-col items-center gap-2 p-3 transition-colors cursor-pointer
                ${settings.colorTheme === p.value
                  ? "bg-[var(--color-accent-muted)]"
                  : "bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-secondary)]"}`}
              onClick={() => updateColorTheme(p.value)}
            >
              <span className="w-7 h-7 rounded-full border border-[var(--color-border)]" style={{ background: p.swatch }} />
              <span className="text-[11px] text-[var(--color-text-secondary)]">{t(p.labelKey)}</span>
            </Squircle>
          ))}
        </div>

        {/* custom color */}
        <Squircle
          cornerRadius={10}
          borderColor={settings.colorTheme === "custom" ? "var(--color-accent)" : undefined}
          className={`flex items-center gap-3 px-3 py-3 transition-colors
            ${settings.colorTheme === "custom"
              ? "bg-[var(--color-accent-muted)]"
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
        </Squircle>
      </div>
    </PluginCard>
  );
}