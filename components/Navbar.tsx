"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Sun, Moon, Monitor, Github, Settings, Star, Clock, ChevronRight } from "lucide-react";
import { useSettings, type Theme } from "@/contexts/SettingsContext";
import { useLocale } from "@/contexts/LocaleContext";
import { useDocs } from "@/contexts/DocsContext";
import type { DocMeta } from "@/lib/docs";
import { getBookmarks, getHistory } from "@/lib/storage";

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
  const { docMap } = useDocs();

  const [bmOpen, setBmOpen] = useState(false);
  const [histOpen, setHistOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [history, setHistory] = useState<{ id: string; title: string }[]>([]);

  const bmRef = useRef<HTMLDivElement>(null);
  const histRef = useRef<HTMLDivElement>(null);

  // 刷新数据
  const refresh = useCallback(() => {
    setBookmarks(getBookmarks());
    setHistory(getHistory());
  }, []);

  // 首次加载 + 切换面板时刷新
  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => { if (bmOpen || histOpen) refresh(); }, [bmOpen, histOpen, refresh]);

  // 点击外部关闭
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bmRef.current && !bmRef.current.contains(e.target as Node)) setBmOpen(false);
      if (histRef.current && !histRef.current.contains(e.target as Node)) setHistOpen(false);
    };
    if (bmOpen || histOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [bmOpen, histOpen]);

  // localStorage 变化时刷新（跨 tab 同步）
  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [refresh]);

  const bookmarkedDocs = bookmarks.map((id) => docMap.get(id)).filter((d): d is DocMeta => !!d);
  const historyDocs = history.map((h) => docMap.get(h.id)).filter((d): d is DocMeta => !!d);

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
                onClick={() => updateTheme(key)}
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

        {/* 收藏按钮 */}
        <div ref={bmRef} className="relative">
          <button
            onClick={() => { setBmOpen(!bmOpen); setHistOpen(false); }}
            className={`nav-icon-btn w-9 h-9 flex items-center justify-center rounded-lg
              transition-colors duration-100 active:scale-[0.92]
              ${bmOpen
                ? "text-[var(--color-accent)] bg-[var(--color-bg-tertiary)]"
                : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]"
              }`}
            title={t("doc.bookmarks")}
            aria-label={t("doc.bookmarks")}
          >
            <Star className="w-[17px] h-[17px]" />
          </button>
          {bmOpen && (
            <DropdownPanel title={t("doc.bookmarks")} count={bookmarkedDocs.length}>
              {bookmarkedDocs.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-[12px] text-[var(--color-text-tertiary)]">{t("doc.noBookmarks")}</p>
                </div>
              ) : (
                bookmarkedDocs.map((doc) => (
                  <Link
                    key={doc.id}
                    href={`/docs/${doc.id}`}
                    onClick={() => setBmOpen(false)}
                    className="flex items-center justify-between gap-2 px-3 py-2.5
                      text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]
                      hover:bg-[var(--color-bg-tertiary)] transition-colors no-underline"
                  >
                    <span className="text-[13px] truncate">{doc.title}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--color-text-tertiary)] shrink-0" />
                  </Link>
                ))
              )}
            </DropdownPanel>
          )}
        </div>

        {/* 最近浏览按钮 */}
        <div ref={histRef} className="relative">
          <button
            onClick={() => { setHistOpen(!histOpen); setBmOpen(false); }}
            className={`nav-icon-btn w-9 h-9 flex items-center justify-center rounded-lg
              transition-colors duration-100 active:scale-[0.92]
              ${histOpen
                ? "text-[var(--color-accent)] bg-[var(--color-bg-tertiary)]"
                : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]"
              }`}
            title={t("doc.recent")}
            aria-label={t("doc.recent")}
          >
            <Clock className="w-[17px] h-[17px]" />
          </button>
          {histOpen && (
            <DropdownPanel title={t("doc.recent")} count={historyDocs.length}>
              {historyDocs.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-[12px] text-[var(--color-text-tertiary)]">{t("doc.noRecent")}</p>
                </div>
              ) : (
                historyDocs.map((doc) => (
                  <Link
                    key={doc.id}
                    href={`/docs/${doc.id}`}
                    onClick={() => setHistOpen(false)}
                    className="flex items-center justify-between gap-2 px-3 py-2.5
                      text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]
                      hover:bg-[var(--color-bg-tertiary)] transition-colors no-underline"
                  >
                    <span className="text-[13px] truncate">{doc.title}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--color-text-tertiary)] shrink-0" />
                  </Link>
                ))
              )}
            </DropdownPanel>
          )}
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

/* ── 下拉面板 ── */

function DropdownPanel({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-[var(--color-border)]
      bg-[var(--color-bg-primary)] shadow-lg z-50 dropdown-in">
      {/* 头部 */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[var(--color-border-light)]">
        <span className="text-[12px] font-medium text-[var(--color-text-secondary)]">{title}</span>
        <span className="text-[11px] text-[var(--color-text-tertiary)] tabular-nums">{count}</span>
      </div>
      {/* 列表 */}
      <div className="max-h-72 overflow-y-auto py-1">
        {children}
      </div>
    </div>
  );
}
