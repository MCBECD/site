import path from "node:path";
import fs from "node:fs";
import matter from "gray-matter";

/* ============================================================
 * MCBECD Command Library Documentation Engine
 *
 * @/content/docs/**.mdx (metadata in frontmatter)
 * ============================================================ */

export interface DocMeta {
  id: string;
  title: string;
  description?: string;
  category?: string;
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

function parseMdxMeta(filePath: string): { frontmatter: Record<string, unknown>; content: string; readingTime: number } | null {
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
    hidden: fm.hidden === true,
  };
}

/* ----------------------------------------------------------
 * Recursive directory scanning
 * ---------------------------------------------------------- */

function scanDirectory(dir: string, prefix: string): DocMeta[] {
  const results: DocMeta[] = [];
  let entries: fs.Dirent[];

  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }

  // Separate directories and files for consistent ordering: dirs first, then files alphabetically
  const dirs: fs.Dirent[] = [];
  const files: fs.Dirent[] = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".") || ["README.md", "CONTRIBUTING.md", "LICENSE"].includes(entry.name)) {
      continue;
    }
    if (entry.isDirectory()) dirs.push(entry);
    else if (entry.name.endsWith(".mdx")) files.push(entry);
  }

  // Sort for deterministic ordering
  dirs.sort((a, b) => a.name.localeCompare(b.name));
  files.sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of dirs) {
    const fullPath = path.join(dir, entry.name);
    const id = prefix ? `${prefix}/${entry.name}` : entry.name;
    results.push(...scanDirectory(fullPath, id));
  }

  for (const entry of files) {
    const fullPath = path.join(dir, entry.name);
    const docId = prefix ? `${prefix}/${entry.name.replace(/\.mdx$/, "")}` : entry.name.replace(/\.mdx$/, "");
    const mdxMeta = parseMdxMeta(fullPath);
    const meta = buildMeta(docId, docId, mdxMeta);
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
  return scanDirectory(docsDir, "");
}

/** Reject IDs containing path traversal sequences */
function isSafeDocId(id: string): boolean {
  return !id.includes("..") && !id.includes("\\") && !id.startsWith("/");
}

/** Get document content by ID; returns null if not found or ID is unsafe */
export function getDocById(id: string): DocContent | null {
  if (!isSafeDocId(id)) return null;
  const docsDir = getDocsDir();

  // path.join correctly handles ids with slashes (e.g. "commands/give" → content/docs/commands/give.mdx)
  const filePath = path.join(docsDir, `${id}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const mdxMeta = parseMdxMeta(filePath);
  const meta = buildMeta(id, id, mdxMeta);
  if (!meta) return null;
  return { meta, rawContent: mdxMeta?.content ?? "" };
}

/** Get raw document file content (including frontmatter) for download */
export function getDocRawContent(id: string): string | null {
  if (!isSafeDocId(id)) return null;
  const docsDir = getDocsDir();

  try {
    const filePath = path.join(docsDir, `${id}.mdx`);
    if (fs.existsSync(filePath)) return fs.readFileSync(filePath, "utf-8");
  } catch {
    // Silently fail — caller handles null return
  }

  return null;
}
