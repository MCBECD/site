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

  /* ---------- Background image sizing ---------- */
  // Load image, get natural size, ensure it covers viewport (+25% extra for parallax).
  // On regular screens the original resolution is usually enough;
  // on 4K we scale up so it still fills the screen.
  const imgRef = useRef<HTMLImageElement>(null);
  const [bgLayout, setBgLayout] = useState<{
    w: number; h: number;        // rendered pixel size
    baseX: number; baseY: number; // centering offset (negative)
    maxX: number; maxY: number;   // safe shift range (px)
  } | null>(null);

  useEffect(() => {
    if (!bgEnabled) { setBgLayout(null); return; }

    const calc = () => {
      const img = new Image();
      img.onload = () => {
        const vpW = window.innerWidth;
        const vpH = window.innerHeight;
        // At least 1× (natural size); scale up only if image can't cover viewport
        const minScale = Math.max(1, vpW / img.naturalWidth, vpH / img.naturalHeight);
        // +25 % headroom for parallax movement
        const scale = minScale * 1.25;
        const w = img.naturalWidth * scale;
        const h = img.naturalHeight * scale;
        const baseX = (vpW - w) / 2;
        const baseY = (vpH - h) / 2;
        setBgLayout({
          w, h, baseX, baseY,
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
    if (!el) return;

    // When parallax is off, just center the image
    if (!bgEnabled || !settings.bgParallax || !bgLayout) {
      el.style.transform = bgLayout
        ? `translate(${bgLayout.baseX}px, ${bgLayout.baseY}px)`
        : "";
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

      const { baseX, baseY, maxX, maxY } = bgLayout;
      const dx = (s.x - 0.5) * 2 * maxX;
      const dy = (s.y - 0.5) * 2 * maxY;
      el.style.transform = `translate(${baseX + dx}px, ${baseY + dy}px)`;

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
              width: bgLayout.w,
              height: bgLayout.h,
              transform: `translate(${bgLayout.baseX}px, ${bgLayout.baseY}px)`,
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
