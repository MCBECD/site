"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, Copy, Check, ChevronDown } from "lucide-react";
import { MDXRenderer } from "@/components/MDXRenderer";
import { DownloadButton } from "@/components/DownloadButton";
import { useDocTitle } from "@/contexts/DocTitleContext";
import type { DocContent } from "@/lib/docs";

interface DocDetailClientProps {
  doc: DocContent;
  locale: string;
  rawContent: string;
}

export function DocDetailClient({ doc, locale, rawContent }: DocDetailClientProps) {
  const t = useTranslations();
  const { setTitle } = useDocTitle();

  /* @side-effect 更新导航栏标题 */
  useEffect(() => {
    setTitle(doc.meta.title);
    return () => setTitle(null);
  }, [doc.meta.title, setTitle]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* 操作栏 */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-border)]
        bg-[var(--color-bg-primary)]/80 backdrop-blur-sm sticky top-[var(--navbar-height)] z-10">
        <Link
          href="/docs"
          locale={locale}
          className="inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)]
            hover:text-[var(--color-accent)] transition-colors no-underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">{t("doc.backToDocs")}</span>
        </Link>

        <div className="flex items-center gap-1.5">
          <CopyDropdown
            rawContent={rawContent}
            labelMD={t("doc.copyMD")}
            labelPlain={t("doc.copyPlain")}
            successLabel={t("doc.copySuccess")}
          />
          <DownloadButton
            filename={doc.meta.id}
            getContent={() => rawContent}
            label={t("doc.downloadButton")}
          />
        </div>
      </div>

      {/* 文档内容 */}
      <div className="px-6 py-8">
        <div className="prose prose-slate dark:prose-invert max-w-none
          prose-headings:text-[var(--color-text-primary)]
          prose-p:text-[var(--color-text-secondary)]
          prose-a:text-[var(--color-accent)] prose-a:no-underline hover:prose-a:underline
          prose-code:text-[var(--color-accent)]
          prose-strong:text-[var(--color-text-primary)]
          prose-li:text-[var(--color-text-secondary)]
          prose-hr:border-[var(--color-border)]
          prose-blockquote:border-[var(--color-accent)]
          prose-blockquote:text-[var(--color-text-secondary)]">
          <MDXRenderer source={doc.rawContent} />
        </div>
      </div>
    </div>
  );
}

function CopyDropdown({
  rawContent,
  labelMD,
  labelPlain,
  successLabel,
}: {
  rawContent: string;
  labelMD: string;
  labelPlain: string;
  successLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const doCopy = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setOpen(false);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const plainText = extractPlainText(rawContent);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-sm
          bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]
          hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-text-primary)]
          transition-colors"
      >
        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        <span className="hidden sm:inline">{successLabel && copied ? successLabel : "复制"}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-36 py-1 rounded-md border border-[var(--color-border)]
          bg-[var(--color-bg-primary)] shadow-lg z-50">
          <button
            onClick={() => doCopy(rawContent)}
            className="w-full text-left px-3 py-1.5 text-sm text-[var(--color-text-secondary)]
              hover:bg-[var(--color-sidebar-active)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            {labelMD}
          </button>
          <button
            onClick={() => doCopy(plainText)}
            className="w-full text-left px-3 py-1.5 text-sm text-[var(--color-text-secondary)]
              hover:bg-[var(--color-sidebar-active)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            {labelPlain}
          </button>
        </div>
      )}
    </div>
  );
}

function extractPlainText(mdx: string): string {
  return mdx
    .replace(/---[\s\S]*?---/, "")
    .replace(/[#*`~>\[\]()!_|{}.<>&-]/g, "")
    .replace(/\n{2,}/g, "\n\n")
    .trim();
}
