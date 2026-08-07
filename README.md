# MCCD Site

Professional, immersive, multi-language Minecraft Commands Documentation site.

Built with Next.js 16, TypeScript, Tailwind CSS 4, Framer Motion, and more.

## Prerequisites

- Node.js 20+
- npm 10+

## Local Development

```bash
# Clone site repo with documentation submodule
git clone --recurse-submodules <site-repo-url>
cd mccd-site
npm install
npm run dev
```

## Link Documentation Repository

```bash
# Add docs submodule (first time or when switching doc source)
git submodule add https://github.com/mc-com-docs/mccd-docs.git content/docs
git submodule update --init --recursive
```

## Update Documentation

```bash
# Pull latest docs from the documentation repository
cd content/docs && git pull origin main
```

## Cloudflare Pages Deployment

- **Build command**: `npm run build`
- **Output directory**: `.next`
- **Important**: Check "Include submodules" in Build settings > Advanced

## Project Structure

```
mccd-site/
  app/                  # Next.js App Router
    [locale]/           # Internationalized routes
      docs/             # Documentation pages
  components/           # React UI components
  contexts/             # React contexts (settings, theme)
  lib/                  # Utility libraries
  messages/             # i18n message files (7 languages)
  content/docs/         # Git Submodule: mccd-docs
  i18n/                 # next-intl configuration
```

## Supported Languages

### UI
zh-CN, en, zh-TW, ja, ko, de, fr

### Documentation
zh-CN, en, zh-TW (more available by adding language directories in mccd-docs)

## License

MIT
