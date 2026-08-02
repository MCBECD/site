"use client";

import { Settings, Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface NavbarProps {
  docTitle?: string;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
}

export function Navbar({ docTitle, sidebarOpen, onToggleSidebar, onOpenSettings }: NavbarProps) {
  const t = useTranslations();

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
        <Link
          href="/docs"
          className="text-lg font-bold tracking-tight text-[var(--color-accent)]
            hover:text-[var(--color-accent-hover)] transition-colors no-underline"
        >
          MCCD
        </Link>
      </div>

      {/* 中间：当前文档标题 */}
      {docTitle && (
        <div className="hidden md:block flex-1 text-center truncate px-4 text-sm text-[var(--color-text-secondary)]">
          {docTitle}
        </div>
      )}

      {/* 右侧：语言切换 + 设置 */}
      <div className="flex items-center gap-1 ml-auto">
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
