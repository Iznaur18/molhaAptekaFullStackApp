/** Как в `resolveProductCategoryWrite` на сервере. */
export const PRODUCT_CATEGORY_BREADCRUMB_SEPARATOR = " › ";

/**
 * Конечная (листовая) категория из breadcrumb, иначе null.
 */
export function resolveProductCategoryLeafLabel(
  breadcrumbRu: unknown,
): string | null {
  if (typeof breadcrumbRu !== "string") return null;
  const trimmed = breadcrumbRu.trim();
  if (!trimmed) return null;

  const parts = trimmed
    .split(/\s*[›>]\s*/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) return null;
  return parts[parts.length - 1] ?? null;
}
