import { ONEC_STOCK_MAX } from "../../../constants/onecConstants.js";
import { ProductModel } from "../../../models/index.js";
import { productHasImages } from "../../product/productImagePresence.js";
import {
  findHeldOneCProducts,
  holdOneCProduct,
  withdrawProductToHold,
} from "./onecHeldProducts.js";

/** Поля карточки, которых хватает и на обновление, и на удаление по правилу. */
const PRODUCT_FIELDS = [
  "_id",
  "product1cGuid",
  "productName",
  "productDescription",
  "productArticle",
  "productCharacteristics",
  "product1cGroupId",
  "productImageUrls",
  "productPreviewVideoUrl",
  "productPrice",
  "productStockQuantity",
  "productCategoryId",
].join(" ");

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
 * Здесь же отрабатывает вторая половина правила «нет картинок и нет остатка»:
 * именно из этого файла впервые становится известен остаток. Товар без
 * картинок, у которого остаток появился, разворачивается из отстойника в
 * карточку; карточка без картинок, у которой остаток обнулился, — наоборот,
 * уезжает в отстойник.
 *
 * @param {{
 *   sellerId: string;
 *   priceTypeIds: string[];
 *   warehouseIds: string[];
 *   onIssue: (issue: { externalId: string; name: string; message: string }) => void;
 *   materializeHeld?: (params: {
 *     held: Record<string, any>;
 *     price: number;
 *     stock: number;
 *   }) => Promise<unknown>;
 *   seenAt?: Date;
 * }} context
 */
export function createOneCOffersApplier({
  sellerId,
  priceTypeIds,
  warehouseIds,
  onIssue,
  materializeHeld,
  seenAt = new Date(),
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
    /** Отложено правилом «нет картинок и нет остатка». */
    held: 0,
    /** Из них: карточки, удалённые с сайта уже после создания. */
    heldDeleted: 0,
    /** Не удалось удалить из-за незакрытых заказов — только сняты с витрины. */
    heldBlocked: 0,
    /** Отложенные, у которых появился остаток и которые стали карточками. */
    restored: 0,
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
      .select(PRODUCT_FIELDS)
      .lean();
    const byGuid = new Map(products.map((row) => [row.product1cGuid, row]));

    const missingIds = externalIds.filter((id) => !byGuid.has(id));
    const heldByGuid = await findHeldOneCProducts({
      sellerId,
      externalIds: missingIds,
    });

    /** @type {import('mongoose').AnyBulkWriteOperation[]} */
    const operations = [];

    for (const offer of offers) {
      const product = byGuid.get(offer.externalId);
      const price = pickOfferPrice(offer.prices, allowedPriceTypeIds);
      const stock = pickOfferStock(offer, allowedWarehouseIds);

      if (!product) {
        const held = heldByGuid.get(offer.externalId);
        if (!held) {
          stats.missing += 1;
          onIssue({
            externalId: offer.externalId,
            name: offer.name,
            message:
              "Предложение без карточки — товара нет в import.xml этой выгрузки",
          });
          continue;
        }

        const effectiveStock = stock ?? held.lastKnownStock ?? null;
        const effectivePrice = price ?? held.lastKnownPrice ?? 0;

        if (effectiveStock !== null && effectiveStock > 0 && materializeHeld) {
          await materializeHeld({
            held,
            price: effectivePrice,
            stock: effectiveStock,
          });
          stats.restored += 1;
          continue;
        }

        await holdOneCProduct({
          sellerId,
          externalId: offer.externalId,
          stock,
          price,
          seenAt,
        });
        stats.held += 1;
        continue;
      }

      stats.matched += 1;

      /** @type {Record<string, unknown>} */
      const set = {};

      if (price !== null && price !== product.productPrice) {
        set.productPrice = price;
        stats.priceUpdated += 1;
      }
      if (offer.article) set.productArticle = offer.article;

      if (stock !== null && stock !== product.productStockQuantity) {
        set.productStockQuantity = stock;
        stats.stockUpdated += 1;
      }

      const effectivePrice = set.productPrice ?? product.productPrice;
      const effectiveStock = set.productStockQuantity ?? product.productStockQuantity;

      // Остаток обнулился, а картинок у карточки нет — на сайте ей делать
      // нечего: удаляем и кладём описание в отстойник до лучших времён.
      if (effectiveStock <= 0 && !productHasImages(product)) {
        const { deleted } = await withdrawProductToHold({
          sellerId,
          product,
          stock: effectiveStock,
          price: effectivePrice,
          seenAt,
          onIssue,
        });
        if (deleted) {
          stats.heldDeleted += 1;
          stats.held += 1;
        } else {
          stats.heldBlocked += 1;
        }
        continue;
      }

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
