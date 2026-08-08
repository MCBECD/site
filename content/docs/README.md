# MCBECD Docs

Minecraft Bedrock Edition Commands Documentation — reference content in MDX format.

## Structure

```
en/        English (26 documents)
zh-CN/     Simplified Chinese / 简体中文 (26 documents)
zh-TW/     Traditional Chinese / 繁體中文 (26 documents)
```

Each language directory contains `.mdx` files organized by category.

## Document Categories

| Category | Key | Description |
|----------|-----|-------------|
| Introduction | `intro` | Project overview |
| Basics | `basics` | Getting started, syntax, command index |
| Commands | `commands` | Per-command reference (22 commands) |

## Commands Documented

`/ability` `/alwaysday` `/camera` `/clear` `/clone` `/damage` `/daylock` `/deop` `/difficulty` `/effect` `/enchant` `/event` `/execute` `/fill` `/gamemode` `/gamerule` `/give` `/kick` `/kill` `/list` `/locate` `/me` `/msg` `/op` `/particle` `/playsound` `/replaceitem` `/say` `/scoreboard` `/setblock` `/setworldspawn` `/spawnpoint` `/spreadplayers` `/stopsound` `/structure` `/summon` `/tag` `/teleport` `/tell` `/tellraw` `/testfor` `/testforblock` `/testforblocks` `/time` `/title` `/toggledownfall` `/tp` `/weather` `/worldbuilder` `/xp`

## Adding a New Document

1. Pick an `order` number (use 10-unit gaps)
2. Set `category`: `intro`, `basics`, or `commands`
3. Create the `.mdx` file in **all three** language directories
4. Use **relative links** for internal references: `[text](./target)`

### Frontmatter

```yaml
---
title: "/command — Description"
order: 40
category: commands
description: "Brief description for SEO"
---
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full guide.

## Usage

This repository is consumed by [mcbecd-site](https://github.com/mcbecd/mcbecd-site) as a Git Submodule.

## License

MIT
