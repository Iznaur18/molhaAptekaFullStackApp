/**
 * Резолв id узла крошки по slug/label, если API ещё без categoryId.
 * @param {{
 *   trail: Array<{ categoryId?: string; slug?: string; labelRu?: string }>;
 *   index: number;
 *   roots: Array<{ id: string; slug?: string; labelRu?: string }>;
 *   fetchChildren: (categoryId: string) => Promise<Array<{ id: string; slug?: string; labelRu?: string }>>;
 * }} params
 * @returns {Promise<string | null>}
 */
export async function resolveCatalogBreadcrumbCategoryId({
  trail,
  index,
  roots,
  fetchChildren,
}) {
  if (!Array.isArray(trail) || index < 0 || index >= trail.length) {
    return null;
  }

  const directId = String(trail[index]?.categoryId ?? "").trim();
  if (directId) {
    return directId;
  }

  let level = Array.isArray(roots) ? roots : [];
  let resolvedId = /** @type {string | null} */ (null);

  for (let step = 0; step <= index; step += 1) {
    const target = trail[step] ?? {};
    const targetSlug = String(target.slug ?? "").trim();
    const targetLabel = String(target.labelRu ?? "").trim();
    const match =
      level.find((node) => {
        const nodeSlug = String(node.slug ?? "").trim();
        const nodeLabel = String(node.labelRu ?? "").trim();
        if (targetSlug && nodeSlug && targetSlug === nodeSlug) {
          return true;
        }
        return Boolean(targetLabel) && targetLabel === nodeLabel;
      }) ?? null;

    if (!match?.id) {
      return null;
    }

    resolvedId = String(match.id);
    if (step === index) {
      return resolvedId;
    }

    level = await fetchChildren(resolvedId);
  }

  return resolvedId;
}
