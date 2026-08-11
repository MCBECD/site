import { describe, it, expect, beforeEach } from "vitest";
import {
  getBookmarks,
  isBookmarked,
  removeBookmark,
  clearBookmarks,
  toggleBookmark,
  getHistory,
  addHistory,
  removeHistory,
  clearHistory,
} from "@/lib/storage";

// Mock localStorage
const store = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => store.set(key, value),
  removeItem: (key: string) => store.delete(key),
  clear: () => store.clear(),
  get length() {
    return store.size;
  },
  key: (_index: number) => null,
};

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

beforeEach(() => {
  store.clear();
});

describe("Bookmarks", () => {
  describe("getBookmarks", () => {
    it("returns empty array when nothing stored", () => {
      expect(getBookmarks()).toEqual([]);
    });

    it("returns stored bookmarks", () => {
      store.set("mcbecd-bookmarks", JSON.stringify(["a", "b", "c"]));
      expect(getBookmarks()).toEqual(["a", "b", "c"]);
    });

    it("returns empty array on invalid JSON", () => {
      store.set("mcbecd-bookmarks", "not-json");
      expect(getBookmarks()).toEqual([]);
    });
  });

  describe("isBookmarked", () => {
    it("returns true when bookmarked", () => {
      store.set("mcbecd-bookmarks", JSON.stringify(["a", "b"]));
      expect(isBookmarked("a")).toBe(true);
    });

    it("returns false when not bookmarked", () => {
      store.set("mcbecd-bookmarks", JSON.stringify(["a", "b"]));
      expect(isBookmarked("c")).toBe(false);
    });
  });

  describe("toggleBookmark", () => {
    it("adds bookmark when not present, returns true", () => {
      const result = toggleBookmark("x");
      expect(result).toBe(true);
      expect(getBookmarks()).toContain("x");
    });

    it("removes bookmark when already present, returns false", () => {
      store.set("mcbecd-bookmarks", JSON.stringify(["x", "y"]));
      const result = toggleBookmark("x");
      expect(result).toBe(false);
      expect(getBookmarks()).toEqual(["y"]);
    });
  });

  describe("removeBookmark", () => {
    it("removes the specified bookmark", () => {
      store.set("mcbecd-bookmarks", JSON.stringify(["a", "b", "c"]));
      removeBookmark("b");
      expect(getBookmarks()).toEqual(["a", "c"]);
    });

    it("does nothing if bookmark not found", () => {
      store.set("mcbecd-bookmarks", JSON.stringify(["a", "b"]));
      removeBookmark("z");
      expect(getBookmarks()).toEqual(["a", "b"]);
    });
  });

  describe("clearBookmarks", () => {
    it("removes all bookmarks", () => {
      store.set("mcbecd-bookmarks", JSON.stringify(["a", "b"]));
      clearBookmarks();
      expect(getBookmarks()).toEqual([]);
    });
  });
});

describe("History", () => {
  describe("getHistory", () => {
    it("returns empty array when nothing stored", () => {
      expect(getHistory()).toEqual([]);
    });
  });

  describe("addHistory", () => {
    it("adds entry to front of list", () => {
      addHistory("cmd1", "Command 1");
      const history = getHistory();
      expect(history).toHaveLength(1);
      expect(history[0]!.id).toBe("cmd1");
      expect(history[0]!.title).toBe("Command 1");
      expect(history[0]!.ts).toBeTypeOf("number");
    });

    it("deduplicates: moves existing entry to front", () => {
      addHistory("cmd1", "Old Title");
      addHistory("cmd2", "Command 2");
      addHistory("cmd1", "New Title");
      const history = getHistory();
      expect(history).toHaveLength(2);
      expect(history[0]!.id).toBe("cmd1");
      expect(history[0]!.title).toBe("New Title");
      expect(history[1]!.id).toBe("cmd2");
    });

    it("trims to MAX_HISTORY (20) entries", () => {
      for (let i = 0; i < 25; i++) {
        addHistory(`cmd${i}`, `Command ${i}`);
      }
      const history = getHistory();
      expect(history).toHaveLength(20);
      // Most recent should be first
      expect(history[0]!.id).toBe("cmd24");
    });
  });

  describe("removeHistory", () => {
    it("removes the specified entry", () => {
      addHistory("cmd1", "Command 1");
      addHistory("cmd2", "Command 2");
      removeHistory("cmd1");
      const history = getHistory();
      expect(history).toHaveLength(1);
      expect(history[0]!.id).toBe("cmd2");
    });
  });

  describe("clearHistory", () => {
    it("removes all history", () => {
      addHistory("cmd1", "Command 1");
      addHistory("cmd2", "Command 2");
      clearHistory();
      expect(getHistory()).toEqual([]);
    });
  });
});
