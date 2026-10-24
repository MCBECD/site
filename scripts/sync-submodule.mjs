#!/usr/bin/env node

/**
 * sync-submodule.mjs
 *
 * 构建前把 content/docs 子模块拉到远端最新。
 *
 * @why 静态站点的内容来自 Git 子模块，而子模块指针是"某个固定提交"。
 * docs 仓库有新提交但 site 没 bump 指针时，构建出来的还是旧内容——
 * 线上看起来"改了没生效"，原因就在这里。构建时拉一次最新，
 * 让线上内容不再依赖指针是否及时更新。
 *
 * @gotcha 只在 Cloudflare Pages 构建环境执行。本地开发时 content/docs
 * 可能是工作副本或符号链接，`--remote` 会覆盖未提交的改动。
 *
 * @side-effect 会改写 .git/modules/content/docs 与工作区内容，仅限 CI。
 */

import { execSync } from "node:child_process";

if (!process.env.CF_PAGES) {
  console.log("[sync-submodule] 非 Cloudflare Pages 构建，跳过");
  process.exit(0);
}

function run(cmd) {
  console.log(`[sync-submodule] ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

try {
  run("git submodule sync --recursive content/docs");
  run("git submodule update --init --remote --recursive content/docs");
} catch (err) {
  // 拉不到就退回指针指向的那份，不让构建直接失败
  console.warn("[sync-submodule] 拉取失败，使用当前指针内容：", err.message);
}
