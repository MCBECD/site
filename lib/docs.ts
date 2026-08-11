import path from "node:path";
import fs from "node:fs";
import matter from "gray-matter";

/* ============================================================
 * MCBECD 命令库文档引擎
 *
 * 支持两种格式：
 *   - 扁平 .mdx：content/docs/{id}.mdx（元数据在 frontmatter）
 *   - 文件夹：content/docs/{id}/index.mdx + meta.json
 *
 * meta.json 字段会覆盖 frontmatter 中的同名字段。
 * ============================================================ */

export interface DocMeta {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  author?: string;
  createdAt?: string;
  updatedAt?: string;
  type?: string;
  readingTime?: number;
  category?: string;
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

function readMetaJson(dirPath: string): Record<string, unknown> | null {
  try {
    const raw = fs.readFileSync(path.join(dirPath, "meta.json"), "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error(`[docs] Failed to parse meta.json: ${dirPath}`, err instanceof Error ? err.message : err);
    }
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
  jsonMeta: Record<string, unknown> | null,
): DocMeta | null {
  const hasAny = mdxMeta || jsonMeta;
  if (!hasAny) return null;

  const fm = mdxMeta?.frontmatter ?? {};
  return {
    id,
    title: asString(jsonMeta?.title) ?? asString(fm.title) ?? fallbackName,
    description: asString(jsonMeta?.description) ?? asString(fm.description),
    tags: asStringArray(jsonMeta?.tags) ?? asStringArray(fm.tags),
    author: asString(jsonMeta?.author) ?? asString(fm.author),
    createdAt: asString(jsonMeta?.createdAt) ?? asString(fm.createdAt),
    updatedAt: asString(jsonMeta?.updatedAt) ?? asString(fm.updatedAt),
    type: asString(jsonMeta?.type) ?? asString(fm.type),
    readingTime: mdxMeta?.readingTime,
    category: asString(jsonMeta?.category) ?? asString(fm.category),
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
    // 跳过非内容文件
    if (entry.name.startsWith(".") || ["README.md", "CONTRIBUTING.md", "LICENSE"].includes(entry.name)) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    const id = prefix ? `${prefix}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      const indexPath = path.join(fullPath, "index.mdx");
      if (fs.existsSync(indexPath)) {
        const mdxMeta = parseMdxMeta(indexPath);
        const jsonMeta = readMetaJson(fullPath);
        const meta = buildMeta(id, entry.name, mdxMeta, jsonMeta);
        if (meta) results.push(meta);
      } else {
        results.push(...scanDirectory(fullPath, id));
      }
    } else if (entry.name.endsWith(".mdx")) {
      const docId = prefix ? `${prefix}/${entry.name.replace(/\.mdx$/, "")}` : entry.name.replace(/\.mdx$/, "");
      const mdxMeta = parseMdxMeta(fullPath);
      const meta = buildMeta(docId, docId, mdxMeta, null);
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

  // Folder format: content/docs/{id}/index.mdx
  const folderPath = path.join(docsDir, id);
  const indexPath = path.join(folderPath, "index.mdx");
  if (fs.existsSync(indexPath)) {
    const mdxMeta = parseMdxMeta(indexPath);
    const jsonMeta = readMetaJson(folderPath);
    const meta = buildMeta(id, id.split("/").pop() ?? id, mdxMeta, jsonMeta);
    if (!meta) return null;
    return { meta, rawContent: mdxMeta?.content ?? "" };
  }

  // Flat format: content/docs/{id}.mdx
  const flatPath = path.join(docsDir, `${id}.mdx`);
  if (fs.existsSync(flatPath)) {
    const mdxMeta = parseMdxMeta(flatPath);
    const meta = buildMeta(id, id, mdxMeta, null);
    if (!meta) return null;
    return { meta, rawContent: mdxMeta?.content ?? "" };
  }

  return null;
}

/** 获取文档原始文件内容（含 frontmatter）用于下载 */
export function getDocRawContent(id: string): string | null {
  const docsDir = getDocsDir();

  try {
    const folderPath = path.join(docsDir, id);
    const indexPath = path.join(folderPath, "index.mdx");
    if (fs.existsSync(indexPath)) return fs.readFileSync(indexPath, "utf-8");

    const flatPath = path.join(docsDir, `${id}.mdx`);
    if (fs.existsSync(flatPath)) return fs.readFileSync(flatPath, "utf-8");
  } catch (err) {
    console.error(`[docs] Failed to read raw content for: ${id}`, err instanceof Error ? err.message : err);
  }

  return null;
}