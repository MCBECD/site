"use client";

import { memo, useMemo, useCallback, useRef } from "react";
import { Sun, Moon, Monitor, Settings } from "lucide-react";
import { GithubIcon } from "@/components/icons/GithubIcon";
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

export const Navbar = memo(function Navbar({ onOpenSettings }: NavbarProps) {
  const { settings, updateSettings } = useSettings();
  const { t } = useLocale();

  const activeIndex = useMemo(
    () => THEMES.findIndex((th) => th.key === settings.theme),
    [settings.theme],
  );

  const handleThemeClick = useCallback(
    (key: Theme) => updateSettings("theme", key),
    [updateSettings],
  );

  const radioRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleRadioKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      let nextIndex: number;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        nextIndex = (index + 1) % THEMES.length;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        nextIndex = (index - 1 + THEMES.length) % THEMES.length;
      } else if (e.key === "Home") {
        e.preventDefault();
        nextIndex = 0;
      } else if (e.key === "End") {
        e.preventDefault();
        nextIndex = THEMES.length - 1;
      } else {
        return;
      }
			if (index !== nextIndex) {
				radioRefs.current[nextIndex]?.focus();
			}
      updateSettings("theme", THEMES[nextIndex]!.key);
    },
    [updateSettings],
  );

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[var(--z-navbar)] flex items-center h-[var(--navbar-height)] px-3 sm:px-5 bg-[var(--color-navbar-bg)] backdrop-blur-[var(--blur-md)] border-b border-[var(--color-border-light)]"
    >
      {/* Left: logo */}
      <Link
        href="/docs/"
        className="flex items-center gap-2 no-underline group min-h-[44px] min-w-[44px] -ml-1"
      >
        <img
          src="/Logo.png"
          alt="MCBECD"
          width={30}
          height={30}
          fetchPriority="high"
          className="w-[30px] h-[30px] ring-1 ring-[var(--color-border)] group-hover:ring-[var(--color-accent)]/40 transition-[ring-color] duration-[var(--duration-fast)]"
        />
        <span className="hidden sm:inline text-[15px] font-semibold tracking-tight text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors duration-[var(--duration-fast)]">
          MCBECD
        </span>
      </Link>

      {/* Right: controls */}
      <div className="flex items-center ml-auto gap-1 sm:gap-1.5">
        {/* Theme toggle */}
        <div
          className="flex items-center gap-0.5 rounded-full p-0.5 bg-[var(--color-bg-tertiary)]"
          role="radiogroup"
          aria-label={t("settings.theme")}
        >
          {THEMES.map(({ key, icon: Icon, titleKey }, i) => {
            const isActive = i === activeIndex;
            return (
              <button
                ref={(el) => { radioRefs.current[i] = el; }}
                key={key}
                role="radio"
                aria-checked={isActive}
                tabIndex={isActive ? 0 : -1}
                className="flex items-center justify-center select-none rounded-full
                  transition-[color,background,transform] duration-[var(--duration-fast)] w-8 h-8"
                style={{
                  color: isActive ? "var(--color-accent)" : "var(--color-text-tertiary)",
                  background: isActive ? "var(--color-bg-elevated)" : "transparent",
                }}
                title={t(titleKey)}
                onClick={() => handleThemeClick(key)}
                onKeyDown={(e) => handleRadioKeyDown(e, i)}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            );
          })}
        </div>

        <a
          href="https://github.com/MCBECD"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-sm)]
            text-[var(--color-text-tertiary)]
            hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]
            transition-[color,transform] duration-[var(--duration-fast)] active:scale-[0.92]"
          title={t("nav.github")}
          aria-label={t("nav.github")}
        >
          <GithubIcon className="w-4 h-4" />
        </a>

        <button
          onClick={onOpenSettings}
          className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-sm)]
            text-[var(--color-text-tertiary)]
            hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]
            transition-[color,transform] duration-[var(--duration-fast)] active:scale-[0.92]"
          title={t("nav.settings")}
          aria-label={t("nav.settings")}
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
});