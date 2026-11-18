import {
  PRODUCT_PROMOTION_BOOST_PRODUCTS_LIMIT,
  PRODUCT_PROMOTION_TIER_GOLD,
} from "@molha/api-contract";

import { ProductModel } from "../../models/index.js";
import { getHiddenSellerIds } from "../access/adminUserGuard.js";
import { buildProductRegionMatch } from "../user/userRegionCatalogFilter.js";
import { attachProductSellerSnapshots } from "./attachProductSellerSnapshots.js";
import { buildCatalogVisibleProductFilter } from "./curatedProductListHelpers.js";
import { getClosedSellerIdsNow } from "./getClosedSellerIdsNow.js";
import { enrichProductApiFields } from "./productDiscount.js";

/**
 * Какие товары считаются «в бусте прямо сейчас» для ряда на главной: уровень
 * «Буст», срок не истёк, товар виден в публичном каталоге и продаётся в
 * регионе зрителя (буст поднимает товар только в своём регионе).
 *
 * @param {{ now: Date; viewerRegionCode: string; hiddenSellerIds: unknown[] }} input
 */
export const buildActiveBoostProductsMatch = ({
  now,
  viewerRegionCode,
  hiddenSellerIds,
}) => ({
  ...buildCatalogVisibleProductFilter(hiddenSellerIds),
  ...buildProductRegionMatch(viewerRegionCode),
  catalogPromotionTier: PRODUCT_PROMOTION_TIER_GOLD,
  catalogPromotionExpiresAt: { $gt: now },
});

/** Свежие бусты первыми; `_id` — чтобы порядок не прыгал при равном времени. */
export const BOOST_PRODUCTS_SORT = { catalogPromotionActivatedAt: -1, _id: -1 };

/**
 * Товары с действующим «Бустом» в регионе зрителя — ряд на главной.
 * Отдаёт те же каталожные карточки, что и подборки товаров.
 * Закрытые по графику продавцы скрыты (свои — видны).
 *
 * @param {{
 *   viewerRegionCode?: string | null;
 *   viewerUserId?: string | null;
 * }} [input]
 */
export async function getProductPromotionBoostProducts({
  viewerRegionCode,
  viewerUserId = null,
} = {}) {
  const [hiddenSellerIds, closedSellerIds] = await Promise.all([
    getHiddenSellerIds(),
    getClosedSellerIdsNow({ excludeUserId: viewerUserId }),
  ]);
  const excludeSellerIds = [...hiddenSellerIds, ...closedSellerIds];
  const rows = await ProductModel.find(
    buildActiveBoostProductsMatch({
      now: new Date(),
      viewerRegionCode: String(viewerRegionCode ?? ""),
      hiddenSellerIds: excludeSellerIds,
    }),
  )
    .sort(BOOST_PRODUCTS_SORT)
    .limit(PRODUCT_PROMOTION_BOOST_PRODUCTS_LIMIT)
    .lean();

  const withSellerSnapshots = await attachProductSellerSnapshots(rows);
  return { products: withSellerSnapshots.map((row) => enrichProductApiFields(row)) };
}
