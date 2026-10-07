import {
  SELLER_DELIVERY_REGION_LIMITED_CARRIERS,
  buildSellerDeliveryRegionBlockMessage,
  isSellerDeliveryOutsideRegionEnabled,
  resolveSellerDeliveryRegionBlock,
} from "@molha/api-contract";

import { UserModel } from "../../models/index.js";

/**
 * Не запретил ли продавец доставку в регион покупателя.
 *
 * Настройка одна на продавца и читается с профиля, а не с товара: товар —
 * снимок, и «свой» товар пересинк не трогает, так что ограничение на нём
 * могло бы устареть. Регион покупателя спрашиваем лениво — он стоит похода
 * в DaData и нужен, только если хоть один продавец ограничил доставку.
 *
 * @param {{
 *   items: Array<{
 *     sellerId: unknown;
 *     carrier: string | null | undefined;
 *     regionCode?: string | null;
 *   }>;
 *   resolveBuyerRegionCode: () => Promise<string | null | undefined> | string | null | undefined;
 * }} input
 * @returns {Promise<{ reason: string; message: string } | null>}
 */
export async function findSellerDeliveryRegionBlock({ items, resolveBuyerRegionCode }) {
  const limited = (items ?? []).filter((item) =>
    SELLER_DELIVERY_REGION_LIMITED_CARRIERS.includes(String(item?.carrier ?? "")),
  );
  if (limited.length === 0) return null;

  const sellerIds = [...new Set(limited.map((item) => String(item.sellerId ?? "")))];
  const sellers = await UserModel.find({ _id: { $in: sellerIds.filter(Boolean) } })
    .select(
      "sellerFulfillmentDefaults.deliveryOutsideRegionEnabled sellerFulfillmentDefaults.regionCode userRegionCode",
    )
    .lean();
  const restricted = new Map(
    sellers
      .filter((seller) => !isSellerDeliveryOutsideRegionEnabled(seller))
      .map((seller) => [String(seller._id), seller]),
  );
  if (restricted.size === 0) return null;

  const buyerRegionCode = await resolveBuyerRegionCode();
  for (const item of limited) {
    const seller = restricted.get(String(item.sellerId ?? ""));
    if (!seller) continue;
    const block = resolveSellerDeliveryRegionBlock({
      deliveryOutsideRegionEnabled: false,
      carrier: item.carrier,
      // Регион товара — откуда он на самом деле едет; профиль и аккаунт —
      // запасные опоры для карточек без региона.
      sellerRegionCode:
        String(item.regionCode ?? "").trim() ||
        String(seller.sellerFulfillmentDefaults?.regionCode ?? "").trim() ||
        String(seller.userRegionCode ?? "").trim(),
      buyerRegionCode,
    });
    if (block) {
      return { reason: block, message: buildSellerDeliveryRegionBlockMessage(block) };
    }
  }
  return null;
}
