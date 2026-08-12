import { createHighlighter, type Highlighter } from "shiki";
import mcfunctionGrammar from "@/lib/mdx/mcfunction.json";

type ShikiGlobal = typeof globalThis & {
  __shikiHighlighter?: Highlighter;
  __shikiHighlighterPromise?: Promise<Highlighter>;
};

export async function getHighlighter(): Promise<Highlighter> {
  const g = globalThis as ShikiGlobal;

  if (g.__shikiHighlighter) {
    return g.__shikiHighlighter;
  }

  if (!g.__shikiHighlighterPromise) {
    g.__shikiHighlighterPromise = createHighlighter({
      themes: ["github-light", "github-dark"],
      langs: [mcfunctionGrammar],
    });
  }

  g.__shikiHighlighter = await g.__shikiHighlighterPromise;
  return g.__shikiHighlighter;
}