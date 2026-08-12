"use client";

import { useEffect, useState, useCallback, type ReactNode } from "react";
import Link from "next/link";
import { Home, Star } from "lucide-react";
import { DownloadButton } from "@/components/DownloadButton";
import CopyDropdown from "./CopyDropdown";
import { useLocale } from "@/contexts/LocaleContext";
import type { DocContent } from "@/lib/docs";
import { getCategoryI18nKey, getCommandTypeI18nKey } from "@/lib/categories";
import { addHistory, toggleBookmark, isBookmarked, getBookmarks } from "@/lib/storage";
import { renderTitleWithCode } from "@/app/docs/renderTitle";

interface Props {
  doc: DocContent;
  rawContent: string;
  children: ReactNode;
}

export function DocDetailClient({ doc, rawContent, children }: Props) {
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

  return (
    <div className="max-w-3xl mx-auto px-5 pt-8 pb-24">
      <div className="doc-glass-card overflow-hidden">
        {/* toolbar */}
        <div className="flex items-center justify-between h-12 px-5 border-b border-[var(--color-border-light)]">
          <div className="flex items-center gap-2">
            <Link
              href="/docs"
              className="inline-flex items-center gap-1.5 text-[13px] text-[var(--color-text-secondary)]
                hover:text-[var(--color-accent)] transition-colors duration-100 no-underline min-h-[44px]"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">{t("common.backToList")}</span>
            </Link>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleToggleBookmark}
              className={`w-8 h-8 flex items-center justify-center rounded-lg
                ${bookmarked
                  ? "text-yellow-500"
                  : "text-[var(--color-text-tertiary)] hover:text-yellow-500"
                } hover:bg-[var(--color-bg-tertiary)] transition-colors`}
              aria-label={bookmarked ? t("common.unbookmark") : t("common.bookmark")}
            >
              <Star className="w-4 h-4" fill={bookmarked ? "currentColor" : "none"} />
            </button>
            <CopyDropdown rawContent={rawContent} />
            <DownloadButton
              filename={doc.meta.id}
              getContent={() => rawContent}
            />
          </div>
        </div>

        {/* title + meta */}
        <header className="px-6 pt-6 pb-3">
          <h1 className="text-[22px] font-bold text-[var(--color-text-primary)] tracking-tight leading-tight">
            {renderTitleWithCode(doc.meta.title)}
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
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
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

        {/* content */}
        <div
          className="px-6 pt-5 pb-8
          prose prose-slate dark:prose-invert max-w-none text-[14px] leading-relaxed
          prose-headings:text-[var(--color-text-primary)]
          prose-p:text-[var(--color-text-secondary)]
          prose-a:text-[var(--color-accent)] prose-a:no-underline hover:prose-a:underline
          prose-code:text-[var(--color-accent)]
          prose-strong:text-[var(--color-text-primary)]
          prose-li:text-[var(--color-text-secondary)]
          prose-hr:border-[var(--color-border)]
          prose-blockquote:border-[var(--color-accent)]
          prose-blockquote:text-[var(--color-text-secondary)]"
        >
          {children}
        </div>
      </div>
    </div>
  );
}