## [Unreleased]

### Added
- 单元测试框架 Vitest + 53 个测试覆盖核心模块
- CI 质量关卡：lint → typecheck → validate → test → build
- React ErrorBoundary 防止整页崩溃
- 代码覆盖率检查脚本 `npm run test:coverage`
- 质量全检脚本 `npm run check`

### Changed
- 拆分 `SettingsPanel.tsx` (530 行 → 主文件 170 行 + 7 个子组件)
- 拆分 `SettingsContext.tsx` (317 行 → 190 行 + palette.ts + plugin-system.ts)
- `remark-github-alerts` 替换手写 AST 遍历为 `unist-util-visit`
- CI 工作流重命名为 `CI / Deploy`，增加质量检查 job

### Fixed
- `docs.ts` 错误处理改为结构化日志（保留静默降级但加 console.error）
- 清理未使用的 import

## [0.0.1-alpha] - 2026-08-07

### Added
- 初始版本 — Minecraft 基岩版命令库文档站点
- Next.js 16 + React 19 + Tailwind 4 技术栈
- 7 语言 i18n 支持
- 暗色/亮色主题 + 自定义颜色 + 背景图插件
- MDX 文档引擎 + Shiki 代码高亮
- Cloudflare Pages 部署
