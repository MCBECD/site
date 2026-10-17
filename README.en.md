# MCBECD Site

[简体中文](README.md) | English | [繁體中文](README.zh-TW.md)

A community-maintained command library for Minecraft Bedrock Edition: [mcbecd.pages.dev](https://mcbecd.pages.dev)

![Command library home](.github/assets/home.png)

Built with Next.js 16, TypeScript and Tailwind CSS 4. Static export, deployed on Cloudflare Pages.

## Features

- Search commands by title and description; press `/` to focus the search box
- Syntax-highlighted code blocks with one-click copy; command block types carry their own icon
- 7 UI languages; the commands themselves stay in English
- Light/dark themes, red/blue/green palettes, or pick your own color; swap the background image and adjust its overlay and blur
- Bookmarks and history live in localStorage and are never uploaded

## Requirements

- Node.js 22+ (see `engines` in `package.json`)
- npm 10+

## Local Development

```sh
git clone --recurse-submodules https://github.com/MCBECD/site.git
cd site
npm install
npm run dev
```

Documentation lives in the `content/docs` submodule. If you cloned without `--recurse-submodules`, the pages will be empty. Fix it with:

```sh
git submodule update --init --recursive
```

## Project Structure

```
site/
  app/                    # App Router
    [slug]/               # basics detail pages, no URL prefix (/give/)
    commands/[slug]/      # /commands/give/
    community/[slug]/     # /community/1/
    standards/[slug]/     # /standards/README/, hidden docs, reached via /hidden/
    doc/                  # shared detail-page components
    home/                 # home page (command list)
    hidden/               # entry point for hidden docs
  components/             # UI components
  contexts/               # settings / theme / locale
  lib/                    # doc scanning, route mapping, i18n
  messages/               # UI strings for 7 languages
  scripts/                # sitemap, doc validation, new-doc scaffold
  styles/                 # global CSS
  content/docs/           # Git submodule: documentation content
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Generate the sitemap, then static-export to `out/` |
| `npm run check` | lint → typecheck → doc validation → i18n validation → tests |
| `npm run validate` | Doc and i18n validation only |
| `npm test` | Vitest |

## Supported UI Languages

zh-CN, en, zh-TW, ja, ko, de, fr

## Deployment

Cloudflare Pages:

- **Build command**: `npm run build`
- **Output directory**: `out`

## Related Repositories

| Repository | Description |
|---|---|
| [MCBECD/docs](https://github.com/MCBECD/docs) | Documentation content, mounted as the `content/docs` submodule |

## License

MIT

## Third-Party Attribution

Minecraft is a trademark of Mojang Studios. This project is not affiliated with, endorsed by, or connected with Mojang Studios or Microsoft Corporation. The organization avatar and website icon reference visual elements from Minecraft, which is the intellectual property of Mojang Studios.
