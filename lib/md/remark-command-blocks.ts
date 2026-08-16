/**
 * remark-command-blocks
 *
 * Transforms the custom command-block syntax into fenced code blocks.
 *
 * Syntax (a standalone paragraph):
 *   <CmdRepeat>`execute as @e[type=snowball] run ...`
 *
 * The `<CmdXxx>` tag names the command-block type; the backtick-wrapped text
 * is the command. The result is a `code` node with language `CmdXxx`, which
 * `MDXRenderer` renders with a command-block icon + syntax highlighting.
 *
 * Operating on the AST (rather than a regex over the raw source) means we only
 * rewrite real command blocks and never corrupt:
 *   - inline-code mentions like `use the <CmdRepeat> component`
 *   - fenced examples inside ```mdx blocks (already `code` nodes)
 */

import type { Plugin } from "unified";
import type { Root, Paragraph, Html, InlineCode, Code, Text } from "mdast";
import { visit } from "unist-util-visit";

export const remarkCommandBlocks: Plugin<[], Root> = () => (tree: Root) => {
  visit(tree, "paragraph", (node: Paragraph, index: number | undefined, parent) => {
    if (typeof index !== "number" || !parent) return;

    const meaningful = node.children.filter(
      (child) => !(child.type === "text" && (child as Text).value.trim() === ""),
    );

    if (meaningful.length !== 2) return;
    const [tagNode, codeNode] = meaningful;
    if (tagNode!.type !== "html" || codeNode!.type !== "inlineCode") return;

    const match = /^<(\w*)>$/.exec((tagNode as Html).value);
    if (!match) return;

    const code: Code = {
      type: "code",
      lang: match[1],
      value: (codeNode as InlineCode).value.trim(),
    };

    parent.children.splice(index, 1, code);
  });
};
