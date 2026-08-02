"use client";

import { Settings, Menu, X, Github, Sun, Moon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useSettings, type Theme } from "@/contexts/SettingsContext";

interface NavbarProps {
  docTitle?: string;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
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
  system: Sun, /* @constraint 跟随系统用太阳图标，靠下划线区分 */
};

export function Navbar({ docTitle, sidebarOpen, onToggleSidebar, onOpenSettings }: NavbarProps) {
  const t = useTranslations();
  const { settings, updateTheme } = useSettings();

  const cycleTheme = () => updateTheme(NEXT_THEME[settings.theme]);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 flex items-center h-[var(--navbar-height)] px-4
        bg-[var(--color-bg-primary)]/90 backdrop-blur-sm border-b border-[var(--color-border)]"
    >
      {/* 左侧：Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-1.5 rounded-md text-[var(--color-text-secondary)]
            hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
          title={t("sidebar.toggleSidebar")}
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <Link href="/docs" className="flex items-center gap-2 no-underline">
          <img
            src="https://avatars.githubusercontent.com/u/312049267?s=48"
            alt="MCBECD"
            width={24}
            height={24}
            className="w-6 h-6 rounded-md"
          />
          <span className="text-base font-bold tracking-tight text-[var(--color-accent)]
            hover:text-[var(--color-accent-hover)] transition-colors">
            MCBECD
          </span>
        </Link>
      </div>

      {/* 中间：当前文档标题 */}
      {docTitle && (
        <div className="hidden md:block flex-1 text-center truncate px-4 text-sm text-[var(--color-text-secondary)]">
          {docTitle}
        </div>
      )}

      {/* 右侧 */}
      <div className="flex items-center gap-1 ml-auto">
        {/* 主题切换 */}
        <button
          onClick={cycleTheme}
          className="p-1.5 rounded-md text-[var(--color-text-secondary)]
            hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
          title={t(`settings.theme${settings.theme === "light" ? "Light" : settings.theme === "dark" ? "Dark" : "System"}`)}
        >
          {(() => {
            const Icon = THEME_ICON[settings.theme];
            return <Icon className="w-5 h-5" />;
          })()}
        </button>

        <a
          href="https://github.com/MCBECD/mcbecd-site"
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-md text-[var(--color-text-secondary)]
            hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
          title="GitHub"
        >
          <Github className="w-5 h-5" />
        </a>
        <LanguageSwitcher />
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-md text-[var(--color-text-secondary)]
            hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
          title={t("nav.settings")}
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
}
