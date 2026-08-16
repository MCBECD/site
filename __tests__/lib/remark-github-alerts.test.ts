import { describe, it, expect } from "vitest";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { remarkGithubAlerts } from "@/lib/md/remark-github-alerts";

async function transform(markdown: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGithubAlerts)
    .use(remarkStringify)
    .process(markdown);
  return String(file);
}

describe("remarkGithubAlerts", () => {
  describe("alert detection", () => {
    it("transforms [!NOTE] blockquote with default title", async () => {
      const result = await transform("> [!NOTE]\n>\n> A helpful note.");
      expect(result).toContain("gh-alert");
      expect(result).toContain("gh-alert-note");
      expect(result).toContain("A helpful note");
      expect(result).not.toContain("blockquote");
    });

    it("transforms [!TIP] blockquote", async () => {
      const result = await transform("> [!TIP]\n>\n> A pro tip.");
      expect(result).toContain("gh-alert-tip");
      expect(result).toContain("A pro tip");
    });

    it("transforms [!IMPORTANT] blockquote", async () => {
      const result = await transform("> [!IMPORTANT]\n>\n> Key info.");
      expect(result).toContain("gh-alert-important");
      expect(result).toContain("Key info");
    });

    it("transforms [!WARNING] blockquote", async () => {
      const result = await transform("> [!WARNING]\n>\n> Be careful!");
      expect(result).toContain("gh-alert-warning");
      expect(result).toContain("Be careful");
    });

    it("transforms [!CAUTION] blockquote", async () => {
      const result = await transform("> [!CAUTION]\n>\n> Danger!");
      expect(result).toContain("gh-alert-caution");
      expect(result).toContain("Danger");
    });
  });

  describe("custom titles", () => {
    it("uses custom title when provided after alert type", async () => {
      const result = await transform("> [!NOTE] 自定义标题\n>\n> Content here.");
      expect(result).toContain("自定义标题");
      expect(result).toContain("Content here");
    });
  });

  describe("case insensitivity", () => {
    it("handles lowercase alert type", async () => {
      const result = await transform("> [!note]\n>\n> Lowercase note.");
      expect(result).toContain("gh-alert-note");
    });

    it("handles mixed case alert type", async () => {
      const result = await transform("> [!Tip]\n>\n> Mixed case.");
      expect(result).toContain("gh-alert-tip");
    });
  });

  describe("non-alert blockquotes", () => {
    it("leaves regular blockquotes unchanged", async () => {
      const result = await transform("> Just a regular quote\n> second line");
      expect(result).not.toContain("gh-alert");
    });

    it("leaves standard blockquote readable", async () => {
      const result = await transform(
        "> First paragraph.\n>\n> Second paragraph.",
      );
      expect(result).not.toContain("gh-alert");
    });
  });

  describe("multi-paragraph alerts", () => {
    it("handles first paragraph as body when no blank line after alert", async () => {
      const result = await transform(
        "> [!NOTE]\n> First paragraph.\n>\n> Second paragraph.",
      );
      expect(result).toContain("gh-alert-note");
      expect(result).toContain("First paragraph");
    });
  });

  describe("invalid alerts pass through", () => {
    it("leaves unknown alert type as blockquote", async () => {
      const result = await transform("> [!UNKNOWN]\n>\n> Some content.");
      expect(result).not.toContain("gh-alert-unknown");
    });
  });
});
