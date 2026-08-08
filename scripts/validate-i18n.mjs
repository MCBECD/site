#!/usr/bin/env node

/**
 * validate-i18n.mjs
 *
 * 校验所有 messages/*.json 文件的 key 完整性，以 zh-CN.json 为基准。
 * 用法: node scripts/validate-i18n.mjs
 * 退出码: 0=通过, 1=有问题
 */

import fs from "node:fs";
import path from "node:path";

const MSGS_DIR = path.join(process.cwd(), "messages");
const BASELINE = "zh-CN.json";

let errors = 0;

function getAllKeys(obj, prefix = "") {
  const keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "string") {
      keys.push(full);
    } else if (typeof v === "object" && v !== null) {
      keys.push(...getAllKeys(v, full));
    }
  }
  return keys.sort();
}

function countPlaceholders(str) {
  const matches = str.match(/\{\w+\}/g);
  return matches ? matches.sort() : [];
}

// --- main ---
const baselinePath = path.join(MSGS_DIR, BASELINE);
if (!fs.existsSync(baselinePath)) {
  console.error(`基准文件不存在: ${baselinePath}`);
  process.exit(1);
}

const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf-8"));
const baselineKeys = getAllKeys(baseline);

const files = fs.readdirSync(MSGS_DIR).filter((f) => f.endsWith(".json") && f !== BASELINE);

console.log(`\n基准: ${BASELINE} (${baselineKeys.length} 个 key)\n`);

for (const file of files) {
  const locale = file.replace(".json", "");
  const data = JSON.parse(fs.readFileSync(path.join(MSGS_DIR, file), "utf-8"));
  const keys = getAllKeys(data);
  const missing = baselineKeys.filter((k) => !keys.includes(k));
  const extra = keys.filter((k) => !baselineKeys.includes(k));
  const localeErrors = missing.length + extra.length;

  if (localeErrors === 0) {
    console.log(`\x1b[32m✓ ${locale}\x1b[0m (${keys.length} keys)`);
  } else {
    console.log(`\x1b[31m✗ ${locale}\x1b[0m`);
    if (missing.length > 0) {
      console.log(`  缺少: ${missing.join(", ")}`);
      errors += missing.length;
    }
    if (extra.length > 0) {
      console.log(`  多余: ${extra.join(", ")}`);
      errors += extra.length;
    }
  }

  // 插值变量检查
  for (const key of baselineKeys) {
    if (missing.includes(key)) continue;
    const bVal = getNestedValue(baseline, key);
    const lVal = getNestedValue(data, key);
    if (typeof bVal !== "string" || typeof lVal !== "string") continue;
    const bPlaceholders = countPlaceholders(bVal);
    const lPlaceholders = countPlaceholders(lVal);
    if (JSON.stringify(bPlaceholders) !== JSON.stringify(lPlaceholders)) {
      console.log(`\x1b[33m⚠ ${locale}/${key}\x1b[0m: 插值变量不匹配 (基准: ${bPlaceholders.join(",")}, 当前: ${lPlaceholders.join(",")})`);
    }
  }
}

console.log(`\n---\n\x1b[32m通过\x1b[0m: ${errors === 0 ? "全部" : "部分"}  \x1b[31m错误: ${errors}\x1b[0m\n`);
process.exit(errors > 0 ? 1 : 0);

function getNestedValue(obj, keyPath) {
  const parts = keyPath.split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = cur[p];
  }
  return cur;
}
