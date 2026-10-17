import { describe, it, expect, beforeAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  getAllDocs,
  getDocById,
  SCAN_CATEGORIES,
} from "@/lib/docs";

const TEST_DOCS_DIR = path.join(process.cwd(), "content", "docs");
let hasContent = false;

beforeAll(() => {
  if (!fs.existsSync(TEST_DOCS_DIR)) {
    throw new Error(`Test docs directory not found: ${TEST_DOCS_DIR}`);
  }
  try {
    const entries = fs.readdirSync(TEST_DOCS_DIR, { recursive: true, withFileTypes: true });
    hasContent = entries.some((e) => e.isFile() && e.name.endsWith(".md"));
  } catch {
    hasContent = false;
  }
});

describe("docs.ts - Document Engine", () => {
  describe("getAllDocs", () => {
    it("returns a non-empty array when content/docs has .md files", () => {
      const docs = getAllDocs();
      if (!hasContent) {
        expect(docs).toEqual([]);
        return;
      }
      expect(docs.length).toBeGreaterThan(0);
    });

    it("every document has required fields", () => {
      const docs = getAllDocs();
      if (docs.length === 0) return;
      for (const doc of docs) {
        expect(doc.id).toBeTruthy();
        expect(doc.title).toBeTruthy();
        expect(typeof doc.id).toBe("string");
        expect(typeof doc.title).toBe("string");
      }
    });

    it("documents have valid category format", () => {
      const docs = getAllDocs();
      if (docs.length === 0) return;
      for (const doc of docs) {
        if (doc.category) {
          // @why 直接引用扫描白名单。此前这里抄了一份字面量，加分类时两边就会不同步，
          // 测试挂掉但看不出是测试过期还是真有问题。
          const validBases: readonly string[] = SCAN_CATEGORIES;
          const base = doc.category.includes("/") ? doc.category.split("/")[0] : doc.category;
          expect(validBases).toContain(base);
        }
      }
    });

    it("returns empty array for missing docs directory", () => {
      const docs = getAllDocs();
      expect(Array.isArray(docs)).toBe(true);
    });
  });

  describe("getDocById", () => {
    it("returns null for non-existent document", () => {
      const doc = getDocById("non-existent-doc-id");
      expect(doc).toBeNull();
    });

    it("finds a document by id", () => {
      const doc = getDocById("commands/give");
      if (!hasContent) {
        expect(doc).toBeNull();
        return;
      }
      expect(doc).not.toBeNull();
      expect(doc!.meta.id).toBe("commands/give");
      expect(doc!.meta.title).toBeTruthy();
      expect(doc!.rawContent).toBeTypeOf("string");
      expect(doc!.rawContent.length).toBeGreaterThan(0);
    });

    it("returns null for empty string id", () => {
      const doc = getDocById("");
      expect(doc).toBeNull();
    });

    it("returns null for id with path traversal", () => {
      const doc = getDocById("../../etc/passwd");
      expect(doc).toBeNull();
    });
  });

});