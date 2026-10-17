import fs from "node:fs";
import path from "node:path";

const SITE_URL = "https://mcbecd.pages.dev";
const DOCS_DIR = path.join(process.cwd(), "content", "docs");
const OUT_DIR = path.join(process.cwd(), "public");

/**
 * Escape special XML characters to produce valid XML output.
 * Prevents broken sitemaps if doc IDs or metadata contain &, <, >, etc.
 */
function escapeXml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function parseFrontmatter(str) {
  const m = str.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const data = {};
  for (const line of m[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    data[key] = val;
  }
  return data;
}

function scanDocs(dir, prefix) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (
      entry.name.startsWith(".") ||
      entry.name === "README.md" ||
      entry.name === "CONTRIBUTING.md" ||
      entry.name === "LICENSE"
    ) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
        results.push(
          ...scanDocs(fullPath, prefix ? `${prefix}/${entry.name}` : entry.name)
        );
    } else if (entry.name.endsWith(".md")) {
      const raw = fs.readFileSync(fullPath, "utf-8");
      const data = parseFrontmatter(raw);
      const docId = prefix
        ? `${prefix}/${entry.name.replace(/\.md$/, "")}`
        : entry.name.replace(/\.md$/, "");
      results.push({
        id: docId,
        updatedAt: data.updatedAt || "",
        hidden: data.hidden === "true",
      });
    }
  }

  return results;
}

fs.mkdirSync(OUT_DIR, { recursive: true });
const docs = scanDocs(DOCS_DIR, "");
const today = new Date().toISOString().split("T")[0];

const urls = [];
urls.push(`  <url><loc>${escapeXml(SITE_URL)}/</loc><lastmod>${today}</lastmod><priority>1.0</priority></url>`);
urls.push(`  <url><loc>${escapeXml(SITE_URL)}/hidden/</loc><lastmod>${today}</lastmod><priority>0.5</priority></url>`);

for (const doc of docs) {
  // @why hidden 文档（目前只有规范）站内仅从 /hidden/ 入口可达，不该出现在 sitemap。
  // 旧代码这里按 "community 来自 Supabase" 跳过社区文档——那个假设早就不成立了，
  // 社区文档就在 content/docs/community/ 里，被整批漏收录。
  if (doc.hidden) continue;
  const lastmod = doc.updatedAt ? doc.updatedAt.split("T")[0] : today;
  // basics/<name> → /<name>/ ; commands/<name> → /commands/<name>/
  const locUrl = doc.id.startsWith("basics/")
    ? `/${doc.id.slice("basics/".length)}/`
    : `/${doc.id}/`;
  urls.push(
    `  <url><loc>${escapeXml(SITE_URL)}${escapeXml(locUrl)}</loc><lastmod>${escapeXml(lastmod)}</lastmod><priority>0.8</priority></url>`
  );
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

fs.writeFileSync(path.join(OUT_DIR, "sitemap.xml"), sitemap, "utf-8");
console.log(`sitemap.xml: ${urls.length} URLs generated`);

const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

fs.writeFileSync(path.join(OUT_DIR, "robots.txt"), robots, "utf-8");
console.log("robots.txt generated");