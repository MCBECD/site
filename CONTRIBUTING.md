# Contributing to MCBECD

Thanks for helping improve Minecraft Bedrock Edition command documentation!

## How to Contribute

### File Structure

```
content/docs/
  ├── command-name/index.mdx    # Document content
  ├── command-name/meta.json     # Document metadata
  └── ...
```

### Adding a New Command

1. Create a folder under `content/docs/` with the command name
2. Add `index.mdx` with the document content
3. Add `meta.json` with title, description, author, and dates

### Document Template

**meta.json:**
```json
{
  "title": "/command — Description",
  "description": "Brief description of the command"
}
```

**index.mdx:**
```mdx
---
title: "/command — Description"
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
```shell
/command example
```

### Bedrock Notes

- Important Bedrock-specific information
```

### Quality Checklist

- [ ] Cross-references use relative paths (`./xxx`)
- [ ] Bedrock-specific notes are included
- [ ] Examples use proper code blocks
- [ ] Parameters are clearly described
