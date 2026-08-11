/** Category key to i18n key mapping */
const CATEGORY_I18N_KEYS: Record<string, string> = {
  basics: "doc.filterBasics",
  commands: "doc.filterCommands",
  examples: "doc.filterExamples",
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

/** @deprecated Use getCategoryI18nKey() + t() for i18n support */
export function getCategoryLabel(category?: string): string | undefined {
  if (!category) return undefined;
  const base = getCategoryBase(category);
  return CATEGORY_I18N_KEYS[base] ?? base;
}

export function getCommandType(category?: string): string | undefined {
  if (!category) return undefined;
  const base = getCategoryBase(category);
  if (base !== "commands") return undefined;
  return getCategorySub(category);
}

export function getBasicsOrder(category?: string): number {
  if (!category) return Infinity;
  const base = getCategoryBase(category);
  if (base !== "basics") return Infinity;
  const sub = getCategorySub(category);
  return sub !== undefined ? Number(sub) : Infinity;
}
