// src/lib/category-labels.ts
// Category names are mutable by anyone on this public API and have been
// observed vandalized/renamed (e.g. "Updated Category Name", "Love is light").
// Since categoryId is stable and that's what filtering actually depends on,
// override display labels for the categories we feature, rather than
// trusting live category.name for anything shown in the UI.
export const CATEGORY_LABEL_OVERRIDES: Record<number, string> = {
  1: "Clothes",
  2: "Electronics",
  3: "Furniture",
  4: "Shoes",
};

export function getCategoryLabel(id: number, fallbackName: string): string {
  return CATEGORY_LABEL_OVERRIDES[id] ?? fallbackName;
}