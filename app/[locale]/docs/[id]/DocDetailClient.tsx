"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { MDXRenderer } from "@/components/MDXRenderer";
import { CopyButton } from "@/components/CopyButton";
import { DownloadButton } from "@/components/DownloadButton";
import { useDocTitle } from "@/contexts/DocTitleContext";
import type { DocContent, DocMeta } from "@/lib/docs";

interface DocDetailClientProps {
  doc: DocContent;
  locale: string;
  rawContent: string;
  prevDoc: DocMeta | null;
  nextDoc: DocMeta | null;
}

export function DocDetailClient({ doc, locale, rawContent, prevDoc, nextDoc }: DocDetailClientProps) {
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
      <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--color-border)]
        bg-[var(--color-bg-primary)]/80 backdrop-blur-sm sticky top-[var(--navbar-height)] z-10">
        <Link
          href="/docs"
          locale={locale}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)]
            hover:text-[var(--color-accent)] transition-colors no-underline"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("doc.backToDocs")}
        </Link>

        <div className="flex items-center gap-2">
          <CopyButton
            getText={() => extractPlainText(rawContent)}
            label={t("doc.copyButton")}
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

      {/* 上一篇/下一篇导航 */}
      {(prevDoc || nextDoc) && (
        <div className="px-6 pb-10 flex items-center justify-between gap-4">
          {prevDoc ? (
            <Link
              href={`/docs/${prevDoc.id}`}
              locale={locale}
              className="flex items-start gap-2 p-3 rounded-lg border border-[var(--color-border)]
                hover:border-[var(--color-accent)] hover:bg-[var(--color-sidebar-active)]
                transition-all no-underline flex-1 min-w-0"
            >
              <ChevronLeft className="w-4 h-4 text-[var(--color-accent)] shrink-0 mt-0.5" />
              <div className="min-w-0 text-left">
                <div className="text-xs text-[var(--color-text-tertiary)]">
                  {t("doc.prevPage")}
                </div>
                <div className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                  {prevDoc.title}
                </div>
              </div>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
          {nextDoc ? (
            <Link
              href={`/docs/${nextDoc.id}`}
              locale={locale}
              className="flex items-start justify-end gap-2 p-3 rounded-lg border border-[var(--color-border)]
                hover:border-[var(--color-accent)] hover:bg-[var(--color-sidebar-active)]
                transition-all no-underline flex-1 min-w-0"
            >
              <div className="min-w-0 text-right">
                <div className="text-xs text-[var(--color-text-tertiary)]">
                  {t("doc.nextPage")}
                </div>
                <div className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                  {nextDoc.title}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--color-accent)] shrink-0 mt-0.5" />
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </div>
      )}
    </div>
  );
}

function extractPlainText(mdx: string): string {
  return mdx
    .replace(/---[\s\S]*?---/, "")     // remove frontmatter
    .replace(/[#*`~>\[\]()!_|{}.<>&-]/g, "") // remove markdown syntax
    .replace(/\n{2,}/g, "\n\n")
    .trim();
}
