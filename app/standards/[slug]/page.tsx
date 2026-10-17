import type { Metadata } from "next";
import { buildDocDetailMetadata } from "@/app/doc/docMetadata";
import { DocDetailView } from "@/app/doc/DocDetailView";
import { getAllDocs } from "@/lib/docs";

interface StandardsDetailProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllDocs()
    .filter((d) => d.category === "standards")
    .map((d) => ({ slug: d.id.slice("standards/".length) }));
}

export async function generateMetadata({ params }: StandardsDetailProps): Promise<Metadata> {
  const { slug } = await params;
  return buildDocDetailMetadata(`standards/${slug}`);
}

export default async function StandardsDetailPage({ params }: StandardsDetailProps) {
  const { slug } = await params;
  return <DocDetailView docId={`standards/${slug}`} />;
}
