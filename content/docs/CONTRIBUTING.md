# Contributing to MCBECD Documentation

Thanks for helping improve Minecraft Bedrock Edition command documentation!

## How to Contribute

### File Structure

```
en/        — English documentation
zh-CN/     — Simplified Chinese (简体中文)
zh-TW/     — Traditional Chinese (繁體中文)
```

Each language directory contains `.mdx` files — one per document.

### Adding a New Command

1. Choose an `order` number (use gaps of 10: 10, 20, 30...)
2. Set `category: commands`
3. Create the `.mdx` file in **all three language directories**

### Document Template

```mdx
---
title: "/command — Description"
order: <number>
category: commands
description: "Brief description of the command"
---

## `/command` — Description

Brief introduction.

### Syntax

`/command <required> [optional]`

### Parameters

- `<required>` — Description
- `[optional]` — Description

### Examples

**Example description:**
\`\`\`
/command example
\`\`\`

### Bedrock Notes

- Important Bedrock-specific information
```

### Cross-References

Use **relative links** for internal references:
```md
See also [other command](./other-command)
```

Do NOT use absolute paths like `/zh-CN/docs/...`.

### Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `title` | Yes | Display title shown in sidebar and navbar |
| `order` | Yes | Sorting weight (lower = first) |
| `category` | Yes | One of: `intro`, `basics`, `commands` |
| `description` | Yes | SEO meta description |

### Quality Checklist

- [ ] Content exists in all three languages
- [ ] All cross-references use relative paths (`./xxx`)
- [ ] Bedrock-specific notes are included
- [ ] Examples use proper `\`\`\`` code blocks
- [ ] Parameters are clearly described
