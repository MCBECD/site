import { notFound } from "next/navigation";
import { getDocById, getDocRawContent, getAllDocs } from "@/lib/docs";
import { DocDetailClient } from "./DocDetailClient";

interface Props {
  params: Promise<{ id: string[] }>;
}

export async function generateStaticParams() {
  const docs = getAllDocs();
  return docs.map((doc) => ({ id: doc.id.split("/") }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const docId = id.join("/");
  const doc = getDocById(docId);
  if (!doc) return { title: "404" };
  return { title: `${doc.meta.title} - MCBECD` };
}

export default async function DocDetailPage({ params }: Props) {
  const { id } = await params;
  const docId = id.join("/");

  const doc = getDocById(docId);
  if (!doc) notFound();

  const rawContent = getDocRawContent(docId) ?? "";

  return (
    <DocDetailClient
      doc={doc}
      rawContent={rawContent}
    />
  );
}
