import { ONEC_STOCK_MAX } from "../../../constants/onecConstants.js";
import { ProductModel } from "../../../models/index.js";

/**
 * Цена, которую продавец разрешил показывать на маркетплейсе.
 *
 * Пустой фильтр — типовой случай «в базе один тип цены»: берём первую
 * попавшуюся, иначе интеграция не заработает до похода в настройки.
 *
 * @param {Array<{ priceTypeId: string; value: number }>} prices
 * @param {Set<string>} allowedPriceTypeIds
 * @returns {number | null}
 */
export function pickOfferPrice(prices, allowedPriceTypeIds) {
  if (!Array.isArray(prices) || prices.length === 0) return null;

  if (allowedPriceTypeIds.size > 0) {
    for (const row of prices) {
      if (allowedPriceTypeIds.has(row.priceTypeId)) return row.value;
    }
    return null;
  }

  return prices[0]?.value ?? null;
}

/**
 * Остаток по разрешённым складам.
 *
 * @param {import('./parseCommerceMlOffers.js').OneCOffer} offer
 * @param {Set<string>} allowedWarehouseIds
 * @returns {number | null} `null` — в пакете нет данных об остатке
 */
export function pickOfferStock(offer, allowedWarehouseIds) {
  const rows = offer.warehouseQuantities ?? [];

  if (rows.length > 0) {
    const relevant =
      allowedWarehouseIds.size > 0
        ? rows.filter((row) => allowedWarehouseIds.has(row.warehouseId))
        : rows;
    // Явный фильтр, под который ничего не подошло, — это ноль на витрине,
    // а не «данных нет»: товар лежит на складе, который продавец не выгружает.
    const total = relevant.reduce((sum, row) => sum + row.quantity, 0);
    return Math.min(ONEC_STOCK_MAX, Math.floor(total));
  }

  if (offer.totalQuantity === null || offer.totalQuantity === undefined) {
    return null;
  }

  return Math.min(ONEC_STOCK_MAX, Math.floor(offer.totalQuantity));
}

/**
 * Применить пакет предложений (`offers` / `prices` / `rests`) к товарам.
 *
 * Все три файла — один и тот же `ПакетПредложений` с разным наполнением,
 * поэтому обновления частичные: нет `<Цены>` — цену не трогаем, нет остатка —
 * не трогаем остаток. Иначе `prices.xml` обнулял бы склад, а `rests.xml` — цену.
 *
 * @param {{
 *   sellerId: string;
 *   priceTypeIds: string[];
 *   warehouseIds: string[];
 *   onIssue: (issue: { externalId: string; name: string; message: string }) => void;
 * }} context
 */
export function createOneCOffersApplier({
  sellerId,
  priceTypeIds,
  warehouseIds,
  onIssue,
}) {
  const allowedPriceTypeIds = new Set(
    (priceTypeIds ?? []).map(String).filter(Boolean),
  );
  const allowedWarehouseIds = new Set(
    (warehouseIds ?? []).map(String).filter(Boolean),
  );

  const stats = {
    matched: 0,
    priceUpdated: 0,
    stockUpdated: 0,
    published: 0,
    missing: 0,
  };

  /**
   * @param {import('./parseCommerceMlOffers.js').OneCOffer[]} offers
   */
  async function applyBatch(offers) {
    if (offers.length === 0) return;

    const externalIds = offers.map((row) => row.externalId);
    const products = await ProductModel.find({
      productSeller: sellerId,
      product1cGuid: { $in: externalIds },
    })
      .select("_id product1cGuid productPrice productStockQuantity productCategoryId")
      .lean();
    const byGuid = new Map(products.map((row) => [row.product1cGuid, row]));

    /** @type {import('mongoose').AnyBulkWriteOperation[]} */
    const operations = [];

    for (const offer of offers) {
      const product = byGuid.get(offer.externalId);
      if (!product) {
        stats.missing += 1;
        onIssue({
          externalId: offer.externalId,
          name: offer.name,
          message:
            "Предложение без карточки — товара нет в import.xml этой выгрузки",
        });
        continue;
      }

      stats.matched += 1;

      /** @type {Record<string, unknown>} */
      const set = {};

      const price = pickOfferPrice(offer.prices, allowedPriceTypeIds);
      if (price !== null && price !== product.productPrice) {
        set.productPrice = price;
        stats.priceUpdated += 1;
      }
      if (offer.article) set.productArticle = offer.article;

      const stock = pickOfferStock(offer, allowedWarehouseIds);
      if (stock !== null && stock !== product.productStockQuantity) {
        set.productStockQuantity = stock;
        stats.stockUpdated += 1;
      }

      const effectivePrice = set.productPrice ?? product.productPrice;
      const effectiveStock = set.productStockQuantity ?? product.productStockQuantity;
      const isAvailable =
        Boolean(product.productCategoryId) &&
        effectivePrice > 0 &&
        effectiveStock > 0;

      set.productIsAvailable = isAvailable;
      set.productOutOfStock = effectiveStock <= 0;
      if (isAvailable) stats.published += 1;

      operations.push({
        updateOne: { filter: { _id: product._id }, update: { $set: set } },
      });
    }

    if (operations.length > 0) {
      await ProductModel.bulkWrite(operations, { ordered: false });
    }
  }

  return { applyBatch, stats };
}
