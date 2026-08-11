"use client";

import { Sun, Moon, Monitor, X, Star, Clock, Trash2 } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useSettings, type Theme, type FontSize } from "@/contexts/SettingsContext";
import { useLocale } from "@/contexts/LocaleContext";
import { useDocs } from "@/contexts/DocsContext";
import type { DocMeta } from "@/lib/docs";
import {
  getBookmarks, clearBookmarks, removeBookmark,
  getHistory, clearHistory, removeHistory,
} from "@/lib/storage";
import { ColorThemePluginCard } from "./settings/ColorThemePluginCard";
import { BackgroundImagePluginCard } from "./settings/BackgroundImagePluginCard";
import { LocaleDropdown } from "./settings/LocaleDropdown";
import { Section } from "./settings/Section";

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

type Tab = "general" | "themes" | "data";

/* ---------- Main Panel ---------- */

export function SettingsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { settings, updateSettings } = useSettings();
  const { t } = useLocale();
  const [tab, setTab] = useState<Tab>("general");
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleClose = useCallback(() => {
    setClosing(true);
    closeTimer.current = setTimeout(() => {
      setClosing(false);
      onClose();
    }, 100);
  }, [onClose]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  useEffect(() => {
    const shouldLock = open || closing;
    if (shouldLock) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, closing]);

  useEffect(() => { if (open) setTab("general"); }, [open]);

  if (!open && !closing) return null;

  const panelAnim = closing ? "settings-panel-out" : "settings-panel-in";

  return (
    <>
      <div
        className={`fixed inset-0 z-50 backdrop-blur-[2px] ${closing ? "overlay-out" : "overlay-in"}`}
        onClick={handleClose}
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div
          className={`w-[min(440px,calc(100vw-32px))] max-h-[min(600px,calc(100vh-48px))] rounded-xl shadow-xl flex flex-col
            bg-[var(--color-bg-primary)] border border-[var(--color-border)] pointer-events-auto ${panelAnim}`}
        >
          {/* header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-0 flex-shrink-0">
            <h2 className="text-[13px] font-semibold text-[var(--color-text-primary)]">{t("settings.title")}</h2>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center -mr-1 rounded-[var(--radius)]
                text-[var(--color-text-tertiary)]
                hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
              aria-label={t("common.backToList")}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* tabs */}
          <div className="flex gap-0 mx-5 mt-4 border-b border-[var(--color-border)] flex-shrink-0">
            {(["general", "themes", "data"] as Tab[]).map((key) => {
              const labelKey = key === "general" ? "settings.tabGeneral"
                : key === "themes" ? "settings.tabPlugins"
                : "settings.tabData";
              return (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`px-3 pb-2.5 text-[13px] font-medium transition-colors relative -mb-px
                    ${tab === key
                      ? "text-[var(--color-accent)]"
                      : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"}`}
                >
                  {t(labelKey)}
                  {tab === key && (
                    <span className="absolute bottom-0 inset-x-0 h-[2px] bg-[var(--color-accent)] rounded-full tab-indicator" />
                  )}
                </button>
              );
            })}
          </div>

          {/* scrollable content */}
          <div className="px-5 py-5 space-y-3 overflow-y-auto flex-1">
            {tab === "general" ? (
              <>
                <Section title={t("settings.theme")}>
                  <div className="flex gap-1.5">
                    {THEME_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updateSettings("theme", opt.value)}
                        className={`flex-1 flex items-center justify-center gap-1.5 h-10 rounded-[var(--radius)] text-[13px] transition-colors
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
                        className={`flex-1 h-10 rounded-[var(--radius)] text-[13px] transition-colors
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
            ) : tab === "themes" ? (
              <div className="space-y-3">
                <ColorThemePluginCard />
                <BackgroundImagePluginCard />
              </div>
            ) : (
              <DataTab onClose={handleClose} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------- Data Tab (Bookmarks + Recent) ---------- */

function DataTab({ onClose }: { onClose: () => void }) {
  const { t } = useLocale();
  const { docMap } = useDocs();
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [history, setHistory] = useState<{ id: string; title: string }[]>([]);

  const refresh = useCallback(() => {
    setBookmarks(getBookmarks());
    setHistory(getHistory());
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleRemoveBookmark = useCallback((id: string) => {
    removeBookmark(id);
    refresh();
  }, [refresh]);

  const handleClearBookmarks = useCallback(() => {
    clearBookmarks();
    refresh();
  }, [refresh]);

  const handleRemoveHistory = useCallback((id: string) => {
    removeHistory(id);
    refresh();
  }, [refresh]);

  const handleClearHistory = useCallback(() => {
    clearHistory();
    refresh();
  }, [refresh]);

  const bookmarkedDocs = bookmarks.map((id) => docMap.get(id)).filter((d): d is DocMeta => !!d);
  const historyDocs = history.map((h) => docMap.get(h.id)).filter((d): d is DocMeta => !!d);

  return (
    <div className="space-y-4">
      {/* 收藏 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Star className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            <span className="text-[13px] font-medium text-[var(--color-text-primary)]">{t("doc.bookmarks")}</span>
            <span className="text-[11px] text-[var(--color-text-tertiary)] tabular-nums">{bookmarkedDocs.length}</span>
          </div>
          {bookmarkedDocs.length > 0 && (
            <button
              onClick={handleClearBookmarks}
              className="flex items-center gap-1 text-[11px] text-[var(--color-text-tertiary)]
                hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              {t("settings.clearAll")}
            </button>
          )}
        </div>
        {bookmarkedDocs.length === 0 ? (
          <p className="text-[12px] text-[var(--color-text-tertiary)] py-4 text-center">{t("doc.noBookmarks")}</p>
        ) : (
          <div className="space-y-0.5 rounded-lg border border-[var(--color-border)] overflow-hidden">
            {bookmarkedDocs.map((doc) => (
              <DataListItem
                key={doc.id}
                doc={doc}
                onDelete={() => handleRemoveBookmark(doc.id)}
                onClose={onClose}
              />
            ))}
          </div>
        )}
      </div>

      {/* 最近浏览 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            <span className="text-[13px] font-medium text-[var(--color-text-primary)]">{t("doc.recent")}</span>
            <span className="text-[11px] text-[var(--color-text-tertiary)] tabular-nums">{historyDocs.length}</span>
          </div>
          {historyDocs.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-1 text-[11px] text-[var(--color-text-tertiary)]
                hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              {t("settings.clearAll")}
            </button>
          )}
        </div>
        {historyDocs.length === 0 ? (
          <p className="text-[12px] text-[var(--color-text-tertiary)] py-4 text-center">{t("doc.noRecent")}</p>
        ) : (
          <div className="space-y-0.5 rounded-lg border border-[var(--color-border)] overflow-hidden">
            {historyDocs.map((doc) => (
              <DataListItem
                key={doc.id}
                doc={doc}
                onDelete={() => handleRemoveHistory(doc.id)}
                onClose={onClose}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- List Item ---------- */

function DataListItem({ doc, onDelete, onClose }: { doc: DocMeta; onDelete: () => void; onClose: () => void }) {
  const { t } = useLocale();
  return (
    <div className="flex items-center gap-2 px-3 py-2.5 hover:bg-[var(--color-bg-tertiary)] transition-colors group">
      <Link
        href={`/docs/${doc.id}`}
        onClick={onClose}
        className="flex-1 min-w-0 no-underline"
      >
        <span className="text-[13px] text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] truncate block transition-colors">
          {doc.title}
        </span>
      </Link>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="w-6 h-6 flex items-center justify-center rounded-md
          text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100
          hover:text-red-400 hover:bg-[var(--color-bg-secondary)] transition-colors shrink-0"
        aria-label={t("common.delete")}
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}