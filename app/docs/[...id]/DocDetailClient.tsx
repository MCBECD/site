"use client";

import { useEffect, useState, useRef, useCallback, type ReactNode } from "react";
import Link from "next/link";
import { Home, Copy, Check, ChevronDown } from "lucide-react";
import { DownloadButton } from "@/components/DownloadButton";
import { useLocale } from "@/contexts/LocaleContext";
import type { DocContent } from "@/lib/docs";

interface Props {
  doc: DocContent;
  rawContent: string;
  children: ReactNode;
}

export function DocDetailClient({ doc, rawContent, children }: Props) {
  const { t } = useLocale();

  return (
    <div className="max-w-3xl mx-auto px-4 pt-4 pb-16">
      <div className="doc-glass-card overflow-hidden">
        {/* 顶部操作栏：返回 + 操作按钮 */}
        <div className="flex items-center justify-between h-11 px-4 doc-header-enter">
          <Link
            href="/docs"
            className="inline-flex items-center gap-1.5 text-[13px] text-[var(--color-text-secondary)]
              hover:text-[var(--color-accent)] transition-colors duration-200 no-underline min-h-[44px]"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">{t("common.backToList")}</span>
          </Link>

          <div className="flex items-center gap-1">
            <CopyDropdown rawContent={rawContent} />
            <DownloadButton
              filename={doc.meta.id}
              getContent={() => rawContent}
            />
          </div>
        </div>

        {/* 标题 + 元信息 */}
        <header className="px-5 pb-1 doc-header-enter" style={{ animationDelay: '0.08s' }}>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight leading-tight">
            {doc.meta.title}
          </h1>
          {(doc.meta.author || doc.meta.updatedAt) && (
            <div className="flex items-center gap-3 mt-2 text-xs text-[var(--color-text-tertiary)]">
              {doc.meta.author && (
                <span className="inline-flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-[var(--color-bg-tertiary)] flex items-center justify-center text-[10px] font-medium text-[var(--color-text-secondary)]">
                    {doc.meta.author.charAt(0).toUpperCase()}
                  </span>
                  {doc.meta.author}
                </span>
              )}
              {doc.meta.updatedAt && (
                <span>{t("doc.updatedAt", { date: doc.meta.updatedAt })}</span>
              )}
            </div>
          )}
          {doc.meta.description && (
            <p className="text-[14px] text-[var(--color-text-tertiary)] mt-2 leading-relaxed">
              {doc.meta.description}
            </p>
          )}
        </header>

        {/* 面包屑 */}
        {/* <nav className="flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)] px-5 pt-3 pb-4">
          <Link href="/docs" className="hover:text-[var(--color-accent)] transition-colors no-underline">
            {t("doc.home")}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[var(--color-text-secondary)] truncate max-w-[280px]">{doc.meta.title}</span>
        </nav> */}

        {/* 分割线 */}
        {/* <div className="mx-5 border-t border-[var(--color-border)]" /> */}

        {/* 文档正文 */}
        <div
          className="px-5 pt-6 pb-6 doc-body-enter
          prose prose-slate dark:prose-invert max-w-none text-[14px] leading-relaxed
          prose-headings:text-[var(--color-text-primary)]
          prose-p:text-[var(--color-text-secondary)]
          prose-a:text-[var(--color-accent)] prose-a:no-underline hover:prose-a:underline
          prose-code:text-[var(--color-accent)]
          prose-strong:text-[var(--color-text-primary)]
          prose-li:text-[var(--color-text-secondary)]
          prose-hr:border-[var(--color-border)]
          prose-blockquote:border-[var(--color-accent)]
          prose-blockquote:text-[var(--color-text-secondary)]"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function CopyDropdown({ rawContent }: { rawContent: string }) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const showToast = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMsg(msg);
    toastTimer.current = setTimeout(() => setToastMsg(""), 2000);
  }, []);

  const doCopy = useCallback(async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setOpen(false);
    showToast(label);
    setTimeout(() => setCopied(false), 2000);
  }, [showToast]);

  const plainText = rawContent
    .replace(/---[\s\S]*?---/, "")
    .replace(/[#*`~>[\]()!_|{}.<>&-]/g, "")
    .replace(/\n{2,}/g, "\n\n")
    .trim();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-[13px]
          text-[var(--color-text-secondary)]
          hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]
          transition-colors"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
        <span className="hidden sm:inline">{copied ? t("code.copied") : t("code.copy")}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-36 py-1 rounded-lg border border-[var(--color-border)]
          bg-[var(--color-bg-primary)] shadow-lg z-50 dropdown-in">
          <button
            onClick={() => doCopy(rawContent, t("code.copiedMd"))}
            className="w-full text-left px-3 py-2 text-[13px] text-[var(--color-text-secondary)]
              hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            {t("code.copyMd")}
          </button>
          <button
            onClick={() => doCopy(plainText, t("code.copiedPlain"))}
            className="w-full text-left px-3 py-2 text-[13px] text-[var(--color-text-secondary)]
              hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            {t("code.copyPlain")}
          </button>
        </div>
      )}

      {toastMsg && (
        <div className="absolute right-0 top-full mt-2 px-3 py-1.5 rounded-lg text-[12px] text-white
          bg-[var(--color-toast-bg)] shadow-lg z-50 whitespace-nowrap dropdown-in">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
