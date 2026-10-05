"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Modal } from "./Modal";

export function DetailModal() {
  const { isDetailOpen, detailArticle, closeDetail } = useAuth();

  if (!isDetailOpen || !detailArticle) return null;

  const createdDate = detailArticle.created_at
    ? new Date(detailArticle.created_at).toLocaleString("zh-CN", { dateStyle: "medium", timeStyle: "short" })
    : "";

  return (
    <Modal onClose={closeDetail} title={detailArticle.title}>
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-[12px] text-[var(--color-text-tertiary)]">
          {createdDate && <span>{createdDate}</span>}
        </div>
        <div className="max-h-[50vh] overflow-y-auto prose prose-sm dark:prose-invert text-[14px] leading-relaxed text-[var(--color-text-primary)] whitespace-pre-wrap break-words">
          {detailArticle.content}
        </div>
      </div>
    </Modal>
  );
}