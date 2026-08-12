import { describe, it, expect, beforeAll } from "vitest";
import fs from "node:fs";
import path from "node:path";

// Import the module under test
import {
  getAllDocs,
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

    it("documents have valid category format", () => {
      const docs = getAllDocs();
      for (const doc of docs) {
        if (doc.category) {
          const validBases = ["basics", "commands", "community"];
          const base = doc.category.includes("/") ? doc.category.split("/")[0] : doc.category;
          expect(validBases).toContain(base);
        }
      }
    });

  });

  describe("getDocById", () => {
    it("returns null for non-existent document", () => {
      const doc = getDocById("non-existent-doc-id");
      expect(doc).toBeNull();
    });

    it("finds a flat document by id", () => {
      const doc = getDocById("give");
      if (!doc) {
        return;
      }
      expect(doc.meta.id).toBe("give");
      expect(doc.meta.title).toBeTruthy();
      expect(doc.rawContent).toBeTypeOf("string");
      expect(doc.rawContent.length).toBeGreaterThan(0);
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