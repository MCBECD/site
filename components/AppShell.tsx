"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { SettingsProvider, useSettings } from "@/contexts/SettingsContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { Navbar } from "@/components/Navbar";
import { SettingsPanel } from "@/components/SettingsPanel";

function ShellInner({ children }: { children: React.ReactNode }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const openSettings = useCallback(() => setSettingsOpen(true), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);
  const { settings } = useSettings();
  const bgEnabled = !!settings.plugins["background-image"] && !!settings.bgImage;

  const overlayStyle = useMemo(() => ({
    backgroundColor: "var(--color-bg-primary)",
    opacity: settings.bgOverlayOpacity / 100,
    ...(settings.bgOverlayBlur > 0 ? { backdropFilter: `blur(${settings.bgOverlayBlur}px)` } : {}),
  }), [settings.bgOverlayOpacity, settings.bgOverlayBlur]);

  /* ---------- Background image: scale to cover + 25% extra ---------- */
  const imgRef = useRef<HTMLImageElement>(null);
  const [bgLayout, setBgLayout] = useState<{
    scale: number;             // CSS scale() value
    baseX: number; baseY: number; // centering offset (px)
    maxX: number; maxY: number;   // safe parallax shift (px)
  } | null>(null);

  useEffect(() => {
    if (!bgEnabled) { setBgLayout(null); return; }

    const calc = () => {
      const img = new Image();
      img.onload = () => {
        const vpW = window.innerWidth;
        const vpH = window.innerHeight;
        // Natural size if it covers viewport; scale up for 4K / small images
        const minScale = Math.max(1, vpW / img.naturalWidth, vpH / img.naturalHeight);
        const scale = minScale * 1.25;
        // After scale, visual size = natW*scale × natH*scale.
        // Center it via translate (transform-origin: 0 0).
        const visW = img.naturalWidth * scale;
        const visH = img.naturalHeight * scale;
        const baseX = (vpW - visW) / 2;
        const baseY = (vpH - visH) / 2;
        setBgLayout({
          scale,
          baseX, baseY,
          maxX: Math.abs(baseX) * 0.9,
          maxY: Math.abs(baseY) * 0.9,
        });
      };
      img.src = settings.bgImage;
    };

    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [bgEnabled, settings.bgImage]);

  /* ---------- Parallax: pointer-follow + lerp easing ---------- */
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const smoothRef = useRef({ x: 0.5, y: 0.5 });
  const rafRef = useRef(0);

  useEffect(() => {
    const el = imgRef.current;
    if (!el || !bgLayout) return;

    if (!bgEnabled || !settings.bgParallax) {
      el.style.transform = `translate(${bgLayout.baseX}px, ${bgLayout.baseY}px) scale(${bgLayout.scale})`;
      return;
    }

    const onPointer = (cx: number, cy: number) => {
      mouseRef.current = { x: cx / window.innerWidth, y: cy / window.innerHeight };
    };
    const onMouse = (e: MouseEvent) => onPointer(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) onPointer(t.clientX, t.clientY);
    };

    window.addEventListener("mousemove", onMouse, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      const s = smoothRef.current;
      const m = mouseRef.current;
      s.x = lerp(s.x, m.x, 0.08);
      s.y = lerp(s.y, m.y, 0.08);

      const { baseX, baseY, maxX, maxY, scale } = bgLayout;
      const dx = (s.x - 0.5) * 2 * maxX;
      const dy = (s.y - 0.5) * 2 * maxY;
      el.style.transform = `translate(${baseX + dx}px, ${baseY + dy}px) scale(${scale})`;

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchmove", onTouch);
      cancelAnimationFrame(rafRef.current);
    };
  }, [bgEnabled, settings.bgParallax, bgLayout]);

  return (
    <>
      {/* solid base colour */}
      <div className="fixed inset-0 bg-[var(--color-bg-primary)] -z-30" aria-hidden="true" />

      {/* background image */}
      {bgEnabled && bgLayout && (
        <>
          <img
            ref={imgRef}
            src={settings.bgImage}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="fixed top-0 left-0 -z-20 pointer-events-none select-none"
            style={{
              transformOrigin: "0 0",
              transform: `translate(${bgLayout.baseX}px, ${bgLayout.baseY}px) scale(${bgLayout.scale})`,
              willChange: settings.bgParallax ? "transform" : undefined,
            }}
          />
          <div
            className="fixed inset-0 -z-10"
            style={overlayStyle}
            aria-hidden="true"
          />
        </>
      )}

      <Navbar onOpenSettings={openSettings} />
      <SettingsPanel open={settingsOpen} onClose={closeSettings} />
      <main className="pt-[var(--navbar-height)] min-h-screen">
        {children}
      </main>
    </>
  );
}

function SettingsAndLocale({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  return (
    <LocaleProvider locale={settings.locale}>
      {children}
    </LocaleProvider>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <ThemeProvider>
        <SettingsAndLocale>
          <ShellInner>{children}</ShellInner>
        </SettingsAndLocale>
      </ThemeProvider>
    </SettingsProvider>
  );
}
