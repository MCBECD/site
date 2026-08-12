import { Suspense } from "react";
import type { Metadata } from "next";
import { DocsPageClient } from "./DocsPageClient";

const SITE_URL = "https://mcbecd.pages.dev";
// TODO(seo-locale): Title and description should be locale-aware. The site uses
// client-side i18n with static export, so metadata is always Chinese.
const DOCS_TITLE = "命令文档";
const DOCS_DESC = "MCBECD 全部命令文档 — Minecraft 基岩版命令参考，含语法、参数与示例";

export const metadata: Metadata = {
  title: DOCS_TITLE,
  description: DOCS_DESC,
  alternates: {
    canonical: `${SITE_URL}/docs/`,
  },
  openGraph: {
    title: `${DOCS_TITLE} - MCBECD`,
    description: DOCS_DESC,
    url: `${SITE_URL}/docs/`,
    siteName: "MCBECD",
  },
  twitter: {
    card: "summary",
    title: `${DOCS_TITLE} - MCBECD`,
    description: DOCS_DESC,
  },
};

export default function DocsPage() {
  return (
    <Suspense>
      <DocsPageClient />
    </Suspense>
  );
}
