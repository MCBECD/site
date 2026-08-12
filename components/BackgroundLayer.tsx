"use client";

import { useMemo, useEffect, useRef, useState, memo } from "react";
import { useSettings } from "@/contexts/SettingsContext";

/**
 * Validate that a background image URL is safe to use as an <img src>.
 * Only allows:
 *   - Relative paths starting with "/"
 *   - data:image/* URLs (safe because browsers don't execute scripts from img src)
 * Rejects javascript:, vbscript:, and arbitrary external URLs that could be used for tracking.
 */
function isSafeBgImage(url: string): boolean {
  if (url.startsWith("/") && !url.startsWith("//")) return true;
  if (url.startsWith("data:image/")) return true;
  return false;
}

/** Background image scale factor (slightly larger than viewport to avoid edges during parallax) */
const BG_SCALE = 1.08;

/** Parallax: divisor that controls how much mouse movement translates to image offset */
const PARALLAX_FACTOR = 20;

/** Parallax: minimum pixel difference before the lerp animation continues */
const PARALLAX_THRESHOLD = 0.3;

/** Parallax: lerp interpolation speed (0–1, lower = smoother) */
const PARALLAX_LERP = 0.08;

const BackgroundLayer = memo(function BackgroundLayer() {
  const { settings } = useSettings();
  const bgEnabled = !!settings.plugins["background-image"] && !!settings.bgImage && isSafeBgImage(settings.bgImage);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  /* When user prefers reduced motion, disable parallax regardless of setting */
  const parallaxEnabled = settings.bgParallax && !reducedMotion;

  const overlayStyle = useMemo(() => ({
    backgroundColor: "var(--color-bg-primary)",
    opacity: settings.bgOverlayOpacity / 100,
  }), [settings.bgOverlayOpacity]);

  const imgFilter = useMemo(() =>
    settings.bgOverlayBlur > 0 ? `blur(${settings.bgOverlayBlur}px)` : undefined,
    [settings.bgOverlayBlur]);

  const imgRef = useRef<HTMLImageElement>(null);
  const [bg, setBg] = useState<{ s: number; tx: number; ty: number } | null>(null);

  useEffect(() => {
    if (!bgEnabled) { setBg(null); return; }
    const calc = () => {
      setBg({
        s: BG_SCALE,
        tx: -innerWidth * (BG_SCALE - 1) / 2,
        ty: -innerHeight * (BG_SCALE - 1) / 2,
      });
    };
    calc();
    addEventListener("resize", calc);
    return () => removeEventListener("resize", calc);
  }, [bgEnabled, settings.bgImage]);

  useEffect(() => {
    const el = imgRef.current;
    if (!el || !bg) return;

    const centered = `translate(${bg.tx}px,${bg.ty}px) scale(${bg.s})`;
    if (!parallaxEnabled) { el.style.transform = centered; return; }

    let mx = innerWidth / 2, my = innerHeight / 2;
    let sx = mx, sy = my;
    let onM: (e: MouseEvent) => void;
    let onT: (e: TouchEvent) => void;
    let raf = 0;
    const tick = () => {
      sx += (mx - sx) * PARALLAX_LERP;
      sy += (my - sy) * PARALLAX_LERP;
      const dx = (sx - innerWidth / 2) / PARALLAX_FACTOR;
      const dy = (sy - innerHeight / 2) / PARALLAX_FACTOR;
      el.style.transform = `translate(${bg.tx + dx}px,${bg.ty + dy}px) scale(${bg.s})`;
      if (Math.abs(mx - sx) > PARALLAX_THRESHOLD || Math.abs(my - sy) > PARALLAX_THRESHOLD) {
        raf = requestAnimationFrame(tick);
      } else { raf = 0; }
    };
    const start = () => { if (!raf) raf = requestAnimationFrame(tick); };
    addEventListener("mousemove", (onM = (e) => { mx = e.clientX; my = e.clientY; start(); }), { passive: true });
    addEventListener("touchmove", (onT = (e: TouchEvent) => { const t = e.touches[0]; if (t) { mx = t.clientX; my = t.clientY; } start(); }), { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      removeEventListener("mousemove", onM);
      removeEventListener("touchmove", onT);
      cancelAnimationFrame(raf);
    };
  }, [bg, parallaxEnabled]);

  return (
    <>
      <div className="fixed inset-0 bg-[var(--color-bg-primary)] z-[var(--z-bg-base)]" aria-hidden="true" />
      {bgEnabled && bg && (
        <>
          <img
            ref={imgRef}
            src={settings.bgImage}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="fixed inset-0 w-full h-full z-[var(--z-bg-image)] pointer-events-none select-none object-cover"
            style={{
              transformOrigin: "0 0",
              transform: `translate(${bg.tx}px,${bg.ty}px) scale(${bg.s})`,
              filter: imgFilter,
              willChange: parallaxEnabled ? "transform" : undefined,
            }}
          />
          <div className="fixed inset-0 z-[var(--z-bg-overlay)]" style={overlayStyle} aria-hidden="true" />
        </>
      )}
    </>
  );
});

export { BackgroundLayer };