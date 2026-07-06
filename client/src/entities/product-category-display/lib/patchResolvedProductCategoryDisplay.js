import { patchProductCategoryDisplay } from "../api/patchProductCategoryDisplay.js";
import { patchProductCategoryNodeDisplay } from "../api/patchProductCategoryNodeDisplay.js";

/**
 * @param {Pick<import('./types.js').ResolvedProductCategoryDisplay, 'categoryId' | 'displaySlug'>} resolved
 * @param {{
 *   customLabel?: string | null;
 *   imageUrl?: string | null;
 *   resetCustomLabel?: boolean;
 *   resetImageUrl?: boolean;
 * }} body
 */
export async function patchResolvedProductCategoryDisplay(resolved, body) {
  if (resolved.categoryId) {
    const { display } = await patchProductCategoryNodeDisplay(resolved.categoryId, body);
    return display;
  }

  const { display } = await patchProductCategoryDisplay(resolved.displaySlug, body);
  return display;
}
