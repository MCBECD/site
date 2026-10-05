import { notFound } from "next/navigation";
import { getDocById } from "@/lib/docs";
import { docIdToUrl } from "@/lib/docUrl";
import { DocDetailClient } from "./DocDetailClient";
import { MDRenderer } from "@/components/MDRenderer";

const SITE_URL = "https://mcbecd.pages.dev";

export function DocDetailView({ docId }: { docId: string }) {
  const doc = getDocById(docId);
  if (!doc) notFound();

  const url = `${SITE_URL}${docIdToUrl(docId)}`;

  const WEBPAGE_JSON_LD = {
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

  const BREADCRUMB_JSON_LD = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: doc.meta.title, item: url },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBPAGE_JSON_LD) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_JSON_LD) }} />
      <DocDetailClient doc={doc}>
        <MDRenderer source={doc.rawContent} />
      </DocDetailClient>
    </>
  );
}