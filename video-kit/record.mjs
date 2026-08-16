// MCBECD 演示视频录制脚本 —— 完整功能走查版
// 用法：
//   npm i playwright && npx playwright install chromium
//   node record.mjs                     # 录线上站
//   SITE_URL=http://localhost:8080 node record.mjs   # 录本地静态站
//
// 风格：光标「点一下这里、点一下那里」，把站点所有功能都过一遍。
//   - 系统鼠标指针替换为 AOSP 自定义光标（cursors/dark/*.svg）
//   - 光标移动用非线性缓动（easeInOutCubic / Quart / Expo）
//   - 覆盖：搜索、视图切换、命令详情、代码复制、收藏、设置面板四个标签、
//     主题/字体/语言、插件（配色/背景图）、关于页

import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CURSOR_DIR = path.join(__dirname, "cursors", "dark");

const SITE_URL = process.env.SITE_URL ?? "https://mcbecd.pages.dev";
const WIDTH = 1920;
const HEIGHT = 1080;

// 把 SVG 光标读成 data URL，内嵌进页面，避免依赖「站点也要托管光标文件」
function cursorDataURL(name) {
  const svg = readFileSync(path.join(CURSOR_DIR, `${name}.svg`), "utf-8");
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

/* ================= 缓动函数（非线性，保证舒适） ================= */
const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeInOutQuart = (t) =>
  t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
const easeOutQuint = (t) => 1 - Math.pow(1 - t, 5);
// 自定义三阶贝塞尔 cubic-bezier(0.87,0.13)，近似 ease-in-out-expo
const cubicBezier = (p1, p2) => (t) => {
  const cu = 3 * p1, cv = 3 * p2;
  const a = 3 * cu - cv + 1, b = 3 * cv - 6 * cu, c = 3 * cu;
  const sample = (x) => ((a * x + b) * x + c) * x;
  let x = t;
  for (let i = 0; i < 8; i++) {
    const err = sample(x) - t;
    if (Math.abs(err) < 1e-5) break;
    const d = 3 * a * x * x + 2 * b * x + c;
    x -= err / d;
  }
  return sample(x);
};
const easeInOutExpo = cubicBezier(0.87, 0.13);

/* ================= 自定义光标 ================= */
async function injectCustomCursor(page, cursorName = "pointer_arrow") {
  const url = cursorDataURL(cursorName);
  await page.addStyleTag({ content: `* { cursor: none !important; }` });
  await page.evaluate((url) => {
    const img = document.createElement("img");
    img.id = "__custom_cursor";
    img.src = url;
    img.style.cssText = [
      "position: fixed", "left: 0", "top: 0",
      "width: 36px", "height: 36px",
      "z-index: 999999", "pointer-events: none",
      "filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
    ].join("; ");
    document.body.appendChild(img);
  }, url);
}
async function placeCursor(page, x, y) {
  await page.evaluate(([x, y]) => {
    const el = document.getElementById("__custom_cursor");
    if (el) el.style.transform = `translate(${x}px, ${y}px)`;
  }, [x, y]);
}
async function setCursor(page, name) {
  const url = cursorDataURL(name);
  await page.evaluate((url) => {
    const el = document.getElementById("__custom_cursor");
    if (el) el.src = url;
  }, url);
}
async function cursorPos(page) {
  return page.evaluate(() => {
    const el = document.getElementById("__custom_cursor");
    const m = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(el?.style.transform ?? "");
    return m ? [parseFloat(m[1]), parseFloat(m[2])] : [960, 540];
  });
}

/* ================= 带缓动的移动 / 点击 / 悬停 ================= */
async function moveCursor(page, toX, toY, { duration = 900, easing = easeInOutCubic, steps = 60, cursor = null } = {}) {
  const from = await cursorPos(page);
  if (cursor) await setCursor(page, cursor);
  for (let i = 1; i <= steps; i++) {
    const t = easing(i / steps);
    const x = from[0] + (toX - from[0]) * t;
    const y = from[1] + (toY - from[1]) * t;
    await placeCursor(page, x, y);
    await page.mouse.move(x, y, { steps: 1 });
    await page.waitForTimeout(duration / steps);
  }
}
async function clickAt(page, x, y, opts = {}) {
  await moveCursor(page, x, y, { cursor: "pointer_hand", ...opts });
  await page.mouse.down();
  await page.waitForTimeout(110);
  await page.mouse.up();
}
async function hoverAt(page, x, y, ms = 700, opts = {}) {
  await moveCursor(page, x, y, { cursor: "pointer_hand", ...opts });
  await page.waitForTimeout(ms);
}
async function centerOf(page, selector) {
  try {
    return await page.locator(selector).first().evaluate((el) => {
      const r = el.getBoundingClientRect();
      return [r.x + r.width / 2, r.y + r.height / 2];
    });
  } catch {
    return null;
  }
}
// 安全点击：元素存在才点
async function tryClick(page, selector, opts = {}) {
  const c = await centerOf(page, selector);
  if (c) await clickAt(page, c[0], c[1], opts);
  else console.log("跳过（未找到）:", selector);
  return c;
}

/* ================= 演示流程（点这里、点那里） ================= */
async function tour(page) {
  await injectCustomCursor(page);
  await placeCursor(page, 940, 520);
  await page.waitForTimeout(1400);

  /* ---- 1) 列表页：搜索框 + 视图切换 ---- */
  await hoverAt(page, 960, 250, 900, { easing: easeInOutExpo });
  await tryClick(page, 'input[type="text"]', { easing: easeInOutQuart });
  await page.keyboard.type("scoreboard", { delay: 90 });
  await page.waitForTimeout(1000);

  // 清空搜索（点输入框右侧的 X 按钮）
  const clearBtn = await centerOf(page, 'button[aria-label*="清除"], button[aria-label*="clear"]');
  if (clearBtn) await clickAt(page, clearBtn[0], clearBtn[1], { easing: easeOutQuint });
  await page.waitForTimeout(700);

  // 切换 卡片/列表 视图
  await tryClick(page, 'button[aria-label*="切换"], button[aria-label*="列表"], button[aria-label*="视图"]', { easing: easeInOutQuart });
  await page.waitForTimeout(900);
  await tryClick(page, 'button[aria-label*="切换"], button[aria-label*="卡片"]', { easing: easeInOutQuart });
  await page.waitForTimeout(900);

  /* ---- 2) 打开一条命令详情，滚动看看 + 复制 ---- */
  await tryClick(page, "a[href*='/docs/commands/execute/']", { duration: 1100, easing: easeInOutQuart });
  await page.waitForTimeout(2400);
  for (let i = 0; i < 4; i++) {
    await page.mouse.wheel(0, 850);
    await page.waitForTimeout(600);
  }
  await page.waitForTimeout(500);

  // 悬停到某个代码块，点复制按钮
  const copyBtn = await centerOf(page, 'button[aria-label*="复制"], button[title*="复制"], .code-copy-btn');
  if (copyBtn) {
    await hoverAt(page, copyBtn[0], copyBtn[1], 800, { easing: easeInOutCubic });
    await clickAt(page, copyBtn[0], copyBtn[1], { easing: easeOutQuint });
    await page.waitForTimeout(800);
  }

  /* ---- 3) 回到列表，切一个社区装置看看 ---- */
  await tryClick(page, "a[href='/docs/'], a[href*='/docs'][aria-label], a[href='/docs/']", { easing: easeInOutQuart });
  await page.waitForTimeout(1600);
  await tryClick(page, "a[href*='/docs/community/']", { duration: 1100, easing: easeInOutQuart });
  await page.waitForTimeout(2200);
  await page.mouse.wheel(0, 700);
  await page.waitForTimeout(700);

  /* ---- 4) 设置面板：通用 → 主题 / 字体 / 语言 ---- */
  const gear = await centerOf(page, 'nav button:last-of-type, button[aria-label*="设置"], button[title*="设置"]');
  if (gear) await clickAt(page, gear[0], gear[1], { easing: easeInOutQuart });
  await page.waitForTimeout(1500);

  // 深色主题
  await tryClick(page, 'button[title*="深色"], button[aria-label*="深色"], button:has-text("深色")', { easing: easeInOutCubic });
  await page.waitForTimeout(900);
  // 字体大小「大」
  await tryClick(page, 'button:has-text("大"), button[title*="大"]', { easing: easeInOutCubic });
  await page.waitForTimeout(900);

  /* ---- 5) 插件标签：配色 / 背景图 ---- */
  await tryClick(page, 'button:has-text("插件"), button:has-text("Plugins")', { easing: easeInOutQuart });
  await page.waitForTimeout(1200);
  await tryClick(page, 'button:has-text("蓝"), button:has-text("Blue")', { easing: easeInOutCubic });
  await page.waitForTimeout(900);

  /* ---- 6) 数据标签：书签 / 历史 ---- */
  await tryClick(page, 'button:has-text("数据"), button:has-text("Data")', { easing: easeInOutQuart });
  await page.waitForTimeout(1200);

  /* ---- 7) 关于标签：版本 / 统计 / 作者 ---- */
  await tryClick(page, 'button:has-text("关于"), button:has-text("About")', { easing: easeInOutQuart });
  await page.waitForTimeout(1800);

  // 关闭设置
  await page.keyboard.press("Escape");
  await page.waitForTimeout(900);

  /* ---- 8) 收尾：回到顶部，光标缓缓停在标题上 ---- */
  await page.mouse.wheel(0, -3000);
  await page.waitForTimeout(800);
  await hoverAt(page, 960, 300, 1000, { easing: easeInOutExpo });
  await page.waitForTimeout(1200);
}

/* ================= 主流程 ================= */
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: WIDTH, height: HEIGHT },
  recordVideo: { dir: ".", size: { width: WIDTH, height: HEIGHT } },
});
const page = await context.newPage();
await page.goto(SITE_URL, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

await tour(page);

await context.close();
await browser.close();
console.log("录制完成：输出 .webm 到当前目录，再用 bash assemble.sh 加动态模糊+字幕转 MP4。");
