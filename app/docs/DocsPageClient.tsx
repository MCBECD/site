"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, X, Command, Star, ChevronRight } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import type { DocMeta } from "@/lib/docs";
import { getBookmarks, toggleBookmark, getPinnedCollapsed, setPinnedCollapsed } from "@/lib/storage";

const PAGE_SIZE = 10;
const DEBOUNCE_MS = 150;

interface Props {
  docs: DocMeta[];
}

export default function DocsPageClient({ docs }: Props) {
  const { t } = useLocale();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(0);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [pinnedCollapsed, setPinnedCollapsedState] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // 从 localStorage 加载收藏
  useEffect(() => {
    setBookmarks(getBookmarks());
    setPinnedCollapsedState(getPinnedCollapsed());
  }, []);

  const togglePinnedCollapsed = useCallback(() => {
    setPinnedCollapsedState((prev) => {
      const next = !prev;
      setPinnedCollapsed(next);
      return next;
    });
  }, []);

  const handleToggleBookmark = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleBookmark(id);
    setBookmarks(getBookmarks());
  }, []);

  const handleInput = useCallback((value: string) => {
    setQuery(value);
    setPage(0);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(value), DEBOUNCE_MS);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== searchRef.current) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape" && document.activeElement === searchRef.current) {
        setQuery("");
        setDebouncedQuery("");
        searchRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const filteredDocs = useMemo(() => {
    let result = docs;
    const q = debouncedQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          (d.description && d.description.toLowerCase().includes(q)),
      );
    }
    return result;
  }, [docs, debouncedQuery]);

  const totalPages = Math.max(1, Math.ceil(unpinnedDocs.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageDocs = unpinnedDocs = useMemo(
    () => filteredDocs.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE),
    [filteredDocs, safePage],
  );

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const w = 2;
    const start = Math.max(0, safePage - w);
    const end = Math.min(totalPages - 1, safePage + w);
    for (let i = 0; i < totalPages; i++) {
      if (i === 0 || i === totalPages - 1 || (i >= start && i <= end)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== -1) {
        pages.push(-1);
      }
    }
    return pages;
  }, [totalPages, safePage]);

  const isSearching = debouncedQuery.trim().length > 0;

  const pinnedDocs = useMemo(
    () => filteredDocs.filter((d) => d.pinned),
    [filteredDocs],
  );

  const unpinnedDocs = useMemo(
    () => filteredDocs.filter((d) => !d.pinned),
    [filteredDocs],
  );


  return (
    <div className="max-w-2xl mx-auto px-5 pt-12 pb-20">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">
          {t("doc.title")}
        </h1>
        <p className="text-[14px] text-[var(--color-text-tertiary)] mt-1.5">
          {t("doc.subtitle", { count: docs.length })}
        </p>
      </div>

      {/* 搜索栏 */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)] pointer-events-none" />
        <input
          ref={searchRef}
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          placeholder={t("doc.searchPlaceholder")}
          className="search-input w-full pl-10 pr-10 py-2.5 text-[14px] rounded-lg
            bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]
            placeholder:text-[var(--color-text-tertiary)]
            border border-[var(--color-border)]
            focus:outline-none"
        />
        {query ? (
          <button
            onClick={() => { setQuery(""); setDebouncedQuery(""); }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7
              flex items-center justify-center rounded-md
              text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]
              hover:bg-[var(--color-bg-tertiary)] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 h-5 inline-flex items-center gap-1 px-1.5 rounded-md text-[11px] font-mono leading-none
            text-[var(--color-kbd-text)] bg-[var(--color-kbd-bg)] border border-[var(--color-kbd-border)]
            pointer-events-none hidden sm:inline-flex">
            <Command className="w-2.5 h-2.5" />
          </kbd>
        )}
      </div>

      {/* 置顶文档 */}
      {pinnedDocs.length > 0 && !isSearching && (
        <div className="mb-4">
          <button
            onClick={togglePinnedCollapsed}
            className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-secondary)] mb-2 px-0.5 hover:text-[var(--color-text-primary)] transition-colors"
          >
            <svg className={`w-3 h-3 transition-transform ${pinnedCollapsed ? '' : 'rotate-90'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            {t("doc.pinned") || "置顶"} ({pinnedDocs.length})
          </button>
          {!pinnedCollapsed && (
            <div className="space-y-1">
              {pinnedDocs.map((doc) => (
                <DocCard
                  key={doc.id}
                  doc={doc}
                  bookmarked={bookmarks.includes(doc.id)}
                  onBookmark={handleToggleBookmark}
                />
              ))}
            </div>
          )}
          {!pinnedCollapsed && <div className="border-t border-[var(--color-border)] my-3" />}
        </div>
      )}

      {/* 搜索结果计数 */}
      {isSearching && (
        <p className="text-xs text-[var(--color-text-tertiary)] mb-3 px-0.5">
          {t("doc.resultCount", { count: filteredDocs.length })}
        </p>
      )}

      {/* 命令列表 */}
      {pageDocs.length === 0 ? (
        <div className="py-24 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-bg-tertiary)] mb-4">
            <Search className="w-5 h-5 text-[var(--color-text-tertiary)]" />
          </div>
          <p className="text-sm text-[var(--color-text-tertiary)]">{t("doc.noResults")}</p>
        </div>
      ) : (
        <div className="space-y-1.5" key={`${debouncedQuery}-${safePage}`}>
          {pageDocs.map((doc) => (
            <DocCard
              key={doc.id}
              doc={doc}
              bookmarked={bookmarks.includes(doc.id)}
              onBookmark={handleToggleBookmark}
            />
          ))}
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-10">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage === 0}
            className="min-w-[36px] h-9 flex items-center justify-center rounded-lg
              text-[var(--color-text-secondary)]
              hover:bg-[var(--color-bg-tertiary)] disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {pageNumbers.map((p, i) =>
            p === -1 ? (
              <span key={`e-${i}`} className="w-9 h-9 flex items-center justify-center text-xs text-[var(--color-text-tertiary)]">…</span>
            ) : (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`min-w-[36px] h-9 flex items-center justify-center rounded-lg text-[13px] transition-colors ${
                  p === safePage
                    ? "bg-[var(--color-accent)] text-white font-medium shadow-sm"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]"
                }`}
              >
                {p + 1}
              </button>
            ),
          )}

          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={safePage === totalPages - 1}
            className="min-w-[36px] h-9 flex items-center justify-center rounded-lg
              text-[var(--color-text-secondary)]
              hover:bg-[var(--color-bg-tertiary)] disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------- */


function DocCard({
  doc,
  bookmarked,
  onBookmark,
}: {
  doc: DocMeta;
  bookmarked: boolean;
  onBookmark: (e: React.MouseEvent, id: string) => void;
}) {
  return (
    <Link
      href={`/docs/${doc.id}`}
      className="doc-card block group px-4 py-3.5 rounded-[var(--radius-sm)]
        bg-[var(--color-card-bg)]
        border border-[var(--color-border)]
        no-underline"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <h2 className="text-[15px] font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] truncate">
            {doc.title}
          </h2>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {/* 收藏星标 */}
          <button
            onClick={(e) => onBookmark(e, doc.id)}
            className={`w-6 h-6 flex items-center justify-center rounded-md
              ${bookmarked
                ? "text-[var(--color-accent)]"
                : "text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 hover:text-[var(--color-accent)]"
              }`}
            aria-label={bookmarked ? "取消收藏" : "收藏"}
          >
            <Star className="w-3.5 h-3.5" fill={bookmarked ? "currentColor" : "none"} />
          </button>
          {/* 箭头 */}
          <ChevronRight className="w-4 h-4 text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 shrink-0" />
        </div>
      </div>
      {(doc.description || doc.author || doc.updatedAt) && (
        <div className="flex items-center justify-between gap-3 mt-1">
          {doc.description && (
            <p className="text-xs text-[var(--color-text-tertiary)] line-clamp-2 leading-relaxed flex-1 min-w-0">
              {doc.description}
            </p>
          )}
          {(doc.author || doc.updatedAt) && (
            <span className="text-[11px] text-[var(--color-text-tertiary)] shrink-0 tabular-nums">
              {doc.author}{doc.author && doc.updatedAt ? " · " : ""}{doc.updatedAt ?? ""}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
