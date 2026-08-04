"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { type DocMeta, type Chapter } from "@/lib/docs";
import { Search, X, BookOpen, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface SidebarProps {
  docs: DocMeta[];
  chapters: Chapter[];
  locale: string;
  open: boolean;
  onClose: () => void;
}

const SEARCH_RESULT_LIMIT = 30;
const DEBOUNCE_MS = 150;

function MobileSidebar({ open, onClose, children }: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            aria-hidden="true"
          />
          <motion.aside
            className="md:hidden fixed top-0 left-0 bottom-0 w-72 max-w-[85vw]
              bg-[var(--color-sidebar-bg)] z-50 shadow-2xl flex flex-col"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            style={{ willChange: "transform" }}
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 p-1.5 rounded-md
                text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]
                hover:bg-[var(--color-bg-tertiary)] transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
            {children}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export function Sidebar({ docs, chapters, locale, open, onClose }: SidebarProps) {
  return (
    <>
      <aside
        className="hidden md:flex flex-col fixed top-[var(--navbar-height)] left-0 bottom-0
          w-[var(--sidebar-width)] bg-[var(--color-sidebar-bg)] border-r border-[var(--color-border)]
          z-30"
      >
        <SidebarContent docs={docs} chapters={chapters} locale={locale} />
      </aside>

      <MobileSidebar open={open} onClose={onClose}>
        <SidebarContent docs={docs} chapters={chapters} locale={locale} />
      </MobileSidebar>
    </>
  );
}

function SidebarContent({
  docs,
  chapters,
  locale,
}: {
  docs: DocMeta[];
  chapters: Chapter[];
  locale: string;
}) {
  const t = useTranslations();
  const pathname = usePathname();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(() => {
    const currentId = pathname.split("/docs/")[1]?.split("#")[0];
    if (currentId) {
      const chapter = chapters.find((ch) =>
        ch.docs.some((d) => d.id === currentId),
      );
      if (chapter) return new Set([chapter.id]);
    }
    return new Set(chapters.length > 0 && chapters[0] ? [chapters[0].id] : []);
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const isActive = (id: string) => pathname.includes(`/docs/${id}`);

  const handleInput = useCallback((value: string) => {
    setQuery(value);
    setSelectedIndex(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(value), DEBOUNCE_MS);
  }, []);

  const hasQuery = debouncedQuery.trim().length > 0;

  const { searchResults, totalHits } = useMemo(() => {
    if (!hasQuery) return { searchResults: [], totalHits: 0 };
    const q = debouncedQuery.trim().toLowerCase();
    const hits = docs.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        (d.description && d.description.toLowerCase().includes(q)),
    );
    return { searchResults: hits.slice(0, SEARCH_RESULT_LIMIT), totalHits: hits.length };
  }, [docs, debouncedQuery, hasQuery]);

  const hiddenCount = hasQuery ? Math.max(0, totalHits - SEARCH_RESULT_LIMIT) : 0;

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) next.delete(chapterId);
      else next.add(chapterId);
      return next;
    });
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
        return;
      }
      if (document.activeElement !== inputRef.current) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, searchResults.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && selectedIndex >= 0) {
        const doc = searchResults[selectedIndex];
        if (doc) window.location.href = `/${locale}/docs/${doc.id}`;
      } else if (e.key === "Escape") {
        setQuery("");
        setDebouncedQuery("");
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [searchResults, selectedIndex, locale]);

  const getChapterStats = (chapter: Chapter) => {
    const total = chapter.docs.length;
    const currentId = pathname.split("/docs/")[1]?.split("#")[0];
    const idx = chapter.docs.findIndex((d) => d.id === currentId);
    return { total, idx: idx >= 0 ? idx + 1 : 0, hasActive: idx >= 0 };
  };

  const renderDocLink = (doc: DocMeta, selected: boolean) => {
    const active = isActive(doc.id);
    return (
      <Link
        key={doc.id}
        href={`/docs/${doc.id}`}
        locale={locale}
        className={`block pl-7 pr-2.5 py-1.5 rounded-md text-sm transition-colors no-underline
          ${active || selected
            ? "bg-[var(--color-sidebar-active)] text-[var(--color-accent)] font-medium"
            : "text-[var(--color-text-secondary)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-text-primary)]"
          }`}
      >
        <span className="truncate block">{doc.title}</span>
      </Link>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* 搜索栏 */}
      <div className="p-3 pb-2 border-b border-[var(--color-border)] shrink-0">
        <div className="mb-2 px-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
            {t("sidebar.documentation")}
          </h2>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-text-tertiary)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            placeholder={t("sidebar.searchPlaceholder")}
            className="w-full pl-8 pr-7 py-1.5 text-sm rounded-md
              bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]
              placeholder:text-[var(--color-text-tertiary)]
              border border-transparent
              focus:outline-none focus:border-[var(--color-accent)]
              transition-colors"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setDebouncedQuery(""); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded
                text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-y-auto p-3 pt-2">
        {!hasQuery ? (
          chapters.length > 0 ? (
            <div className="space-y-0.5">
              {chapters.map((chapter) => {
                const isExpanded = expandedChapters.has(chapter.id);
                const { total, idx, hasActive } = getChapterStats(chapter);

                return (
                  <div key={chapter.id}>
                    <button
                      onClick={() => toggleChapter(chapter.id)}
                      className="flex items-center w-full gap-1.5 px-2 py-1.5 text-left
                        rounded-md hover:bg-[var(--color-sidebar-hover)] transition-colors group"
                    >
                      <ChevronRight
                        className={`w-3 h-3 text-[var(--color-text-tertiary)] transition-transform shrink-0
                          ${isExpanded ? "rotate-90" : ""}`}
                      />
                      <BookOpen className="w-3 h-3 text-[var(--color-accent)] shrink-0" />
                      <span className={`text-xs font-semibold truncate flex-1
                        ${hasActive ? "text-[var(--color-accent)]" : "text-[var(--color-text-secondary)]"}`}>
                        {chapter.id}
                      </span>
                      {idx > 0 && (
                        <span className="text-[10px] text-[var(--color-text-tertiary)] shrink-0">
                          {idx}/{total}
                        </span>
                      )}
                    </button>

                    {isExpanded && (
                      <nav className="mt-0.5 space-y-0.5">
                        {chapter.docs.map((doc) => renderDocLink(doc, false))}
                      </nav>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <nav className="space-y-0.5">
              {docs.map((doc) => renderDocLink(doc, false))}
            </nav>
          )
        ) : searchResults.length === 0 ? (
          <p className="px-2 py-4 text-sm text-center text-[var(--color-text-tertiary)]">
            {t("sidebar.noResults")}
          </p>
        ) : (
          <>
            {totalHits > 0 && (
              <p className="px-2 mb-2 text-xs text-[var(--color-text-tertiary)]">
                {t("sidebar.searchResults").replace("{count}", String(totalHits))}
              </p>
            )}
            <nav className="space-y-0.5">
              {searchResults.map((doc, idx) => renderDocLink(doc, idx === selectedIndex))}
            </nav>
          </>
        )}

        {hiddenCount > 0 && (
          <p className="px-2 pt-3 text-xs text-[var(--color-text-tertiary)]">
            {t("sidebar.moreResults").replace("{count}", String(hiddenCount))}
          </p>
        )}
      </div>
    </div>
  );
}
