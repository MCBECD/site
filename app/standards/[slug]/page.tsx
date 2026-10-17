import type { Metadata } from "next";
import { buildDocDetailMetadata } from "@/app/doc/docMetadata";
import { DocDetailView } from "@/app/doc/DocDetailView";
import { getAllDocs } from "@/lib/docs";

interface StandardsDetailProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const docs = getAllDocs().filter((d) => d.category === "standards");
  /**
   * @why output: export 下动态路由至少要产出一个页面，返回空数组会让 next build
   * 直接失败、带崩整站。子模块 content/docs 的版本落后（还没有 standards/ 目录）时
   * 就会走到这里，所以返回一个占位 slug；页面内 getDocById 拿不到会走 notFound()。
   */
  if (docs.length === 0) return [{ slug: "README" }];
  return docs.map((d) => ({ slug: d.id.slice("standards/".length) }));
}

export async function generateMetadata({ params }: StandardsDetailProps): Promise<Metadata> {
  const { slug } = await params;
  return buildDocDetailMetadata(`standards/${slug}`);
}

export default async function StandardsDetailPage({ params }: StandardsDetailProps) {
  const { slug } = await params;
  return <DocDetailView docId={`standards/${slug}`} />;
}
