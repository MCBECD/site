import { createHighlighter, type Highlighter } from "shiki";
import mcfunctionGrammar from "@/lib/mdx/mcfunction.json";

const globalHighlighter = globalThis as unknown as {
  __shikiHighlighter?: Highlighter;
  __shikiHighlighterPromise?: Promise<Highlighter>;
};

export async function getHighlighter(): Promise<Highlighter> {
  if (globalHighlighter.__shikiHighlighter) {
    return globalHighlighter.__shikiHighlighter;
  }

  if (!globalHighlighter.__shikiHighlighterPromise) {
    globalHighlighter.__shikiHighlighterPromise = createHighlighter({
      themes: ["github-light", "github-dark"],
      langs: [mcfunctionGrammar],
    });
  }

  globalHighlighter.__shikiHighlighter = await globalHighlighter.__shikiHighlighterPromise;
  return globalHighlighter.__shikiHighlighter;
}