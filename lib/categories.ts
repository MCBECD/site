/** Category key to i18n key mapping */
const CATEGORY_I18N_KEYS: Record<string, string> = {
  basics: "doc.filterBasics",
  commands: "doc.filterCommands",
  community: "doc.filterCommunity",
  hidden: "doc.filterHidden",
};

export function getCategoryBase(category?: string): string {
  if (!category) return "";
  const slashIndex = category.indexOf("/");
  return slashIndex === -1 ? category : category.slice(0, slashIndex);
}

function getCategorySub(category?: string): string | undefined {
  if (!category) return undefined;
  const slashIndex = category.indexOf("/");
  return slashIndex === -1 ? undefined : category.slice(slashIndex + 1);
}

/** Returns the i18n key for a category (e.g. "doc.filterCommands"). */
export function getCategoryI18nKey(category?: string): string | undefined {
  if (!category) return undefined;
  const base = getCategoryBase(category);
  return CATEGORY_I18N_KEYS[base];
}

export function getCommandType(category?: string): string | undefined {
  if (!category) return undefined;
  const base = getCategoryBase(category);
  if (base !== "commands") return undefined;
  return getCategorySub(category);
}

/** Returns the i18n key for a command type (e.g. "doc.typePlayer"). */
export function getCommandTypeI18nKey(category?: string): string | undefined {
  const type = getCommandType(category);
  if (!type) return undefined;
  return `doc.type${type}`;
}

export function getBasicsOrder(category?: string): number {
  if (!category) return Infinity;
  const base = getCategoryBase(category);
  if (base !== "basics") return Infinity;
  const sub = getCategorySub(category);
  return sub !== undefined ? Number(sub) : Infinity;
}

/** Extract numeric prefix from a community doc filename (id sub-part). */
export function getCommunityOrder(id: string): number {
  const parts = id.split("/");
  const filename = parts[parts.length - 1] ?? "";
  const numMatch = filename.match(/^(\d+)/);
  return numMatch ? Number(numMatch[1]) : Infinity;
}