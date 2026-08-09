"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { SettingsProvider, useSettings } from "@/contexts/SettingsContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { Navbar } from "@/components/Navbar";
import { SettingsPanel } from "@/components/SettingsPanel";
import { QuickRefFloat } from "@/components/QuickRefFloat";
import { PageTransition } from "@/components/PageTransition";

function ShellInner({ children }: { children: React.ReactNode }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const openSettings = useCallback(() => setSettingsOpen(true), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);
  const { settings } = useSettings();
  const bgEnabled = !!settings.plugins["background-image"] && !!settings.bgImage;

  const overlayStyle = useMemo(() => ({
    backgroundColor: "var(--color-bg-primary)",
    opacity: settings.bgOverlayOpacity / 100,
  }), [settings.bgOverlayOpacity]);

  const imgFilter = useMemo(() =>
    settings.bgOverlayBlur > 0 ? `blur(${settings.bgOverlayBlur}px)` : undefined,
  [settings.bgOverlayBlur]
  );

  /* ---------- bg image ---------- */
  const imgRef = useRef<HTMLImageElement>(null);
  const [bg, setBg] = useState<{ s: number; tx: number; ty: number } | null>(null);

  useEffect(() => {
    if (!bgEnabled) { setBg(null); return; }
    const calc = () => {
      const vpW = innerWidth, vpH = innerHeight;
      const s = 1.08;
      const tx = -vpW * (s - 1) / 2;
      const ty = -vpH * (s - 1) / 2;
      setBg({ s, tx, ty });
    };
    calc();
    addEventListener("resize", calc);
    return () => removeEventListener("resize", calc);
  }, [bgEnabled, settings.bgImage]);

  /* ---------- parallax ---------- */
  useEffect(() => {
    const el = imgRef.current;
    if (!el || !bg) return;

    const centered = `translate(${bg.tx}px,${bg.ty}px) scale(${bg.s})`;
    if (!settings.bgParallax) { el.style.transform = centered; return; }

    let mx = innerWidth / 2, my = innerHeight / 2;
    let sx = mx, sy = my;
    let onM: (e: MouseEvent) => void;
    let onT: (e: TouchEvent) => void;

    let raf = 0;
    const F = 20;
    const THRESHOLD = 0.3;
    const tick = () => {
      sx += (mx - sx) * 0.08;
      sy += (my - sy) * 0.08;
      const dx = (sx - innerWidth / 2) / F;
      const dy = (sy - innerHeight / 2) / F;
      el.style.transform = `translate(${bg.tx + dx}px,${bg.ty + dy}px) scale(${bg.s})`;
      // Pause when converged to save GPU
      if (Math.abs(mx - sx) > THRESHOLD || Math.abs(my - sy) > THRESHOLD) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
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
            className="fixed inset-0 w-full h-full -z-20 pointer-events-none select-none object-cover"
            style={{
              transformOrigin: "0 0",
              transform: `translate(${bg.tx}px,${bg.ty}px) scale(${bg.s})`,
              filter: imgFilter,
              willChange: settings.bgParallax ? "transform" : undefined,
            }}
          />
          <div className="fixed inset-0 -z-10" style={overlayStyle} aria-hidden="true" />
        </>
      )}
      <Navbar onOpenSettings={openSettings} />
      <SettingsPanel open={settingsOpen} onClose={closeSettings} />
      <QuickRefFloat />
      <main className="pt-[var(--navbar-height)] min-h-screen">
        <PageTransition>{children}</PageTransition>
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
