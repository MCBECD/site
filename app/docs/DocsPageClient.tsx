"use client";

import { useState, useMemo, useRef, useEffect, useCallback, useLayoutEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, X, Command, LayoutList, List, Star, Clock, Trash2, ChevronRight, Group } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { useDocs } from "@/contexts/DocsContext";
import type { DocMeta } from "@/lib/docs";
import { getBookmarks, toggleBookmark, getHistory, removeBookmark, removeHistory, clearBookmarks, clearHistory, saveDocsUIState, loadDocsUIState } from "@/lib/storage";
import { getCategoryBase, getCommandType, getCommandTypeI18nKey, getBasicsOrder } from "@/lib/categories";
import DocCard from "./DocCard";
import DocPagination from "./DocPagination";

type CategoryFilter = "all" | "basics" | "commands" | "examples";
type SortBy = "name" | "type";
type ViewMode = "card" | "list";

const PAGE_SIZE_CARD = 10;
const DEBOUNCE_MS = 150;

interface DocGroup {
  typeLabel?: string;
  items: DocMeta[];
}

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
  const { docs, docMap } = useDocs();
  const searchParams = useSearchParams();
  const router = useRouter();
  const savedState = loadDocsUIState();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(() => {
    if (savedState) return savedState.page;
    const p = Number(searchParams.get("page"));
    return Number.isFinite(p) && p >= 1 ? p - 1 : 0;
  });
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [history, setHistory] = useState<{ id: string; title: string }[]>([]);
  const [bookmarksCollapsed, setBookmarksCollapsed] = useState(() => savedState?.bookmarksCollapsed ?? false);
  const [historyCollapsed, setHistoryCollapsed] = useState(() => savedState?.historyCollapsed ?? false);
  const [category, setCategory] = useState<CategoryFilter>(() => (savedState?.category as CategoryFilter) ?? "all");
  const [sortBy, setSortBy] = useState<SortBy>(() => (savedState?.sortBy as SortBy) ?? "name");
  const [viewMode, setViewMode] = useState<ViewMode>(() => (savedState?.viewMode as ViewMode) ?? "card");
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const scrollYRef = useRef<number>(savedState?.scrollY ?? 0);

  const refreshBookmarks = useCallback(() => setBookmarks(getBookmarks()), []);
  const refreshHistory = useCallback(() => setHistory(getHistory()), []);

  useEffect(() => {
    refreshBookmarks();
    refreshHistory();
  }, [refreshBookmarks, refreshHistory]);

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
    refreshBookmarks();
  }, [refreshBookmarks]);

  const handleRemoveBookmark = useCallback((id: string) => {
    removeBookmark(id);
    refreshBookmarks();
  }, [refreshBookmarks]);

  const handleClearBookmarks = useCallback(() => {
    clearBookmarks();
    refreshBookmarks();
  }, [refreshBookmarks]);

  const handleRemoveHistory = useCallback((id: string) => {
    removeHistory(id);
    refreshHistory();
  }, [refreshHistory]);

  const handleClearHistory = useCallback(() => {
    clearHistory();
    refreshHistory();
  }, [refreshHistory]);

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
    setPage(0);
  }, [category, sortBy, viewMode]);

  const scrollSaveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    saveDocsUIState({
      category,
      bookmarksCollapsed,
      historyCollapsed,
      sortBy,
      viewMode,
      page,
      scrollY: scrollYRef.current,
    });
  }, [category, bookmarksCollapsed, historyCollapsed, sortBy, viewMode, page]);

  useEffect(() => {
    const onScroll = () => {
      scrollYRef.current = window.scrollY;
      if (scrollSaveTimerRef.current) clearTimeout(scrollSaveTimerRef.current);
      scrollSaveTimerRef.current = setTimeout(() => {
        saveDocsUIState({
          category,
          bookmarksCollapsed,
          historyCollapsed,
          sortBy,
          viewMode,
          page,
          scrollY: scrollYRef.current,
        });
      }, 200);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (scrollSaveTimerRef.current) clearTimeout(scrollSaveTimerRef.current);
      saveDocsUIState({
        category,
        bookmarksCollapsed,
        historyCollapsed,
        sortBy,
        viewMode,
        page,
        scrollY: scrollYRef.current,
      });
    };
  }, [category, bookmarksCollapsed, historyCollapsed, sortBy, viewMode, page]);

  useLayoutEffect(() => {
    const targetScroll = savedState?.scrollY ?? 0;
    if (targetScroll <= 0) return;
    window.scrollTo(0, targetScroll);
  }, []);

  useEffect(() => {
    const targetScroll = savedState?.scrollY ?? 0;
    if (targetScroll <= 0) return;
    let attempts = 0;
    const tryScroll = () => {
      window.scrollTo(0, targetScroll);
      attempts++;
      if (attempts < 10 && window.scrollY < targetScroll) {
        requestAnimationFrame(tryScroll);
      }
    };
    requestAnimationFrame(tryScroll);
  }, []);

  const showSortToggle = category === "commands" || category === "all";

  const filteredDocs = useMemo(() => {
    let result = docs;

    if (category !== "all") {
      if (category === "examples") {
        result = result.filter((d) => d.category === "examples");
      } else {
        result = result.filter((d) => getCategoryBase(d.category) === category);
      }
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
    } else if (category === "commands") {
      result = sortCommands(result, sortBy);
    } else if (category === "examples") {
      result = result.sort((a, b) => {
        const aU = a.updatedAt ?? "";
        const bU = b.updatedAt ?? "";
        if (aU !== bU) return bU.localeCompare(aU);
        return cmpTitle(a, b);
      });
    } else {
      const basicsDocs = sortBasics(result.filter((d) => getCategoryBase(d.category) === "basics"));
      const commandsDocs = sortCommands(result.filter((d) => getCategoryBase(d.category) === "commands"), sortBy);
      const otherDocs = result
        .filter((d) => {
          const base = getCategoryBase(d.category);
          return base !== "basics" && base !== "commands";
        })
        .sort((a, b) => {
          const aU = a.updatedAt ?? "";
          const bU = b.updatedAt ?? "";
          if (aU !== bU) return bU.localeCompare(aU);
          return a.title.localeCompare(b.title, locale ?? "zh-CN");
        });
      result = [...basicsDocs, ...commandsDocs, ...otherDocs];
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

  const groupedPageDocs = useMemo<DocGroup[] | null>(() => {
    if (sortBy !== "type") return null;

    const groups: DocGroup[] = [];
    let currentGroup: DocGroup | null = null;

    for (const doc of pageDocs) {
      const typeKey = getCommandTypeI18nKey(doc.category);
      const typeLabel = typeKey ? t(typeKey) : undefined;

      if (typeLabel) {
        if (currentGroup && currentGroup.typeLabel === typeLabel) {
          currentGroup.items.push(doc);
        } else {
          currentGroup = { typeLabel, items: [doc] };
          groups.push(currentGroup);
        }
      } else {
        if (currentGroup && !currentGroup.typeLabel) {
          currentGroup.items.push(doc);
        } else {
          currentGroup = { items: [doc] };
          groups.push(currentGroup);
        }
      }
    }

    return groups;
  }, [pageDocs, sortBy, t]);

  const bookmarkedDocs = useMemo(
    () => bookmarks.map((id) => docMap.get(id)).filter((d): d is DocMeta => !!d),
    [bookmarks, docMap],
  );

  const historyDocs = useMemo(
    () => history.map((h) => docMap.get(h.id)).filter((d): d is DocMeta => !!d),
    [history, docMap],
  );

  const categoryTabs: { key: CategoryFilter; labelKey: string }[] = [
    { key: "all", labelKey: "doc.filterAll" },
    { key: "basics", labelKey: "doc.filterBasics" },
    { key: "commands", labelKey: "doc.filterCommands" },
    { key: "examples", labelKey: "doc.filterExamples" },
  ];

  return (
    <div className="max-w-3xl mx-auto px-5 pt-14 pb-24">
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)] hero-enter">
          {t("doc.title")}
        </h1>
        <p className="text-[13px] text-[var(--color-text-tertiary)] mt-2 hero-sub-enter">
          {t("doc.subtitle", { count: docs.length })}
        </p>
      </div>

      {/* 收藏 & 历史 */}
      {(bookmarkedDocs.length > 0 || historyDocs.length > 0) && (
        <div className="mb-6 space-y-3">
          {/* 收藏 */}
          {bookmarkedDocs.length > 0 && (
            <div className="bookmarks-enter">
              <CollapsibleSection
                icon={<Star className="w-3.5 h-3.5 text-[var(--color-accent)]" />}
                title={t("doc.bookmarks")}
                count={bookmarkedDocs.length}
                collapsed={bookmarksCollapsed}
                onToggle={() => setBookmarksCollapsed((v) => !v)}
                onClear={handleClearBookmarks}
                clearLabel={t("settings.clearAll")}
              >
                <div className="space-y-0.5 rounded-lg border border-[var(--color-border)] overflow-hidden bg-[var(--color-card-bg)]">
                  {bookmarkedDocs.map((doc) => (
                    <QuickItem
                      key={doc.id}
                      doc={doc}
                      onDelete={() => handleRemoveBookmark(doc.id)}
                      deleteLabel={t("common.delete")}
                    />
                  ))}
                </div>
              </CollapsibleSection>
            </div>
          )}

          {/* 历史 */}
          {historyDocs.length > 0 && (
            <div className="history-enter">
              <CollapsibleSection
                icon={<Clock className="w-3.5 h-3.5 text-[var(--color-accent)]" />}
                title={t("doc.recent")}
                count={historyDocs.length}
                collapsed={historyCollapsed}
                onToggle={() => setHistoryCollapsed((v) => !v)}
                onClear={handleClearHistory}
                clearLabel={t("settings.clearAll")}
              >
                <div className="space-y-0.5 rounded-lg border border-[var(--color-border)] overflow-hidden bg-[var(--color-card-bg)]">
                  {historyDocs.slice(0, 8).map((doc) => (
                    <QuickItem
                      key={doc.id}
                      doc={doc}
                      onDelete={() => handleRemoveHistory(doc.id)}
                      deleteLabel={t("common.delete")}
                    />
                  ))}
                </div>
              </CollapsibleSection>
            </div>
          )}
        </div>
      )}

      {/* 分类筛选标签 */}
      <div className="relative z-20 flex items-center gap-1.5 mb-4 tabs-enter">
        <div className="flex items-center gap-1.5 overflow-x-auto -mx-1 px-1 pb-1 scrollbar-none flex-1 min-w-0">
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
        {/* 工具栏：分组 + 视图切换 */}
        <div className="flex items-center gap-2">
          {showSortToggle && (
            <button
              onClick={() => setSortBy((prev) => (prev === "type" ? "name" : "type"))}
              className={`h-9 px-3.5 inline-flex items-center gap-1.5 rounded-lg border transition-colors
                ${sortBy === "type"
                  ? "bg-[var(--color-accent)] text-white border-transparent"
                  : "bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]"}
              `}
            >
              <Group className="w-4 h-4" />
              <span className="text-[13px] font-medium">{t("doc.group")}</span>
            </button>
          )}

          <button
            onClick={() => setViewMode(viewMode === "card" ? "list" : "card")}
            className="h-9 px-3.5 inline-flex items-center gap-1.5 rounded-lg
              bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]
              border border-[var(--color-border)]
              hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]
              transition-colors"
          >
            {viewMode === "card" ? <List className="w-4 h-4" /> : <LayoutList className="w-4 h-4" />}
            <span className="text-[13px] font-medium">{viewMode === "card" ? t("doc.viewList") : t("doc.viewCards")}</span>
          </button>
        </div>
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
      ) : groupedPageDocs ? (
        <div key={`${debouncedQuery}-${safePage}-${viewMode}-grouped`}>
          {groupedPageDocs.map((group, gi) => (
            <div key={gi} className={gi > 0 ? "mt-6" : ""}>
              {group.typeLabel && (
                <p className="ml-3 text-[20px] text-[var(--color-accent)]">
                    {group.typeLabel}
                </p>
              )}
              <div
                className={viewMode === "card" ? "space-y-1.5" : "space-y-0.5 px-4 py-2 border border-[var(--color-border)] rounded-lg overflow-hidden bg-[var(--color-card-bg)]"}
              >
                {group.items.map((doc, i) => (
                  <div key={doc.id} className="doc-card-enter" style={{ '--stagger-index': i } as React.CSSProperties}>
                    <DocCard
                      doc={doc}
                      bookmarked={bookmarks.includes(doc.id)}
                      onBookmark={handleToggleBookmark}
                      viewMode={viewMode}
                      sortBy={sortBy}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className={viewMode === "card" ? "space-y-1.5" : "space-y-0.5 px-4 py-2 border border-[var(--color-border)] rounded-lg overflow-hidden bg-[var(--color-card-bg)]"}
          key={`${debouncedQuery}-${safePage}-${viewMode}`}
        >
          {pageDocs.map((doc, i) => (
            <div key={doc.id} className="doc-card-enter" style={{ '--stagger-index': i } as React.CSSProperties}>
              <DocCard
                doc={doc}
                bookmarked={bookmarks.includes(doc.id)}
                onBookmark={handleToggleBookmark}
                viewMode={viewMode}
                sortBy={sortBy}
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

/* ---------- Sub components ---------- */

interface CollapsibleSectionProps {
  icon: React.ReactNode;
  title: string;
  count: number;
  collapsed: boolean;
  onToggle: () => void;
  onClear: () => void;
  clearLabel: string;
  children: React.ReactNode;
}

function CollapsibleSection({
  icon,
  title,
  count,
  collapsed,
  onToggle,
  onClear,
  clearLabel,
  children,
}: CollapsibleSectionProps) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 min-w-0 transition-colors hover:text-[var(--color-text-primary)] text-[var(--color-text-secondary)]"
        >
          <ChevronRight
            className={`w-3.5 h-3.5 shrink-0 text-[var(--color-text-tertiary)] transition-transform duration-200 ${collapsed ? "" : "rotate-90"}`}
          />
          <div className="shrink-0">{icon}</div>
          <span className="text-[13px] font-medium">{title}</span>
          <span className="text-[11px] text-[var(--color-text-tertiary)] tabular-nums">{count}</span>
        </button>
        <button
          onClick={onClear}
          className="flex items-center gap-1 text-[11px] text-[var(--color-text-tertiary)]
            hover:text-red-400 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          {clearLabel}
        </button>
      </div>
      {!collapsed && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

interface QuickItemProps {
  doc: DocMeta;
  onDelete: () => void;
  deleteLabel: string;
}

function QuickItem({ doc, onDelete, deleteLabel }: QuickItemProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 hover:bg-[var(--color-bg-tertiary)] transition-colors group">
      <Link
        href={`/docs/${doc.id}`}
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
        aria-label={deleteLabel}
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}