export const CATEGORY_LABELS: Record<string, string> = {
  basics: "基础",
  commands: "命令",
  examples: "示例",
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

export function getCategoryLabel(category?: string): string | undefined {
  if (!category) return undefined;
  const base = getCategoryBase(category);
  return CATEGORY_LABELS[base] ?? base;
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