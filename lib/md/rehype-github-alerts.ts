/**
 * rehype-github-alerts
 *
 * Transforms GitHub-style blockquote alerts into styled divs at the HAST level.
 * Supports: NOTE, TIP, IMPORTANT, WARNING, CAUTION
 *
 * Syntax:
 *   > [!NOTE]
 *   > Useful information that users should know.
 *
 * This plugin operates on the HAST (HTML AST) and creates proper `element` nodes,
 * unlike the old remark plugin which created `raw` HTML nodes that broke MD.
 */

import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

const ALERT_RE = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(.*)/i;

const ALERT_META: Record<string, { className: string; defaultTitle: string }> = {
  NOTE:      { className: "gh-alert-note",      defaultTitle: "Note" },
  TIP:       { className: "gh-alert-tip",       defaultTitle: "Tip" },
  IMPORTANT: { className: "gh-alert-important", defaultTitle: "Important" },
  WARNING:   { className: "gh-alert-warning",   defaultTitle: "Warning" },
  CAUTION:   { className: "gh-alert-caution",   defaultTitle: "Caution" },
};

type HastNode = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

function getTextContent(node: HastNode): string {
  if (node.type === "text") return node.value ?? "";
  if (Array.isArray(node.children)) {
    return node.children.map(getTextContent).join("");
  }
  return "";
}

function makeText(value: string): HastNode {
  return { type: "text", value };
}

function makeElement(
  tagName: string,
  properties: Record<string, unknown>,
  children: HastNode[],
): HastNode {
  return { type: "element", tagName, properties, children };
}

export const rehypeGithubAlerts: Plugin<[], HastNode> = () => {
  return (tree: HastNode) => {
    visit(tree, "element", (node: HastNode, index: number | undefined, parent: HastNode | undefined) => {
      if (node.tagName !== "blockquote") return;
      if (typeof index !== "number" || !parent) return;

      const children = node.children ?? [];
      const titleIdx = children.findIndex(
        (child) => child.type === "element" && child.tagName === "p",
      );
      if (titleIdx === -1) return;

      const titleParagraphNode = children[titleIdx]!;
      const text = getTextContent(titleParagraphNode);
      const match = ALERT_RE.exec(text);
      if (!match) return;

      const alertType = match[1]!.toUpperCase();
      const meta = ALERT_META[alertType];
      if (!meta) return;

      const title = match[2]?.trim() || meta.defaultTitle;

      const titleParagraph = makeElement(
        "p",
        { className: "gh-alert-title" },
        [makeElement("span", {}, [makeText(title)])],
      );

      const bodyChildren = children.slice(titleIdx + 1);

      const alertDiv = makeElement(
        "div",
        { className: `gh-alert ${meta.className}` },
        [titleParagraph, ...bodyChildren],
      );

      parent.children!.splice(index, 1, alertDiv);
    });
  };
};