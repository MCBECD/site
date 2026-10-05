"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Home } from "lucide-react";
import { fetchArticleById, type Article } from "@/lib/supabase";
import { MDRenderer } from "@/components/MDRenderer";

export function CommunityDetailClient() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const numericId = Number(id);
      if (!Number.isFinite(numericId)) throw new Error("无效的文章 ID");
      const found = await fetchArticleById(numericId);
      if (found) setArticle(found);
      else setError("文章不存在或已被删除");
    } catch (err) {
      setError((err as Error).message || "加载失败");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const createdDate = article?.created_at
    ? new Date(article.created_at).toLocaleDateString("zh-CN")
    : "";

  return (
    <div className="max-w-3xl mx-auto px-[var(--content-gutter)] pt-8 pb-24">
      <div className="doc-glass-card overflow-hidden detail-enter">
        {/* Top action bar */}
        <div className="flex items-center justify-between h-12 px-3 sm:px-5 border-b border-[var(--color-border-light)]">
          <Link
            href="/?tab=community"
            className="inline-flex items-center gap-1.5 text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-accent)]/60 min-h-[44px]"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">返回社区</span>
          </Link>
        </div>

        {loading ? (
          <div className="py-24 text-center text-[13px] text-[var(--color-text-tertiary)]">
            加载中...
          </div>
        ) : error ? (
          <div className="py-24 text-center">
            <p className="text-[13px] text-red-500">{error}</p>
            <button
              onClick={load}
              className="mt-3 px-4 py-2 text-[12px] rounded-[var(--radius-sm)] bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            >
              重试
            </button>
          </div>
        ) : article ? (
          <>
            <header className="px-4 sm:px-6 pt-5 sm:pt-6 pb-3">
              <h1 className="text-[20px] sm:text-[22px] font-bold text-[var(--color-text-primary)] tracking-tight leading-tight">
                {article.title}
              </h1>
              <div className="flex items-center gap-2 mt-3 text-[12px] text-[var(--color-text-tertiary)]">
                {article.author && <span>{article.author}</span>}
                {createdDate && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{createdDate}</span>
                  </>
                )}
              </div>
              {article.description && (
                <p className="mt-3 text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
                  {article.description}
                </p>
              )}
            </header>
            <div className="px-4 sm:px-6 pt-5 pb-8 text-[15px] leading-relaxed text-[var(--color-text-primary)]">
              <Suspense fallback={null}>
                <MDRenderer source={article.content} showHeadings />
              </Suspense>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}