/**
 * remark-github-alerts
 *
 * Transforms GitHub-style blockquote alerts into styled HTML divs.
 * Supports: NOTE, TIP, IMPORTANT, WARNING, CAUTION
 *
 * Syntax:
 *   > [!NOTE]
 *   > Useful information that users should know.
 */

import type { Plugin } from "unified";
import type { Root, Blockquote, Paragraph, Text, Html, Parent } from "mdast";

function visit(tree: Parent, type: string, callback: (node: Parent, index: number) => void) {
  function walk(node: Parent) {
    if (node.children && Array.isArray(node.children)) {
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i] as Parent;
        if (child.type === type) {
          callback(child, i);
        }
        walk(child);
      }
    }
  }
  walk(tree);
}

const ALERT_RE = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(.*)/i;

const ALERT_META: Record<string, { className: string; defaultTitle: string }> = {
  NOTE:      { className: "gh-alert-note",      defaultTitle: "Note" },
  TIP:       { className: "gh-alert-tip",       defaultTitle: "Tip" },
  IMPORTANT: { className: "gh-alert-important", defaultTitle: "Important" },
  WARNING:   { className: "gh-alert-warning",   defaultTitle: "Warning" },
  CAUTION:   { className: "gh-alert-caution",   defaultTitle: "Caution" },
};

function extractText(node: unknown): string {
  if (!node || typeof node !== "object" || !("type" in node)) return "";
  const n = node as { type: string; value?: string; children?: unknown[] };
  if (n.type === "text" && typeof n.value === "string") return n.value;
  if (n.type === "inlineCode" && typeof n.value === "string") return `<code>${n.value}</code>`;
  if (n.type === "strong" && Array.isArray(n.children))
    return `<strong>${n.children.map(extractText).join("")}</strong>`;
  if (n.type === "emphasis" && Array.isArray(n.children))
    return `<em>${n.children.map(extractText).join("")}</em>`;
  if (Array.isArray(n.children)) return n.children.map(extractText).join("");
  return "";
}

interface AlertMatch {
  index: number;
  type: string;
  title: string;
  body: string;
}

export const remarkGithubAlerts: Plugin<[], Root> = () => {
  return (tree: Root) => {
    const alerts: AlertMatch[] = [];

    visit(tree, "blockquote", (node, index) => {
      if (typeof index !== "number") return;
      const first = (node as Blockquote).children[0];
      if (!first || first.type !== "paragraph") return;
      const textNode = (first as Paragraph).children[0];
      if (!textNode || textNode.type !== "text") return;

      const match = ALERT_RE.exec((textNode as Text).value);
      if (!match) return;

      const alertType = match[1]!.toUpperCase();
      const meta = ALERT_META[alertType];
      if (!meta) return;

      const title = match[2]?.trim() || meta.defaultTitle;
      const bodyParts: string[] = [];
      const bqChildren = (node as Blockquote).children;
      for (let i = 1; i < bqChildren.length; i++) {
        const child = bqChildren[i];
        if (!child) continue;
        if (child.type === "paragraph") {
          const text = (child as Paragraph).children.map(extractText).join("");
          if (text) bodyParts.push(`<p>${text}</p>`);
        }
      }

      alerts.push({
        index,
        type: meta.className,
        title,
        body: bodyParts.join(""),
      });
    });

    // Replace in reverse order to preserve indices
    for (let i = alerts.length - 1; i >= 0; i--) {
      const alert = alerts[i]!;
      const htmlNode: Html = {
        type: "html",
        value: `<div class="gh-alert ${alert.type}"><p class="gh-alert-title"><span>${alert.title}</span></p>${alert.body}</div>`,
      };
      tree.children.splice(alert.index, 1, htmlNode);
    }
  };
};