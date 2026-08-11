"use client";

import { useRef, useState, useCallback } from "react";
import { Sun, Moon, Monitor, Github, Settings } from "lucide-react";
import Link from "next/link";
import { useSettings, type Theme } from "@/contexts/SettingsContext";
import { useLocale } from "@/contexts/LocaleContext";

interface NavbarProps {
  onOpenSettings: () => void;
}

const THEMES: { key: Theme; icon: typeof Sun; titleKey: string }[] = [
  { key: "light", icon: Sun, titleKey: "settings.themeLight" },
  { key: "dark", icon: Moon, titleKey: "settings.themeDark" },
  { key: "system", icon: Monitor, titleKey: "settings.themeSystem" },
];

const S = 30; // button size
const G = 2;  // gap between buttons
const P = 2;  // track padding
const STEP = S + G; // distance between button starts

export function Navbar({ onOpenSettings }: NavbarProps) {
  const { settings, updateSettings } = useSettings();
  const { t } = useLocale();
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [indicatorX, setIndicatorX] = useState(0);
  const committedIndex = useRef(-1);

  const activeIndex = THEMES.findIndex((th) => th.key === settings.theme);

  // Sync committed index when theme changes externally
  if (committedIndex.current !== activeIndex) {
    committedIndex.current = activeIndex;
  }

  const restX = P + committedIndex.current * STEP;

  const clampX = useCallback((x: number) => {
    const max = P + (THEMES.length - 1) * STEP;
    return Math.max(P, Math.min(max, x));
  }, []);

  const xToIndex = useCallback((x: number) => {
    const clamped = clampX(x);
    return Math.round((clamped - P) / STEP);
  }, [clampX]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!trackRef.current) return;
    e.preventDefault();
    const rect = trackRef.current.getBoundingClientRect();
    const x = clampX(e.clientX - rect.left);
    setIndicatorX(x);
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [clampX]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    setIndicatorX(clampX(e.clientX - rect.left));
  }, [dragging, clampX]);

  const handlePointerUp = useCallback(() => {
    if (!dragging) return;
    setDragging(false);
    const idx = xToIndex(indicatorX);
    committedIndex.current = idx;
    const theme = THEMES[idx];
    if (theme) updateSettings("theme", theme.key);
  }, [dragging, indicatorX, xToIndex, updateSettings]);

  const displayX = dragging ? indicatorX : restX;

  // How much the indicator overlaps each button (0 = none, 1 = fully covered)
  const overlap = (i: number) => {
    const btnStart = P + i * STEP;
    const btnEnd = btnStart + S;
    const indStart = displayX;
    const indEnd = displayX + S;
    const overlapStart = Math.max(btnStart, indStart);
    const overlapEnd = Math.min(btnEnd, indEnd);
    return Math.max(0, Math.min(1, (overlapEnd - overlapStart) / S));
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 flex items-center h-[var(--navbar-height)] px-5
        bg-[var(--color-navbar-bg)] backdrop-blur-sm border-b border-[var(--color-border-light)]"
    >
      <Link
        href="/docs"
        className="flex items-center gap-2.5 no-underline group min-h-[44px] -ml-1"
      >
        <img
          src="https://avatars.githubusercontent.com/u/312049267?s=64"
          alt="MCBECD"
          width={30}
          height={30}
          fetchPriority="high"
          className="w-[30px] h-[30px] ring-1 ring-[var(--color-border)] group-hover:ring-[var(--color-accent)]/40 transition-[ring-color] duration-100"
        />
        <span className="text-[15px] font-semibold tracking-tight text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors duration-100">
          MCBECD
        </span>
      </Link>

      <div className="flex items-center ml-auto">
        {/* Theme segmented control */}
        <div
          ref={trackRef}
          className="relative flex items-center rounded-full p-[2px] touch-none"
          style={{
            background: "var(--color-bg-tertiary)",
            width: P * 2 + THEMES.length * S + (THEMES.length - 1) * G,
            height: S + P * 2,
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Sliding indicator — follows finger during drag, animates on release */}
          <span
            className="absolute top-[2px] rounded-[13px] pointer-events-none"
            style={{
              left: displayX,
              width: S,
              height: S,
              background: "color-mix(in srgb, var(--color-accent) 12%, var(--color-bg-elevated))",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              transition: dragging
                ? "none"
                : `left 280ms var(--ease-spring)`,
            }}
          />
          {THEMES.map(({ key, icon: Icon, titleKey }, i) => {
            const o = overlap(i);
            const active = dragging ? o > 0 : i === activeIndex;
            return (
              <button
                key={key}
                className="relative z-[1] flex items-center justify-center select-none"
                style={{
                  width: S,
                  height: S,
                  marginLeft: i > 0 ? G : 0,
                  color: active
                    ? "var(--color-accent)"
                    : "var(--color-text-tertiary)",
                  transition: dragging
                    ? "none"
                    : `color 280ms var(--ease-spring)`,
                }}
                title={t(titleKey)}
                aria-pressed={activeIndex === i}
              >
                <Icon className="w-[15px] h-[15px]" />
              </button>
            );
          })}
        </div>

        <div className="nav-divider" aria-hidden="true" />

        <a
          href="https://github.com/MCBECD"
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 flex items-center justify-center rounded-lg
            text-[var(--color-text-tertiary)]
            hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]
            transition-colors duration-100 active:scale-[0.92]"
          title={t("nav.github")}
          aria-label={t("nav.github")}
        >
          <Github className="w-[17px] h-[17px]" />
        </a>

        <div className="nav-divider" aria-hidden="true" />

        <button
          onClick={onOpenSettings}
          className="w-9 h-9 flex items-center justify-center rounded-lg
            text-[var(--color-text-tertiary)]
            hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]
            transition-colors duration-100 active:scale-[0.92]"
          title={t("nav.settings")}
          aria-label={t("nav.settings")}
        >
          <Settings className="w-[17px] h-[17px]" />
        </button>
      </div>
    </nav>
  );
}
