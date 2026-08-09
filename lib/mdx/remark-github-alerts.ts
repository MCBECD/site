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
import type { Root, Blockquote, Text, Html } from "mdast";
import { visit } from "unist-util-visit";

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

export const remarkGithubAlerts: Plugin<[], Root> = () => {
  return (tree: Root) => {
    const alerts: { index: number; html: string }[] = [];

    visit(tree, "blockquote", (node: Blockquote, index: number | undefined) => {
      if (typeof index !== "number") return;

      const first = node.children[0];
      if (!first || first.type !== "paragraph") return;

      const textNode = first.children[0];
      if (!textNode || textNode.type !== "text") return;

      const match = ALERT_RE.exec((textNode as Text).value);
      if (!match) return;

      const alertType = match[1]!.toUpperCase();
      const meta = ALERT_META[alertType];
      if (!meta) return;

      const title = match[2]?.trim() || meta.defaultTitle;
      const bodyParts: string[] = [];

      for (let i = 1; i < node.children.length; i++) {
        const child = node.children[i];
        if (!child) continue;
        if (child.type === "paragraph") {
          const text = child.children.map(extractText).join("");
          if (text) bodyParts.push(`<p>${text}</p>`);
        }
      }

      alerts.push({
        index,
        html: `<div class="gh-alert ${meta.className}"><p class="gh-alert-title"><span>${title}</span></p>${bodyParts.join("")}</div>`,
      });
    });

    // Replace in reverse order to preserve indices
    for (let i = alerts.length - 1; i >= 0; i--) {
      const alert = alerts[i]!;
      const htmlNode: Html = { type: "html", value: alert.html };
      tree.children.splice(alert.index, 1, htmlNode);
    }
  };
};
