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
  const description = doc.meta.description ?? `${title} — Minecraft Bedrock command reference with syntax, parameters and examples`;
  const url = `${SITE_URL}/docs/${docId}/`;
  const keywords = ["Minecraft", "Bedrock", "command", "MCBECD", ...(doc.meta.tags ?? [])];

  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      siteName: "MCBECD",
      modifiedTime: doc.meta.updatedAt,
      // TODO(seo): Add publishedTime once createdAt is tracked in DocMeta frontmatter.
      authors: doc.meta.author ? [doc.meta.author] : undefined,
      tags: doc.meta.tags,
      // TODO(seo): Add images array once an OG image is created.
    },
    twitter: { card: "summary", title, description },
  };
}

export default async function DocDetailPage({ params }: Props) {
  const { id } = await params;
  const docId = id.join("/");

  const doc = getDocById(docId);
  if (!doc) notFound();

  const rawFileContent = getDocRawContent(docId) ?? "";
  const url = `${SITE_URL}/docs/${docId}/`;

  // TODO(seo-locale): inLanguage should be dynamically set per locale.
  // Currently hardcoded to zh-CN because metadata is server-rendered with no locale context.
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: doc.meta.title,
    description: doc.meta.description ?? `${doc.meta.title} — Minecraft Bedrock command reference`,
    url,
    inLanguage: "zh-CN",
    dateModified: doc.meta.updatedAt,
    author: doc.meta.author ? { "@type": "Person", name: doc.meta.author } : undefined,
    isPartOf: { "@type": "WebSite", name: "MCBECD", url: SITE_URL },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Commands", item: `${SITE_URL}/docs/` },
      { "@type": "ListItem", position: 3, name: doc.meta.title, item: url },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <DocDetailClient doc={doc} rawContent={rawFileContent}>
        <MDXRenderer source={doc.rawContent} />
      </DocDetailClient>
    </>
  );
}
