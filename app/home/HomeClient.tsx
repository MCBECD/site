"use client";

import { DocsPanel } from "./DocsPanel";

/**
 * @why 站点唯一内容源是 Git 子模块 content/docs。社区文档与命令/基础文档同源
 * （content/docs/community/），由 DocsPanel 的社区分区渲染；站点没有数据库，
 * 也没有需要客户端鉴权的 tab 切换。
 */
export function HomeClient() {
  return <DocsPanel />;
}
