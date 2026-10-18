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
      <div className="max-w-3xl mx-auto px-[var(--content-gutter)] pt-8 pb-24">
        <div className="doc-glass-card overflow-hidden detail-enter">
          <DocDetailClient meta={doc.meta} rawContent={doc.rawContent} />
          {/* @why 正文由 Server Component 直接输出，不进入客户端组件的 props 树。
              注意：RSC 载荷里仍然会有整页元素树（App Router 的文档就是这么发的），
              所以体积降幅只有约 10KB，别拿它当性能优化项看待。 */}
          <div
            className="px-4 sm:px-6 pt-5 pb-8 detail-content-enter prose max-w-none text-[15px] leading-relaxed
            prose-a:no-underline hover:prose-a:underline"
          >
            {/* @why 详情页要显示 ## 章节标题。此前没传 showHeadings，MDRenderer 会把
                h2 渲染成 null，导致唯一使用 ## 分章的规范文档在站内丢失全部大章节标题。 */}
            <MDRenderer source={doc.rawContent} showHeadings />
          </div>
        </div>
      </div>
    </>
  );
}