/**
 * localStorage 工具 — 统一的客户端存储抽象
 *
 * 所有客户端持久化都应通过此模块，确保：
 *   - 统一的 key 前缀（mcbecd-）
 *   - SSR 安全（typeof window 检查）
 *   - 容错（JSON 解析失败返回 fallback）
 */

const PREFIX = "mcbecd-";

function getKey(key: string): string {
  return `${PREFIX}${key}`;
}

/** 读取并反序列化，失败时移除损坏的 key 并返回 fallback */
export function storageRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const fullKey = getKey(key);
  try {
    const raw = localStorage.getItem(fullKey);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    localStorage.removeItem(fullKey);
    return fallback;
  }
}

/** 序列化并写入 */
export function storageWrite(key: string, value: unknown): void {
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
  return storageRead<string[]>(BOOKMARKS_KEY, []);
}

export function isBookmarked(id: string, list?: string[]): boolean {
  return (list ?? getBookmarks()).includes(id);
}

export function removeBookmark(id: string): void {
  const list = getBookmarks();
  const idx = list.indexOf(id);
  if (idx >= 0) list.splice(idx, 1);
  storageWrite(BOOKMARKS_KEY, list);
}

export function clearBookmarks(): void {
  storageWrite(BOOKMARKS_KEY, []);
}

export function toggleBookmark(id: string): boolean {
  const list = getBookmarks();
  const idx = list.indexOf(id);
  if (idx >= 0) {
    list.splice(idx, 1);
  } else {
    list.push(id);
  }
  storageWrite(BOOKMARKS_KEY, list);
  return idx < 0; // true = added
}

/* ----------------------------------------------------------
 * 最近浏览 (Recent History)
 * ---------------------------------------------------------- */

const HISTORY_KEY = "history";
const MAX_HISTORY = 20;

interface HistoryEntry {
  id: string;
  title: string;
  ts: number;
}

export function getHistory(): HistoryEntry[] {
  return storageRead<HistoryEntry[]>(HISTORY_KEY, []);
}

export function addHistory(id: string, title: string): void {
  const list = getHistory();
  // 去重：已存在则移到最前
  const idx = list.findIndex((e) => e.id === id);
  if (idx >= 0) list.splice(idx, 1);
  list.unshift({ id, title, ts: Date.now() });
  // 超过上限裁剪
  if (list.length > MAX_HISTORY) list.length = MAX_HISTORY;
  storageWrite(HISTORY_KEY, list);
}

export function removeHistory(id: string): void {
  const list = getHistory();
  const idx = list.findIndex((e) => e.id === id);
  if (idx >= 0) list.splice(idx, 1);
  storageWrite(HISTORY_KEY, list);
}

export function clearHistory(): void {
  storageWrite(HISTORY_KEY, []);
}

/* ----------------------------------------------------------
 * 文档页 UI 状态 (分类筛选、排序、视图、页码、滚动位置)
 * ---------------------------------------------------------- */

const DOCS_UI_STATE_KEY = "docs-ui-state";

export interface DocsUIState {
  viewMode: string;
  page: number;
  scrollY: number;
}

export function saveDocsUIState(state: DocsUIState): void {
  storageWrite(DOCS_UI_STATE_KEY, state);
}

export function loadDocsUIState(): DocsUIState | null {
  return storageRead<DocsUIState | null>(DOCS_UI_STATE_KEY, null);
}
