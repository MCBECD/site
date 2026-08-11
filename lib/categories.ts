export const CATEGORY_LABELS: Record<string, string> = {
  commands: "命令",
  basics: "基础",
  intro: "简介",
};

export function getCategoryLabel(category?: string): string | undefined {
  if (!category) return undefined;
  return CATEGORY_LABELS[category] ?? category;
}

export function getAllCategoryLabels(): Record<string, string> {
  return { ...CATEGORY_LABELS };
}