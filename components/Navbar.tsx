"use client";

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

export function Navbar({ onOpenSettings }: NavbarProps) {
  const { settings, updateSettings } = useSettings();
  const { t } = useLocale();
  const activeIndex = THEMES.findIndex((th) => th.key === settings.theme);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[var(--z-navbar)] flex items-center h-[var(--navbar-height)] px-5 bg-[var(--color-navbar-bg)] backdrop-blur-md border-b border-[var(--color-border-light)]"
    >
      {/* Left: logo */}
      <Link
        href="/docs/"
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

      {/* Right: controls */}
      <div className="flex items-center ml-auto gap-1">
        {/* Theme toggle */}
        <div
          className="flex items-center rounded-[var(--radius-sm)] p-[2px]"
          style={{ background: "var(--color-bg-tertiary)" }}
          role="radiogroup"
          aria-label={t("settings.theme")}
        >
          {THEMES.map(({ key, icon: Icon, titleKey }, i) => {
            const isActive = i === activeIndex;
            return (
              <button
                key={key}
                role="radio"
                aria-checked={isActive}
                className="flex items-center justify-center select-none rounded-[calc(var(--radius-sm) - 2px)]
                  transition-colors duration-200"
                style={{
                  width: 30,
                  height: 30,
                  marginLeft: i > 0 ? 2 : 0,
                  color: isActive ? "var(--color-accent)" : "var(--color-text-tertiary)",
                  background: isActive
                    ? "color-mix(in srgb, var(--color-accent) 12%, var(--color-bg-elevated))"
                    : "transparent",
                  boxShadow: isActive ? "var(--shadow-sm)" : "none",
                }}
                title={t(titleKey)}
                onClick={() => updateSettings("theme", key)}
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
