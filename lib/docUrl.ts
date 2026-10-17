/**
 * Route/category → URL prefix mapping.
 *
 * basics/<name>     → /<name>/
 * commands/<name>   → /commands/<name>/
 * community/<name>  → /community/<name>/
 * standards/<name>  → /standards/<name>/
 */
const CATEGORY_PREFIX: Record<string, string> = {
  basics: "",
  commands: "/commands",
  community: "/community",
  standards: "/standards",
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