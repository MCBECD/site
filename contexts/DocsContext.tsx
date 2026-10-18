"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

/**
 * @why 根布局只下发"索引"（id/title/category），不下发完整 DocMeta。
 *
 * 全量 DocMeta 含 description/tags/author/updatedAt，35 篇文档约 15KB，会被序列化进
 * **每一个页面**的 RSC 载荷——包括根本用不到列表的文档详情页。真正需要全量元数据的
 * 只有首页与 /hidden，它们由 Server Component 直接以 props 传进列表组件；全局上下文
 * 只服务设置面板的书签/历史标题与命令数统计，用 id+title+category 就够。
 *
 * @constraint 索引必须由 Server Component 侧裁好再传进来。若在这里接收完整 DocMeta 再
 * 裁剪，全量数据已经进入 RSC 载荷了，等于没优化。
 */
export interface DocIndexEntry {
  id: string;
  title: string;
  category: string;
}

interface DocsContextValue {
  index: DocIndexEntry[];
  docMap: Map<string, DocIndexEntry>;
}

const DocsContext = createContext<DocsContextValue | null>(null);

export function DocsProvider({ index, children }: { index: DocIndexEntry[]; children: ReactNode }) {
  const docMap = useMemo(() => new Map(index.map((d) => [d.id, d])), [index]);
  return (
    <DocsContext value={{ index, docMap }}>
      {children}
    </DocsContext>
  );
}

export function useDocs(): DocsContextValue {
  const ctx = useContext(DocsContext);
  if (!ctx) throw new Error("useDocs must be used within DocsProvider");
  return ctx;
}
