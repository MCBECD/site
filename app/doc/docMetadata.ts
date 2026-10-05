import type { Metadata } from "next";
import { getDocById } from "@/lib/docs";
import { docIdToUrl } from "@/lib/docUrl";

const SITE_URL = "https://mcbecd.pages.dev";

export async function buildDocDetailMetadata(docId: string): Promise<Metadata> {
  const doc = getDocById(docId);
  if (!doc) return { title: "404" };

  const title = doc.meta.title;
  const description = doc.meta.description ?? `${title} — Minecraft Bedrock command reference with syntax, parameters and examples`;
  const url = `${SITE_URL}${docIdToUrl(docId)}`;
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
      authors: doc.meta.author ? [doc.meta.author] : undefined,
      tags: doc.meta.tags,
    },
    twitter: { card: "summary", title, description },
  };
}