// MCBECD 演示视频录制脚本 —— 完整功能走查版（节奏快、光标跟手）
// 用法：
//   npm install && npx playwright install chromium
//   node record.mjs                     # 录线上站
//   SITE_URL=http://localhost:8080 node record.mjs   # 录本地静态站
//
// 要点：
//   - 系统鼠标指针替换为 AOSP 自定义光标（cursors/dark/*.svg），28px
//   - 光标用 mousemove 事件实时跟随真实鼠标，不额外轮询，跟手不抖
//   - 移动用非线性缓动（easeInOutCubic / Quart / Expo），快而不突兀

import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CURSOR_DIR = path.join(__dirname, "cursors", "dark");

const SITE_URL = process.env.SITE_URL ?? "https://mcbecd.pages.dev";
const WIDTH = 1920;
const HEIGHT = 1080;

/* ================= 缓动函数 ================= */
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeInOutQuart = (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2);
const easeOutQuint = (t) => 1 - Math.pow(1 - t, 5);
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

/* ================= 自定义光标（跟手） ================= */
function cursorDataURL(name) {
  const svg = readFileSync(path.join(CURSOR_DIR, `${name}.svg`), "utf-8");
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

// 注入一个 28px 的光标图层，靠 mousemove 事件实时跟随，杜绝逐帧 evaluate 的抖动
async function injectCustomCursor(page, cursorName = "pointer_arrow") {
  const url = cursorDataURL(cursorName);
  await page.addStyleTag({ content: `* { cursor: none !important; }` });
  await page.evaluate((url) => {
    const img = document.createElement("img");
    img.id = "__custom_cursor";
    img.src = url;
    img.style.cssText = [
      "position: fixed", "left: 0", "top: 0",
      "width: 28px", "height: 28px",
      "z-index: 999999", "pointer-events: none",
      "will-change: transform",
      "filter: drop-shadow(0 2px 3px rgba(0,0,0,0.45))",
    ].join("; ");
    document.body.appendChild(img);
    const follow = (e) => {
      img.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    };
    document.addEventListener("mousemove", follow);
    window.__cursorFollow = follow;
  }, url);
}

async function setCursor(page, name) {
  const url = cursorDataURL(name);
  await page.evaluate((url) => {
    const el = document.getElementById("__custom_cursor");
    if (el) el.src = url;
  }, url);
}

/* ================= 带缓动的移动 / 点击 ================= */
async function moveCursor(page, toX, toY, { duration = 420, easing = easeInOutCubic, steps = 24, cursor = null } = {}) {
  if (cursor) await setCursor(page, cursor);
  const from = await page.evaluate(() => {
    const el = document.getElementById("__custom_cursor");
    const m = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(el?.style.transform ?? "");
    return m ? [parseFloat(m[1]), parseFloat(m[2])] : [960, 540];
  });
  for (let i = 1; i <= steps; i++) {
    const t = easing(i / steps);
    const x = from[0] + (toX - from[0]) * t;
    const y = from[1] + (toY - from[1]) * t;
    await page.mouse.move(x, y, { steps: 1 }); // 触发 mousemove，光标图层自动跟随
    await page.waitForTimeout(duration / steps);
  }
}
async function clickAt(page, x, y, opts = {}) {
  await moveCursor(page, x, y, { cursor: "pointer_hand", ...opts });
  await page.mouse.down();
  await page.waitForTimeout(80);
  await page.mouse.up();
}
async function hoverAt(page, x, y, ms = 400, opts = {}) {
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
async function tryClick(page, selector, opts = {}) {
  const c = await centerOf(page, selector);
  if (c) await clickAt(page, c[0], c[1], opts);
  else console.log("跳过（未找到）:", selector);
  return c;
}

/* ================= 演示流程 ================= */
async function tour(page) {
  await injectCustomCursor(page);
  await page.mouse.move(940, 520);
  await page.waitForTimeout(700);

  /* 1) 列表：搜索 + 清空 + 视图切换 */
  await hoverAt(page, 960, 250, 500, { easing: easeInOutExpo });
  await tryClick(page, 'input[type="text"]', { easing: easeInOutQuart });
  await page.keyboard.type("scoreboard", { delay: 55 });
  await page.waitForTimeout(550);
  await tryClick(page, 'button[aria-label*="清除"], button[aria-label*="clear"]', { easing: easeOutQuint });
  await page.waitForTimeout(400);
  await tryClick(page, 'button[aria-label*="切换"], button[aria-label*="列表"], button[aria-label*="视图"]', { easing: easeInOutQuart });
  await page.waitForTimeout(500);
  await tryClick(page, 'button[aria-label*="切换"], button[aria-label*="卡片"]', { easing: easeInOutQuart });
  await page.waitForTimeout(500);

  /* 2) 命令详情：滚动 + 复制 */
  await tryClick(page, "a[href*='/docs/commands/execute/']", { duration: 550, easing: easeInOutQuart });
  await page.waitForTimeout(1100);
  for (let i = 0; i < 3; i++) {
    await page.mouse.wheel(0, 850);
    await page.waitForTimeout(320);
  }
  const copyBtn = await centerOf(page, 'button[aria-label*="复制"], button[title*="复制"], .code-copy-btn');
  if (copyBtn) {
    await hoverAt(page, copyBtn[0], copyBtn[1], 400, { easing: easeInOutCubic });
    await clickAt(page, copyBtn[0], copyBtn[1], { easing: easeOutQuint });
    await page.waitForTimeout(450);
  }

  /* 3) 社区装置 */
  await tryClick(page, "a[href='/docs/'], a[href*='/docs']", { easing: easeInOutQuart });
  await page.waitForTimeout(750);
  await tryClick(page, "a[href*='/docs/community/']", { duration: 550, easing: easeInOutQuart });
  await page.waitForTimeout(1100);
  await page.mouse.wheel(0, 700);
  await page.waitForTimeout(350);

  /* 4) 设置：通用 → 主题/字体 */
  const gear = await centerOf(page, 'nav button:last-of-type, button[aria-label*="设置"], button[title*="设置"]');
  if (gear) await clickAt(page, gear[0], gear[1], { easing: easeInOutQuart });
  await page.waitForTimeout(850);
  await tryClick(page, 'button[title*="深色"], button[aria-label*="深色"], button:has-text("深色")', { easing: easeInOutCubic });
  await page.waitForTimeout(500);
  await tryClick(page, 'button:has-text("大"), button[title*="大"]', { easing: easeInOutCubic });
  await page.waitForTimeout(500);

  /* 5) 插件：配色 */
  await tryClick(page, 'button:has-text("插件"), button:has-text("Plugins")', { easing: easeInOutQuart });
  await page.waitForTimeout(650);
  await tryClick(page, 'button:has-text("蓝"), button:has-text("Blue")', { easing: easeInOutCubic });
  await page.waitForTimeout(500);

  /* 6) 数据 */
  await tryClick(page, 'button:has-text("数据"), button:has-text("Data")', { easing: easeInOutQuart });
  await page.waitForTimeout(650);

  /* 7) 关于 */
  await tryClick(page, 'button:has-text("关于"), button:has-text("About")', { easing: easeInOutQuart });
  await page.waitForTimeout(900);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(450);

  /* 8) 收尾 */
  await page.mouse.wheel(0, -3000);
  await page.waitForTimeout(400);
  await hoverAt(page, 960, 300, 600, { easing: easeInOutExpo });
  await page.waitForTimeout(700);
}

/* ================= 主流程 ================= */
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-gpu"] });
const context = await browser.newContext({
  viewport: { width: WIDTH, height: HEIGHT },
  recordVideo: { dir: ".", size: { width: WIDTH, height: HEIGHT } },
});
const page = await context.newPage();
await page.goto(SITE_URL, { waitUntil: "networkidle" });
await page.waitForTimeout(900);

await tour(page);

await context.close();
await browser.close();
console.log("录制完成：输出 .webm，再用 bash assemble.sh 加动态模糊+字幕转 MP4。");
