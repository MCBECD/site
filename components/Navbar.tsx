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
  const { settings, updateTheme } = useSettings();
  const { t } = useLocale();

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 flex items-center h-[var(--navbar-height)] px-4
        bg-[var(--color-navbar-bg)] backdrop-blur-xl border-b border-[var(--color-border)]"
    >
      <Link
        href="/docs"
        className="flex items-center gap-2 no-underline group min-h-[44px]"
      >
        <img
          src="https://avatars.githubusercontent.com/u/312049267?s=64"
          alt="MCBECD"
          width={28}
          height={28}
          fetchPriority="high"
          className="w-7 h-7 rounded-[7px] ring-1 ring-[var(--color-border)] group-hover:ring-[var(--color-accent)]/40 transition-all duration-200"
        />
        <span className="text-[15px] font-semibold tracking-tight text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors duration-200">
          MCBECD
        </span>
      </Link>

      <div className="flex items-center ml-auto">
        {/* 主题切换组 */}
        <div className="flex items-center gap-0.5">
          {THEMES.map(({ key, icon: Icon, titleKey }) => {
            const active = settings.theme === key;
            return (
              <button
                key={key}
                onClick={() => updateTheme(key)}
                className="nav-icon-btn w-8 h-8 flex items-center justify-center rounded-md
                  transition-all duration-150
                  text-[var(--color-text-tertiary)]
                  hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]
                  active:scale-[0.92]
                  data-[active=true]:text-[var(--color-accent)] data-[active=true]:bg-[var(--color-accent-muted)]"
                data-active={active}
                title={t(titleKey)}
                aria-pressed={active}
              >
                <Icon className="w-[16px] h-[16px] transition-transform duration-200" />
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
          className="nav-icon-btn w-8 h-8 flex items-center justify-center rounded-md
            text-[var(--color-text-tertiary)]
            hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]
            transition-all duration-150 active:scale-[0.92]"
          title={t("nav.github")}
          aria-label={t("nav.github")}
        >
          <Github className="w-[16px] h-[16px] transition-transform duration-200" />
        </a>

        <div className="nav-divider" aria-hidden="true" />

        {/* 设置 */}
        <button
          onClick={onOpenSettings}
          className="nav-icon-btn w-8 h-8 flex items-center justify-center rounded-md
            text-[var(--color-text-tertiary)]
            hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]
            transition-all duration-150 active:scale-[0.92]"
          title={t("nav.settings")}
          aria-label={t("nav.settings")}
        >
          <Settings className="w-[16px] h-[16px] transition-transform duration-200" />
        </button>
      </div>
    </nav>
  );
}
