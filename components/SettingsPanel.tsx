"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { Sun, Moon, Monitor, X, Star, Clock, Trash2 } from "lucide-react";
import { useSettings, type Theme, type FontSize } from "@/contexts/SettingsContext";
import { useLocale } from "@/contexts/LocaleContext";
import { useDocs } from "@/contexts/DocsContext";
import { getBookmarks, getHistory, removeBookmark, removeHistory, clearBookmarks, clearHistory } from "@/lib/storage";
import type { DocMeta } from "@/lib/docs";
import { ColorThemePluginCard } from "./settings/ColorThemePluginCard";
import { BackgroundImagePluginCard } from "./settings/BackgroundImagePluginCard";
import { LocaleDropdown } from "./settings/LocaleDropdown";
import { Section } from "./settings/Section";

/* ---------- Focus-trap utility ---------- */

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
}

/* ---------- Constants ---------- */

const THEME_OPTIONS: { value: Theme; icon: typeof Sun; labelKey: string }[] = [
  { value: "light", icon: Sun, labelKey: "settings.themeLight" },
  { value: "dark", icon: Moon, labelKey: "settings.themeDark" },
  { value: "system", icon: Monitor, labelKey: "settings.themeSystem" },
];

const FONT_OPTIONS: { value: FontSize; labelKey: string }[] = [
  { value: "small", labelKey: "settings.fontSizeSmall" },
  { value: "medium", labelKey: "settings.fontSizeMedium" },
  { value: "large", labelKey: "settings.fontSizeLarge" },
];

type Tab = "general" | "data" | "plugins" | "about";

const APP_VERSION = process.env.NEXT_PUBLIC_VERSION ?? "0.0.1-alpha";

/* ---------- About Tab ---------- */

function AboutTab() {
  const { t } = useLocale();
  const { docMap } = useDocs();
  const [buildInfo, setBuildInfo] = useState<{ build: number; commit?: string } | null>(null);

  useEffect(() => {
    fetch("/version.json")
      .then((r) => r.json())
      .then((data) => setBuildInfo(data))
      .catch(() => { /* dev / offline */ });
  }, []);

  const commandCount = docMap.size;

  return (
    <div className="space-y-4">
      <Section title={t("settings.aboutVersion")}>
        <div className="space-y-2.5 text-[13px]">
          <div className="flex justify-between items-center">
            <span className="text-[var(--color-text-tertiary)]">{t("settings.aboutVersionLabel")}</span>
            <span className="font-mono text-[var(--color-text-primary)]">v{APP_VERSION}</span>
          </div>
          {buildInfo && (
            <div className="flex justify-between items-center">
              <span className="text-[var(--color-text-tertiary)]">{t("settings.aboutBuildLabel")}</span>
              <span className="font-mono text-[var(--color-text-primary)]">#{buildInfo.build}</span>
            </div>
          )}
        </div>
      </Section>

      <Section title={t("settings.aboutStats")}>
        <div className="space-y-2.5 text-[13px]">
          <div className="flex justify-between items-center">
            <span className="text-[var(--color-text-tertiary)]">{t("settings.aboutCommands")}</span>
            <span className="text-[var(--color-text-primary)]">{commandCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[var(--color-text-tertiary)]">{t("settings.aboutLocales")}</span>
            <span className="text-[var(--color-text-primary)]">7</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[var(--color-text-tertiary)]">{t("settings.aboutLicense")}</span>
            <span className="text-[var(--color-text-primary)]">MIT</span>
          </div>
        </div>
      </Section>

      <Section title={t("settings.aboutLinks")}>
        <div className="space-y-1">
          <Link
            href="https://github.com/MCBECD/site"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-2 py-2 rounded-[var(--radius)] text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors no-underline"
          >
            <span>GitHub</span>
            <span className="text-[11px] text-[var(--color-text-tertiary)]">MCBECD/site ↗</span>
          </Link>
          <Link
            href="/docs/"
            className="flex items-center justify-between px-2 py-2 rounded-[var(--radius)] text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors no-underline"
          >
            <span>{t("nav.docs")}</span>
            <span className="text-[11px] text-[var(--color-text-tertiary)]">/docs/</span>
          </Link>
        </div>
      </Section>

      <div className="pt-2 text-[11px] text-[var(--color-text-tertiary)] text-center">
        © 2026 MCBECD
      </div>
    </div>
  );
}

/* ---------- Main Panel ---------- */

export function SettingsPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const { settings, updateSettings } = useSettings();
  const { t } = useLocale();
  const { docMap } = useDocs();
  const [tab, setTab] = useState<Tab>("general");
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  /* Bookmarks & History state */
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [history, setHistory] = useState<{ id: string; title: string }[]>([]);

  const refreshBookmarks = useCallback(() => setBookmarks(getBookmarks()), []);
  const refreshHistory = useCallback(() => setHistory(getHistory()), []);

  useEffect(() => {
    refreshBookmarks();
    refreshHistory();
  }, [refreshBookmarks, refreshHistory]);

  const bookmarkedDocs: DocMeta[] = useMemo(
    () => bookmarks.map((id) => docMap.get(id)).filter((d): d is DocMeta => !!d),
    [bookmarks, docMap],
  );

  const historyDocs: DocMeta[] = useMemo(
    () => history.map((h) => docMap.get(h.id)).filter((d): d is DocMeta => !!d),
    [history, docMap],
  );


  const handleClose = useCallback(() => {
    setClosing(true);
    closeTimer.current = setTimeout(() => {
      setClosing(false);
      onClose();
    }, 180);
  }, [onClose]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  useEffect(() => {
    const shouldLock = isOpen || closing;
    if (shouldLock) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, closing]);

  useEffect(() => { if (isOpen) setTab("general"); }, [isOpen]);

  // Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, handleClose]);

  // Focus trap: keep Tab/Shift+Tab within the panel
  useEffect(() => {
    if (!isOpen || closing) return;
    const panel = panelRef.current;
    if (!panel) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusable = getFocusableElements(panel);
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    panel.addEventListener("keydown", handler);
    return () => panel.removeEventListener("keydown", handler);
  }, [isOpen, closing]);

  // Save & restore focus
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Defer focus so the panel has mounted
      requestAnimationFrame(() => {
        const panel = panelRef.current;
        if (!panel) return;
        const focusable = getFocusableElements(panel);
        const closeBtn = panel.querySelector<HTMLButtonElement>("[data-close-btn]");
        (closeBtn ?? focusable[0] ?? panel)?.focus();
      });
    } else if (!closing) {
      // Panel fully closed — return focus
      const el = previousFocusRef.current;
      if (el && typeof el.focus === "function") {
        el.focus();
      }
      previousFocusRef.current = null;
    }
  }, [isOpen, closing]);

  if (!isOpen && !closing) return null;

  const panelAnim = closing ? "settings-panel-out" : "settings-panel-in";

  const TABS: { key: Tab; labelKey: string }[] = [
    { key: "general", labelKey: "settings.tabGeneral" },
    { key: "plugins", labelKey: "settings.tabPlugins" },
    { key: "data", labelKey: "settings.tabData" },
    { key: "about", labelKey: "settings.tabAbout" },
  ];

  return (
    <>
      <div
        className={`fixed inset-0 z-[var(--z-dropdown)] backdrop-blur-[2px] ${closing ? "overlay-out" : "overlay-in"}`}
        onClick={handleClose}
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-[var(--z-dropdown)] flex items-end sm:items-center justify-center pointer-events-none">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={t("settings.title")}
          className={`w-full sm:w-[min(440px,calc(100vw-32px))] max-h-[min(85vh,calc(100vh-48px))] sm:max-h-[min(600px,calc(100vh-48px))] rounded-t-[var(--radius-lg)] sm:rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] flex flex-col
            bg-[var(--color-bg-primary)] border border-[var(--color-border)] border-b-0 sm:border-b pointer-events-auto ${panelAnim}`}
        >
          {/* header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-0 flex-shrink-0">
            <h2 className="text-[13px] font-semibold text-[var(--color-text-primary)]">{t("settings.title")}</h2>
            <button
              data-close-btn
              onClick={handleClose}
              className="w-11 h-11 flex items-center justify-center -mr-1 rounded-[var(--radius-sm)]
                text-[var(--color-text-tertiary)]
                hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors duration-100"
              aria-label={t("settings.close")}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* tabs */}
          <div className="flex gap-0 mx-5 mt-4 border-b border-[var(--color-border)] flex-shrink-0">
            {TABS.map(({ key, labelKey }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-3 pb-2.5 text-[13px] font-medium transition-colors relative -mb-px min-h-[44px] flex items-center
                  ${tab === key
                    ? "text-[var(--color-accent)]"
                    : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"}`}
              >
                {t(labelKey)}
                {tab === key && (
                  <span className="absolute bottom-0 inset-x-0 h-[2px] bg-[var(--color-accent)] rounded-full tab-indicator" />
                )}
              </button>
            ))}
          </div>

          {/* scrollable content */}
          <div className="px-5 py-5 space-y-3 overflow-y-auto flex-1 min-h-0">
            {tab === "general" ? (
              <>
                <Section title={t("settings.theme")}>
                  <div className="flex gap-1.5">
                    {THEME_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updateSettings("theme", opt.value)}
                        className={`flex-1 flex items-center justify-center gap-1.5 h-11 rounded-[var(--radius)] text-[13px] transition-colors
                          ${settings.theme === opt.value
                            ? "bg-[var(--color-accent)] text-white"
                            : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"}`}
                      >
                        <opt.icon className="w-3.5 h-3.5" />
                        {t(opt.labelKey)}
                      </button>
                    ))}
                  </div>
                </Section>

                <Section title={t("settings.fontSize")}>
                  <div className="flex gap-1.5">
                    {FONT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updateSettings("fontSize", opt.value)}
                        className={`flex-1 h-11 rounded-[var(--radius)] text-[13px] transition-colors
                          ${settings.fontSize === opt.value
                            ? "bg-[var(--color-accent)] text-white"
                            : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"}`}
                      >
                        {t(opt.labelKey)}
                      </button>
                    ))}
                  </div>
                </Section>

                <Section title={t("settings.language")}>
                  <LocaleDropdown value={settings.locale} onChange={(locale) => updateSettings("locale", locale)} />
                </Section>
              </>
            ) : tab === "data" ? (
              <div className="space-y-3">
                {/* Bookmarks */}
                <Section
                  title={t("doc.bookmarks")}
                  action={
                    bookmarkedDocs.length > 0 ? (
                      <button
                        onClick={() => { clearBookmarks(); refreshBookmarks(); }}
                        className="flex items-center gap-1 text-[11px] text-[var(--color-text-tertiary)] hover:text-red-400 transition-colors min-h-[44px] px-1 -mx-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        {t("settings.clearAll")}
                      </button>
                    ) : undefined
                  }
                >
                  {bookmarkedDocs.length > 0 ? (
                    <div className="space-y-0.5 rounded-[var(--radius)] border border-[var(--color-border)] overflow-hidden">
                      {bookmarkedDocs.map((doc) => (
                        <div key={doc.id} className="flex items-center gap-2 px-3 py-2 hover:bg-[var(--color-bg-tertiary)] transition-colors group">
                          <Link
                            href={`/docs/${doc.id}/`}
                            className="flex items-center gap-2 flex-1 min-w-0 no-underline"
                            onClick={handleClose}
                          >
                            <Star className="w-3 h-3 text-[var(--color-accent)] shrink-0" />
                            <span className="text-[13px] text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] truncate transition-colors">
                              {doc.title}
                            </span>
                          </Link>
                          <button
                            onClick={() => { removeBookmark(doc.id); refreshBookmarks(); }}
                            className="w-11 h-11 flex items-center justify-center rounded-[var(--radius-sm)]
                              text-[var(--color-text-tertiary)] sm:opacity-0 sm:group-hover:opacity-100
                              hover:text-red-400 hover:bg-[var(--color-bg-secondary)] transition-colors duration-100 shrink-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[12px] text-[var(--color-text-tertiary)] py-2">
                      {t("doc.noBookmarks")}
                    </p>
                  )}
                </Section>

                {/* History */}
                <Section
                  title={t("doc.recent")}
                  action={
                    historyDocs.length > 0 ? (
                      <button
                        onClick={() => { clearHistory(); refreshHistory(); }}
                        className="flex items-center gap-1 text-[11px] text-[var(--color-text-tertiary)] hover:text-red-400 transition-colors min-h-[44px] px-1 -mx-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        {t("settings.clearAll")}
                      </button>
                    ) : undefined
                  }
                >
                  {historyDocs.length > 0 ? (
                    <div className="space-y-0.5 rounded-[var(--radius)] border border-[var(--color-border)] overflow-hidden">
                      {historyDocs.slice(0, 8).map((doc) => (
                        <div key={doc.id} className="flex items-center gap-2 px-3 py-2 hover:bg-[var(--color-bg-tertiary)] transition-colors group">
                          <Link
                            href={`/docs/${doc.id}/`}
                            className="flex items-center gap-2 flex-1 min-w-0 no-underline"
                            onClick={handleClose}
                          >
                            <Clock className="w-3 h-3 text-[var(--color-accent)] shrink-0" />
                            <span className="text-[13px] text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] truncate transition-colors">
                              {doc.title}
                            </span>
                          </Link>
                          <button
                            onClick={() => { removeHistory(doc.id); refreshHistory(); }}
                            className="w-11 h-11 flex items-center justify-center rounded-[var(--radius-sm)]
                              text-[var(--color-text-tertiary)] sm:opacity-0 sm:group-hover:opacity-100
                              hover:text-red-400 hover:bg-[var(--color-bg-secondary)] transition-colors duration-100 shrink-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[12px] text-[var(--color-text-tertiary)] py-2">
                      {t("doc.noRecent")}
                    </p>
                  )}
                </Section>
              </div>
            ) : tab === "plugins" ? (
              <div className="space-y-3">
                <ColorThemePluginCard />
                <BackgroundImagePluginCard />
              </div>
            ) : (
              <AboutTab />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
