# MCBECD Site

社区贡献的 Minecraft 基岩版命令库网站。

Built with Next.js 16, TypeScript, Tailwind CSS 4.

## Prerequisites

- Node.js 20+
- npm 10+

## Local Development

```sh
git clone --recurse-submodules https://github.com/MCBECD/site.git
cd site
npm install
npm run dev
```

## Project Structure

```
site/
  app/                  # Next.js App Router
    docs/                # Documentation pages
  components/           # React UI components
  contexts/             # React contexts (settings, theme, locale)
  lib/                  # Utility libraries
    i18n/                # i18n type definitions
  messages/             # i18n message files (7 languages)
  content/docs/         # Git Submodule: documentation content
  styles/               # Global CSS
```

## Supported UI Languages

zh-CN, en, zh-TW, ja, ko, de, fr

## Cloudflare Pages Deployment

- **Build command**: `npm run build`
- **Output directory**: `out`

## License

MIT

## Third-Party Attribution

Minecraft is a trademark of Mojang Studios. This project is not affiliated with, endorsed by, or connected with Mojang Studios or Microsoft Corporation. The organization avatar and website icon reference visual elements from Minecraft, which is the intellectual property of Mojang Studios.
