---
Task ID: 2
Agent: main
Task: 统一 UI 主题一致性 + 修复全部 CI 错误 + 重做宣传动画

Work Log:
- CI 修复：
  - eslint.config.mjs：为 video-kit/**/*.mjs 补充 Node + Browser（page.evaluate）globals，
    消除 record.mjs / serve.mjs 的 no-undef 误报；删除 record.mjs 未使用的 cubicBezier/easeInOutBack
  - tsconfig.json：exclude animation / video-kit（独立子包，各自有 package.json + tsconfig），
    修复 site 构建时 Next 对 animation/src 的 type error（找不到 remotion 模块等）
  - render-animation.yml：新增 Typecheck 步骤 + render 加 --concurrency=50%
  - 验证：lint 0 error 0 warning、typecheck 通过、validate 通过、110 个测试全过、next build 通过
- UI 统一：
  - DocDetailClient 复制 toast：bg-white 改为 --color-toast-bg token（暗色模式下不再刺眼白底）
  - SettingsPanel 两处 className 模板残留的多余 "}" 修正
- 动画重做（animation/src/DemoAnimation.tsx，30s @30fps = 900 帧）：
  - 原动画问题：光标在空白处乱飞、最后 30 秒定格不动；卡片/代码块与背景对比度低；
    布局坐标错位（绝对定位卡片相对窗口而非内容区）；场景冗长无叙事
  - 新结构：场景1 开场 Logo（0-140）→ 场景2 浏览器 mockup 产品走查（140-740）：
    搜索 execute 逐字打出 → 结果卡片弹出 → 光标点击卡片 → 详情面板 + 语法高亮代码块 → 点击复制 → 已复制 toast
    → 场景3 结尾（740-900）
  - 光标只在交互时刻出现、轨迹对齐点击目标（卡片中心/复制按钮），带按压动画
  - 布局：所有元素在 1920×1080 安全区内；内容区 position:relative 作为定位基准，杜绝坐标错位
  - 渲染验证：remotion still 逐帧 + 像素区域分析（scripts/analyze-frame.mjs、verify-regions.mjs）
  - 本地渲染需 CJK 字体：XDG_DATA_HOME 指向下载的 Noto Sans CJK；TMPDIR 指向大盘避免 tmpfs 溢出

Stage Summary:
- 站点 lint/typecheck/validate/test/build 全绿
- 复制 toast 暗色模式一致；设置面板类名干净
- 动画从"乱飞的 50s"变成 30s 有叙事的产品走查片，光标、布局、对比度全部修正
