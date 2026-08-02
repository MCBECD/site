"use client";

import { useEffect, useState } from "react";
import { useSettings } from "@/contexts/SettingsContext";
import { useTheme } from "@/contexts/ThemeContext";

export function BackgroundLayer() {
  const { settings } = useSettings();
  const { background } = settings;
  const { resolvedTheme } = useTheme();
  const [bingUrl, setBingUrl] = useState<string | null>(null);

  /* @side-effect 获取必应每日图片 */
  useEffect(() => {
    if (!background.enabled || background.source !== "bing") return;
    let cancelled = false;
    fetch("https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1")
      .then((r) => r.json())
      .then((data: { images?: Array<{ url: string }> }) => {
        if (!cancelled && data.images?.[0]?.url) {
          setBingUrl(`https://www.bing.com${data.images[0].url}`);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [background.enabled, background.source]);

  if (!background.enabled) return null;

  const imgUrl = background.source === "bing" ? bingUrl : background.url;
  if (!imgUrl) return null;

  return (
    <>
      {/* @constraint z-index: -1 确保在所有内容下方 */}
      <div className="fixed inset-0 -z-10" aria-hidden="true">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${imgUrl})`,
            filter: `blur(${background.blur}px)`,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: resolvedTheme === "dark" ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.7)",
            opacity: background.overlayOpacity / 100,
          }}
        />
      </div>
    </>
  );
}
