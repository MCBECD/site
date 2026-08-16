"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LayoutList, List, ChevronLeft } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { useDocs } from "@/contexts/DocsContext";
import { getBookmarks, toggleBookmark, saveDocsUIState, loadDocsUIState } from "@/lib/storage";
import { getCategoryBase, getBasicsOrder } from "@/lib/categories";
import { DocCard } from "@/app/docs/DocCard";
import { DocPagination } from "@/app/docs/DocPagination";
import type { DocMeta } from "@/lib/docs";

type ViewMode = "card" | "list";

const PAGE_SIZE_CARD = 10;

export function HiddenPageClient() {
  const { t, locale } = useLocale();
  const { docs } = useDocs();
  const router = useRouter();

  const [page, setPage] = useState(0);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const scrollYRef = useRef<number>(0);

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
    const url = `/docs/hidden/${qs ? `?${qs}` : ""}`;
    window.history.replaceState(null, "", url);
    router.replace(url, { scroll: false });
  }, [router]);

  const handleToggleBookmark = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark(id);
    refreshBookmarks();
  }, [refreshBookmarks]);

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
    const cmpTitle = (a: DocMeta, b: DocMeta) =>
      a.title.localeCompare(b.title, locale ?? "zh-CN");

    return docs
      .filter((d) => d.hidden && getCategoryBase(d.category) === "basics")
      .sort((a, b) => {
        const aO = getBasicsOrder(a.category);
        const bO = getBasicsOrder(b.category);
        if (aO !== bO) return aO - bO;
        return cmpTitle(a, b);
      });
  }, [docs, locale]);

  const totalPages = viewMode === "list" ? 1 : Math.max(1, Math.ceil(filteredDocs.length / PAGE_SIZE_CARD));
  const safePage = viewMode === "list" ? 0 : Math.min(page, totalPages - 1);

  type Section = { key: string; titleKey: string; docs: DocMeta[] };
  type FlatItem =
    | { type: "doc"; doc: DocMeta; sectionIdx: number }
    | { type: "header"; sectionKey: string; titleKey: string };
  const sections = useMemo<Section[]>(() => {
    if (filteredDocs.length > 0) {
      return [{ key: "basics", titleKey: "doc.filterBasics", docs: filteredDocs }];
    }
    return [];
  }, [filteredDocs]);

  const pageRenderItems = useMemo(() => {
    if (viewMode === "list") {
      return { type: "sections" as const, sections };
    }
    const flat: FlatItem[] = [];
    sections.forEach((sec, secIdx) => {
      if (sec.titleKey) {
        flat.push({ type: "header", sectionKey: sec.key, titleKey: sec.titleKey });
      }
      sec.docs.forEach((doc) => {
        flat.push({ type: "doc", doc, sectionIdx: secIdx });
      });
    });
    const docItems = flat.filter((f) => f.type === "doc");
    const pageDocItems = docItems.slice(safePage * PAGE_SIZE_CARD, (safePage + 1) * PAGE_SIZE_CARD);
    const pageDocIds = new Set(pageDocItems.map((d) => (d.type === "doc" ? d.doc.id : "")));
    const pageItems: typeof flat = [];
    for (const item of flat) {
      if (item.type === "header") {
        const section = sections.find((s) => s.key === item.sectionKey);
        if (section && section.docs.some((d) => pageDocIds.has(d.id))) {
          pageItems.push(item);
        }
      } else if (item.type === "doc" && pageDocIds.has(item.doc.id)) {
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
      <button
        onClick={() => router.push("/docs/")}
        className="inline-flex items-center gap-1.5 text-[13px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] mb-6 -ml-1 px-1 py-1 rounded-[var(--radius-sm)] hover:bg-[var(--color-bg-tertiary)] transition-colors duration-[var(--duration-fast)]"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>{t("common.backToList")}</span>
      </button>

      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--color-text-primary)] hero-enter">
          {t("doc.hiddenTitle")}
        </h1>
        <p className="text-[15px] text-[var(--color-text-tertiary)] mt-3 hero-sub-enter max-w-lg leading-relaxed">
          {t("doc.hiddenSubtitle", { count: filteredDocs.length })}
        </p>
      </div>

      <div className="flex justify-end mb-6 search-enter">
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

      {filteredDocs.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-[13px] text-[var(--color-text-tertiary)]">{t("doc.noResults")}</p>
        </div>
      ) : viewMode === "list" ? (
        <div
          className="space-y-6"
          key={`${safePage}-${viewMode}`}
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
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="space-y-1.5"
          key={`${safePage}-${viewMode}`}
        >
          {(pageRenderItems as { type: "items"; items: FlatItem[] }).items.map((item, i) => (
            item.type !== "header" && (
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