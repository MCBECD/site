"use client";

import { useRef, useCallback } from "react";
import { Image } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { useSettings } from "@/contexts/SettingsContext";
import { SliderRow } from "./SliderRow";
import { ToggleSwitch } from "./ToggleSwitch";

const BG_PRESETS = [
  { value: "/bg/cargil-1.png", labelKey: "settings.bgPreset1" },
  { value: "/bg/cargil-2.jpg", labelKey: "settings.bgPreset2" },
  { value: "/bg/cargil-3.png", labelKey: "settings.bgPreset3" },
];

export function BackgroundImagePluginCard() {
  const { t } = useLocale();
  const { settings, updateSettings, isPluginEnabled, togglePlugin } = useSettings();
  const id = "background-image";
  const enabled = isPluginEnabled(id);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleToggle = useCallback((v: boolean) => {
    togglePlugin(id, v);
    if (v && !settings.bgImage) {
      updateSettings("bgImage", BG_PRESETS[0]!.value);
    }
  }, [settings.bgImage, togglePlugin, updateSettings]);

  const handleUpload = useCallback(() => {
    fileRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert(t("settings.bgImageTooLarge"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateSettings("bgImage", reader.result);
      }
    };
    reader.readAsDataURL(file);
  }, [updateSettings, t]);

  return (
    <div
      className={`rounded-lg border transition-[border-color,background-color,opacity] duration-100 ${
        enabled
          ? "border-[var(--color-accent)]/30 bg-[var(--color-bg-primary)]"
          : "border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
      }`}
    >
      <div className="flex items-center gap-3.5 px-4 py-3.5">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
            enabled
              ? "bg-[var(--color-accent-muted)] text-[var(--color-accent)]"
              : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)]"
          }`}
        >
          <Image className="w-[18px] h-[18px]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-medium text-[var(--color-text-primary)] leading-tight">{t("settings.pluginBgImage")}</div>
          <div className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5 leading-snug">{t("settings.pluginBgImageDesc")}</div>
        </div>
        <ToggleSwitch checked={enabled} onChange={handleToggle} />
      </div>

      {enabled && (
        <div className="px-4 pb-4 pt-1 border-t border-[var(--color-border)]">
          <div className="pt-4 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {BG_PRESETS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => updateSettings("bgImage", p.value)}
                  className={`relative flex flex-col items-center gap-2 p-2.5 rounded-[var(--radius)] transition-colors overflow-hidden
                    ${settings.bgImage === p.value
                      ? "ring-1 ring-[var(--color-accent)]"
                      : "hover:bg-[var(--color-bg-tertiary)]"}`}
                >
                  <span
                    className="w-full h-12 rounded bg-cover bg-center border border-[var(--color-border)]"
                    style={{ backgroundImage: `url(${p.value})` }}
                  />
                  <span className="text-[11px] text-[var(--color-text-secondary)]">{t(p.labelKey)}</span>
                </button>
              ))}
            </div>

            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <button
              onClick={handleUpload}
              className={`w-full flex items-center justify-center gap-2 h-9 rounded-[var(--radius)] text-[12px] transition-colors
                ${settings.bgImage && !BG_PRESETS.some((p) => p.value === settings.bgImage)
                  ? "bg-[var(--color-accent-muted)] text-[var(--color-accent)]"
                  : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"}`}
            >
              <Image className="w-3.5 h-3.5" />
              {t("settings.bgUpload")}
            </button>

            <SliderRow label={t("settings.bgOverlayOpacity")} value={settings.bgOverlayOpacity} onChange={(v) => updateSettings("bgOverlayOpacity", v)} />

            <SliderRow label={t("settings.bgOverlayBlur")} value={settings.bgOverlayBlur} onChange={(v) => updateSettings("bgOverlayBlur", v)} max={20} />

            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[var(--color-text-secondary)]">{t("settings.bgParallax")}</span>
              <ToggleSwitch checked={settings.bgParallax} onChange={() => updateSettings("bgParallax", !settings.bgParallax)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}