# MCBECD Docs

Minecraft Bedrock Edition Commands Documentation — MDX 格式命令参考文档。

## 结构

所有文档以扁平 `.mdx` 文件存放在 `content/docs/` 目录下，支持子目录形式（如 `give-diamonds/`）。

```
content/docs/
  mccd-intro.mdx     # 介绍
  getting-started.mdx  # 快速开始
  command-syntax.mdx   # 语法基础
  commands-reference.mdx # 命令目录
  give.mdx             # 单个命令文档
  give-diamonds/       # 子目录文档
    index.mdx
    meta.json
  ...
```

## Frontmatter

```yaml
---
title: "/command — 描述"
order: 10
category: commands
description: "简短描述"
author: "作者名"
updatedAt: "2026-08-08"
---
```

## 添加新文档

1. 创建 `.mdx` 文件
2. 设置 `order`（使用 10 的间隔，如 10、20、30）
3. 设置 `category`: `intro`、`basics` 或 `commands`
4. 使用**相对链接**引用其他文档: `[text](./target)`

## License

MIT
