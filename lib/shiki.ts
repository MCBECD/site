import { createHighlighter, type Highlighter } from "shiki";
import mcfunctionGrammar from "@/lib/md/mcfunction.json";

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
      langs: [mcfunctionGrammar, "markdown", "sh"],
    }).catch((err) => {
      // Clear the stale promise so the next call can retry
      g.__shikiHighlighterPromise = undefined;
      throw err;
    });
  }

  try {
    g.__shikiHighlighter = await g.__shikiHighlighterPromise;
  } catch (err) {
    console.error("[shiki] Failed to initialize highlighter:", err);
    throw err;
  }
  return g.__shikiHighlighter;
}
