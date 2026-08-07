"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Check, ChevronDown, ChevronRight } from "lucide-react";
import { MDXRenderer } from "@/components/MDXRenderer";
import { DownloadButton } from "@/components/DownloadButton";
import type { DocContent } from "@/lib/docs";

interface Props {
  doc: DocContent;
  rawContent: string;
}

export function DocDetailClient({ doc, rawContent }: Props) {
  return (
    <div className="max-w-4xl mx-auto">
      {/* 操作栏 */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-border)]
        bg-[var(--color-bg-primary)]/80 backdrop-blur-sm sticky top-[var(--navbar-height)] z-10"
      >
        <Link
          href="/docs"
          className="inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)]
            hover:text-[var(--color-accent)] transition-colors no-underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">返回列表</span>
        </Link>

        <div className="flex items-center gap-1.5">
          <CopyDropdown rawContent={rawContent} />
          <DownloadButton
            filename={doc.meta.id}
            getContent={() => rawContent}
            label="下载"
          />
        </div>
      </div>

      {/* 文档内容 */}
      <div className="px-4 py-6">
        {/* 面包屑导航 */}
        <nav className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)] mb-4">
          <Link href="/docs" className="hover:text-[var(--color-accent)] transition-colors no-underline text-[var(--color-text-tertiary)]">
            首页
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[var(--color-text-secondary)]">{doc.meta.title}</span>
        </nav>

        {/* 作者 / 时间 */}
        {(doc.meta.author || doc.meta.updatedAt) && (
          <div className="flex items-center gap-3 text-xs text-[var(--color-text-tertiary)] mb-4">
            {doc.meta.author && <span>{doc.meta.author}</span>}
            {doc.meta.updatedAt && <span>更新于 {doc.meta.updatedAt}</span>}
          </div>
        )}

        <div
          className="prose prose-slate dark:prose-invert max-w-none
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
        className="inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-md text-sm
          bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]
          hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]
          transition-colors"
      >
        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        <span className="hidden sm:inline">{copied ? "已复制" : "复制"}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-36 py-1 rounded-md border border-[var(--color-border)]
          bg-[var(--color-bg-primary)] shadow-lg z-50">
          <button
            onClick={() => doCopy(rawContent, "已复制 MD 到剪贴板")}
            className="w-full text-left px-3 py-2 text-sm text-[var(--color-text-secondary)]
              hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            复制 MD
          </button>
          <button
            onClick={() => doCopy(plainText, "已复制纯文本到剪贴板")}
            className="w-full text-left px-3 py-2 text-sm text-[var(--color-text-secondary)]
              hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            复制纯文本
          </button>
        </div>
      )}

      {/* Toast 提示 */}
      {toastMsg && (
        <div className="absolute right-0 top-full mt-2 px-3 py-2 rounded-md text-xs text-white
          bg-gray-800 dark:bg-gray-700 shadow-lg z-50 whitespace-nowrap animate-[fadeIn_0.15s_ease]">
          {toastMsg}
        </div>
      )}
    </div>
  );
}