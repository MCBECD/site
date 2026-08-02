"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { type DocMeta } from "@/lib/docs";
import { Search, X, ChevronLeft, Star } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface SidebarProps {
  docs: DocMeta[];
  locale: string;
  open: boolean;
  onClose: () => void;
}

const SIDEBAR_CATEGORIES = ["intro", "basics"];

const CATEGORY_LABELS: Record<string, string> = {
  intro: "介绍",
  basics: "基础",
};
const SEARCH_RESULT_LIMIT = 30;
const DEBOUNCE_MS = 150;

export function Sidebar({ docs, locale, open, onClose }: SidebarProps) {
  const t = useTranslations();
  const pathname = usePathname();

  const isActive = (id: string) => pathname.includes(`/docs/${id}`);

  return (
    <>
      <aside
        className="hidden md:flex flex-col fixed top-[var(--navbar-height)] left-0 bottom-0
          w-[var(--sidebar-width)] bg-[var(--color-sidebar-bg)] border-r border-[var(--color-border)]
          z-30"
      >
        <SidebarContent docs={docs} locale={locale} isActive={isActive} t={t} onClose={onClose} />
      </aside>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              aria-hidden="true"
            />
            <motion.aside
              className="md:hidden fixed top-[var(--navbar-height)] left-0 bottom-0
                w-[var(--sidebar-width)] max-w-[80vw] bg-[var(--color-sidebar-bg)]
                border-r border-[var(--color-border)] z-50 shadow-xl flex flex-col"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <SidebarContent docs={docs} locale={locale} isActive={isActive} t={t} onClose={onClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function SidebarContent({
  docs,
  locale,
  isActive,
  t,
  onClose,
}: {
  docs: DocMeta[];
  locale: string;
  isActive: (id: string) => boolean;
  t: ReturnType<typeof useTranslations>;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const listRef = useRef<HTMLDivElement>(null);

  /* @side-effect 防抖搜索 */
  const handleInput = useCallback((value: string) => {
    setQuery(value);
    setSelectedIndex(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(value), DEBOUNCE_MS);
  }, []);

  const hasQuery = debouncedQuery.trim().length > 0;

  /* @why 按 category 自动分组，不硬编码文档 ID */
  const { sections, searchResults, totalHits } = useMemo(() => {
    if (!hasQuery) {
      const byCategory = new Map<string, DocMeta[]>();
      for (const doc of docs) {
        const cat = doc.category ?? "other";
        if (!byCategory.has(cat)) byCategory.set(cat, []);
        byCategory.get(cat)!.push(doc);
      }
      const sections = SIDEBAR_CATEGORIES
        .filter((cat) => byCategory.has(cat))
        .map((cat) => ({
          label: CATEGORY_LABELS[cat] ?? cat,
          docs: byCategory.get(cat)!,
        }));
      return { sections, searchResults: [], totalHits: 0 };
    }
    const q = debouncedQuery.trim().toLowerCase();
    const hits = docs.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        (d.description && d.description.toLowerCase().includes(q)),
    );
    return { sections: [], searchResults: hits.slice(0, SEARCH_RESULT_LIMIT), totalHits: hits.length };
  }, [docs, debouncedQuery, hasQuery]);

  const hiddenCount = hasQuery ? Math.max(0, totalHits - SEARCH_RESULT_LIMIT) : 0;

  /* @side-effect 键盘导航 */
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
        if (doc) {
          window.location.href = `/${locale}/docs/${doc.id}`;
        }
      } else if (e.key === "Escape") {
        setQuery("");
        setDebouncedQuery("");
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [searchResults, selectedIndex, locale]);

  const renderLink = (doc: DocMeta, selected: boolean) => {
    const active = isActive(doc.id);
    return (
      <Link
        key={doc.id}
        href={`/docs/${doc.id}`}
        locale={locale}
        onClick={onClose}
        className={`block px-2.5 py-1.5 rounded-md text-sm transition-colors no-underline
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
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
            {t("sidebar.documentation")}
          </h2>
          <button
            onClick={onClose}
            className="md:hidden p-0.5 rounded text-[var(--color-text-tertiary)]
              hover:text-[var(--color-text-primary)] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
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

      {/* 文档列表 */}
      <div ref={listRef} className="flex-1 overflow-y-auto p-3 pt-2">
        {!hasQuery ? (
          sections.map((section) => (
            <div key={section.label} className="mb-3">
              <div className="flex items-center gap-1.5 px-2 py-1.5">
                <Star className="w-3 h-3 text-[var(--color-accent)]" />
                <span className="text-xs font-medium text-[var(--color-text-tertiary)]">
                  {section.label}
                </span>
              </div>
              <nav className="space-y-0.5">
                {section.docs.map((doc) => renderLink(doc, false))}
              </nav>
            </div>
          ))
        ) : searchResults.length === 0 ? (
          <p className="px-2 py-4 text-sm text-center text-[var(--color-text-tertiary)]">
            {t("sidebar.noResults")}
          </p>
        ) : (
          <>
            {totalHits > 0 && (
              <p className="px-2 mb-1 text-xs text-[var(--color-text-tertiary)]">
                {t("sidebar.searchResults").replace("{count}", String(totalHits))}
              </p>
            )}
            <nav className="space-y-0.5">
              {searchResults.map((doc, idx) => renderLink(doc, idx === selectedIndex))}
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
