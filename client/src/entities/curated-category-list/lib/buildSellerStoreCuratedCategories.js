import { buildCuratedCategoryItemKey } from "@molha/api-contract";

/**
 * Оплаченные личные категории продавцов → элементы витрины категорий,
 * чтобы главная показывала их тем же рядом плиток, что и витрины админа.
 *
 * @param {Array<{ _id: string; sellerId: string; labelRu: string; imageUrl?: string | null }>} tiles
 * @returns {import('../model/types.js').HomeCuratedCategoryFromApi[]}
 */
export function buildSellerStoreCuratedCategories(tiles) {
  return tiles.map((tile) => ({
    itemKey: buildCuratedCategoryItemKey("personal", tile._id),
    kind: "personal",
    refId: tile._id,
    label: tile.labelRu,
    imageUrl: tile.imageUrl ?? null,
    sellerId: tile.sellerId,
  }));
}
