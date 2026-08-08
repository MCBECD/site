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

  /* ---------- Parallax (pointer-follow with zoom + easing) ---------- */
  const bgRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });       // normalised 0‒1
  const currentRef = useRef({ x: 0.5, y: 0.5 });     // smoothed
  const rafRef = useRef(0);

  useEffect(() => {
    if (!bgEnabled || !settings.bgParallax) return;

    // Normalise pointer position to 0‒1 relative to viewport
    const updateTarget = (clientX: number, clientY: number) => {
      mouseRef.current = {
        x: clientX / window.innerWidth,
        y: clientY / window.innerHeight,
      };
    };

    const onMouse = (e: MouseEvent) => updateTarget(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) updateTarget(t.clientX, t.clientY);
    };

    window.addEventListener("mousemove", onMouse, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });

    // Lerp animation loop
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const MAX_SHIFT = 20; // px max displacement each axis

    const tick = () => {
      const cur = currentRef.current;
      const tgt = mouseRef.current;
      cur.x = lerp(cur.x, tgt.x, 0.08);
      cur.y = lerp(cur.y, tgt.y, 0.08);

      const el = bgRef.current;
      if (el) {
        const dx = (cur.x - 0.5) * MAX_SHIFT * 2;
        const dy = (cur.y - 0.5) * MAX_SHIFT * 2;
        el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchmove", onTouch);
      cancelAnimationFrame(rafRef.current);
    };
  }, [bgEnabled, settings.bgParallax]);

  /* Reset transform when parallax is off */
  useEffect(() => {
    if (bgRef.current && (!bgEnabled || !settings.bgParallax)) {
      bgRef.current.style.transform = "";
    }
  }, [bgEnabled, settings.bgParallax]);

  return (
    <>
      {/* base background */}
      <div className="fixed inset-0 bg-[var(--color-bg-primary)] -z-30" aria-hidden="true" />
      {/* background image layer */}
      {bgEnabled && (
        <>
          <div
            ref={bgRef}
            className="fixed inset-0 -z-20 bg-no-repeat bg-center will-change-transform overflow-hidden"
            style={{ backgroundImage: `url(${settings.bgImage})`, backgroundSize: '125% 125%' }}
            aria-hidden="true"
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
