import { notFound } from "next/navigation";
import { getDocById, getDocRawContent, getAllDocs } from "@/lib/docs";
import { DocDetailClient } from "./DocDetailClient";
import { MDXRenderer } from "@/components/MDXRenderer";
import type { Metadata } from "next";

const SITE_URL = "https://mcbecd.pages.dev";

interface Props {
  params: Promise<{ id: string[] }>;
}

export async function generateStaticParams() {
  const docs = getAllDocs();
  return docs.map((doc) => ({ id: doc.id.split("/") }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const docId = id.join("/");
  const doc = getDocById(docId);
  if (!doc) return { title: "404" };

  const title = doc.meta.title;
  const description =
    doc.meta.description ??
    `${title} — Minecraft 基岩版命令详解，包含语法、参数和示例`;
  const url = `${SITE_URL}/docs/${docId}/`;
   const keywords = [
    "Minecraft",
    "基岩版",
    "Bedrock",
    "命令",
    "command",
    ...(doc.meta.tags ?? []),
  ];

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      siteName: "MCBECD",
      modifiedTime: doc.meta.updatedAt,
      authors: doc.meta.author ? [doc.meta.author] : undefined,
      tags: doc.meta.tags,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function DocDetailPage({ params }: Props) {
  const { id } = await params;
  const docId = id.join("/");

  const doc = getDocById(docId);
  if (!doc) notFound();

  const rawContent = getDocRawContent(docId) ?? "";
  const url = `${SITE_URL}/docs/${docId}/`;

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: doc.meta.title,
    description:
      doc.meta.description ??
      `${doc.meta.title} — Minecraft 基岩版命令详解`,
    url,
    inLanguage: "zh-CN",
    dateModified: doc.meta.updatedAt,
    author: doc.meta.author
      ? { "@type": "Person", name: doc.meta.author }
      : undefined,
    isPartOf: {
      "@type": "WebSite",
      name: "MCBECD",
      url: SITE_URL,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "首页",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "命令文档",
        item: `${SITE_URL}/docs/`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: doc.meta.title,
        item: url,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <DocDetailClient doc={doc} rawContent={rawContent}>
        <MDXRenderer source={doc.rawContent} />
      </DocDetailClient>
    </>
  );
}
