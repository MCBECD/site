import { Suspense } from "react";
import type { Metadata } from "next";
import DocsPageClient from "./DocsPageClient";

export const metadata: Metadata = {
  title: "命令文档",
  description: "MCBECD 全部命令文档 — Minecraft 基岩版命令参考，含语法、参数与示例",
  alternates: {
    canonical: "https://mcbecd.pages.dev/docs/",
  },
  openGraph: {
    title: "命令文档 - MCBECD",
    description: "MCBECD 全部命令文档 — Minecraft 基岩版命令参考，含语法、参数与示例",
    url: "https://mcbecd.pages.dev/docs/",
  },
};

export default function DocsPage() {
  return (
    <Suspense>
      <DocsPageClient />
    </Suspense>
  );
}
