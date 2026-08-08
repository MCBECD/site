"use client";

import { Sun, Moon, Monitor, Github, Settings } from "lucide-react";
import Link from "next/link";
import { useSettings, type Theme } from "@/contexts/SettingsContext";
import { useLocale } from "@/contexts/LocaleContext";

interface NavbarProps {
  onOpenSettings: () => void;
}

const NEXT_THEME: Record<Theme, Theme> = {
  light: "dark",
  dark: "system",
  system: "light",
};

const THEME_ICON: Record<Theme, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

const THEME_TITLE_KEY: Record<Theme, string> = {
  light: "settings.themeLight",
  dark: "settings.themeDark",
  system: "settings.themeSystem",
};

export function Navbar({ onOpenSettings }: NavbarProps) {
  const { settings, updateTheme } = useSettings();
  const { t } = useLocale();
  const cycleTheme = () => updateTheme(NEXT_THEME[settings.theme]);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 flex items-center h-[var(--navbar-height)] px-5
        bg-[var(--color-navbar-bg)] backdrop-blur-xl border-b border-[var(--color-border)]"
    >
      <Link href="/docs" className="flex items-center gap-2.5 no-underline group">
        <img
          src="https://avatars.githubusercontent.com/u/312049267?s=64"
          alt="MCBECD"
          width={26}
          height={26}
          fetchPriority="high"
          className="w-[26px] h-[26px] rounded-[6px] ring-1 ring-[var(--color-border)]"
        />
        <span className="text-[15px] font-semibold tracking-tight text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">
          MCBECD
        </span>
      </Link>

      <div className="flex items-center gap-0.5 ml-auto">
        <button
          onClick={cycleTheme}
          className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-[var(--radius)]
            text-[var(--color-text-tertiary)]
            hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-all"
          title={t(THEME_TITLE_KEY[settings.theme])}
        >
          {(() => {
            const Icon = THEME_ICON[settings.theme];
            return <Icon className="w-[18px] h-[18px]" />;
          })()}
        </button>

        <a
          href="https://github.com/MCBECD"
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-[var(--radius)]
            text-[var(--color-text-tertiary)]
            hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-all"
          title={t("nav.github")}
        >
          <Github className="w-[18px] h-[18px]" />
        </a>

        <button
          onClick={onOpenSettings}
          className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-[var(--radius)]
            text-[var(--color-text-tertiary)]
            hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-all"
          title={t("nav.settings")}
        >
          <Settings className="w-[18px] h-[18px]" />
        </button>
      </div>
    </nav>
  );
}
