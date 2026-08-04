import path from "node:path";
import fs from "node:fs";
import matter from "gray-matter";
import { docLocales, type DocLocale } from "@/i18n/shared";

/* ============================================================
 * MCBECD 文档引擎 v2.0
 *
 * @design 线性教程 + 参考索引混合结构
 *   - tutorial/: 线性教程，按 chapter + order 排序，用户按顺序阅读
 *   - reference/: 参考条目，按字母/分类排列，支持搜索查阅
 *   - 根目录 .mdx: 兼容旧结构（基础入门文档）
 *
 * @scale 设计支持 100k+ 文档——每次请求只读必要文件
 * ============================================================ */

export interface DocMeta {
  id: string;
  title: string;
  description?: string;
  order: number;
  category?: string;
  /** @new v2.0 所属章节——用于线性导航分组 */
  chapter?: string;
  /** @new v2.0 文档所在子目录（tutorial | reference | ""） */
  section?: string;
  /** @new v2.0 预计阅读时间（分钟） */
  readingTime?: number;
}

export interface DocContent {
  meta: DocMeta;
  rawContent: string;
}

/** 相邻文档导航信息 */
export interface AdjacentDocs {
  prev: DocMeta | null;
  next: DocMeta | null;
}

/** 章节（线性教程的一章） */
export interface Chapter {
  id: string;
  title: string;
  docs: DocMeta[];
}

/* ----------------------------------------------------------
 * 内部工具函数
 * ---------------------------------------------------------- */

export function getDocsDir(): string {
  return path.join(process.cwd(), "content", "docs");
}

/**
 * @why 从 MDX frontmatter 提取元数据，统一处理默认值
 */
function extractMeta(filePath: string, id: string): DocMeta | null {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    const wordCount = content.replace(/\s+/g, "").length;
    return {
      id,
      title: data.title ?? id,
      description: data.description ?? undefined,
      order: typeof data.order === "number" ? data.order : Number.MAX_SAFE_INTEGER,
      category: data.category ?? undefined,
      chapter: data.chapter ?? undefined,
      readingTime: Math.max(1, Math.ceil(wordCount / 400)), // ~400 chars/min
    };
  } catch {
    return null;
  }
}

/**
 * @why 递归扫描目录下所有 .mdx，保留目录结构信息
 */
function scanMdxFiles(dir: string, section: string): DocMeta[] {
  const results: DocMeta[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const subSection = section ? `${section}/${entry.name}` : entry.name;
      results.push(...scanMdxFiles(fullPath, subSection));
    } else if (entry.name.endsWith(".mdx")) {
      const id = section
        ? `${section}/${entry.name.replace(/\.mdx$/, "")}`
        : entry.name.replace(/\.mdx$/, "");
      const meta = extractMeta(fullPath, id);
      if (meta) {
        meta.section = section || undefined;
        results.push(meta);
      }
    }
  }
  return results;
}

/**
 * @why 估算阅读时间，用于在侧边栏显示
 */
function estimateReadingTime(rawContent: string): number {
  const text = rawContent.replace(/---[\s\S]*?---/, "").replace(/\s+/g, "");
  return Math.max(1, Math.ceil(text.length / 400));
}

/* ----------------------------------------------------------
 * 公共 API
 * ---------------------------------------------------------- */

/**
 * @return 指定语言的所有文档元数据，按 order 排序
 * @performance 静态生成时调用，结果缓存在 RSC payload 中
 */
export function getAllDocs(locale: string): DocMeta[] {
  const localeDir = path.join(getDocsDir(), locale);
  if (!fs.existsSync(localeDir)) return [];

  // 扫描根目录 .mdx（兼容旧结构）
  const rootDocs = fs
    .readdirSync(localeDir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => {
      const id = f.replace(/\.mdx$/, "");
      return extractMeta(path.join(localeDir, f), id);
    })
    .filter((d): d is DocMeta => d !== null);

  // 扫描子目录
  const subDirs = ["tutorial", "reference"];
  const sectionDocs: DocMeta[] = [];
  for (const sub of subDirs) {
    const subPath = path.join(localeDir, sub);
    if (fs.existsSync(subPath) && fs.statSync(subPath).isDirectory()) {
      sectionDocs.push(...scanMdxFiles(subPath, sub));
    }
  }

  return [...rootDocs, ...sectionDocs].sort((a, b) => a.order - b.order);
}

/**
 * @return 按章节分组的文档列表（仅线性教程文档）
 */
export function getDocsByChapter(locale: string): Chapter[] {
  const allDocs = getAllDocs(locale);
  const chapterMap = new Map<string, DocMeta[]>();
  const chapterOrder: string[] = [];

  for (const doc of allDocs) {
    // 仅 tutorial/ 和根目录有 chapter 的文档参与线性导航
    const ch = doc.chapter;
    if (!ch) continue;
    if (!chapterMap.has(ch)) {
      chapterMap.set(ch, []);
      chapterOrder.push(ch);
    }
    chapterMap.get(ch)!.push(doc);
  }

  return chapterOrder.map((ch) => ({
    id: ch,
    title: ch, // frontmatter chapter 字段即为章节标题
    docs: chapterMap.get(ch)!.sort((a, b) => a.order - b.order),
  }));
}

/**
 * @return 获取相邻文档（用于 prev/next 导航）
 * @design 按 order 排序后的全局线性序列
 */
export function getAdjacentDocs(locale: string, currentId: string): AdjacentDocs {
  const allDocs = getAllDocs(locale);
  // 过滤出参与线性导航的文档（有 chapter 或在 tutorial/ 下）
  const linear = allDocs.filter((d) => d.chapter || d.section === "tutorial");

  const idx = linear.findIndex((d) => d.id === currentId);
  if (idx === -1) return { prev: null, next: null };

  return {
    prev: idx > 0 ? (linear[idx - 1] ?? null) : null,
    next: idx < linear.length - 1 ? (linear[idx + 1] ?? null) : null,
  };
}

/**
 * @return 获取文档在当前章节中的位置（第 N 篇，共 M 篇）
 */
export function getChapterProgress(
  locale: string,
  docId: string,
): { chapterTitle: string; current: number; total: number } | null {
  const allDocs = getAllDocs(locale);
  const doc = allDocs.find((d) => d.id === docId);
  if (!doc?.chapter) return null;

  const chapterDocs = allDocs
    .filter((d) => d.chapter === doc.chapter)
    .sort((a, b) => a.order - b.order);

  const idx = chapterDocs.findIndex((d) => d.id === docId);
  if (idx === -1) return null;

  return {
    chapterTitle: doc.chapter,
    current: idx + 1,
    total: chapterDocs.length,
  };
}

/**
 * @return null 表示文档不存在，调用方负责处理 404
 */
export function getDocById(locale: string, id: string): DocContent | null {
  // 支持子目录路径如 "tutorial/01-intro"
  const filePath = path.join(getDocsDir(), locale, `${id}.mdx`);

  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const wordCount = content.replace(/\s+/g, "").length;

  return {
    meta: {
      id,
      title: data.title ?? id,
      description: data.description ?? undefined,
      order: typeof data.order === "number" ? data.order : Number.MAX_SAFE_INTEGER,
      category: data.category ?? undefined,
      chapter: data.chapter ?? undefined,
      section: id.includes("/") ? id.split("/")[0] : undefined,
      readingTime: Math.max(1, Math.ceil(wordCount / 400)),
    },
    rawContent: content,
  };
}

/**
 * @why 下载功能需要原始文件内容（含 frontmatter），不是解析后的 MDX
 */
export function getDocRawContent(locale: string, id: string): string | null {
  const filePath = path.join(getDocsDir(), locale, `${id}.mdx`);

  if (!fs.existsSync(filePath)) return null;

  return fs.readFileSync(filePath, "utf-8");
}

/**
 * @return 参考索引文档（无线性顺序，按字母排列）
 */
export function getReferenceDocs(locale: string): DocMeta[] {
  return getAllDocs(locale)
    .filter((d) => !d.chapter && d.section !== "tutorial")
    .sort((a, b) => a.title.localeCompare(b.title));
}

/**
 * @return 所有章节标题列表
 */
export function getChapterList(locale: string): string[] {
  const allDocs = getAllDocs(locale);
  const chapters = new Set<string>();
  for (const doc of allDocs) {
    if (doc.chapter) chapters.add(doc.chapter);
  }
  return [...chapters];
}
