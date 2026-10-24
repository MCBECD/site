"use client";

import { useRef, useState, useCallback } from "react";
import { Image } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { useSettings } from "@/contexts/SettingsContext";
import { SliderRow } from "./SliderRow";
import { ToggleSwitch } from "./ToggleSwitch";
import { AURORA_BG, BG_PRESETS } from "@/lib/backgrounds";

/**
 * @why 预设定义在 lib/backgrounds.ts，和 BackgroundLayer 共用一份。位图预设一律用
 * WebP：原图是 2000×1168 的 RGBA PNG，单张 1.45MB，一开背景插件就要多下 1.5MB，
 * 而且正好砸在首屏 JS 竞争最激烈的时刻。转成 1920px WebP 后分别是 61/74/47 KB。
 *
 * @constraint 旧的 .png/.jpg 文件保留在 public/bg/ 下不要删：老用户 localStorage 里
 * 存的是旧路径，删掉会让他们的背景图 404（不崩，但会突然变空白）。
 */

/** Allowed MIME types for background image uploads */
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
]);

/** Maximum file size in bytes (2 MB) */
const MAX_FILE_SIZE = 2 * 1024 * 1024;

export function BackgroundImagePluginCard() {
  const { t } = useLocale();
  const { settings, updateSettings, isPluginEnabled, togglePlugin } = useSettings();
  const id = "background-image";
  const enabled = isPluginEnabled(id);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<"size" | "type" | false>(false);

  const handleToggle = useCallback((v: boolean) => {
    togglePlugin(id, v);
    if (v && !settings.bgImage) {
      updateSettings("bgImage", BG_PRESETS[0]!.value);
    }
  }, [settings.bgImage, togglePlugin, updateSettings]);

  const handleUpload = useCallback(() => {
    setUploadError(false);
    fileRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setUploadError("size");
      return;
    }

    // Validate MIME type (the accept attribute is only a UI hint, not enforced)
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setUploadError("type");
      return;
    }

    setUploadError(false);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        // Double-check the data URL prefix is a safe image type
        if (!reader.result.startsWith("data:image/")) {
          setUploadError("type");
          return;
        }
        updateSettings("bgImage", reader.result);
      }
    };
    reader.onerror = () => {
      console.error("[BackgroundImage] Failed to read uploaded file");
      setUploadError("type");
    };
    reader.readAsDataURL(file);
    // Reset input so the same file can be re-selected
    e.target.value = "";
  }, [updateSettings]);

  return (
    <div
      className={`rounded-[var(--radius)] border transition-[border-color,background-color,opacity] duration-[var(--duration-fast)] ${
        enabled
          ? "border-[var(--color-accent)]/30 bg-[var(--color-bg-primary)]"
          : "border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
      }`}
    >
      <div className="flex items-center gap-3.5 px-4 py-3.5">
        <div
          className={`w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center flex-shrink-0 transition-colors duration-[var(--duration-fast)] ${
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
        <ToggleSwitch isChecked={enabled} onChange={handleToggle} label={t("settings.pluginBgImage")} />
      </div>

      {enabled && (
        <div className="px-4 pb-4 pt-1 border-t border-[var(--color-border)]">
          <div className="pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {BG_PRESETS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => updateSettings("bgImage", p.value)}
                  className={`relative flex flex-col items-center gap-2 p-2.5 rounded-[var(--radius)] active:scale-[0.92] transition-[color,transform] duration-[var(--duration-fast)] overflow-hidden
                    ${settings.bgImage === p.value
                      ? "ring-1 ring-[var(--color-accent)]"
                      : "hover:bg-[var(--color-bg-tertiary)]"}`}
                >
                  {p.aurora ? (
                    /* @why 弥散光是"两张皮肤"的预设（深色 + 浅色，实际用哪张由主题决定），
                       所以缩略图刻意画成两张叠在一起，而不是一张——否则用户会以为它只有一版，
                       在切主题后看到背景变了会当成 bug。 */
                    <span className="relative w-full h-14">
                      {/* 深色那版垫在下面、向右下错开，露出一条深色边角当作"第二张" */}
                      <span className="absolute left-[16%] top-[16%] right-0 bottom-0 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-border)]">
                        <span className="block h-full w-full bg-aurora-dark" />
                      </span>
                      {/* 浅色那版压在上面，带描边和阴影，看得出是一张独立的卡 */}
                      <span className="absolute left-0 top-0 right-[16%] bottom-[16%] overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-border)] shadow-[var(--shadow-sm)]">
                        <span className="block h-full w-full bg-aurora-light" />
                      </span>
                    </span>
                  ) : (
                    <span
                      className="w-full h-14 rounded-[var(--radius-sm)] bg-cover bg-center border border-[var(--color-border)]"
                      style={{ backgroundImage: `url(${p.value})` }}
                    />
                  )}
                  <span className="text-[11px] text-[var(--color-text-secondary)]">{t(p.labelKey)}</span>
                </button>
              ))}
            </div>

            {settings.bgImage === AURORA_BG && (
              <p className="text-[11px] text-[var(--color-text-tertiary)] leading-snug">
                {t("settings.bgPreset4Desc")}
              </p>
            )}

            {uploadError && (
              <p className="text-[11px] text-[var(--color-accent)]">
                {t(uploadError === "size" ? "settings.bgImageTooLarge" : "settings.bgImageWrongType")}
              </p>
            )}

            <input ref={fileRef} type="file" accept="image/*" className="hidden" aria-hidden="true" onChange={handleFileChange} />
            <button
              onClick={handleUpload}
              className={`w-full flex items-center justify-center gap-2 h-11 rounded-[var(--radius)] text-[13px] active:scale-[0.92] transition-[color,transform] duration-[var(--duration-fast)]
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
              <ToggleSwitch isChecked={settings.bgParallax} onChange={() => updateSettings("bgParallax", !settings.bgParallax)} label={t("settings.bgParallax")} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
