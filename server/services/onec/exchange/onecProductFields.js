import {
  PRODUCT_MODERATION_APPROVED,
  PRODUCT_MODERATION_PENDING,
} from "../../../constants/productModerationConstants.js";
import { PRODUCT_LISTING_ORIGIN_RESALE } from "../../../constants/productListingOriginConstants.js";
import { PRODUCT_PRICE_MARKET_STATUS_DEFAULT } from "../../../constants/productPriceMarketStatusConstants.js";
import { ProductModel } from "../../../models/index.js";
import { buildProductSearchBlobFromFields } from "../../product/buildProductSearchBlob.js";
import { hashStableValue } from "../../product/productContentFingerprint.js";

/**
 * Поля карточки, общие для двух путей создания товара из 1С: обычного разбора
 * `import.xml` и «оживления» отложенной номенклатуры, когда остаток приехал
 * позже каталога.
 */

/**
 * @param {{ key: string; value: string }[]} raw
 */
export function normalizeCharacteristics(raw) {
  /** @type {{ key: string; value: string }[]} */
  const out = [];
  const seen = new Set();
  for (const item of raw ?? []) {
    const key = String(item?.key ?? "").trim().slice(0, 60);
    const value = String(item?.value ?? "").trim().slice(0, 300);
    if (!key || !value) continue;
    // Ключ дедупликации через JSON: пара («Цвет», «синий») не должна
    // схлопываться с («Цвет син», «ий») из-за склейки строк.
    const dedupeKey = JSON.stringify([key, value]);
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    out.push({ key, value });
  }
  return out;
}

/**
 * @param {{
 *   item: { name: string; description?: string; article?: string; groupIds?: string[] };
 *   characteristics: { key: string; value: string }[];
 *   categoryWrite: Record<string, any>;
 *   images: { urls: string[]; hashes: string[] } | null;
 *   seenAt: Date;
 * }} params
 */
export function buildOneCProductCommonFields({
  item,
  characteristics,
  categoryWrite,
  images,
  seenAt,
}) {
  const searchBlob = buildProductSearchBlobFromFields({
    productName: item.name,
    productDescription: item.description,
    productCharacteristics: characteristics,
    productCategory: categoryWrite.productCategory,
    categoryBreadcrumbRu: categoryWrite.categoryBreadcrumbRu,
    categoryPathLabelRu: categoryWrite.categoryPathLabelRu,
    categorySearchKeywords: categoryWrite.categorySearchKeywords,
  });

  return {
    productName: item.name,
    productDescription: item.description,
    productArticle: item.article,
    productCharacteristics: characteristics,
    product1cGroupId: item.groupIds?.[0] ?? null,
    productCategory: categoryWrite.productCategory,
    productCategoryId: categoryWrite.productCategoryId,
    categoryPathIds: categoryWrite.categoryPathIds,
    categoryBreadcrumbRu: categoryWrite.categoryBreadcrumbRu,
    productSearchBlob: searchBlob,
    productFromOneC: true,
    product1cSeenAt: seenAt,
    ...(images
      ? { productImageUrls: images.urls, product1cImageHashes: images.hashes }
      : {}),
  };
}

/**
 * Отпечаток того, что 1С прислала по товару.
 *
 * Считается ровно по тем полям, которые импорт и записывает, — кроме метки
 * «когда видели», она меняется каждый обмен по определению. Совпал с
 * сохранённым на карточке — писать нечего.
 *
 * @param {Record<string, unknown>} commonFields
 * @returns {string}
 */
export function buildOneCContentHash(commonFields) {
  const { product1cSeenAt: _seenAt, ...rest } = commonFields;
  return hashStableValue(rest);
}

/**
 * Создать карточку товара 1С.
 *
 * Модерация, происхождение и статус цены проставляются только здесь: при
 * обновлении их трогать нельзя, иначе перевыгрузка гоняла бы одобренный товар
 * на повторную проверку.
 *
 * `moderationStatus` отличается от `pending` только в одном случае: карточку
 * заводят заново вместо ранее одобренной, и её содержимое с момента одобрения
 * не изменилось (см. `materializeHeldOneCProduct`).
 *
 * @param {{
 *   sellerId: string;
 *   externalId: string;
 *   sellerDefaults: Record<string, unknown>;
 *   commonFields: Record<string, unknown>;
 *   images: { urls: string[]; hashes: string[] } | null;
 *   price?: number;
 *   stock?: number;
 *   isAvailable?: boolean;
 *   moderationStatus?: string;
 *   moderationHash?: string;
 * }} params
 */
export function createOneCProduct({
  sellerId,
  externalId,
  sellerDefaults,
  commonFields,
  images,
  price = 0,
  stock = 0,
  isAvailable = false,
  moderationStatus = PRODUCT_MODERATION_PENDING,
  moderationHash = "",
}) {
  const approved = moderationStatus === PRODUCT_MODERATION_APPROVED;

  return ProductModel.create({
    ...sellerDefaults,
    ...commonFields,
    productSeller: sellerId,
    product1cGuid: externalId,
    productPrice: price,
    productOldPrice: null,
    productStockQuantity: stock,
    productIsAvailable: approved ? isAvailable : false,
    productOutOfStock: stock <= 0,
    productImageUrls: images?.urls ?? [],
    product1cImageHashes: images?.hashes ?? [],
    product1cContentHash: buildOneCContentHash(commonFields),
    product1cHeld: false,
    productModerationStatus: moderationStatus,
    productModerationApprovedHash: approved ? moderationHash : "",
    productModerationComment: "",
    productListingOrigin: PRODUCT_LISTING_ORIGIN_RESALE,
    productPriceMarketStatus: PRODUCT_PRICE_MARKET_STATUS_DEFAULT,
  });
}
