"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import type { DocMeta } from "@/lib/docs";

const PAGE_SIZE = 20;
const DEBOUNCE_MS = 150;

interface Props {
  docs: DocMeta[];
}

export default function DocsPageClient({ docs }: Props) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

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
      if (i === 0 || i === totalPages - 1 || (i >= start && i <= end)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== -1) {
        pages.push(-1);
      }
    }
    return pages;
  }, [totalPages, safePage]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* 搜索栏 */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)] pointer-events-none" />
        <input
          ref={searchRef}
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="搜索命令..."
          className="search-input w-full pl-10 pr-20 py-2.5 text-sm rounded-lg
            bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]
            placeholder:text-[var(--color-text-tertiary)]
            border border-[var(--color-border)]
            focus:outline-none transition-all"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setDebouncedQuery(""); }}
            className="absolute right-11 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px]
              flex items-center justify-center rounded
              text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px]
          flex items-center justify-center rounded text-[10px] font-mono
          text-[var(--color-text-tertiary)] bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]
          pointer-events-none hidden sm:flex"
          style={query ? { visibility: "hidden" } : undefined}
        >
          /
        </kbd>
      </div>

      {/* 结果计数 */}
      {debouncedQuery.trim() && (
        <p className="text-xs text-[var(--color-text-tertiary)] mb-3">
          {filteredDocs.length} 条结果
        </p>
      )}

      {/* 命令列表 */}
      {pageDocs.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-[var(--color-text-tertiary)]">没有找到匹配的命令</p>
        </div>
      ) : (
        <div className="space-y-2">
          {pageDocs.map((doc) => (
            <Link
              key={doc.id}
              href={`/docs/${doc.id}`}
              className="block group p-3.5 rounded-lg
                bg-[var(--color-card-bg)] shadow-[var(--color-card-shadow)]
                hover:shadow-md hover:shadow-[var(--color-accent)]/5
                hover:border-[var(--color-accent)]
                transition-all no-underline"
            >
              <h2 className="text-sm font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] truncate">
                {doc.title}
              </h2>
              {doc.description && (
                <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5 truncate">
                  {doc.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage === 0}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md
              text-[var(--color-text-secondary)]
              hover:bg-[var(--color-bg-tertiary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {pageNumbers.map((p, i) =>
            p === -1 ? (
              <span key={`e-${i}`} className="w-11 h-11 flex items-center justify-center text-sm text-[var(--color-text-tertiary)]">
                ...
              </span>
            ) : (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`min-w-[44px] min-h-[44px] rounded-md text-sm transition-colors ${
                  p === safePage
                    ? "bg-[var(--color-accent)] text-white font-medium"
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
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md
              text-[var(--color-text-secondary)]
              hover:bg-[var(--color-bg-tertiary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
