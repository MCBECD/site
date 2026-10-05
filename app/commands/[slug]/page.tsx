import type { Metadata } from "next";
import { buildDocDetailMetadata } from "@/app/doc/docMetadata";
import { DocDetailView } from "@/app/doc/DocDetailView";
import { getAllDocs } from "@/lib/docs";

interface CommandDetailProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllDocs()
    .filter((d) => d.category === "commands")
    .map((d) => ({ slug: d.id.slice("commands/".length) }));
}

export async function generateMetadata({ params }: CommandDetailProps): Promise<Metadata> {
  const { slug } = await params;
  return buildDocDetailMetadata(`commands/${slug}`);
}

export default async function CommandDetailPage({ params }: CommandDetailProps) {
  const { slug } = await params;
  return <DocDetailView docId={`commands/${slug}`} />;
}