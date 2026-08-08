"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Check, ChevronDown, ChevronRight } from "lucide-react";
import { MDXRenderer } from "@/components/MDXRenderer";
import { DownloadButton } from "@/components/DownloadButton";
import { useLocale } from "@/contexts/LocaleContext";
import type { DocContent } from "@/lib/docs";

interface Props {
  doc: DocContent;
  rawContent: string;
}

export function DocDetailClient({ doc, rawContent }: Props) {
  const { t } = useLocale();

  return (
    <div className="max-w-3xl mx-auto">
      {/* 操作栏 */}
      <div
        className="flex items-center justify-between px-4 h-10 border-b border-[var(--color-border)]
        bg-[var(--color-navbar-bg)] backdrop-blur-xl sticky top-[var(--navbar-height)] z-10"
      >
        <Link
          href="/docs"
          className="inline-flex items-center gap-1.5 text-[13px] text-[var(--color-text-secondary)]
            hover:text-[var(--color-accent)] transition-colors no-underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t("common.backToList")}</span>
        </Link>

        <div className="flex items-center gap-1.5">
          <CopyDropdown rawContent={rawContent} />
          <DownloadButton
            filename={doc.meta.id}
            getContent={() => rawContent}
          />
        </div>
      </div>

      {/* 文档内容 */}
      <div className="px-5 pt-6 pb-16">
        {/* 面包屑 */}
        <nav className="flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)] mb-5">
          <Link href="/docs" className="hover:text-[var(--color-accent)] transition-colors no-underline">
            {t("doc.home")}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[var(--color-text-secondary)]">{doc.meta.title}</span>
        </nav>

        {/* 作者 / 时间 */}
        {(doc.meta.author || doc.meta.updatedAt) && (
          <div className="flex items-center gap-3 text-xs text-[var(--color-text-tertiary)] mb-5">
            {doc.meta.author && <span>{doc.meta.author}</span>}
            {doc.meta.updatedAt && (
              <span>{t("doc.updatedAt", { date: doc.meta.updatedAt })}</span>
            )}
          </div>
        )}

        <div
          className="prose prose-slate dark:prose-invert max-w-none text-[14px] leading-relaxed
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
          <MDXRenderer source={doc.rawContent} />
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
    .replace(/[#*`~>\[\]()!_|{}.<>&-]/g, "")
    .replace(/\n{2,}/g, "\n\n")
    .trim();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-[var(--radius)] text-[13px]
          text-[var(--color-text-secondary)]
          hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]
          transition-colors"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
        <span className="hidden sm:inline">{copied ? t("code.copied") : t("code.copy")}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-36 py-1 rounded-[var(--radius)] border border-[var(--color-border)]
          bg-[var(--color-bg-primary)] shadow-lg z-50 animate-[slideUp_0.12s_ease]">
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
        <div className="absolute right-0 top-full mt-2 px-3 py-1.5 rounded-[var(--radius)] text-[12px] text-white
          bg-[var(--color-toast-bg)] shadow-lg z-50 whitespace-nowrap animate-[fadeIn_0.15s_ease]">
          {toastMsg}
        </div>
      )}
    </div>
  );
}