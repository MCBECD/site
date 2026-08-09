/**
 * localStorage 工具 — 收藏、最近浏览
 */

const PREFIX = "mcbecd-";

function getKey(key: string) {
  return `${PREFIX}${key}`;
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(getKey(key));
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getKey(key), JSON.stringify(value));
  } catch {
    // storage full — ignore
  }
}

/* ----------------------------------------------------------
 * 收藏 (Bookmarks)
 * ---------------------------------------------------------- */

const BOOKMARKS_KEY = "bookmarks";

export function getBookmarks(): string[] {
  return read<string[]>(BOOKMARKS_KEY, []);
}

export function isBookmarked(id: string): boolean {
  return getBookmarks().includes(id);
}

export function toggleBookmark(id: string): boolean {
  const list = getBookmarks();
  const idx = list.indexOf(id);
  if (idx >= 0) {
    list.splice(idx, 1);
  } else {
    list.push(id);
  }
  write(BOOKMARKS_KEY, list);
  return idx < 0; // true = added
}

/* ----------------------------------------------------------
 * 最近浏览 (Recent History)
 * ---------------------------------------------------------- */

const HISTORY_KEY = "history";
const MAX_HISTORY = 20;

export interface HistoryEntry {
  id: string;
  title: string;
  ts: number;
}

export function getHistory(): HistoryEntry[] {
  return read<HistoryEntry[]>(HISTORY_KEY, []);
}

export function addHistory(id: string, title: string): void {
  const list = getHistory();
  // 去重：已存在则移到最前
  const idx = list.findIndex((e) => e.id === id);
  if (idx >= 0) list.splice(idx, 1);
  list.unshift({ id, title, ts: Date.now() });
  // 超过上限裁剪
  if (list.length > MAX_HISTORY) list.length = MAX_HISTORY;
  write(HISTORY_KEY, list);
}

export function clearHistory(): void {
  write(HISTORY_KEY, []);
}


