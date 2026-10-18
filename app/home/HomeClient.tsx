"use client";

import type { DocMeta } from "@/lib/docs";
import { DocsPanel } from "./DocsPanel";

/**
 * @why 站点唯一内容源是 Git 子模块 content/docs。社区文档与命令/基础文档同源
 * （content/docs/community/），由 DocsPanel 的社区分区渲染；站点没有数据库，
 * 也没有需要客户端鉴权的 tab 切换。
 *
 * @constraint docs 由 app/page.tsx（Server Component）读好后以 props 传入，
 * 客户端不要再通过 context 取一次——那会把全量元数据塞进每一页的 RSC 载荷。
 */
export function HomeClient({ docs }: { docs: DocMeta[] }) {
  return <DocsPanel docs={docs} />;
}
