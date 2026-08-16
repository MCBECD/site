import { Suspense } from "react";
import type { Metadata } from "next";
import { HiddenPageClient } from "./HiddenPageClient";

const SITE_URL = "https://mcbecd.pages.dev";
const HIDDEN_TITLE = "文档标准规范";
const HIDDEN_DESC = "MCBECD 文档标准规范 — Frontmatter 规范、标签体系、命名规则、文档结构等全部标准文档";

export const metadata: Metadata = {
  title: HIDDEN_TITLE,
  description: HIDDEN_DESC,
  alternates: {
    canonical: `${SITE_URL}/docs/hidden/`,
  },
  openGraph: {
    title: `${HIDDEN_TITLE} - MCBECD`,
    description: HIDDEN_DESC,
    url: `${SITE_URL}/docs/hidden/`,
    siteName: "MCBECD",
  },
  twitter: {
    card: "summary",
    title: `${HIDDEN_TITLE} - MCBECD`,
    description: HIDDEN_DESC,
  },
};

export default function HiddenPage() {
  return (
    <Suspense>
      <HiddenPageClient />
    </Suspense>
  );
}