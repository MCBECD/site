import { getAllDocs } from "@/lib/docs";
import DocsPageClient from "./DocsPageClient";
import type { DocMeta } from "@/lib/docs";

export default function DocsPage() {
  const docs: DocMeta[] = getAllDocs();
  return <DocsPageClient docs={docs} />;
}
