/**
 * Route/category → URL prefix mapping.
 *
 * After the docs/community merge at the root:
 *   basics/<name>   → /<name>/
 *   commands/<name> → /commands/<name>/
 * Community local content is no longer parsed (comes from Supabase).
 */
const CATEGORY_PREFIX: Record<string, string> = {
  basics: "",
  commands: "/commands",
};

/** Convert a doc id (e.g. "commands/give") into its public URL path. */
export function docIdToUrl(docId: string): string {
  const slashIndex = docId.indexOf("/");
  if (slashIndex === -1) return `/${docId}/`;
  const category = docId.slice(0, slashIndex);
  const name = docId.slice(slashIndex + 1);
  const base = CATEGORY_PREFIX[category] ?? `/${category}`;
  return `${base}/${name}/`;
}

/** Convert a public URL path (without leading/trailing slashes) into a doc id. */
export function urlToDocId(parts: string[]): string | null {
  if (parts.length === 0) return null;
  if (parts[0] === "commands") {
    if (parts.length !== 2) return null;
    return `commands/${parts[1]}`;
  }
  if (parts.length !== 1) return null;
  // Single segment at root level is treated as a basics doc.
  return `basics/${parts[0]}`;
}