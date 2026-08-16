"use client";

import { useEffect, useState, useCallback, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Home, Star, Check } from "lucide-react";
import { DownloadButton } from "@/components/DownloadButton";
import { CopyDropdown } from "./CopyDropdown";
import { useLocale } from "@/contexts/LocaleContext";
import type { DocContent } from "@/lib/docs";
import { getCategoryI18nKey, getCommandTypeI18nKey } from "@/lib/categories";
import { addHistory, toggleBookmark, isBookmarked, getBookmarks } from "@/lib/storage";
import { renderTitleWithCode } from "@/app/docs/renderTitle";

interface DocDetailClientProps {
  doc: DocContent;
  rawContent: string;
  children: ReactNode;
}

export function DocDetailClient({ doc, rawContent, children }: DocDetailClientProps) {
  const { t } = useLocale();
  const [bookmarked, setBookmarked] = useState(false);
  const categoryKey = getCategoryI18nKey(doc.meta.category);
  const categoryLabel = categoryKey ? t(categoryKey) : undefined;
  const commandTypeKey = getCommandTypeI18nKey(doc.meta.category);
  const commandTypeLabel = commandTypeKey ? t(commandTypeKey) : undefined;

  useEffect(() => {
    addHistory(doc.meta.id, doc.meta.title);
    setBookmarked(isBookmarked(doc.meta.id));
  }, [doc.meta.id, doc.meta.title]);

  const handleToggleBookmark = useCallback(() => {
    toggleBookmark(doc.meta.id);
    setBookmarked(isBookmarked(doc.meta.id, getBookmarks()));
  }, [doc.meta.id]);

  const getContent = useCallback(() => rawContent, [rawContent]);

  const [copied, setCopied] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const leaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    return () => {
      clearTimeout(copiedTimer.current);
      clearTimeout(leaveTimer.current);
    };
  }, []);

  const handleBodyClick = useCallback((e: React.MouseEvent) => {
    const btn = (e.target as HTMLElement).closest?.("[data-code]");
    if (!btn) return;
    const code = btn.getAttribute("data-code");
    if (code === null) return;
    navigator.clipboard.writeText(code).then(() => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      if (leaveTimer.current) clearTimeout(leaveTimer.current);
      setLeaving(false);
      setCopied(true);
      btn.classList.add("copied");
      copiedTimer.current = setTimeout(() => {
        setLeaving(true);
        btn.classList.remove("copied");
        leaveTimer.current = setTimeout(() => {
          setCopied(false);
          setLeaving(false);
        }, 250);
      }, 1500);
    }).catch(() => {});
  }, []);

  const copyToast = copied
    ? createPortal(
        <div
          role="status"
          className={`fixed top-20 left-1/2 -translate-x-1/2 z-[var(--z-toast)] flex items-center gap-2 rounded-[var(--radius)] px-4 py-2 text-[13px] font-medium shadow-[var(--shadow-lg)] border border-[var(--color-accent)] bg-white text-[var(--color-accent)] ${leaving ? "toast-out" : "toast-in"}`}
        >
          <Check className="w-4 h-4" />
          <span>{t("code.copied")}</span>
        </div>,
        document.body,
      )
    : null;

  return (
    <div className="max-w-3xl mx-auto px-[var(--content-gutter)] pt-8 pb-24">
      <div className="doc-glass-card overflow-hidden detail-enter">
        {/* Top action bar */}
        <div className="flex items-center justify-between h-12 px-3 sm:px-5 border-b border-[var(--color-border-light)]">
          <div className="flex items-center gap-2">
            <Link
              href="/docs/"
              className="inline-flex items-center gap-1.5 text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-accent)]/60 min-h-[44px]"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">{t("common.backToList")}</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleToggleBookmark}
              className={`w-11 h-11 flex items-center justify-center hover:text-[var(--color-accent)]/60 ${bookmarked
                  ? "text-[var(--color-accent)]"
                  : "text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)]"
                }`}
              aria-label={bookmarked ? t("common.unbookmark") : t("common.bookmark")}
            >
              <Star className="w-4 h-4" fill={bookmarked ? "currentColor" : "none"} />
            </button>
            <CopyDropdown rawContent={rawContent} />
            <DownloadButton
              filename={doc.meta.id}
              getContent={getContent}
            />
          </div>
        </div>

        {/* Title + metadata */}
        <header className="px-4 sm:px-6 pt-5 sm:pt-6 pb-3">
          <h1 className="text-[20px] sm:text-[22px] font-bold text-[var(--color-text-primary)] tracking-tight leading-tight">
            {...renderTitleWithCode(doc.meta.title, false)}
          </h1>
          {doc.meta.description && (
            <p className="text-[13px] text-[var(--color-text-tertiary)] mt-2 leading-relaxed">
              {doc.meta.description}
            </p>
          )}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              {categoryLabel && (
                <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--color-accent)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                  {categoryLabel}
                </span>
              )}
              {commandTypeLabel && (
                <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--color-accent)]">
                  <span className="text-[var(--color-accent)]/60">·</span>
                  {commandTypeLabel}
                </span>
              )}
            </div>
            {(doc.meta.author || doc.meta.updatedAt) && (
              <span className="text-[12px] text-[var(--color-text-tertiary)]">
                {doc.meta.author}{doc.meta.author && doc.meta.updatedAt ? " · " : ""}{doc.meta.updatedAt ?? ""}
              </span>
            )}
          </div>
        </header>

        {/* Document body */}
        <div
          className="px-4 sm:px-6 pt-5 pb-8 detail-content-enter
          prose max-w-none text-[15px] leading-relaxed
          prose-a:no-underline hover:prose-a:underline"
          onClick={handleBodyClick}
        >
          {children}
        </div>
        {copyToast}
      </div>
    </div>
  );
}