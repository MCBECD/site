"use client";

import { Sun, Moon, Monitor, Github, Settings } from "lucide-react";
import Link from "next/link";
import { useSettings, type Theme } from "@/contexts/SettingsContext";

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

const THEME_LABEL: Record<Theme, string> = {
  light: "浅色",
  dark: "深色",
  system: "跟随系统",
};

export function Navbar({ onOpenSettings }: NavbarProps) {
  const { settings, updateTheme } = useSettings();
  const cycleTheme = () => updateTheme(NEXT_THEME[settings.theme]);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 flex items-center h-[var(--navbar-height)] px-4
        bg-[var(--color-bg-primary)]/90 backdrop-blur-sm border-b border-[var(--color-border)]"
    >
      {/* Logo */}
      <Link href="/docs" className="flex items-center gap-2 no-underline">
        <img
          src="https://avatars.githubusercontent.com/u/312049267?s=48"
          alt="MCBECD"
          width={24}
          height={24}
          fetchPriority="high"
          className="w-6 h-6 rounded-md"
        />
        <span className="text-base font-bold tracking-tight text-[var(--color-accent)]">
          MCBECD
        </span>
      </Link>

      {/* 右侧 */}
      <div className="flex items-center gap-1 ml-auto">
        <button
          onClick={cycleTheme}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md
            text-[var(--color-text-secondary)]
            hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
          title={THEME_LABEL[settings.theme]}
        >
          {(() => {
            const Icon = THEME_ICON[settings.theme];
            return <Icon className="w-5 h-5" />;
          })()}
        </button>

        <a
          href="https://github.com/MCBECD/site"
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md
            text-[var(--color-text-secondary)]
            hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
          title="GitHub"
        >
          <Github className="w-5 h-5" />
        </a>

        <button
          onClick={onOpenSettings}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md
            text-[var(--color-text-secondary)]
            hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
          title="设置"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
}
