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
  category?: string;
  pinned?: boolean;
  readingTime?: number;
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
    console.error(`[docs] 解析 MDX 失败: ${filePath}`, err instanceof Error ? err.message : err);
    return null;
  }
}

function readMetaJson(dirPath: string): Record<string, unknown> | null {
  try {
    const raw = fs.readFileSync(path.join(dirPath, "meta.json"), "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error(`[docs] 解析 meta.json 失败: ${dirPath}`, err instanceof Error ? err.message : err);
    }
    return null;
  }
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
    title: (jsonMeta?.title as string) ?? (fm.title as string) ?? fallbackName,
    description: (jsonMeta?.description as string) ?? (fm.description as string) ?? undefined,
    tags: normalizeTags((jsonMeta?.tags as string[]) ?? (fm.tags as string[])),
    author: (jsonMeta?.author as string) ?? (fm.author as string) ?? undefined,
    createdAt: (jsonMeta?.createdAt as string) ?? (fm.createdAt as string) ?? undefined,
    updatedAt: (jsonMeta?.updatedAt as string) ?? (fm.updatedAt as string) ?? undefined,
    type: (jsonMeta?.type as string) ?? (fm.type as string) ?? undefined,
    category: (jsonMeta?.category as string) ?? (fm.category as string) ?? undefined,
    pinned: (jsonMeta?.pinned as boolean) ?? (fm.pinned as boolean) ?? undefined,
    readingTime: mdxMeta?.readingTime,
  };
}

function normalizeTags(tags: unknown): string[] | undefined {
  if (!Array.isArray(tags)) return undefined;
  const valid = tags.filter((t): t is string => typeof t === "string" && t.length > 0);
  return valid.length > 0 ? valid : undefined;
}

/* ----------------------------------------------------------
 * 递归扫描
 * ---------------------------------------------------------- */

function scanDirectory(dir: string, prefix: string, mtimes?: Map<string, number>): DocMeta[] {
  const results: DocMeta[] = [];
  let entries: fs.Dirent[];

  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (err) {
    console.error(`[docs] 扫描目录失败: ${dir}`, err instanceof Error ? err.message : err);
    return results;
  }

  for (const entry of entries) {
    // 跳过非内容文件
    if (entry.name.startsWith(".") || entry.name === "README.md" || entry.name === "CONTRIBUTING.md" || entry.name === "LICENSE") {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    const id = prefix ? `${prefix}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      const indexPath = path.join(fullPath, "index.mdx");
      if (fs.existsSync(indexPath)) {
        // 文件夹文档：index.mdx + meta.json
        const mdxMeta = parseMdxMeta(indexPath);
        const jsonMeta = readMetaJson(fullPath);
        const meta = buildMeta(id, entry.name, mdxMeta, jsonMeta);
        if (meta) { if (mtimes) mtimes.set(meta.id, fs.statSync(indexPath).mtimeMs); results.push(meta); }
      } else {
        // 非 index.mdx 的子目录才递归扫描
        results.push(...scanDirectory(fullPath, id));
      }
    } else if (entry.name.endsWith(".mdx")) {
      const docId = prefix ? `${prefix}/${entry.name.replace(/\.mdx$/, "")}` : entry.name.replace(/\.mdx$/, "");
      const mdxMeta = parseMdxMeta(fullPath);
      const meta = buildMeta(docId, docId, mdxMeta, null);
      if (meta) { if (mtimes) mtimes.set(meta.id, fs.statSync(fullPath).mtimeMs); results.push(meta); }
    }
  }

  return results;
}

/* ----------------------------------------------------------
 * 公共 API
 * ---------------------------------------------------------- */

/** 获取所有文档元数据，按标题排序 */
export function getAllDocs(): DocMeta[] {
  const docsDir = getDocsDir();
  if (!fs.existsSync(docsDir)) return [];

  const mtimes = new Map<string, number>();
  const docs = scanDirectory(docsDir, "", mtimes);

  return docs.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;

    const tA = getSortTime(a, mtimes);
    const tB = getSortTime(b, mtimes);
    if (tB !== tA) return tB - tA;

    return a.title.localeCompare(b.title, "zh-CN");
  });
}

function getSortTime(meta: DocMeta, mtimes: Map<string, number>): number {
  if (meta.updatedAt) { const t = Date.parse(meta.updatedAt); if (!isNaN(t)) return t; }
  if (meta.createdAt) { const t = Date.parse(meta.createdAt); if (!isNaN(t)) return t; }
  return mtimes.get(meta.id) ?? 0;
}

/** 获取所有不重复的标签 */
export function getAllTags(): string[] {
  const docs = getAllDocs();
  const tagSet = new Set<string>();
  for (const doc of docs) {
    if (doc.tags) {
      for (const tag of doc.tags) {
        tagSet.add(tag);
      }
    }
  }
  return [...tagSet].sort((a, b) => a.localeCompare(b, "zh-CN"));
}

/** 根据 ID 获取文档内容，null 表示不存在 */
export function getDocById(id: string): DocContent | null {
  const docsDir = getDocsDir();

  // 尝试文件夹格式：content/docs/{id}/index.mdx
  const folderPath = path.join(docsDir, id);
  const indexPath = path.join(folderPath, "index.mdx");
  if (fs.existsSync(indexPath)) {
    const mdxMeta = parseMdxMeta(indexPath);
    const jsonMeta = readMetaJson(folderPath);
    const meta = buildMeta(id, id.split("/").pop() ?? id, mdxMeta, jsonMeta);
    if (!meta) return null;
    return { meta, rawContent: mdxMeta?.content ?? "" };
  }

  // 尝试扁平格式：content/docs/{id}.mdx
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

  const folderPath = path.join(docsDir, id);
  const indexPath = path.join(folderPath, "index.mdx");
  if (fs.existsSync(indexPath)) return fs.readFileSync(indexPath, "utf-8");

  const flatPath = path.join(docsDir, `${id}.mdx`);
  if (fs.existsSync(flatPath)) return fs.readFileSync(flatPath, "utf-8");

  return null;
}
