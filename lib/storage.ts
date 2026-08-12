/**
 * localStorage utility — Unified client-side storage abstraction
 *
 * All client-side persistence should go through this module, ensuring:
 *   - Unified key prefix (mcbecd-)
 *   - SSR safety (typeof window check)
 *   - Fault tolerance (returns fallback on JSON parse failure)
 */

const PREFIX = "mcbecd-";

function getKey(key: string): string {
  return `${PREFIX}${key}`;
}

/** Read and deserialize; removes corrupted key and returns fallback on failure */
export function storageRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const fullKey = getKey(key);
  try {
    const raw = localStorage.getItem(fullKey);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[storage] Failed to read key: ${fullKey}, removing corrupted entry`, err);
    localStorage.removeItem(fullKey);
    return fallback;
  }
}

/** Serialize and write */
export function storageWrite(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getKey(key), JSON.stringify(value));
  } catch (err) {
    if (err instanceof DOMException && err.name === "QuotaExceededError") {
      console.warn(`[storage] Quota exceeded when writing key: ${key}`);
    } else {
      console.error(`[storage] Failed to write key: ${key}`, err);
    }
  }
}

/* ----------------------------------------------------------
 * Bookmarks
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
 * Recent History
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
  // Deduplicate: move existing entry to front
  const idx = list.findIndex((e) => e.id === id);
  if (idx >= 0) list.splice(idx, 1);
  list.unshift({ id, title, ts: Date.now() });
  // Trim if exceeding max length
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
 * Docs page UI state (category filter, sort, view, page number, scroll position)
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
