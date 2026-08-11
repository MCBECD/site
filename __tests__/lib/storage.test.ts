import { describe, it, expect, beforeEach } from "vitest";
import {
  getBookmarks, isBookmarked, toggleBookmark, removeBookmark, clearBookmarks,
  getHistory, addHistory, removeHistory, clearHistory,
} from "@/lib/storage";

describe("Bookmarks", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns empty array initially", () => {
    expect(getBookmarks()).toEqual([]);
  });

  it("adds a bookmark via toggleBookmark", () => {
    const added = toggleBookmark("cmd/give");
    expect(added).toBe(true);
    expect(getBookmarks()).toContain("cmd/give");
  });

  it("removes a bookmark via toggleBookmark (toggle off)", () => {
    toggleBookmark("cmd/give");
    const added = toggleBookmark("cmd/give");
    expect(added).toBe(false);
    expect(getBookmarks()).not.toContain("cmd/give");
  });

  it("isBookmarked returns correct state", () => {
    expect(isBookmarked("cmd/tp")).toBe(false);
    toggleBookmark("cmd/tp");
    expect(isBookmarked("cmd/tp")).toBe(true);
  });

  it("removeBookmark removes specific id", () => {
    toggleBookmark("cmd/a");
    toggleBookmark("cmd/b");
    removeBookmark("cmd/a");
    expect(getBookmarks()).toEqual(["cmd/b"]);
  });

  it("clearBookmarks empties the list", () => {
    toggleBookmark("cmd/a");
    toggleBookmark("cmd/b");
    clearBookmarks();
    expect(getBookmarks()).toEqual([]);
  });

  it("handles localStorage prefix correctly", () => {
    toggleBookmark("cmd/give");
    const raw = localStorage.getItem("mcbecd-bookmarks");
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!)).toContain("cmd/give");
  });
});

describe("History", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns empty array initially", () => {
    expect(getHistory()).toEqual([]);
  });

  it("adds a history entry", () => {
    addHistory("cmd/give", "give 命令");
    const list = getHistory();
    expect(list).toHaveLength(1);
    expect(list[0]!.id).toBe("cmd/give");
    expect(list[0]!.title).toBe("give 命令");
    expect(list[0]!.ts).toBeTypeOf("number");
  });

  it("deduplicates: moves existing entry to front", () => {
    addHistory("cmd/a", "A");
    addHistory("cmd/b", "B");
    addHistory("cmd/a", "A updated");
    const list = getHistory();
    expect(list).toHaveLength(2);
    expect(list[0]!.id).toBe("cmd/a");
    expect(list[0]!.title).toBe("A updated");
  });

  it("caps at 20 entries", () => {
    for (let i = 0; i < 25; i++) {
      addHistory(`cmd/${i}`, `Doc ${i}`);
    }
    expect(getHistory()).toHaveLength(20);
  });

  it("removeHistory removes specific entry", () => {
    addHistory("cmd/a", "A");
    addHistory("cmd/b", "B");
    removeHistory("cmd/a");
    const list = getHistory();
    expect(list).toHaveLength(1);
    expect(list[0]!.id).toBe("cmd/b");
  });

  it("clearHistory empties the list", () => {
    addHistory("cmd/a", "A");
    addHistory("cmd/b", "B");
    clearHistory();
    expect(getHistory()).toEqual([]);
  });
});
