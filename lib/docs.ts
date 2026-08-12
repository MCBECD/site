import path from "node:path";
import fs from "node:fs";
import matter from "gray-matter";

/* ============================================================
 * MCBECD 命令库文档引擎
 *
 * @/content/docs/**.mdx（元数据在 frontmatter）
 * ============================================================ */

export interface DocMeta {
  id: string;
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  author?: string;
  updatedAt?: string;
}

export interface DocContent {
  meta: DocMeta;
  rawContent: string;
}

/* ----------------------------------------------------------
 * 内部工具
 * ---------------------------------------------------------- */

function getDocsDir(): string {
  return path.join(process.cwd(), "content", "docs");
}

function parseMdxMeta(filePath: string): { frontmatter: Record<string, unknown>; content: string; readingTime: number } | null {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    const wordCount = content.replace(/\s+/g, "").length;
    return { frontmatter: data, content, readingTime: Math.max(1, Math.ceil(wordCount / 400)) };
  } catch (err) {
    console.error(`[docs] Failed to parse MDX: ${filePath}`, err instanceof Error ? err.message : err);
    return null;
  }
}

/** 从 unknown 中安全提取 string，非 string 返回 undefined */
function asString(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

/** 从 unknown 中安全提取 string[]，非数组或元素非 string 返回 undefined */
function asStringArray(v: unknown): string[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const valid = v.filter((t): t is string => typeof t === "string" && t.length > 0);
  return valid.length > 0 ? valid : undefined;
}

function buildMeta(
  id: string,
  fallbackName: string,
  mdxMeta: ReturnType<typeof parseMdxMeta> | null,
): DocMeta | null {
  if (!mdxMeta) return null;

  const fm = mdxMeta.frontmatter;
  return {
    id,
    title: asString(fm.title) ?? fallbackName,
    description: asString(fm.description),
    tags: asStringArray(fm.tags),
    author: asString(fm.author),
    updatedAt: asString(fm.updatedAt),
    category: asString(fm.category),
  };
}

/* ----------------------------------------------------------
 * 递归扫描
 * ---------------------------------------------------------- */

function scanDirectory(dir: string, prefix: string): DocMeta[] {
  const results: DocMeta[] = [];
  let entries: fs.Dirent[];

  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (err) {
    console.error(`[docs] Failed to scan directory: ${dir}`, err instanceof Error ? err.message : err);
    return results;
  }

  for (const entry of entries) {
    if (entry.name.startsWith(".") || ["README.md", "CONTRIBUTING.md", "LICENSE"].includes(entry.name)) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    const id = prefix ? `${prefix}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      results.push(...scanDirectory(fullPath, id));
    } else if (entry.name.endsWith(".mdx")) {
      const docId = prefix ? `${prefix}/${entry.name.replace(/\.mdx$/, "")}` : entry.name.replace(/\.mdx$/, "");
      const mdxMeta = parseMdxMeta(fullPath);
      const meta = buildMeta(docId, docId, mdxMeta);
      if (meta) results.push(meta);
    }
  }

  return results;
}

/* ----------------------------------------------------------
 * 公共 API
 * ---------------------------------------------------------- */

/** 获取所有文档元数据 */
export function getAllDocs(): DocMeta[] {
  const docsDir = getDocsDir();
  if (!fs.existsSync(docsDir)) return [];
  return scanDirectory(docsDir, "");
}

/** 根据 ID 获取文档内容，null 表示不存在 */
export function getDocById(id: string): DocContent | null {
  const docsDir = getDocsDir();

  const flatPath = path.join(docsDir, `${id}.mdx`);
  if (fs.existsSync(flatPath)) {
    const mdxMeta = parseMdxMeta(flatPath);
    const meta = buildMeta(id, id, mdxMeta);
    if (!meta) return null;
    return { meta, rawContent: mdxMeta?.content ?? "" };
  }

  return null;
}

/** 获取文档原始文件内容（含 frontmatter）用于下载 */
export function getDocRawContent(id: string): string | null {
  const docsDir = getDocsDir();

  try {
    const flatPath = path.join(docsDir, `${id}.mdx`);
    if (fs.existsSync(flatPath)) return fs.readFileSync(flatPath, "utf-8");
  } catch (err) {
    console.error(`[docs] Failed to read raw content for: ${id}`, err instanceof Error ? err.message : err);
  }

  return null;
}