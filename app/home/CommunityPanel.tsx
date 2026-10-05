"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchArticles, type ArticleSummary } from "@/lib/supabase";

const PAGE_SIZE = 20;

export function CommunityPanel() {
  const router = useRouter();
  const { user, openLogin } = useAuth();
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, total: t } = await fetchArticles({ limit: PAGE_SIZE, offset: 0 });
      setArticles(data);
      setTotal(t);
    } catch (err) {
      setError((err as Error).message || "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    setError(null);
    try {
      const { data } = await fetchArticles({ limit: PAGE_SIZE, offset: articles.length });
      setArticles((prev) => [...prev, ...data]);
    } catch (err) {
      setError((err as Error).message || "加载失败");
    } finally {
      setLoadingMore(false);
    }
  }, [articles.length]);

  useEffect(() => {
    load();
  }, [load]);

  const handleWriteClick = useCallback(() => {
    if (!user) {
      openLogin();
    } else {
      router.push("/new");
    }
  }, [user, openLogin, router]);

  const hasMore = articles.length < total;

  return (
    <div className="relative max-w-3xl mx-auto px-[var(--content-gutter)] pt-14 pb-28">
      <div className="mb-10">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--color-text-primary)] hero-enter mt-4">
              社区文档
            </h1>
            <p className="text-[15px] text-[var(--color-text-tertiary)] mt-3 hero-sub-enter max-w-lg leading-relaxed">
              由社区用户分享的文章，点击右上角「发布文章」即可发布新文档
            </p>
          </div>
          <button
            onClick={handleWriteClick}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 text-[13px] font-medium rounded-full
              text-[var(--color-on-accent)] bg-[var(--color-accent)]
              hover:opacity-90 active:scale-[0.97]
              transition-[opacity,transform] duration-[var(--duration-fast)]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">发布文章</span>
          </button>
        </div>
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
      ) : articles.length === 0 ? (
        <div className="py-24 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--color-bg-tertiary)] mb-4">
            <FileText className="w-[18px] h-[18px] text-[var(--color-text-tertiary)]" />
          </div>
          <p className="text-[13px] text-[var(--color-text-tertiary)]">
            还没有文章，快来发布第一篇吧
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/community/?id=${article.id}`}
              className="block w-full px-5 py-4 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-card-bg)] hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-bg-tertiary)] transition-colors duration-[var(--duration-fast)] no-underline"
            >
              <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)]">
                {article.title}
              </h3>
              <div className="flex items-center gap-2 mt-2 text-[12px] text-[var(--color-text-tertiary)]">
                {article.author && <span>{article.author}</span>}
                {article.created_at && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>
                      {new Date(article.created_at).toLocaleDateString("zh-CN")}
                    </span>
                  </>
                )}
              </div>
              <p className="mt-2 text-[13px] text-[var(--color-text-secondary)] line-clamp-2">
                {article.description}
              </p>
            </Link>
          ))}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-5 py-2 text-[12px] font-medium rounded-full
              text-[var(--color-text-secondary)] bg-[var(--color-bg-tertiary)]
              hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)]
              disabled:opacity-60 transition-colors duration-[var(--duration-fast)]"
          >
            {loadingMore ? "加载中..." : "加载更多"}
          </button>
        </div>
      )}
    </div>
  );
}