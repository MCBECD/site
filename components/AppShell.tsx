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

  /* ---------- Background sizing (cover + 25% extra, aspect-ratio preserved) ---------- */
  const bgRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef({ baseX: 0, baseY: 0, maxX: 0, maxY: 0 });

  useEffect(() => {
    if (!bgEnabled) return;
    const el = bgRef.current;
    if (!el) return;

    const calc = () => {
      const img = new Image();
      img.onload = () => {
        const vpW = window.innerWidth;
        const vpH = window.innerHeight;
        // Cover scale (fill viewport, maintain aspect ratio)
        const coverScale = Math.max(vpW / img.naturalWidth, vpH / img.naturalHeight);
        // 25% extra for parallax room
        const scale = coverScale * 1.25;
        const bgW = img.naturalWidth * scale;
        const bgH = img.naturalHeight * scale;

        el.style.backgroundSize = `${bgW}px ${bgH}px`;

        // Centered position (negative because image is larger than viewport)
        const baseX = (vpW - bgW) / 2;
        const baseY = (vpH - bgH) / 2;
        sizeRef.current = {
          baseX, baseY,
          maxX: Math.abs(baseX) * 0.9,
          maxY: Math.abs(baseY) * 0.9,
        };
        // Reset to center when not parallaxing
        if (!settings.bgParallax) {
          el.style.backgroundPosition = `${baseX}px ${baseY}px`;
        }
      };
      img.src = settings.bgImage;
    };

    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [bgEnabled, settings.bgImage, settings.bgParallax]);

  /* ---------- Parallax (pointer-follow via background-position + easing) ---------- */
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const currentRef = useRef({ x: 0.5, y: 0.5 });
  const rafRef = useRef(0);

  useEffect(() => {
    if (!bgEnabled || !settings.bgParallax) return;

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

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      const cur = currentRef.current;
      const tgt = mouseRef.current;
      cur.x = lerp(cur.x, tgt.x, 0.08);
      cur.y = lerp(cur.y, tgt.y, 0.08);

      const el = bgRef.current;
      if (el) {
        const { baseX, baseY, maxX, maxY } = sizeRef.current;
        const dx = (cur.x - 0.5) * 2 * maxX;
        const dy = (cur.y - 0.5) * 2 * maxY;
        el.style.backgroundPosition = `${baseX + dx}px ${baseY + dy}px`;
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

  /* Reset background-position when parallax is off */
  useEffect(() => {
    const el = bgRef.current;
    if (el && bgEnabled && !settings.bgParallax) {
      const { baseX, baseY } = sizeRef.current;
      el.style.backgroundPosition = `${baseX}px ${baseY}px`;
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
            className="fixed inset-0 -z-20 bg-no-repeat"
            style={{ backgroundImage: `url(${settings.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
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
