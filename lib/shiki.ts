/// <reference path="./shiki.d.ts" />
import { createHighlighter, type Highlighter } from "shiki";
import mcfunctionGrammar from "@/lib/mdx/mcfunction.json";

export async function getHighlighter(): Promise<Highlighter> {
  if (globalThis.__shikiHighlighter) {
    return globalThis.__shikiHighlighter;
  }

  if (!globalThis.__shikiHighlighterPromise) {
    globalThis.__shikiHighlighterPromise = createHighlighter({
      themes: ["github-light", "github-dark"],
      langs: [mcfunctionGrammar],
    });
  }

  globalThis.__shikiHighlighter = await globalThis.__shikiHighlighterPromise;
  return globalThis.__shikiHighlighter;
}
