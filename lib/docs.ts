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
 * Public API
 * ---------------------------------------------------------- */

/** Get all document metadata */
export function getAllDocs(): DocMeta[] {
  const docsDir = getDocsDir();
  if (!fs.existsSync(docsDir)) return [];
  return scanDirectory(docsDir, "");
}

/** Get document content by ID; returns null if not found */
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

/** Get raw document file content (including frontmatter) for download */
export function getDocRawContent(id: string): string | null {
  const docsDir = getDocsDir();

  try {
    const flatPath = path.join(docsDir, `${id}.mdx`);
    if (fs.existsSync(flatPath)) return fs.readFileSync(flatPath, "utf-8");
  } catch {
    // Silently fail — caller handles null return
  }

  return null;
}