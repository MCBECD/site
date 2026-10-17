# MCBECD Site

[简体中文](README.md) | [English](README.en.md) | 繁體中文

社群維護的 Minecraft 基岩版命令庫網站：[mcbecd.pages.dev](https://mcbecd.pages.dev)

![命令庫首頁](.github/assets/home.png)

技術棧 Next.js 16 + TypeScript + Tailwind CSS 4，靜態匯出，部署在 Cloudflare Pages。

## 功能

- 依標題與描述搜尋命令，按 `/` 直接聚焦搜尋框
- 程式碼區塊語法高亮，一鍵複製，命令方塊類型帶對應圖示
- 7 種介面語言，命令本身維持英文
- 亮／暗主題，紅／藍／綠三套配色，也可自訂取色；背景圖可換，能調遮罩與模糊
- 收藏與最近瀏覽存在 localStorage，不上傳

## 環境需求

- Node.js 22+（`package.json` 的 `engines` 要求）
- npm 10+

## 本機執行

```sh
git clone --recurse-submodules https://github.com/MCBECD/site.git
cd site
npm install
npm run dev
```

文件內容來自 Git 子模組 `content/docs`。複製時漏了 `--recurse-submodules`，頁面會是空的，補一次就好：

```sh
git submodule update --init --recursive
```

## 目錄結構

```
site/
  app/                    # App Router
    [slug]/               # basics 詳情頁，URL 無前綴（/give/）
    commands/[slug]/      # /commands/give/
    community/[slug]/     # /community/1/
    standards/[slug]/     # /standards/README/，hidden 文件，從 /hidden/ 進入
    doc/                  # 詳情頁共用元件
    home/                 # 首頁（命令列表）
    hidden/               # 隱藏文件入口
  components/             # UI 元件
  contexts/               # settings / theme / locale
  lib/                    # 文件掃描、路由對應、i18n
  messages/               # 7 種語言的文案
  scripts/                # sitemap、文件校驗、新建文件
  styles/                 # 全域 CSS
  content/docs/           # Git 子模組：文件內容
```

## 常用指令

| 指令 | 作用 |
|---|---|
| `npm run dev` | 本機開發 |
| `npm run build` | 產生 sitemap 後靜態匯出到 `out/` |
| `npm run check` | lint → typecheck → 文件校驗 → i18n 校驗 → 測試 |
| `npm run validate` | 只跑文件與 i18n 校驗 |
| `npm test` | Vitest |

## 介面語言

zh-CN, en, zh-TW, ja, ko, de, fr

## 部署

Cloudflare Pages：

- **建置指令**：`npm run build`
- **輸出目錄**：`out`

## 相關倉庫

| 倉庫 | 說明 |
|---|---|
| [MCBECD/docs](https://github.com/MCBECD/docs) | 文件內容，作為子模組掛在 `content/docs` |

## 授權

MIT

## 商標聲明

Minecraft is a trademark of Mojang Studios. This project is not affiliated with, endorsed by, or connected with Mojang Studios or Microsoft Corporation. The organization avatar and website icon reference visual elements from Minecraft, which is the intellectual property of Mojang Studios.
