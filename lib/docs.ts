import path from "node:path";
import fs from "node:fs";
import matter from "gray-matter";

/* ============================================================
 * MCBECD Command Library Documentation Engine
 *
 * @/content/docs/**.md (metadata in frontmatter)
 * ============================================================ */

export interface DocMeta {
  id: string;
  title: string;
  description?: string;
  category: string;
  tags?: string[];
  author?: string;
  updatedAt?: string;
  hidden?: boolean;
}

export interface DocContent {
  meta: DocMeta;
  rawContent: string;
}

/* ----------------------------------------------------------
 * Internal utilities
 * ---------------------------------------------------------- */

function getDocsDir(): string {
  return path.join(process.cwd(), "content", "docs");
}

function parseMdMeta(filePath: string): { frontmatter: Record<string, unknown>; content: string; readingTime: number } | null {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    const wordCount = content.replace(/\s+/g, "").length;
    return { frontmatter: data, content, readingTime: Math.max(1, Math.ceil(wordCount / 400)) };
  } catch {
    return null;
  }
}

/** Safely extract a string from unknown; returns undefined if not a string */
function asString(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

/** Safely extract a string[] from unknown; returns undefined if not an array or elements are not strings */
function asStringArray(v: unknown): string[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const valid = v.filter((t): t is string => typeof t === "string" && t.length > 0);
  return valid.length > 0 ? valid : undefined;
}

/** Derive a doc's category from its id/path when the frontmatter omits it. */
function deriveCategory(id: string): string {
  if (id.startsWith("commands/")) return "commands";
  if (id.startsWith("community/")) return "community";
  return "basics";
}

function buildMeta(
  id: string,
  fallbackName: string,
  category: string,
  mdMeta: ReturnType<typeof parseMdMeta> | null,
): DocMeta | null {
  if (!mdMeta) return null;

  const fm = mdMeta.frontmatter;
  return {
    id,
    title: asString(fm.title) ?? fallbackName,
    description: asString(fm.description),
    tags: asStringArray(fm.tags),
    author: asString(fm.author),
    updatedAt: asString(fm.updatedAt),
    category,
    hidden: fm.hidden === true,
  };
}

/* ----------------------------------------------------------
 * Targeted directory scanning (only basics, commands, community, no subdirs)
 * ---------------------------------------------------------- */

const SCAN_CATEGORIES = ["basics", "commands", "community"] as const;

function scanCategoryDir(docsDir: string, category: string): DocMeta[] {
  const results: DocMeta[] = [];
  const categoryDir = path.join(docsDir, category);

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(categoryDir, { withFileTypes: true });
  } catch {
    return results;
  }

  const files: fs.Dirent[] = [];
  for (const entry of entries)
    if (entry.isFile() && entry.name.endsWith(".md"))
      files.push(entry);

  files.sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of files) {
    const fullPath = path.join(categoryDir, entry.name);
    const docId = `${category}/${entry.name.replace(/\.md$/, "")}`;
    const mdMeta = parseMdMeta(fullPath);
    const meta = buildMeta(docId, docId, category, mdMeta);
    if (meta) results.push(meta);
  }

  return results;
}

/* ----------------------------------------------------------
 * Public API
 * ---------------------------------------------------------- */

/** Get all document metadata */
export function getAllDocs(): DocMeta[] {
  const docsDir = getDocsDir();
  if (!fs.existsSync(docsDir)) return [];
  const results: DocMeta[] = [];
  for (const category of SCAN_CATEGORIES)
    results.push(...scanCategoryDir(docsDir, category));

  return results;
}

/** Reject IDs containing path traversal sequences */
function isSafeDocId(id: string): boolean {
  return !id.includes("..") && !id.includes("\\") && !id.startsWith("/");
}

/** Get document content by ID; returns null if not found or ID is unsafe */
export function getDocById(id: string): DocContent | null {
  if (!isSafeDocId(id)) return null;
  const docsDir = getDocsDir();

  // Extract category from id (format: category/filename)
  const slashIndex = id.indexOf("/");
  const category = slashIndex === -1 ? "" : id.slice(0, slashIndex);

  // path.join correctly handles ids with slashes (e.g. "commands/give" → content/docs/commands/give.md)
  const filePath = path.join(docsDir, `${id}.md`);
  if (!fs.existsSync(filePath)) return null;

  const mdMeta = parseMdMeta(filePath);
  const meta = buildMeta(id, id, category, mdMeta);
  if (!meta) return null;
  return { meta, rawContent: mdMeta?.content ?? "" };
}

/** Get raw document file content (including frontmatter) for download */
export function getDocRawContent(id: string): string | null {
  if (!isSafeDocId(id)) return null;
  const docsDir = getDocsDir();

  try {
    const filePath = path.join(docsDir, `${id}.md`);
    if (fs.existsSync(filePath)) return fs.readFileSync(filePath, "utf-8");
  } catch {
    // Silently fail — caller handles null return
  }

  return null;
}