"use client";

import { useEffect, useState, useCallback, type ReactNode } from "react";
import Link from "next/link";
import { Home, Star } from "lucide-react";
import { DownloadButton } from "@/components/DownloadButton";
import CopyDropdown from "./CopyDropdown";
import { useLocale } from "@/contexts/LocaleContext";
import type { DocContent } from "@/lib/docs";
import { addHistory, toggleBookmark, isBookmarked } from "@/lib/storage";
import { renderTitleWithCode } from "@/app/docs/renderTitle";

interface Props {
  doc: DocContent;
  rawContent: string;
  children: ReactNode;
}

export function DocDetailClient({ doc, rawContent, children }: Props) {
  const { t } = useLocale();
  const [bookmarked, setBookmarked] = useState(false);

  // 记录浏览历史
  useEffect(() => {
    addHistory(doc.meta.id, doc.meta.title);
    setBookmarked(isBookmarked(doc.meta.id));
  }, [doc.meta.id, doc.meta.title]);

  const handleToggleBookmark = useCallback(() => {
    toggleBookmark(doc.meta.id);
    setBookmarked(isBookmarked(doc.meta.id));
  }, [doc.meta.id]);

  return (
    <div className="max-w-3xl mx-auto px-5 pt-6 pb-20">
      <div className="doc-glass-card overflow-hidden">
        {/* 顶部操作栏 */}
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
            {/* 收藏按钮 */}
            <button
              onClick={handleToggleBookmark}
              className={`w-8 h-8 flex items-center justify-center rounded-lg
                ${bookmarked
                  ? "text-[var(--color-accent)]"
                  : "text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)]"
                } hover:bg-[var(--color-bg-tertiary)] transition-colors`}
              aria-label={bookmarked ? t("common.unbookmark") : t("common.bookmark")}
            >
              <Star className="w-4 h-4" fill={bookmarked ? "currentColor" : "none"} />
            </button>
            <CopyDropdown rawContent={rawContent} docId={doc.meta.id} />
            <DownloadButton
              filename={doc.meta.id}
              getContent={() => rawContent}
            />
          </div>
        </div>

        {/* 标题 + 元信息 */}
        <header className="px-6 pt-5 pb-2">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight leading-tight">
            {renderTitleWithCode(doc.meta.title)}
          </h1>
          {(doc.meta.author || doc.meta.updatedAt) && (
            <div className="flex items-center gap-3 mt-2 text-xs text-[var(--color-text-tertiary)]">
              {doc.meta.author && (
                <span className="inline-flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-[var(--color-bg-tertiary)] flex items-center justify-center text-[10px] font-medium text-[var(--color-text-secondary)]">
                    {doc.meta.author.charAt(0).toUpperCase()}
                  </span>
                  {doc.meta.author}
                </span>
              )}
              {doc.meta.updatedAt && (
                <span>{t("doc.updatedAt", { date: doc.meta.updatedAt })}</span>
              )}
            </div>
          )}
          {doc.meta.description && (
            <p className="text-[14px] text-[var(--color-text-tertiary)] mt-2 leading-relaxed">
              {doc.meta.description}
            </p>
          )}
        </header>

        {/* 文档正文 */}
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