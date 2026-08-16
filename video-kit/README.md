# MCBECD 演示视频制作套件

这套文件用来给 MCBECD（Minecraft 基岩版命令库）生成一段演示视频（MP4）。
包含：自动录制脚本、AOSP 自定义鼠标光标、中英双语字幕、后期合成脚本。

## 目录

```
video-kit/
├── record.mjs        # Playwright 自动录制：自定义光标 + 非线性缓动 + 完整演示
├── subtitles.ass     # 中英字幕：中文在上、英文在下、立体描边+投影
├── assemble.sh       # ffmpeg 后期：动态模糊 + 字幕烧录 + 输出 MP4
├── cursors/
│   ├── dark/         # AOSP 深色主题光标（25 个 SVG）
│   └── light/        # AOSP 浅色主题光标（25 个 SVG）
└── README.md
```

## 快速开始

### 方式一：GitHub Actions（推荐，不用本地环境）

这个套件已经放在 `MCBECD/site` 仓库里，并配好了 `.github/workflows/render-demo.yml`。

1. 打开仓库的 **Actions** 标签页 → 左侧选 **Render Demo Video** → **Run workflow**。
2. 等它跑完，在本次运行的 **Artifacts** 里下载 `mcbecd-demo`，解压即得 `mcbecd-demo.mp4`。

流程：自动 build 站点 → 起本地静态服务 → Playwright 录制（自定义光标 + 缓动）→ ffmpeg 加动态模糊 + 烧中英字幕 → 上传 MP4。

### 方式二：本地跑（备用）

1. 安装依赖（只需一次）：

   ```bash
   npm install
   npx playwright install chromium
   ```

2. 录制（默认录线上站 `https://mcbecd.pages.dev`）：

   ```bash
   node record.mjs
   ```

   会输出一个 `.webm`（1080p）。

3. 后期合成（动态模糊 → 烧字幕 → MP4）：

   ```bash
   bash assemble.sh   # 自动找最新的 .webm，输出 mcbecd-demo.mp4
   bash assemble.sh   # 想更顺滑：MOTION=pro bash assemble.sh（更慢）
   ```

## 各部分说明

### 1. 自定义光标（record.mjs）

- 用 AOSP 光标（`cursors/dark/*.svg`）替代系统鼠标指针，视频里不会出现默认箭头。
- 光标会随交互自动切换：默认 `pointer_arrow`、悬停/点击 `pointer_hand`、文本输入 `pointer_text`。
- 光标 SVG 来自 `https://github.com/DingdingOvO/aosp-cursors-temp`（已拷贝 dark/light 两套）。

### 2. 非线性缓动（record.mjs 里的 easing）

光标移动不是匀速，而是用高阶缓动函数插值，保证「舒适不突兀」：

- `easeInOutCubic` / `easeInOutQuart`：启动慢→中间快→收尾慢（最常用，观感舒适）
- `easeOutQuint`：快速启动、轻柔落点
- `easeInOutExpo`（自定义贝塞尔 `cubic-bezier(0.87,0.13)`）：更强的「疾进缓停」

`moveCursor()` 会按帧插值移动，录制出来就是平滑缓动。

### 3. 动态模糊（assemble.sh）

真实、专业的运动模糊（光学流 / 矢量模糊，如 ReelSmart Motion Blur、AE CC Force Motion
Blur）**ffmpeg 无法完全复刻**。本脚本用两层近似：

- `minterpolate`：运动补偿插帧到 60fps，先让运动更顺。
- `tmix`（1:2:1 高斯权重）：相邻帧时间域混合，产生「拖影」的模糊观感。

**如果你要真正的专业级动态模糊**，建议录完后进 After Effects / DaVinci Resolve 处理；
本脚本给的是「可用的近似」，适合快速出片。

### 4. 中英字幕（subtitles.ass）

- 中文在上、英文在下，双行同屏。
- 「立体感」= 白色粗体 + 4px 深色描边 + 右下 4px 投影（ASS 的 `\bord` + `\shad`）。
- 内容明确交代了：**项目目前非常早期、有大量错误**，结尾也有作者署名和致谢。

字体：中文用 `Noto Sans CJK SC`（GitHub Actions 里已自动安装 `fonts-noto-cjk`），
英文用 `DejaVu Sans`。本地 Windows 若没有这两个字体，把 `subtitles.ass` 里
`Style:` 行的字体名改成你系统里的（如 `Microsoft YaHei` / `Arial`）即可。

### 5. 时间轴

`subtitles.ass` 里的时间是示例（约 66 秒），请按你实际录制的镜头微调每行
`Dialogue:` 的起止时间。录制脚本 `tour()` 里的每段 `waitForTimeout` 也和字幕大致对应。

## 已知限制（说清楚）

1. **出片在 GitHub Actions 上跑**：我的本地沙箱没浏览器、内存小，直接在这渲染会崩；
   所以用仓库自带的 workflow 在 GitHub 上出片（见「方式一」）。
2. **运镜（camera movement）由你做**：本脚本只做「固定镜头 + 光标操作」的演示；
   缩放/推拉/跟拍等运镜，你在剪辑软件里加。
3. **动态模糊是近似**：见上文第 3 条。
4. **3D 字幕是「立体描边+投影」**：真正的 3D 挤压/透视字幕需要 AE 或 Blender。

## 常见问题

- **录制没声音**：这是纯演示视频，默认无音频，也不需要音频。
- **光标大小/热点不对**：AOSP 光标是 24dp，脚本里放大到 36px 显示；想调大小改
  `record.mjs` 里 `width: 36px` 和对应热点的偏移即可。
- **字幕位置**：`subtitles.ass` 里每行 `\pos(960,760)` 是中文位置、
  `\pos(960,845)` 是英文位置，想上下移动直接改这两个 Y 值。
