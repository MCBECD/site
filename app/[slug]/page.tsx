import type { Metadata } from "next";
import { buildDocDetailMetadata } from "@/app/doc/docMetadata";
import { DocDetailView } from "@/app/doc/DocDetailView";
import { getAllDocs } from "@/lib/docs";

interface BasicsDetailProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllDocs()
    .filter((d) => d.category === "basics")
    .map((d) => ({ slug: d.id.slice("basics/".length) }));
}

export async function generateMetadata({ params }: BasicsDetailProps): Promise<Metadata> {
  const { slug } = await params;
  return buildDocDetailMetadata(`basics/${slug}`);
}

export default async function BasicsDetailPage({ params }: BasicsDetailProps) {
  const { slug } = await params;
  return <DocDetailView docId={`basics/${slug}`} />;
}