"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { publishArticle } from "@/lib/supabase";

const inputClass =
  "w-full px-3.5 py-2.5 text-[13px] rounded-[var(--radius-sm)] " +
  "text-[var(--color-text-primary)] bg-[var(--color-bg-secondary)] " +
  "border border-[var(--color-border)] placeholder:text-[var(--color-text-tertiary)] " +
  "focus:outline-none focus:border-[var(--color-accent)]/50 transition-colors duration-[var(--duration-fast)]";

export default function NewArticlePage() {
  const { user, loading, openLogin } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 作者默认取当前用户邮箱前缀，可手动修改
  useEffect(() => {
    if (user && !author) {
      setAuthor(user.email?.split("@")[0] ?? user.user_metadata?.user_name ?? "匿名");
    }
  }, [user, author]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim()) {
        setError("请输入文章标题");
        return;
      }
      if (!description.trim()) {
        setError("请输入文章描述");
        return;
      }
      if (!content.trim()) {
        setError("请输入文章内容");
        return;
      }
      setSubmitting(true);
      setError(null);
      try {
        const article = await publishArticle({
          user_id: user!.id,
          title: title.trim(),
          author: author.trim() || "匿名",
          description: description.trim(),
          content: content.trim(),
        });
        router.push(`/community/?id=${article.id}`);
      } catch (err) {
        setError((err as Error).message || "发布失败，请重试");
        setSubmitting(false);
      }
    },
    [user, title, author, description, content, router],
  );

  if (!loading && !user) {
    return (
      <div className="relative max-w-3xl mx-auto px-[var(--content-gutter)] pt-14 pb-28">
        <div className="doc-glass-card overflow-hidden detail-enter">
          <div className="flex items-center justify-between h-12 px-3 sm:px-5 border-b border-[var(--color-border-light)]">
            <Link
              href="/?tab=community"
              className="inline-flex items-center gap-1.5 text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-accent)]/60 min-h-[44px]"
            >
              <Home className="w-4 h-4" />
              <span>返回社区</span>
            </Link>
          </div>
          <div className="py-24 text-center">
            <p className="text-[13px] text-[var(--color-text-tertiary)]">
              发布文章需要先登录
            </p>
            <button
              onClick={openLogin}
              className="mt-4 px-5 py-2.5 text-[13px] font-medium rounded-[var(--radius-sm)]
                text-[var(--color-on-accent)] bg-[var(--color-accent)] hover:opacity-90 active:scale-[0.98]
                transition-[opacity,transform] duration-[var(--duration-fast)]"
            >
              去登录
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative max-w-3xl mx-auto px-[var(--content-gutter)] pt-14 pb-28">
      <div className="doc-glass-card overflow-hidden detail-enter">
        <div className="flex items-center justify-between h-12 px-3 sm:px-5 border-b border-[var(--color-border-light)]">
          <Link
            href="/?tab=community"
            className="inline-flex items-center gap-1.5 text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-accent)]/60 min-h-[44px]"
          >
            <Home className="w-4 h-4" />
            <span>返回社区</span>
          </Link>
          <span className="text-[13px] font-medium text-[var(--color-text-primary)]">
            发布新文章
          </span>
        </div>

        <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-6 space-y-4">
          <div>
            <label className="block text-[12px] text-[var(--color-text-secondary)] mb-1.5">
              标题
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="文章标题"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-[12px] text-[var(--color-text-secondary)] mb-1.5">
              作者
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="作者"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-[12px] text-[var(--color-text-secondary)] mb-1.5">
              描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="一句话描述文章内容"
              rows={2}
              className={`${inputClass} resize-none leading-relaxed`}
            />
          </div>

          <div>
            <label className="block text-[12px] text-[var(--color-text-secondary)] mb-1.5">
              内容（支持 Markdown）
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="输入 Markdown 内容..."
              rows={12}
              className={`${inputClass} resize-y min-h-[160px] leading-relaxed`}
            />
          </div>

          {error && (
            <p className="text-[12px] text-red-500" role="alert">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={submitting || loading}
              className="flex-1 py-2.5 text-[13px] font-medium rounded-[var(--radius-sm)]
                text-[var(--color-on-accent)] bg-[var(--color-accent)]
                hover:opacity-90 active:scale-[0.98]
                disabled:opacity-60 disabled:active:scale-100
                transition-[opacity,transform] duration-[var(--duration-fast)]"
            >
              {submitting ? "发布中..." : "发布"}
            </button>
            <Link
              href="/?tab=community"
              className="px-4 py-2.5 text-[13px] rounded-[var(--radius-sm)]
                text-[var(--color-text-secondary)] bg-[var(--color-bg-tertiary)]
                hover:text-[var(--color-text-primary)]
                transition-colors duration-[var(--duration-fast)] no-underline"
            >
              取消
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}