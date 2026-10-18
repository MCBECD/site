import { Suspense } from "react";
import type { Metadata } from "next";
import { HomeClient } from "./home/HomeClient";
import { getAllDocs } from "@/lib/docs";

const SITE_URL = "https://mcbecd.pages.dev";
const DOCS_TITLE = "命令库";
const DOCS_DESC = "MCBECD 命令库 — Minecraft 基岩版命令参考，含语法、参数与示例";

export const metadata: Metadata = {
  title: DOCS_TITLE,
  description: DOCS_DESC,
  alternates: {
    canonical: `${SITE_URL}/`,
  },
  openGraph: {
    title: `${DOCS_TITLE} - MCBECD`,
    description: DOCS_DESC,
    url: `${SITE_URL}/`,
    siteName: "MCBECD",
  },
  twitter: {
    card: "summary",
    title: `${DOCS_TITLE} - MCBECD`,
    description: DOCS_DESC,
  },
};

export default function HomePage() {
  /**
   * @why 全量文档元数据在 Server Component 侧读取并以 props 交给列表组件，
   * 不再挂在根布局的 context 上。文档详情页因此不必再为一份用不到的列表
   * 背上约 15KB 的 RSC 载荷。
   */
  const docs = getAllDocs();
  return (
    <Suspense>
      <HomeClient docs={docs} />
    </Suspense>
  );
}