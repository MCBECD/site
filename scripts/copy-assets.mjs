#!/usr/bin/env node

/**
 * copy-assets.mjs
 *
 * 把内容仓库（content/docs，Git 子模块）里的文档图片复制到 public/doc-assets，
 * 供 next build 静态导出。文档里统一写绝对路径 `/doc-assets/<分类>/<slug>/<文件>`。
 *
 * @why 图片必须跟内容仓库一起走：作者改一篇文档时，图和 md 在同一个 PR 里，
 * 不用跨仓库提两次。站点只做消费者，public 下不存原始图片。
 *
 * @gotcha content/docs 在未初始化子模块时是空目录，这里必须静默跳过，
 * 否则全新克隆（没跑 --recurse-submodules）会直接构建失败。
 */

import fs from "node:fs";
import path from "node:path";

const SRC = path.join(process.cwd(), "content", "docs", "assets");
const DEST = path.join(process.cwd(), "public", "doc-assets");

if (!fs.existsSync(SRC)) {
  console.log("[copy-assets] 未找到 content/docs/assets，跳过");
  process.exit(0);
}

fs.rmSync(DEST, { recursive: true, force: true });
fs.cpSync(SRC, DEST, { recursive: true });

const count = fs
  .readdirSync(DEST, { recursive: true })
  .filter((f) => /\.(png|jpe?g|webp|avif|gif)$/i.test(String(f))).length;

console.log(`[copy-assets] 已复制 ${count} 张图片到 public/doc-assets`);
