# MCBECD Site

简体中文 | [English](README.en.md) | [繁體中文](README.zh-TW.md)

社区贡献的 Minecraft 基岩版命令库网站：[mcbecd.pages.dev](https://mcbecd.pages.dev)

![命令库首页](.github/assets/home.png)

技术栈 Next.js 16 + TypeScript + Tailwind CSS 4，静态导出，部署在 Cloudflare Pages。

## 功能

- 按标题和描述搜索命令，按 `/` 直接聚焦搜索框
- 代码块语法高亮，一键复制，命令方块类型带对应图标
- 7 种界面语言，命令本身保持英文
- 亮/暗主题，红/蓝/绿三套配色，也可自定义取色；背景图可换，能调遮罩与模糊
- 收藏和最近浏览存在 localStorage，不上传

## 环境要求

- Node.js 22+（`package.json` 的 `engines` 要求）
- npm 10+

## 本地运行

```sh
git clone --recurse-submodules https://github.com/MCBECD/site.git
cd site
npm install
npm run dev
```

文档内容来自 Git 子模块 `content/docs`。克隆时漏了 `--recurse-submodules`，页面会是空的，补一次就行：

```sh
git submodule update --init --recursive
```

## 目录结构

```
site/
  app/                    # App Router
    [slug]/               # basics 详情页，URL 无前缀（/give/）
    commands/[slug]/      # /commands/give/
    community/[slug]/     # /community/1/
    standards/[slug]/     # /standards/README/，hidden 文档，从 /hidden/ 进入
    doc/                  # 详情页共用组件
    home/                 # 首页（命令列表）
    hidden/               # 隐藏文档入口
  components/             # UI 组件
  contexts/               # settings / theme / locale
  lib/                    # 文档扫描、路由映射、i18n
  messages/               # 7 种语言的文案
  scripts/                # sitemap、文档校验、新建文档
  styles/                 # 全局 CSS
  content/docs/           # Git 子模块：文档内容
```

## 常用脚本

| 命令 | 作用 |
|---|---|
| `npm run dev` | 本地开发 |
| `npm run build` | 生成 sitemap 后静态导出到 `out/` |
| `npm run check` | lint → typecheck → 文档校验 → i18n 校验 → 测试 |
| `npm run validate` | 只跑文档与 i18n 校验 |
| `npm test` | Vitest |

## 界面语言

zh-CN, en, zh-TW, ja, ko, de, fr

## 部署

Cloudflare Pages：

- **构建命令**：`npm run build`
- **输出目录**：`out`

## 相关仓库

| 仓库 | 说明 |
|---|---|
| [MCBECD/docs](https://github.com/MCBECD/docs) | 文档内容，作为子模块挂在 `content/docs` |

## 许可

MIT

## 商标声明

Minecraft is a trademark of Mojang Studios. This project is not affiliated with, endorsed by, or connected with Mojang Studios or Microsoft Corporation. The organization avatar and website icon reference visual elements from Minecraft, which is the intellectual property of Mojang Studios.
