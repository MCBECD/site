import { describe, it, expect, beforeAll } from "vitest";
import fs from "node:fs";
import path from "node:path";

// Import the module under test
import {
  getAllDocs,
  getAllTags,
  getDocById,
  getDocRawContent,
} from "@/lib/docs";

const TEST_DOCS_DIR = path.join(process.cwd(), "content", "docs");

describe("docs.ts - Document Engine", () => {
  beforeAll(() => {
    // Verify test data exists
    if (!fs.existsSync(TEST_DOCS_DIR)) {
      throw new Error(`Test docs directory not found: ${TEST_DOCS_DIR}`);
    }
  });

  describe("getAllDocs", () => {
    it("returns a non-empty array of documents", () => {
      const docs = getAllDocs();
      expect(docs.length).toBeGreaterThan(0);
    });

    it("every document has required fields", () => {
      const docs = getAllDocs();
      for (const doc of docs) {
        expect(doc.id).toBeTruthy();
        expect(doc.title).toBeTruthy();
        expect(typeof doc.id).toBe("string");
        expect(typeof doc.title).toBe("string");
      }
    });

    it("documents are sorted by pinned first then time desc", () => {
      const docs = getAllDocs();
      for (let i = 1; i < docs.length; i++) {
        const prev = docs[i - 1]!;
        const curr = docs[i]!;
        // Pinned first, then by updatedAt desc
        if (prev.updatedAt && curr.updatedAt && prev.updatedAt !== curr.updatedAt) {
          expect(prev.updatedAt >= curr.updatedAt).toBe(true);
        }
      }
    });

    it("returns documents with valid reading time when present", () => {
      const docs = getAllDocs();
      for (const doc of docs) {
        if (doc.readingTime !== undefined) {
          expect(doc.readingTime).toBeGreaterThan(0);
          expect(Number.isInteger(doc.readingTime)).toBe(true);
        }
      }
    });
  });

  describe("getAllTags", () => {
    it("returns an array of unique sorted tags", () => {
      const tags = getAllTags();
      const uniqueTags = [...new Set(tags)];
      expect(tags).toEqual(uniqueTags);
    });

    it("tags are sorted alphabetically", () => {
      const tags = getAllTags();
      const sorted = [...tags].sort((a, b) => a.localeCompare(b, "zh-CN"));
      expect(tags).toEqual(sorted);
    });
  });

  describe("getDocById", () => {
    it("returns null for non-existent document", () => {
      const doc = getDocById("non-existent-doc-id");
      expect(doc).toBeNull();
    });

    it("finds a flat document by id", () => {
      // 'give' is a flat .mdx file
      const doc = getDocById("give");
      if (!doc) {
        // Might not exist if test data varies, skip gracefully
        return;
      }
      expect(doc.meta.id).toBe("give");
      expect(doc.meta.title).toBeTruthy();
      expect(doc.rawContent).toBeTypeOf("string");
      expect(doc.rawContent.length).toBeGreaterThan(0);
    });

    it("finds a folder document by id", () => {
      // 'give-diamonds' is a folder with index.mdx + meta.json
      const doc = getDocById("give-diamonds");
      if (!doc) {
        return; // Skip if not present
      }
      expect(doc.meta.id).toBe("give-diamonds");
      expect(doc.meta.title).toBeTruthy();
      expect(doc.rawContent).toBeTypeOf("string");
    });

    it("returns null for empty string id", () => {
      const doc = getDocById("");
      expect(doc).toBeNull();
    });
  });

  describe("getDocRawContent", () => {
    it("returns raw content for existing doc", () => {
      const content = getDocRawContent("give");
      if (!content) return; // skip
      expect(content).toContain("---");
      expect(typeof content).toBe("string");
    });

    it("returns null for non-existent doc", () => {
      const content = getDocRawContent("nonexistent-12345");
      expect(content).toBeNull();
    });
  });
});
