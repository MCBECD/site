"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Search, X, Command } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import type { DocMeta } from "@/lib/docs";
import { getBookmarks, toggleBookmark } from "@/lib/storage";
import DocCard from "./DocCard";
import DocPagination from "./DocPagination";

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
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setBookmarks(getBookmarks());
  }, []);

  const handleToggleBookmark = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark(id);
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
        setQuery(""); setDebouncedQuery("");
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
      result = result.filter((d) =>
        d.title.toLowerCase().includes(q) ||
        (d.description && d.description.toLowerCase().includes(q)),
      );
    }
    return result;
  }, [docs, debouncedQuery]);

  const isSearching = debouncedQuery.trim().length > 0;

  const totalPages = Math.max(1, Math.ceil(filteredDocs.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageDocs = useMemo(
    () => filteredDocs.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE),
    [filteredDocs, safePage],
  );

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const w = 2;
    const start = Math.max(0, safePage - w);
    const end = Math.min(totalPages - 1, safePage + w);
    for (let i = 0; i < totalPages; i++) {
      if (i === 0 || i === totalPages - 1 || (i >= start && i <= end)) pages.push(i);
      else if (pages[pages.length - 1] !== -1) pages.push(-1);
    }
    return pages;
  }, [totalPages, safePage]);

  return (
    <div className="max-w-2xl mx-auto px-5 pt-12 pb-20">
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

      {isSearching && (
        <p className="text-xs text-[var(--color-text-tertiary)] mb-3 px-0.5">
          {t("doc.resultCount", { count: filteredDocs.length })}
        </p>
      )}

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

      <DocPagination page={safePage} totalPages={totalPages} pageNumbers={pageNumbers} onPageChange={setPage} />
    </div>
  );
}
