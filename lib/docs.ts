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

function parseDocMeta(
  filePath: string,
  id: string,
  category: string,
): DocContent | null {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    return {
      meta: {
        id,
        title: asString(data.title) ?? id,
        description: asString(data.description),
        category,
        tags: asStringArray(data.tags),
        author: asString(data.author),
        updatedAt: asString(data.updatedAt),
        hidden: data.hidden === true,
      },
      rawContent: content,
    };
  } catch {
    return null;
  }
}

const SCAN_CATEGORIES = ["basics", "commands", "community"] as const;

/* ----------------------------------------------------------
 * Public API
 * ---------------------------------------------------------- */

export function getAllDocs(): DocMeta[] {
  const docsDir = getDocsDir();
  const results: DocMeta[] = [];

  for (const category of SCAN_CATEGORIES) {
    const categoryDir = path.join(docsDir, category);
    const entries = fs.readdirSync(categoryDir, { withFileTypes: true });

    for (const entry of entries)
      if (entry.isFile() && entry.name.endsWith(".md")) {
        const fullPath = path.join(categoryDir, entry.name);
        const docId = `${category}/${entry.name.replace(/\.md$/, "")}`;
        const result = parseDocMeta(fullPath, docId, category);
        if (result) results.push(result.meta);
      }
  }
  return results;
}

function isSafeDocId(id: string): boolean {
  return !id.includes("..") && !id.includes("\\") && !id.startsWith("/");
}

export function getDocById(id: string): DocContent | null {
  if (!isSafeDocId(id)) return null;
  const docsDir = getDocsDir();

  const slashIndex = id.indexOf("/");
  const category = slashIndex === -1 ? "" : id.slice(0, slashIndex);

  const filePath = path.join(docsDir, `${id}.md`);
  if (!fs.existsSync(filePath)) return null;

  return parseDocMeta(filePath, id, category);
}
