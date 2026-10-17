import type { Metadata } from "next";
import { buildDocDetailMetadata } from "@/app/doc/docMetadata";
import { DocDetailView } from "@/app/doc/DocDetailView";
import { getAllDocs } from "@/lib/docs";

interface CommunityDetailProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllDocs()
    .filter((d) => d.category === "community")
    .map((d) => ({ slug: d.id.slice("community/".length) }));
}

export async function generateMetadata({ params }: CommunityDetailProps): Promise<Metadata> {
  const { slug } = await params;
  return buildDocDetailMetadata(`community/${slug}`);
}

export default async function CommunityDetailPage({ params }: CommunityDetailProps) {
  const { slug } = await params;
  return <DocDetailView docId={`community/${slug}`} />;
}
