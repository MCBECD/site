"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { MDXRenderer } from "@/components/MDXRenderer";
import { CopyButton } from "@/components/CopyButton";
import { DownloadButton } from "@/components/DownloadButton";
import { useDocTitle } from "@/contexts/DocTitleContext";
import { DocSkeleton } from "@/components/Skeleton";
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
