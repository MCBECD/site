import type { MetadataRoute } from "next";
import { getAllDocs } from "@/lib/docs";
import { docIdToUrl } from "@/lib/docUrl";

/**
 * @why sitemap 必须是 Next 内置的 metadata route，不能再用 scripts/generate-sitemap.mjs
 * 写到 public/ 里。Cloudflare Pages 的 Next.js 预设跑的是 `npx next build`，不会执行
 * package.json 的 build 脚本，于是那个前置脚本从未在生产执行过——线上 /sitemap.xml
 * 一直是 404，而 robots.txt 与 <link rel="sitemap"> 都指着它。
 *
 * 放到 app/ 下之后，`next build` 一条命令就能产出 out/sitemap.xml，与谁在构建无关。
 *
 * @constraint 静态导出（output: "export"）下 metadata route 只允许在构建期求值，
 * 不能读 request/headers，否则 build 直接失败。
 */
export const dynamic = "force-static";

const SITE_URL = "https://mcbecd.pages.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const today = new Date().toISOString().split("T")[0]!;

  const entries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: today, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/hidden/`, lastModified: today, changeFrequency: "monthly", priority: 0.5 },
  ];

  for (const doc of getAllDocs()) {
    // @why hidden 文档（目前只有规范）站内仅从 /hidden/ 入口可达，不该出现在 sitemap。
    if (doc.hidden) continue;
    entries.push({
      url: `${SITE_URL}${docIdToUrl(doc.id)}`,
      lastModified: doc.updatedAt ? doc.updatedAt.split("T")[0]! : today,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  return entries;
}
