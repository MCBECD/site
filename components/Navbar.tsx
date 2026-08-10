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
        {/* 主题切换组 */}
        <div className="flex items-center gap-0.5 bg-[var(--color-bg-tertiary)] rounded-lg p-0.5">
          {THEMES.map(({ key, icon: Icon, titleKey }) => {
            const active = settings.theme === key;
            return (
              <button
                key={key}
                onClick={() => updateSettings("theme", key)}
                className="nav-icon-btn w-[30px] h-[30px] flex items-center justify-center rounded-md
                  transition-colors duration-100
                  text-[var(--color-text-tertiary)]
                  hover:text-[var(--color-text-secondary)]
                  active:scale-[0.92]
                  data-[active=true]:text-[var(--color-accent)] data-[active=true]:bg-[var(--color-bg-elevated)] data-[active=true]:shadow-sm"
                data-active={active}
                title={t(titleKey)}
                aria-pressed={active}
              >
                <Icon className="w-[15px] h-[15px]" />
              </button>
            );
          })}
        </div>

        <div className="nav-divider" aria-hidden="true" />

        {/* GitHub */}
        <a
          href="https://github.com/MCBECD"
          target="_blank"
          rel="noopener noreferrer"
          className="nav-icon-btn w-9 h-9 flex items-center justify-center rounded-lg
            text-[var(--color-text-tertiary)]
            hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]
            transition-colors duration-100 active:scale-[0.92]"
          title={t("nav.github")}
          aria-label={t("nav.github")}
        >
          <Github className="w-[17px] h-[17px]" />
        </a>

        <div className="nav-divider" aria-hidden="true" />

        {/* 设置 */}
        <button
          onClick={onOpenSettings}
          className="nav-icon-btn w-9 h-9 flex items-center justify-center rounded-lg
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