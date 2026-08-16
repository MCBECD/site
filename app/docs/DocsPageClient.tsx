"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, X, LayoutList, List, ChevronRight, BookOpen } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { useDocs } from "@/contexts/DocsContext";
import { getBookmarks, toggleBookmark, saveDocsUIState, loadDocsUIState } from "@/lib/storage";
import { getCategoryBase, getBasicsOrder, getCommunityOrder } from "@/lib/categories";
import { DocCard } from "./DocCard";
import { DocPagination } from "./DocPagination";
import type { DocMeta } from "@/lib/docs";

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

  const { basicsDocs, commandsDocs, communityDocs, hiddenCount, filteredDocs } = useMemo(() => {
    let result = docs;

    const q = debouncedQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((d) =>
        d.title.toLowerCase().includes(q) ||
        (d.description && d.description.toLowerCase().includes(q)),
      );
    }

    const cmpTitle = (a: DocMeta, b: DocMeta) =>
      a.title.localeCompare(b.title, locale ?? "zh-CN");

    const cmpIdFilePart = (a: DocMeta, b: DocMeta) => {
      const aName = a.id.split("/").pop() ?? "";
      const bName = b.id.split("/").pop() ?? "";
      return aName.localeCompare(bName, locale ?? "zh-CN");
    };

    const sortBasics = (arr: DocMeta[]) =>
      [...arr].sort((a, b) => {
        const aO = getBasicsOrder(a.category);
        const bO = getBasicsOrder(b.category);
        if (aO !== bO) return aO - bO;
        return cmpTitle(a, b);
      });

    const hiddenCountAll = docs.filter((d) => d.hidden).length;

    const basicsDocs = sortBasics(result.filter((d) => getCategoryBase(d.category) === "basics" && !d.hidden));
    const commandsDocs = result
      .filter((d) => getCategoryBase(d.category) === "commands" && !d.hidden)
      .sort((a, b) => cmpIdFilePart(a, b));
    const communityDocs = result
      .filter((d) => getCategoryBase(d.category) === "community" && !d.hidden)
      .sort((a, b) => {
        const aO = getCommunityOrder(a.id);
        const bO = getCommunityOrder(b.id);
        if (aO !== bO) return aO - bO;
        return cmpTitle(a, b);
      });

    const filteredDocs = [...basicsDocs, ...commandsDocs, ...communityDocs];

    return { basicsDocs, commandsDocs, communityDocs, hiddenCount: hiddenCountAll, filteredDocs };
  }, [docs, debouncedQuery, locale]);

  const isSearching = debouncedQuery.trim().length > 0;

  type Section = { key: string; titleKey: string; docs: DocMeta[]; trailingEntry?: { href: string; title: string; description: string; badge?: number } };
  type FlatItem =
    | { type: "doc"; doc: DocMeta; sectionIdx: number }
    | { type: "entry"; entry: NonNullable<Section["trailingEntry"]>; sectionIdx: number }
    | { type: "header"; sectionKey: string; titleKey: string };
  const sections = useMemo<Section[]>(() => {
    if (isSearching) {
      return [{ key: "results", titleKey: "", docs: filteredDocs }];
    }
    const s: Section[] = [];
    if (basicsDocs.length > 0 || hiddenCount > 0) {
      s.push({
        key: "basics",
        titleKey: "doc.filterBasics",
        docs: basicsDocs,
        trailingEntry: hiddenCount > 0 ? {
          href: "/docs/hidden/",
          title: t("doc.hiddenCardTitle"),
          description: t("doc.hiddenCardDesc"),
          badge: hiddenCount,
        } : undefined,
      });
    }
    if (commandsDocs.length > 0) {
      s.push({ key: "commands", titleKey: "doc.filterCommands", docs: commandsDocs });
    }
    if (communityDocs.length > 0) {
      s.push({ key: "community", titleKey: "doc.filterCommunity", docs: communityDocs });
    }
    return s;
  }, [basicsDocs, commandsDocs, communityDocs, filteredDocs, hiddenCount, isSearching, t]);

  const totalPageable = useMemo(() => {
    const entryCount = sections.filter((s) => s.trailingEntry && !isSearching).length;
    return filteredDocs.length + entryCount;
  }, [filteredDocs.length, sections, isSearching]);
  const totalPages = viewMode === "list" ? 1 : Math.max(1, Math.ceil(totalPageable / PAGE_SIZE_CARD));
  const safePage = viewMode === "list" ? 0 : Math.min(page, totalPages - 1);

  // For card view with pagination, we need to flatten sections into a page-aware list
  const pageRenderItems = useMemo(() => {
    if (viewMode === "list") {
      return { type: "sections" as const, sections };
    }
    // Card view: paginate flat docs, but track section boundaries for headers on page 0 only
    const flat: FlatItem[] = [];
    sections.forEach((sec, secIdx) => {
      if (sec.titleKey) {
        flat.push({ type: "header", sectionKey: sec.key, titleKey: sec.titleKey });
      }
      sec.docs.forEach((doc) => {
        flat.push({ type: "doc", doc, sectionIdx: secIdx });
      });
      if (sec.trailingEntry) {
        flat.push({ type: "entry", entry: sec.trailingEntry, sectionIdx: secIdx });
      }
    });
    // Count items (not headers) per page for pagination
    const pageableItems = flat.filter((f) => f.type === "doc" || f.type === "entry") as Array<FlatItem & { type: "doc" | "entry" }>;
    const pageDocItems = pageableItems.slice(safePage * PAGE_SIZE_CARD, (safePage + 1) * PAGE_SIZE_CARD);
    const pageDocKeys = new Set(pageDocItems.map((d) => d.type === "doc" ? `doc:${d.doc.id}` : `entry:${d.entry.href}`));
    const pageItems: FlatItem[] = [];
    for (const item of flat) {
      if (item.type === "header") {
        const section = sections.find((s) => s.key === item.sectionKey);
        const hasDoc = section?.docs.some((d) => pageDocKeys.has(`doc:${d.id}`));
        const hasEntry = section?.trailingEntry && pageDocKeys.has(`entry:${section.trailingEntry.href}`);
        if (section && (hasDoc || hasEntry)) {
          pageItems.push(item);
        }
      } else if (item.type === "doc" && pageDocKeys.has(`doc:${item.doc.id}`)) {
        pageItems.push(item);
      } else if (item.type === "entry" && pageDocKeys.has(`entry:${item.entry.href}`)) {
        pageItems.push(item);
      }
    }
    return { type: "items" as const, items: pageItems };
  }, [sections, viewMode, safePage]);

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

      {filteredDocs.length === 0 && !sections.some((s) => s.trailingEntry) ? (
        <div className="py-24 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--color-bg-tertiary)] mb-4">
            <Search className="w-[18px] h-[18px] text-[var(--color-text-tertiary)]" />
          </div>
          <p className="text-[13px] text-[var(--color-text-tertiary)]">{t("doc.noResults")}</p>
        </div>
      ) : viewMode === "list" ? (
        <div
          className="space-y-6"
          key={`${debouncedQuery}-${safePage}-${viewMode}`}
        >
          {(pageRenderItems as { type: "sections"; sections: Section[] }).sections.map((section) => (
            <div key={section.key} className="section-block">
              {section.titleKey && (
                <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2 px-4">
                  {t(section.titleKey)}
                </h3>
              )}
              <div className="space-y-0.5 px-4 py-2 border border-[var(--color-border)] rounded-[var(--radius)] overflow-hidden bg-[var(--color-card-bg)]">
                {section.docs.map((doc, i) => (
                  <div key={doc.id} className="doc-card-enter" style={{ '--stagger-index': i } as React.CSSProperties}>
                    <DocCard
                      doc={doc}
                      isBookmarked={bookmarks.includes(doc.id)}
                      onBookmark={handleToggleBookmark}
                      viewMode={viewMode}
                    />
                  </div>
                ))}
                {section.trailingEntry && (
                  <div
                    key={`entry-${section.trailingEntry.href}`}
                    className="doc-card-enter"
                    style={{ '--stagger-index': section.docs.length } as React.CSSProperties}
                  >
                    <Link
                      href={section.trailingEntry.href}
                      className="doc-card flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-[calc(var(--radius)-2px)]
                        hover:bg-[var(--color-bg-tertiary)]/70 no-underline group transition-colors duration-[var(--duration-fast)]"
                    >
                      <div className="w-9 h-9 shrink-0 rounded-[var(--radius-sm)] bg-[var(--color-accent)]/10 flex items-center justify-center text-[var(--color-accent)]">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] truncate transition-colors duration-[var(--duration-fast)]">
                            {section.trailingEntry.title}
                          </span>
                          {section.trailingEntry.badge !== undefined && (
                            <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--color-accent)]/10 text-[var(--color-accent)] tabular-nums">
                              {section.trailingEntry.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5 truncate">
                          {section.trailingEntry.description}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 shrink-0 transition-opacity duration-[var(--duration-fast)]" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="space-y-1.5"
          key={`${debouncedQuery}-${safePage}-${viewMode}`}
        >
          {(pageRenderItems as { type: "items"; items: FlatItem[] }).items.map((item, i) => (
            item.type === "header" ? (
              <h3 key={`hdr-${item.sectionKey}`} className="text-[12px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mt-4 mb-2 first:mt-0 px-0.5 section-header-enter" style={{ '--stagger-index': i } as React.CSSProperties}>
                {t(item.titleKey)}
              </h3>
            ) : item.type === "entry" ? (
              <div key={`entry-${item.entry.href}`} className="doc-card-enter" style={{ '--stagger-index': i } as React.CSSProperties}>
                <Link
                  href={item.entry.href}
                  className="doc-card block group px-4 py-4 rounded-[var(--radius-lg)]
                    bg-[var(--color-card-bg)]
                    border border-[var(--color-border)]
                    no-underline min-h-[44px]
                    hover:border-[var(--color-accent)]/50 transition-colors duration-[var(--duration-fast)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 shrink-0 rounded-[var(--radius)] bg-[var(--color-accent)]/10 flex items-center justify-center text-[var(--color-accent)]">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="text-[15px] font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] truncate transition-colors duration-[var(--duration-fast)]">
                          {item.entry.title}
                        </h2>
                        {item.entry.badge !== undefined && (
                          <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[var(--color-accent)]/10 text-[var(--color-accent)] tabular-nums">
                            {item.entry.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5 truncate">
                        {item.entry.description}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 shrink-0 transition-opacity duration-[var(--duration-fast)]" />
                  </div>
                </Link>
              </div>
            ) : (
              <div key={item.doc.id} className="doc-card-enter" style={{ '--stagger-index': i } as React.CSSProperties}>
                <DocCard
                  doc={item.doc}
                  isBookmarked={bookmarks.includes(item.doc.id)}
                  onBookmark={handleToggleBookmark}
                  viewMode={viewMode}
                />
              </div>
            )
          ))}
        </div>
      )}

      {viewMode === "card" && (
        <DocPagination page={safePage} totalPages={totalPages} pageNumbers={pageNumbers} onPageChange={navigatePage} />
      )}
    </div>
  );
}