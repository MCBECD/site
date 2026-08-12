#!/usr/bin/env node

/**
 * validate-docs.mjs
 *
 * 校验 content/docs/ 下所有 MDX 文档的 frontmatter 完整性。
 * 用法: node scripts/validate-docs.mjs
 * 退出码: 0=全部通过, 1=有问题
 */

import fs from "node:fs";
import path from "node:path";

const DOCS_DIR = path.join(process.cwd(), "content", "docs");
const REQUIRED_FIELDS = ["title", "description", "author", "updatedAt"];
const VALID_CATEGORIES = ["intro", "basics", "commands"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const SKIP_FILES = new Set(["README.md", "CONTRIBUTING.md", "LICENSE"]);

let errors = 0;
let warnings = 0;

function parseFrontmatter(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  const match = /^---\r?\n([\s\S]*?)\r?\n---/;
  const m = raw.match(match);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
    fm[key] = val;
  }
  return fm;
}

function scanDir(dir, prefix = "") {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith(".") || SKIP_FILES.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    const id = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      scanDir(full, id);
    } else if (entry.name.endsWith(".mdx")) {
      const docId = entry.name.replace(/\.mdx$/, "");
      checkFile(full, prefix ? `${prefix}/${docId}` : docId);
    }
  }
}

function checkFile(filePath, id) {
  const fm = parseFrontmatter(filePath);
  if (!fm) {
    console.error(`\x1b[31m[ERROR] ${id}\x1b[0m: 无法解析 frontmatter`);
    errors++;
    return;
  }

  // 必填字段
  for (const field of REQUIRED_FIELDS) {
    if (!fm[field]) {
      console.error(`\x1b[31m[ERROR] ${id}\x1b[0m: 缺少 \`${field}\``);
      errors++;
    }
  }

  // category 校验 (check base category only, e.g. "commands/player" → "commands")
  const baseCategory = fm.category?.split("/")[0];
  if (baseCategory && !VALID_CATEGORIES.includes(baseCategory)) {
    console.error(`\x1b[31m[ERROR] ${id}\x1b[0m: 无效 category \`${fm.category}\` (应为 ${VALID_CATEGORIES.join("/")})`);
    errors++;
  }

  // updatedAt 格式
  if (fm.updatedAt && !DATE_RE.test(fm.updatedAt)) {
    console.error(`\x1b[31m[ERROR] ${id}\x1b[0m: updatedAt 格式错误 \`${fm.updatedAt}\` (应为 YYYY-MM-DD)`);
    errors++;
  }

  // 相对链接检查 (仅检查站内绝对路径，排除外部 URL)
  const raw = fs.readFileSync(filePath, "utf-8");
  const absLinks = raw.match(/\]\((?!https?:)[^)]*\/docs\/[^)]*\)/g);
  if (absLinks) {
    for (const link of absLinks) {
      console.warn(`\x1b[33m⚠ ${id}\x1b[0m: 发现绝对路径链接 ${link}，应使用相对路径`);
      warnings++;
    }
  }

  // 成功
  if (
    REQUIRED_FIELDS.every((f) => fm[f]) &&
    (!fm.category || VALID_CATEGORIES.includes(fm.category?.split("/")[0])) &&
    (!fm.updatedAt || DATE_RE.test(fm.updatedAt))
  ) {
    console.log(`\x1b[32m✓ ${id}\x1b[0m`);
  }
}

// --- main ---
if (!fs.existsSync(DOCS_DIR)) {
  console.error(`\x1b[31m目录不存在: ${DOCS_DIR}\x1b[0m`);
  process.exit(1);
}

console.log(`\n校验文档: ${DOCS_DIR}\n`);
scanDir(DOCS_DIR);

console.log(`\n---\n\x1b[32m通过\x1b[0m: ${errors === 0 ? "全部" : "部分"}  \x1b[31m错误: ${errors}\x1b[0m  \x1b[33m警告: ${warnings}\x1b[0m\n`);
process.exit(errors > 0 ? 1 : 0);