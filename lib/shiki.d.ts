import type { Highlighter } from "shiki";

declare global {
  var __shikiHighlighter?: Highlighter;
  var __shikiHighlighterPromise?: Promise<Highlighter>;
}
