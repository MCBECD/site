"use client";

import { useRef, useCallback } from "react";
import { Image } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { useSettings } from "@/contexts/SettingsContext";
import { PluginCard } from "./PluginCard";
import { SliderRow } from "./SliderRow";
import { ToggleSwitch } from "./ToggleSwitch";
import { SquircleButton } from "@/components/SquircleButton";

const BG_PRESETS = [
  { value: "/bg/cargil-1.png", labelKey: "settings.bgPreset1" },
  { value: "/bg/cargil-2.jpg", labelKey: "settings.bgPreset2" },
  { value: "/bg/cargil-3.png", labelKey: "settings.bgPreset3" },
];

export function BackgroundImagePluginCard() {
  const { t } = useLocale();
  const { settings, updateBgImage, updateBgOverlayOpacity, updateBgOverlayBlur, updateBgParallax, isPluginEnabled, togglePlugin } = useSettings();
  const id = "background-image";
  const enabled = isPluginEnabled(id);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(() => {
    fileRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateBgImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }, [updateBgImage]);

  return (
    <PluginCard
      name={t("settings.pluginBgImage")}
      desc={t("settings.pluginBgImageDesc")}
      Icon={Image}
      enabled={enabled}
      onToggle={(v) => togglePlugin(id, v)}
    >
      <div className="space-y-3">
        {/* presets grid */}
        <div className="grid grid-cols-3 gap-2">
          {BG_PRESETS.map((p) => (
            <SquircleButton
              key={p.value}
              cornerRadius={10}
              className={`relative flex flex-col items-center gap-2 p-2.5 transition-colors overflow-hidden
                ${settings.bgImage === p.value
                  ? "ring-1 ring-[var(--color-accent)]"
                  : "hover:bg-[var(--color-bg-tertiary)]"}`}
              onClick={() => updateBgImage(p.value)}
            >
              <span
                className="w-full h-12 bg-cover bg-center border border-[var(--color-border)]"
                style={{ backgroundImage: `url(${p.value})` }}
              />
              <span className="text-[11px] text-[var(--color-text-secondary)]">{t(p.labelKey)}</span>
            </SquircleButton>
          ))}
        </div>

        {/* upload button */}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        <SquircleButton
          cornerRadius={10}
          className={`w-full flex items-center justify-center gap-2 h-9 text-[12px] transition-colors
            ${settings.bgImage && !BG_PRESETS.some((p) => p.value === settings.bgImage)
              ? "bg-[var(--color-accent-muted)] text-[var(--color-accent)]"
              : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"}`}
          onClick={handleUpload}
        >
          <Image className="w-3.5 h-3.5" />
          {t("settings.bgUpload")}
        </SquircleButton>

        {/* clear button */}
        {settings.bgImage && (
          <button
            onClick={() => updateBgImage("")}
            className="w-full text-center text-[11px] text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)] transition-colors"
          >
            {t("settings.bgClear")}
          </button>
        )}

        {/* overlay opacity */}
        <SliderRow label={t("settings.bgOverlayOpacity")} value={settings.bgOverlayOpacity} onChange={updateBgOverlayOpacity} />

        {/* overlay blur */}
        <SliderRow label={t("settings.bgOverlayBlur")} value={settings.bgOverlayBlur} onChange={updateBgOverlayBlur} max={20} />

        {/* parallax toggle */}
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[var(--color-text-secondary)]">{t("settings.bgParallax")}</span>
          <ToggleSwitch checked={settings.bgParallax} onChange={() => updateBgParallax(!settings.bgParallax)} />
        </div>
      </div>
    </PluginCard>
  );
}
