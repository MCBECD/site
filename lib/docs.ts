import path from "node:path";
import fs from "node:fs";
import matter from "gray-matter";

export interface DocMeta {
  id: string;
  title: string;
  description?: string;
  order: number;
  category?: string;
}

export interface DocContent {
  meta: DocMeta;
  rawContent: string;
}

/**
 * @why content/docs 通过 Git Submodule 关联外部文档仓库
 * @return 文档根目录的绝对路径
 */
export function getDocsDir(): string {
  return path.join(process.cwd(), "content", "docs");
}

/**
 * @why 纯 fs 同步读取——文档数量少(<1k)，无性能瓶颈，同步代码更简洁
 * @performance 每请求最多读取一次目录，接受
 */
export function getAllDocs(locale: string): DocMeta[] {
  const localeDir = path.join(getDocsDir(), locale);

  if (!fs.existsSync(localeDir)) {
    return [];
  }

  const files = fs.readdirSync(localeDir).filter((f) => f.endsWith(".mdx"));

  const docs: DocMeta[] = [];

  for (const file of files) {
    const filePath = path.join(localeDir, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(raw);

    const id = file.replace(/\.mdx$/, "");
    docs.push({
      id,
      title: data.title ?? id,
      description: data.description ?? undefined,
      order: typeof data.order === "number" ? data.order : Number.MAX_SAFE_INTEGER,
      category: data.category ?? undefined,
    });
  }

  return docs.sort((a, b) => a.order - b.order);
}

/**
 * @return null 表示文档不存在，调用方负责处理 404
 */
export function getDocById(locale: string, id: string): DocContent | null {
  const filePath = path.join(getDocsDir(), locale, `${id}.mdx`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    meta: {
      id,
      title: data.title ?? id,
      description: data.description ?? undefined,
      order: typeof data.order === "number" ? data.order : Number.MAX_SAFE_INTEGER,
    },
    rawContent: content,
  };
}

/**
 * @why 下载功能需要原始文件内容（含 frontmatter），不是解析后的 MDX
 */
export function getDocRawContent(locale: string, id: string): string | null {
  const filePath = path.join(getDocsDir(), locale, `${id}.mdx`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  return fs.readFileSync(filePath, "utf-8");
}
