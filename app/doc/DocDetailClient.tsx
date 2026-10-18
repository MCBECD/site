"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Home, Star } from "lucide-react";
import { DownloadButton } from "@/components/DownloadButton";
import { CopyDropdown } from "./CopyDropdown";
import { useLocale } from "@/contexts/LocaleContext";
import type { DocMeta } from "@/lib/docs";
import { getCategoryI18nKey, getCommandTypeI18nKey } from "@/lib/categories";
import { addHistory, toggleBookmark, isBookmarked, getBookmarks } from "@/lib/storage";
import { renderTitleWithCode } from "@/app/doc/renderTitle";

interface DocDetailClientProps {
  meta: DocMeta;
  rawContent: string;
}

/**
 * @why 这里只包"工具栏 + 头部元信息"，正文不再作为 children 传进来。
 *
 * 旧结构是 DocDetailClient 套住整篇正文，于是整个详情页只有这一层客户端组件，
 * 正文被塞进它的 props 树里。现在正文由父级 Server Component 直接输出，客户端边界
 * 只剩交互部件。
 *
 * @gotcha 别指望这个改动能把详情页体积砍半。App Router 的文档本身就会把整页的 RSC
 * 载荷内联进 HTML（self.__next_f），所以"渲染结果存在两份"是框架行为，跟客户端边界
 * 无关。实测这一改只省了约 10KB（/commands/execute/ 225KB → 215KB，gzip 34.7 → 31.7）。
 * 真正的价值是把客户端职责收敛到按钮上，顺带干掉了原先挂在正文容器上的事件委托
 * 和 createPortal 全局 Toast。
 *
 * @constraint 不要把它改回成"外层容器 + children"。
 */
export function DocDetailClient({ meta, rawContent }: DocDetailClientProps) {
  const { t } = useLocale();
  const [bookmarked, setBookmarked] = useState(false);
  const categoryKey = getCategoryI18nKey(meta.category);
  const categoryLabel = categoryKey ? t(categoryKey) : undefined;
  const commandTypeKey = getCommandTypeI18nKey(meta.category);
  const commandTypeLabel = commandTypeKey ? t(commandTypeKey) : undefined;

  useEffect(() => {
    addHistory(meta.id, meta.title);
    setBookmarked(isBookmarked(meta.id));
  }, [meta.id, meta.title]);

  const handleToggleBookmark = useCallback(() => {
    toggleBookmark(meta.id);
    setBookmarked(isBookmarked(meta.id, getBookmarks()));
  }, [meta.id]);

  const getContent = useCallback(() => rawContent, [rawContent]);

  return (
    <>
      {/* Top action bar */}
      <div className="flex items-center justify-between h-12 px-3 sm:px-5 border-b border-[var(--color-border-light)]">
        <div className="flex items-center gap-2">
          <Link
            href="/"
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
          <DownloadButton filename={meta.id} getContent={getContent} />
        </div>
      </div>

      {/* Title + metadata */}
      <header className="px-4 sm:px-6 pt-5 sm:pt-6 pb-3">
        <h1 className="text-[20px] sm:text-[22px] font-bold text-[var(--color-text-primary)] tracking-tight leading-tight">
          {...renderTitleWithCode(meta.title, false)}
        </h1>
        {meta.description && (
          <p className="text-[13px] text-[var(--color-text-tertiary)] mt-2 leading-relaxed">
            {meta.description}
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
          {(meta.author || meta.updatedAt) && (
            <span className="text-[12px] text-[var(--color-text-secondary)]">
              {meta.author}{meta.author && meta.updatedAt ? " · " : ""}{meta.updatedAt ?? ""}
            </span>
          )}
        </div>
      </header>
    </>
  );
}
