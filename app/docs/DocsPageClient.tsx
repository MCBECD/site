"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, X, Command, LayoutGrid, List, ChevronDown } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { useDocs } from "@/contexts/DocsContext";
import { getBookmarks, toggleBookmark } from "@/lib/storage";
import { getCategoryBase, getCommandType, getBasicsOrder } from "@/lib/categories";
import DocCard from "./DocCard";
import DocPagination from "./DocPagination";

type CategoryFilter = "all" | "basics" | "commands" | "examples";
type SortBy = "name" | "type";
type ViewMode = "card" | "list";

const PAGE_SIZE_CARD = 10;
const DEBOUNCE_MS = 150;

const TYPE_ORDER: Record<string, number> = {
  Player: 0,
  World: 1,
  Building: 2,
  Entity: 3,
  UI: 4,
  Advanced: 5,
  other: 99,
};

export default function DocsPageClient() {
  const { t, locale } = useLocale();
  const { docs } = useDocs();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(() => {
    const p = Number(searchParams.get("page"));
    return Number.isFinite(p) && p >= 1 ? p - 1 : 0;
  });
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [sortOpen, setSortOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setBookmarks(getBookmarks());
  }, []);

  const navigatePage = useCallback((p: number) => {
    setPage(p);
    const params = new URLSearchParams(searchParams.toString());
    if (p <= 0) params.delete("page");
    else params.set("page", String(p + 1));
    router.replace(`/docs${params.toString() ? `?${params}` : ""}`, { scroll: false });
  }, [searchParams, router]);

  const handleToggleBookmark = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark(id);
    setBookmarks(getBookmarks());
  }, []);

  const resetPage = useCallback(() => {
    setPage(0);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    router.replace(`/docs${params.toString() ? `?${params}` : ""}`, { scroll: false });
  }, [searchParams, router]);

  const handleInput = useCallback((value: string) => {
    setQuery(value);
    resetPage();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(value), DEBOUNCE_MS);
  }, [resetPage]);

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

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setPage(0);
  }, [category, sortBy, viewMode]);

  const showSortDropdown = category === "commands" || category === "all";

  const filteredDocs = useMemo(() => {
    let result = docs;

    if (category !== "all") {
      result = result.filter((d) => getCategoryBase(d.category) === category);
    }

    const q = debouncedQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((d) =>
        d.title.toLowerCase().includes(q) ||
        (d.description && d.description.toLowerCase().includes(q)),
      );
    }

    const cmpTitle = (a: typeof result[0], b: typeof result[0]) =>
      a.title.localeCompare(b.title, locale ?? "zh-CN");

    const sortBasics = (arr: typeof result) =>
      [...arr].sort((a, b) => {
        const aO = getBasicsOrder(a.category);
        const bO = getBasicsOrder(b.category);
        if (aO !== bO) return aO - bO;
        return cmpTitle(a, b);
      });

    const sortExamples = (arr: typeof result) =>
      [...arr].sort((a, b) => {
        const aU = a.updatedAt ?? "";
        const bU = b.updatedAt ?? "";
        if (aU !== bU) return bU.localeCompare(aU);
        return cmpTitle(a, b);
      });

    const sortCommands = (arr: typeof result, currentSortBy: SortBy) =>
      [...arr].sort((a, b) => {
        if (currentSortBy === "type") {
          const aT = getCommandType(a.category) ?? "other";
          const bT = getCommandType(b.category) ?? "other";
          const aTO = TYPE_ORDER[aT] ?? 99;
          const bTO = TYPE_ORDER[bT] ?? 99;
          if (aTO !== bTO) return aTO - bTO;
        }
        return cmpTitle(a, b);
      });

    if (category === "basics") {
      result = sortBasics(result);
    } else if (category === "examples") {
      result = sortExamples(result);
    } else if (category === "commands") {
      result = sortCommands(result, sortBy);
    } else {
      const basicsDocs = sortBasics(result.filter((d) => getCategoryBase(d.category) === "basics"));
      const examplesDocs = sortExamples(result.filter((d) => getCategoryBase(d.category) === "examples"));
      const commandsDocs = sortCommands(result.filter((d) => getCategoryBase(d.category) === "commands"), sortBy);
      result = [...basicsDocs, ...examplesDocs, ...commandsDocs];
    }

    return result;
  }, [docs, debouncedQuery, category, sortBy, locale]);

  const isSearching = debouncedQuery.trim().length > 0;
  const totalPages = viewMode === "list" ? 1 : Math.max(1, Math.ceil(filteredDocs.length / PAGE_SIZE_CARD));
  const safePage = viewMode === "list" ? 0 : Math.min(page, totalPages - 1);
  const pageDocs = useMemo(() => {
    if (viewMode === "list") return filteredDocs;
    const pageSize = PAGE_SIZE_CARD;
    return filteredDocs.slice(safePage * pageSize, (safePage + 1) * pageSize);
  }, [filteredDocs, safePage, viewMode]);

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

  const categoryTabs: { key: CategoryFilter; labelKey: string }[] = [
    { key: "all", labelKey: "doc.filterAll" },
    { key: "basics", labelKey: "doc.filterBasics" },
    { key: "commands", labelKey: "doc.filterCommands" },
    { key: "examples", labelKey: "doc.filterExamples" },
  ];

  const sortOptions: { key: SortBy; labelKey: string }[] = [
    { key: "name", labelKey: "doc.sortByName" },
    { key: "type", labelKey: "doc.sortByType" },
  ];

  return (
    <div className="max-w-2xl mx-auto px-5 pt-14 pb-24">
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)] hero-enter">
          {t("doc.title")}
        </h1>
        <p className="text-[13px] text-[var(--color-text-tertiary)] mt-2 hero-sub-enter">
          {t("doc.subtitle", { count: docs.length })}
        </p>
      </div>

      {/* 分类筛选标签 */}
      <div className="flex items-center gap-1.5 mb-4 overflow-x-auto -mx-1 px-1 pb-1 scrollbar-none tabs-enter">
        {categoryTabs.map((tab) => {
          const active = category === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setCategory(tab.key)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all
                ${active
                  ? "bg-[var(--color-accent)] text-white shadow-sm"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]"}
              `}
            >
              {t(tab.labelKey)}
            </button>
          );
        })}
      </div>

      {/* 搜索栏 + 工具栏 */}
      <div className="relative z-10 flex flex-col sm:flex-row gap-2.5 mb-6 search-enter">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)] pointer-events-none z-10" />
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            placeholder={t("doc.searchPlaceholder")}
            className="search-input w-full pl-10 pr-10 py-2.5 text-[14px] rounded-lg
              text-[var(--color-text-primary)]
              placeholder:text-[var(--color-text-tertiary)]
              border border-[var(--color-border)]
              focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => { setQuery(""); setDebouncedQuery(""); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 z-10
                flex items-center justify-center rounded-md
                text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]
                hover:bg-[var(--color-bg-tertiary)] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 h-5 z-10 inline-flex items-center gap-1 px-1.5 rounded-md text-[11px] font-mono leading-none
              text-[var(--color-kbd-text)] bg-[var(--color-kbd-bg)] border border-[var(--color-kbd-border)]
              pointer-events-none hidden sm:inline-flex">
              <Command className="w-2.5 h-2.5" />
            </kbd>
          )}
        </div>

        {/* 排序 & 视图切换 */}
        <div className="flex items-center gap-1.5 shrink-0">
          {showSortDropdown && (
            <div ref={sortDropdownRef} className="relative">
              <button
                onClick={() => setSortOpen((v) => !v)}
                className="h-[42px] px-3.5 inline-flex items-center gap-1.5 rounded-lg
                  bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]
                  border border-[var(--color-border)]
                  hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]
                  transition-colors"
              >
                <span className="text-[13px] font-medium">{t(sortOptions.find((o) => o.key === sortBy)!.labelKey)}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${sortOpen ? "rotate-180" : ""}`} />
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-full mt-1.5 py-1 min-w-[140px] rounded-lg
                  bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-lg z-20 dropdown-in">
                  {sortOptions.map((opt) => {
                    const active = sortBy === opt.key;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => { setSortBy(opt.key); setSortOpen(false); }}
                        className={`w-full px-3.5 py-2 text-left text-[13px] transition-colors
                          ${active
                            ? "text-[var(--color-accent)] bg-[var(--color-accent)]/10"
                            : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]"}
                        `}
                      >
                        {t(opt.labelKey)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 视图切换 */}
          <button
            onClick={() => setViewMode(viewMode === "card" ? "list" : "card")}
            title={viewMode === "card" ? t("doc.viewList") : t("doc.viewCards")}
            className="h-[42px] w-[42px] inline-flex items-center justify-center rounded-lg
              bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]
              border border-[var(--color-border)]
              hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]
              transition-colors"
          >
            {viewMode === "card" ? <List className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
          </button>
        </div>
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
        <div className={viewMode === "card" ? "space-y-1.5" : "space-y-0.5"} key={`${debouncedQuery}-${safePage}-${viewMode}`}>
          {pageDocs.map((doc, i) => (
            <div key={doc.id} className="doc-card-enter" style={{ '--stagger-index': i } as React.CSSProperties}>
              <DocCard
                doc={doc}
                bookmarked={bookmarks.includes(doc.id)}
                onBookmark={handleToggleBookmark}
                viewMode={viewMode}
              />
            </div>
          ))}
        </div>
      )}

      {viewMode === "card" && (
        <DocPagination page={safePage} totalPages={totalPages} pageNumbers={pageNumbers} onPageChange={navigatePage} />
      )}
    </div>
  );
}