"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, LayoutList, List } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { useDocs } from "@/contexts/DocsContext";
import { getBookmarks, toggleBookmark, saveDocsUIState, loadDocsUIState } from "@/lib/storage";
import { getCategoryBase, getBasicsOrder } from "@/lib/categories";
import { DocCard } from "./DocCard";
import { DocPagination } from "./DocPagination";

type ViewMode = "card" | "list";

const PAGE_SIZE_CARD = 10;
const DEBOUNCE_MS = 150;

export function DocsPageClient() {
  const { t, locale } = useLocale();
  const { docs } = useDocs();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(0);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const scrollYRef = useRef<number>(0);

  // Apply URL param / saved UI state after hydration. Reading localStorage and
  // window.location during the initial render would make the server HTML and the
  // first client render disagree (hydration mismatch), so it happens here instead.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlPage = Number(params.get("page"));
    const hasUrlPage = Number.isFinite(urlPage) && urlPage >= 1;

    const saved = loadDocsUIState();
    if (saved) {
      if (saved.viewMode === "card" || saved.viewMode === "list") {
        setViewMode(saved.viewMode);
      }
      const savedScroll = Number(saved.scrollY);
      if (Number.isFinite(savedScroll) && savedScroll > 0) scrollYRef.current = savedScroll;
    }

    // URL `page` param takes priority over the saved page number.
    if (hasUrlPage) {
      setPage(urlPage - 1);
    } else if (saved) {
      const savedPage = Number(saved.page);
      if (Number.isFinite(savedPage) && savedPage >= 0) setPage(savedPage);
    }
  }, []);

  const refreshBookmarks = useCallback(() => setBookmarks(getBookmarks()), []);

  useEffect(() => {
    refreshBookmarks();
  }, [refreshBookmarks]);

  const navigatePage = useCallback((p: number) => {
    setPage(p);
    const params = new URLSearchParams(window.location.search);
    if (p <= 0) params.delete("page");
    else params.set("page", String(p + 1));
    const qs = params.toString();
    const url = `/docs/${qs ? `?${qs}` : ""}`;
    window.history.replaceState(null, "", url);
    router.replace(url, { scroll: false });
  }, [router]);

  const handleToggleBookmark = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark(id);
    refreshBookmarks();
  }, [refreshBookmarks]);

  const resetPage = useCallback(() => {
    setPage(0);
    const params = new URLSearchParams(window.location.search);
    params.delete("page");
    const qs = params.toString();
    const url = `/docs/${qs ? `?${qs}` : ""}`;
    window.history.replaceState(null, "", url);
    router.replace(url, { scroll: false });
  }, [router]);

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
        resetPage();
        searchRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
      clearTimeout(debounceRef.current);
    };
  }, [resetPage]);

  useEffect(() => {
    setPage(0);
  }, [viewMode]);

  useEffect(() => {
    const onScroll = () => {
      scrollYRef.current = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      saveDocsUIState({
        viewMode,
        page,
        scrollY: scrollYRef.current,
      });
    };
  }, [viewMode, page]);

  // Only restore scroll position if no page URL parameter is present
  // (otherwise we'd scroll to a position saved from a different page)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("page")) return;
    const targetScroll = scrollYRef.current;
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

  const filteredDocs = useMemo(() => {
    let result = docs;

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

    // Sort by category groups: basics first (by order number), commands alphabetically, others by update time
    const basicsDocs = sortBasics(result.filter((d) => getCategoryBase(d.category) === "basics"));
    const commandsDocs = result
      .filter((d) => getCategoryBase(d.category) === "commands")
      .sort((a, b) => cmpTitle(a, b));
    const otherDocs = result
      .filter((d) => {
        const base = getCategoryBase(d.category);
        return base !== "basics" && base !== "commands";
      })
      .sort((a, b) => {
        const aU = a.updatedAt ?? "";
        const bU = b.updatedAt ?? "";
        if (aU !== bU) return bU.localeCompare(aU);
        return cmpTitle(a, b);
      });

    return [...basicsDocs, ...commandsDocs, ...otherDocs];
  }, [docs, debouncedQuery, locale]);

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

  return (
    <div className="relative max-w-3xl mx-auto px-[var(--content-gutter)] pt-14 pb-24">
      {/* Hero */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--color-text-primary)] hero-enter">
          {t("doc.title")}
        </h1>
        <p className="text-[15px] text-[var(--color-text-tertiary)] mt-3 hero-sub-enter max-w-lg leading-relaxed">
          {t("doc.subtitle", { count: docs.length })}
        </p>
      </div>

      {/* Search bar + view toggle */}
      <div className="relative z-[var(--z-search)] flex items-center gap-2 mb-6 search-enter">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)] pointer-events-none z-[var(--z-search)]" />
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            placeholder={t("doc.searchPlaceholder")}
            className="search-input w-full pl-10 pr-10 py-2.5 text-[13px] rounded-[var(--radius)]
              text-[var(--color-text-primary)]
              placeholder:text-[var(--color-text-tertiary)]
              border border-[var(--color-border)]
              focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => { setQuery(""); setDebouncedQuery(""); resetPage(); }}
              aria-label={t("doc.clearSearch")}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-11 h-11 z-[var(--z-search)]
                flex items-center justify-center rounded-[var(--radius-sm)]
                text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]
                hover:bg-[var(--color-bg-tertiary)] active:scale-[0.92] transition-[color,transform] duration-[var(--duration-fast)]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 h-5 z-[var(--z-search)] inline-flex items-center gap-1 px-1.5 rounded-[var(--radius-sm)] text-[11px] font-mono leading-none
              text-[var(--color-kbd-text)] bg-[var(--color-kbd-bg)] border border-[var(--color-kbd-border)]
              pointer-events-none hidden sm:inline-flex">
              <span>/</span>
            </kbd>
          )}
        </div>
        <button
          onClick={() => setViewMode(viewMode === "card" ? "list" : "card")}
          aria-label={t("doc.switchToView", { mode: viewMode === "card" ? t("doc.viewList") : t("doc.viewCards") })}
          className="shrink-0 w-11 h-11 inline-flex items-center justify-center rounded-[var(--radius-sm)]
            bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]
            border border-[var(--color-border)]
            hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]
            active:scale-[0.92] transition-[color,transform] duration-[var(--duration-fast)]"
        >
          {viewMode === "card" ? <List className="w-4 h-4" /> : <LayoutList className="w-4 h-4" />}
        </button>
      </div>

      {isSearching && (
        <p className="text-[12px] text-[var(--color-text-tertiary)] mb-3 px-0.5">
          {t("doc.resultCount", { count: filteredDocs.length })}
        </p>
      )}

      {pageDocs.length === 0 ? (
        <div className="py-24 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--color-bg-tertiary)] mb-4">
            <Search className="w-[18px] h-[18px] text-[var(--color-text-tertiary)]" />
          </div>
          <p className="text-[13px] text-[var(--color-text-tertiary)]">{t("doc.noResults")}</p>
        </div>
      ) : (
        <div
          className={viewMode === "card" ? "space-y-1.5" : "space-y-0.5 px-4 py-2 border border-[var(--color-border)] rounded-[var(--radius)] overflow-hidden bg-[var(--color-card-bg)]"}
          key={`${debouncedQuery}-${safePage}-${viewMode}`}
        >
          {pageDocs.map((doc, i) => (
            <div key={doc.id} className="doc-card-enter" style={{ '--stagger-index': i } as React.CSSProperties}>
              <DocCard
                doc={doc}
                isBookmarked={bookmarks.includes(doc.id)}
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
