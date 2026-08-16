/**
 * new-doc.mjs
 *
 * 快速创建新命令文档的脚手架脚本。
 * 用法: node scripts/new-doc.mjs <command-name> ["标题描述"] [order]
 * 示例: node scripts/new-doc.mjs clear "清除物品" 32
 */

import fs from "node:fs";
import path from "node:path";

const DOCS_DIR = path.join(process.cwd(), "content", "docs");

const commandName = process.argv[2];
if (!commandName) {
  console.error("用法: node scripts/new-doc.mjs <command-name> [\"标题描述\"] [order]");
  console.error('示例: node scripts/new-doc.mjs clear "清除物品" 32');
  process.exit(1);
}

// 验证 command name
if (!/^[a-z0-9-]+$/.test(commandName)) {
  console.error(`命令名只能包含小写字母、数字和连字符: \`${commandName}\``);
  process.exit(1);
}

const targetPath = path.join(DOCS_DIR, `${commandName}.md`);
if (fs.existsSync(targetPath)) {
  console.error(`文件已存在: ${targetPath}`);
  process.exit(1);
}

const title = process.argv[3] || `/${commandName} — 命令说明`;
const today = new Date().toISOString().slice(0, 10);
const order = process.argv[4] || "";

const content = `---
author: "官方•Dingding OvO"
updatedAt: "${today}"
title: "${title}"
${order ? `order: ${order}` : "order: "}
description: "一句话描述 /${commandName} 命令的用途"
---

## \`/${commandName}\` — 命令说明

简要介绍该命令的用途。

### 语法

\`/${commandName} <必填> [可选]\`

### 参数

- \`<必填>\` — 参数说明
- \`[可选]\` — 参数说明

### 示例

\`/${commandName} example\`

示例说明。

### 基岩版注意事项

- 基岩版特有信息
`;

fs.writeFileSync(targetPath, content, "utf-8");
console.log(`\x1b[32m✓\x1b[0m 创建: ${targetPath}`);
console.log(`  标题: ${title}`);
console.log(`  日期: ${today}`);
if (order) console.log(`  order: ${order}`);
console.log(`\n下一步:`);
console.log(`  1. 编辑 ${targetPath} 填写内容`);
console.log(`  2. 如果没有设置 order，在 frontmatter 中设置一个`);
console.log(`  3. 运行 node scripts/validate-docs.mjs 校验`);