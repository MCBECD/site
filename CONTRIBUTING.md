# Contributing to MCBECD

Thanks for helping improve Minecraft Bedrock Edition command documentation!

## Quick Start

```bash
git clone https://github.com/MCBECD/site.git
cd site
npm install
npm run dev
```

Open http://localhost:3000 — changes to docs or code will hot-reload.

## Project Structure

```
app/                     # Next.js App Router 页面
  docs/                  # 文档列表页 + 详情页
    DocsPageClient.tsx   # 首页命令卡片列表
    [...id]/             # 动态路由：文档详情
components/              # React 组件
  MDRenderer.tsx        # MD 渲染 + Shiki 代码高亮
  Navbar.tsx             # 顶部导航栏
  SettingsPanel.tsx      # 设置面板
contexts/                # React Context（设置/主题/语言）
lib/                     # 工具库
  docs.ts                # 文档扫描引擎（frontmatter 解析）
  md/                   # remark 插件
  i18n/                  # i18n 类型定义
messages/                # 7 种语言的翻译文件（JSON）
content/docs/            # 文档内容（MD 文件）
styles/globals.css       # 全局样式 + 设计令牌
functions/               # Cloudflare Pages Functions
```

## Adding a New Command Document

### Option 1: Use the scaffolding script (recommended)

```bash
npm run new-doc -- /clear
```

This creates `content/docs/clear.md` with the correct frontmatter template.

### Option 2: Manual

1. Create `content/docs/<command>.md`
2. Use this frontmatter:

```yaml
---
author: "Your Name"
updatedAt: "YYYY-MM-DD"
title: "/command  Description"
order: <number>
category: commands
description: "Brief one-line description"
---

## `/command` — Description

Brief introduction.

### 语法

`/command <required> [optional]`

### 参数

- `<required>` — Description
- `[optional]` — Description

### 示例

`/command example`

Description of what this does.

### 基岩版注意事项

- Bedrock-specific information here
```

### Order Number Guide

| Range | Content |
|-------|---------|
| 0 | About / project intro |
| 1-9 | Introduction guides |
| 10-49 | Command references |
| 50+ | Advanced topics / examples |

Use gaps of 1-2 between commands so future inserts don't require reordering everything.

## Validation

Before submitting, run:

```bash
# Check all documents have valid frontmatter
npm run validate:docs

# Check all i18n files have matching keys
npm run validate:i18n

# Full check
npm run validate
```

## Quality Checklist

- [ ] Frontmatter has all required fields: `title`, `order`, `category`, `description`, `author`, `updatedAt`
- [ ] Cross-references use relative paths (`./other-command`)
- [ ] Bedrock-specific notes are included (not Java Edition info)
- [ ] Examples use proper fenced code blocks with `mcfunction` language tag
- [ ] `npm run validate:docs` passes
- [ ] `npm run build` succeeds

## Adding a New UI Language

1. Add the locale to `lib/i18n/types.ts` (`LOCALES` array + `NATIVE_NAMES`)
2. Create `messages/<locale>.json` with all keys matching `messages/zh-CN.json`
3. Run `npm run validate:i18n` to verify

## Coding Standards

- TypeScript strict mode — no `any` without explicit justification
- Components are "use client" only when needed (state/effects/event handlers)
- CSS uses custom properties (`var(--color-*)`) for theming — never hardcode colors
- Run `npm run lint` and `npm run typecheck` before pushing

## Deployment

Cloudflare Pages — just push to `main`. Build command: `npm run build`, output: `out/`.

## License

MIT