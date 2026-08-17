// MCBECD 演示视频录制脚本 —— 完整功能走查版（节奏快、光标跟手）
// 用法：
//   npm install && npx playwright install chromium
//   node record.mjs                     # 录线上站
//   SITE_URL=http://localhost:8080 node record.mjs   # 录本地静态站
//
// 要点：
//   - 系统鼠标指针替换为 AOSP 自定义光标（cursors/dark/*.svg），28px
//   - 光标用 mousemove 事件实时跟随真实鼠标，不额外轮询，跟手不抖
//   - 移动用非线性缓动（easeInOutQuint / Quart / Expo），快而不突兀

import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CURSOR_DIR = path.join(__dirname, "cursors", "dark");

const SITE_URL = process.env.SITE_URL ?? "https://mcbecd.pages.dev";
const WIDTH = 1920;
const HEIGHT = 1080;

/* ================= 高级缓动函数（非线性，杜绝直上直下） ================= */
// 5 次方：起步/收尾减速更明显，中间加速更猛
const easeInOutQuint = (t) => (t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2);
const easeOutQuint = (t) => 1 - Math.pow(1 - t, 5);
// 指数级：最明显的「疾进缓停」
const easeInOutExpo = (t) =>
  t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
// 圆弧缓动：观感更圆润
const easeInOutCirc = (t) =>
  t < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2;

/* ================= 自定义光标（跟手） ================= */
function cursorDataURL(name) {
  const svg = readFileSync(path.join(CURSOR_DIR, `${name}.svg`), "utf-8");
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

// 热点表（单位 dp，取自 cursors.json）：把光标「点击点」对准真实鼠标位置
const CURSOR_SCALE = 28 / 24;
const CURSOR_HOTSPOTS = {
  pointer_arrow: [4.5, 3.5],
  pointer_hand: [9.5, 2.5],
  pointer_text: [12, 11],
  pointer_crosshair: [12, 12],
  pointer_grab: [12, 12],
  pointer_grabbing: [12, 12],
};

// 注入 28px 光标图层：靠 mousemove 实时跟随，并按热点偏移对齐，避免箭头尖和点击点错位
async function injectCustomCursor(page, cursorName = "pointer_arrow") {
  const url = cursorDataURL(cursorName);
  const [hx, hy] = CURSOR_HOTSPOTS[cursorName] ?? [0, 0];
  const ox = hx * CURSOR_SCALE, oy = hy * CURSOR_SCALE;
  await page.addStyleTag({ content: `* { cursor: none !important; }` });
  await page.evaluate(({ url, ox, oy }) => {
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
    window.__cursorOx = ox;
    window.__cursorOy = oy;
    window.__cursorX = 960;
    window.__cursorY = 540;
    const follow = (e) => {
      window.__cursorX = e.clientX;
      window.__cursorY = e.clientY;
      img.style.transform = `translate(${e.clientX - window.__cursorOx}px, ${e.clientY - window.__cursorOy}px)`;
    };
    document.addEventListener("mousemove", follow);
    window.__cursorFollow = follow;
  }, { url, ox, oy });
}

async function setCursor(page, name) {
  const url = cursorDataURL(name);
  const [hx, hy] = CURSOR_HOTSPOTS[name] ?? [0, 0];
  const ox = hx * CURSOR_SCALE, oy = hy * CURSOR_SCALE;
  await page.evaluate(({ url, ox, oy }) => {
    const el = document.getElementById("__custom_cursor");
    if (el) el.src = url;
    window.__cursorOx = ox;
    window.__cursorOy = oy;
    if (window.__cursorFollow) {
      window.__cursorFollow({ clientX: window.__cursorX, clientY: window.__cursorY });
    }
  }, { url, ox, oy });
}

/* ================= 带缓动的移动 / 点击 ================= */
async function moveCursor(page, toX, toY, { duration = 320, easing = easeInOutQuint, steps = 10, cursor = null, arc = 0.12 } = {}) {
  if (cursor) await setCursor(page, cursor);
  const [x1, y1] = await page.evaluate(() => [window.__cursorX ?? 960, window.__cursorY ?? 540]);
  const dx = toX - x1, dy = toY - y1;
  const len = Math.hypot(dx, dy) || 1;
  // 垂直方向单位向量：让轨迹带一点弧线，像人手甩鼠标，不是笔直一条线
  const nx = -dy / len, ny = dx / len;
  const arcH = len * arc;
  for (let i = 1; i <= steps; i++) {
    const e = easing(i / steps);
    const a = Math.sin(Math.PI * e) * arcH; // 弧在中间最高，两端归零
    const x = x1 + dx * e + nx * a;
    const y = y1 + dy * e + ny * a;
    await page.mouse.move(x, y, { steps: 1 });
    await page.waitForTimeout(duration / steps);
  }
  // 落点精确归位，避免弧线造成的偏差影响点击
  await page.mouse.move(toX, toY, { steps: 1 });
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
    // 2 秒超时：选择器匹配不到时快速跳过，而不是默认等 30 秒拖慢整段录制
    const el = await page.locator(selector).first().elementHandle({ timeout: 2000 });
    const box = await el.boundingBox();
    return box ? [box.x + box.width / 2, box.y + box.height / 2] : null;
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
  await tryClick(page, 'input[type="text"]', { easing: easeInOutCirc });
  await page.keyboard.type("scoreboard", { delay: 55 });
  await page.waitForTimeout(550);
  await tryClick(page, 'button[aria-label*="清除"], button[aria-label*="clear"]', { easing: easeOutQuint });
  await page.waitForTimeout(400);
  await tryClick(page, 'button[aria-label*="切换"], button[aria-label*="列表"], button[aria-label*="视图"]', { easing: easeInOutCirc });
  await page.waitForTimeout(500);
  await tryClick(page, 'button[aria-label*="切换"], button[aria-label*="卡片"]', { easing: easeInOutCirc });
  await page.waitForTimeout(500);

  /* 2) 命令详情：滚动 + 复制 */
  await tryClick(page, "a[href*='/docs/commands/execute/']", { duration: 550, easing: easeInOutCirc });
  await page.waitForTimeout(1100);
  for (let i = 0; i < 3; i++) {
    await page.mouse.wheel(0, 850);
    await page.waitForTimeout(320);
  }
  const copyBtn = await centerOf(page, 'button[aria-label*="复制"], button[title*="复制"], .code-copy-btn');
  if (copyBtn) {
    await hoverAt(page, copyBtn[0], copyBtn[1], 400, { easing: easeInOutQuint });
    await clickAt(page, copyBtn[0], copyBtn[1], { easing: easeOutQuint });
    await page.waitForTimeout(450);
  }

  /* 3) 社区装置 */
  await tryClick(page, "a[href='/docs/'], a[href*='/docs']", { easing: easeInOutCirc });
  await page.waitForTimeout(750);
  await tryClick(page, "a[href*='/docs/community/']", { duration: 550, easing: easeInOutCirc });
  await page.waitForTimeout(1100);
  await page.mouse.wheel(0, 700);
  await page.waitForTimeout(350);

  /* 4) 设置：通用 → 主题/字体 */
  const gear = await centerOf(page, 'nav button:last-of-type, button[aria-label*="设置"], button[title*="设置"]');
  if (gear) await clickAt(page, gear[0], gear[1], { easing: easeInOutCirc });
  await page.waitForTimeout(850);
  await tryClick(page, 'button[title*="深色"], button[aria-label*="深色"], button:has-text("深色")', { easing: easeInOutQuint });
  await page.waitForTimeout(500);
  await tryClick(page, 'button:has-text("大"), button[title*="大"]', { easing: easeInOutQuint });
  await page.waitForTimeout(500);

  /* 5) 插件：配色 */
  await tryClick(page, 'button:has-text("插件"), button:has-text("Plugins")', { easing: easeInOutCirc });
  await page.waitForTimeout(650);
  await tryClick(page, 'button:has-text("蓝"), button:has-text("Blue")', { easing: easeInOutQuint });
  await page.waitForTimeout(500);

  /* 6) 数据 */
  await tryClick(page, 'button:has-text("数据"), button:has-text("Data")', { easing: easeInOutCirc });
  await page.waitForTimeout(650);

  /* 7) 关于 */
  await tryClick(page, 'button:has-text("关于"), button:has-text("About")', { easing: easeInOutCirc });
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
