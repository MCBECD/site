import type { Metadata } from "next";
import { getAllDocs } from "@/lib/docs";
import { LandingPage } from "@/components/landing/LandingPage";

const SITE_URL = "https://mcbecd.pages.dev";
const SITE_TITLE = "MCBECD - Minecraft 基岩版命令库";
const SITE_DESC = "社区贡献的 Minecraft 基岩版命令库 — 可直接复制使用的命令集合，涵盖 give、execute、tp、scoreboard 等核心命令";

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESC,
  alternates: { canonical: `${SITE_URL}/` },
  openGraph: {
    type: "website",
    title: SITE_TITLE,
    description: SITE_DESC,
    url: `${SITE_URL}/`,
    siteName: "MCBECD",
  },
  twitter: {
    card: "summary",
    title: SITE_TITLE,
    description: SITE_DESC,
  },
};

export default function RootPage() {
  const docs = getAllDocs();
  return <LandingPage docsCount={docs.length} />;
}
