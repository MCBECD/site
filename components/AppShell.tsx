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
  const [bg, setBg] = useState<{ s: number; cx: number; cy: number } | null>(null);

  useEffect(() => {
    if (!bgEnabled) { setBg(null); return; }
    const calc = () => {
      const img = new Image();
      img.onload = () => {
        const vpW = innerWidth, vpH = innerHeight;
        const s = Math.max(vpW / img.naturalWidth, vpH / img.naturalHeight) * 1.8;
        setBg({ s, cx: (vpW - img.naturalWidth) / 2, cy: (vpH - img.naturalHeight) / 2 });
      };
      img.src = settings.bgImage;
    };
    calc();
    addEventListener("resize", calc);
    return () => removeEventListener("resize", calc);
  }, [bgEnabled, settings.bgImage]);

  /* ---------- parallax ---------- */
  useEffect(() => {
    const el = imgRef.current;
    if (!el || !bg) return;

    const centered = `translate(${bg.cx}px,${bg.cy}px) scale(${bg.s})`;
    if (!settings.bgParallax) { el.style.transform = centered; return; }

    let mx = innerWidth / 2, my = innerHeight / 2;
    let sx = mx, sy = my;

    const onM = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    const onT = (e: TouchEvent) => { const t = e.touches[0]; if (t) { mx = t.clientX; my = t.clientY; } };
    addEventListener("mousemove", onM, { passive: true });
    addEventListener("touchmove", onT, { passive: true });

    let raf = 0;
    const F = 20;
    const tick = () => {
      sx += (mx - sx) * 0.08;
      sy += (my - sy) * 0.08;
      const dx = (sx - innerWidth / 2) / F;
      const dy = (sy - innerHeight / 2) / F;
      el.style.transform = `translate(${bg.cx + dx}px,${bg.cy + dy}px) scale(${bg.s})`;
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
              transformOrigin: "center",
              transform: `translate(${bg.cx}px,${bg.cy}px) scale(${bg.s})`,
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
