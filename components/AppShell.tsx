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

  /* ---------- bg image ---------- */
  const imgRef = useRef<HTMLImageElement>(null);
  const [bg, setBg] = useState<{ s: number; ox: number; oy: number; ex: number; ey: number } | null>(null);

  useEffect(() => {
    if (!bgEnabled) { setBg(null); return; }
    const img = new Image();
    img.onload = () => {
      const vpW = window.innerWidth, vpH = window.innerHeight;
      const s = Math.max(vpW / img.naturalWidth, vpH / img.naturalHeight) * 1.8;
      const vw = img.naturalWidth * s, vh = img.naturalHeight * s;
      setBg({ s, ox: (vpW - vw) / 2, oy: (vpH - vh) / 2, ex: (vw - vpW) / 2, ey: (vh - vpH) / 2 });
    };
    img.src = settings.bgImage;
    const onResize = () => { img.src = settings.bgImage; };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [bgEnabled, settings.bgImage]);

  /* ---------- parallax ---------- */
  useEffect(() => {
    const el = imgRef.current;
    if (!el || !bg) return;

    // parallax off → just center
    if (!settings.bgParallax) {
      el.style.transform = `translate(${bg.ox}px,${bg.oy}px) scale(${bg.s})`;
      return;
    }

    let mx = 0.5, my = 0.5, sx = 0.5, sy = 0.5;
    const ptr = (x: number, y: number) => { mx = x / innerWidth; my = y / innerHeight; };
    const onM = (e: MouseEvent) => ptr(e.clientX, e.clientY);
    const onT = (e: TouchEvent) => { const t = e.touches[0]; if (t) ptr(t.clientX, t.clientY); };
    addEventListener("mousemove", onM, { passive: true });
    addEventListener("touchmove", onT, { passive: true });

    let raf = 0;
    const tick = () => {
      sx += (mx - sx) * 0.08;
      sy += (my - sy) * 0.08;
      el.style.transform = `translate(${bg.ox + (sx - 0.5) * 2 * bg.ex}px,${bg.oy + (sy - 0.5) * 2 * bg.ey}px) scale(${bg.s})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      removeEventListener("mousemove", onM);
      removeEventListener("touchmove", onT);
      cancelAnimationFrame(raf);
    };
  }, [bg, settings.bgParallax]);

  return (
    <>
      <div className="fixed inset-0 bg-[var(--color-bg-primary)] -z-30" aria-hidden="true" />
      {bgEnabled && bg && (
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
              transform: `translate(${bg.ox}px,${bg.oy}px) scale(${bg.s})`,
              willChange: settings.bgParallax ? "transform" : undefined,
            }}
          />
          <div className="fixed inset-0 -z-10" style={overlayStyle} aria-hidden="true" />
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
