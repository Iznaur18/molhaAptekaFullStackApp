import { OneCPendingProductModel, ProductModel } from "../../../models/index.js";
import { deleteProductsCascade } from "../../product/deleteProductsCascade.js";
import {
  buildOneCProductCommonFields,
  createOneCProduct,
  normalizeCharacteristics,
} from "./onecProductFields.js";

/**
 * Правило приёмки: на сайт не попадает номенклатура 1С, у которой нет ни одной
 * картинки И нет остатка. Такой товар всё равно нельзя ни показать, ни купить,
 * а карточки-пустышки засоряют каталог, поиск и очередь модерации.
 *
 * Правило жёсткое, без настройки, и работает в обоих каналах (CommerceML и
 * pull). Особенность CommerceML — остаток приезжает отдельным файлом ПОСЛЕ
 * каталога, поэтому такая номенклатура складывается в `OneCPendingProduct`
 * (ни карточки, ни залитых картинок) и разворачивается в товар, как только
 * остаток окажется больше нуля.
 */
export const ONEC_HOLD_RULE_MESSAGE =
  "Нет картинок и нет остатка — карточка на сайте не заводится";

export const ONEC_HOLD_BLOCKED_MESSAGE =
  "Нет картинок и нет остатка, но по товару есть незакрытые заказы — карточка снята с витрины, но не удалена";

/**
 * @param {{ hasImages: boolean; stock: number | null | undefined }} params
 */
export function shouldHoldOneCProduct({ hasImages, stock }) {
  if (hasImages) return false;
  return !(typeof stock === "number" && Number.isFinite(stock) && stock > 0);
}

/**
 * @param {{ sellerId: string; externalIds: string[] }} params
 * @returns {Promise<Map<string, Record<string, any>>>}
 */
export async function findHeldOneCProducts({ sellerId, externalIds }) {
  const ids = [...new Set((externalIds ?? []).map(String).filter(Boolean))];
  if (ids.length === 0) return new Map();

  const rows = await OneCPendingProductModel.find({
    sellerId,
    externalId: { $in: ids },
  }).lean();

  return new Map(rows.map((row) => [row.externalId, row]));
}

/**
 * Положить номенклатуру в отстойник (или обновить лежащее там описание).
 *
 * `stock`/`price` со значением `null` не затирают ранее известные: каталог о
 * них ничего не знает, `prices.xml` приходит без остатков, а `rests.xml` — без
 * цен.
 *
 * @param {{
 *   sellerId: string;
 *   externalId: string;
 *   item?: {
 *     name?: string;
 *     description?: string;
 *     article?: string;
 *     groupIds?: string[];
 *     characteristics?: { key: string; value: string }[];
 *   } | null;
 *   stock?: number | null;
 *   price?: number | null;
 *   seenAt?: Date | null;
 * }} params
 */
export async function holdOneCProduct({
  sellerId,
  externalId,
  item = null,
  stock = null,
  price = null,
  seenAt = null,
}) {
  /** @type {Record<string, unknown>} */
  const set = {};

  if (item) {
    set.name = item.name ?? "";
    set.description = item.description ?? "";
    set.article = item.article ?? "";
    set.groupIds = item.groupIds ?? [];
    set.characteristics = normalizeCharacteristics(item.characteristics);
  }
  if (typeof stock === "number" && Number.isFinite(stock)) {
    set.lastKnownStock = stock;
  }
  if (typeof price === "number" && Number.isFinite(price)) {
    set.lastKnownPrice = price;
  }
  if (seenAt) set.lastSeenAt = seenAt;

  await OneCPendingProductModel.updateOne(
    { sellerId, externalId },
    { $set: set, $setOnInsert: { sellerId, externalId } },
    { upsert: true },
  );
}

/**
 * @param {{ sellerId: string; externalIds: string[] }} params
 */
export async function dropHeldOneCProducts({ sellerId, externalIds }) {
  const ids = [...new Set((externalIds ?? []).map(String).filter(Boolean))];
  if (ids.length === 0) return 0;
  const result = await OneCPendingProductModel.deleteMany({
    sellerId,
    externalId: { $in: ids },
  });
  return result.deletedCount ?? 0;
}

/**
 * Полная выгрузка = «в 1С осталось ровно это»: чего в ней нет, того больше нет
 * и в отстойнике.
 *
 * @param {{ sellerId: string; before: Date }} params
 */
export async function dropStaleHeldOneCProducts({ sellerId, before }) {
  const result = await OneCPendingProductModel.deleteMany({
    sellerId,
    $or: [{ lastSeenAt: null }, { lastSeenAt: { $lt: before } }],
  });
  return result.deletedCount ?? 0;
}

/**
 * Карточка, попавшая под правило, уезжает в отстойник: сама карточка удаляется
 * со всеми связями, описание сохраняется — вернётся, когда 1С пришлёт остаток.
 *
 * Товар с незакрытыми продажами не удаляем: на него ссылается строка заказа.
 *
 * @param {{
 *   sellerId: string;
 *   product: Record<string, any>;
 *   item?: Record<string, any> | null;
 *   stock?: number | null;
 *   price?: number | null;
 *   seenAt?: Date | null;
 *   onIssue?: (issue: { externalId: string; name: string; message: string }) => void;
 * }} params
 * @returns {Promise<{ deleted: boolean; blocked: boolean }>}
 */
export async function withdrawProductToHold({
  sellerId,
  product,
  item = null,
  stock = null,
  price = null,
  seenAt = null,
  onIssue,
}) {
  const externalId = String(product.product1cGuid ?? "");
  const name = String(item?.name ?? product.productName ?? "");

  const payload = item ?? {
    name,
    description: product.productDescription ?? "",
    article: product.productArticle ?? "",
    groupIds: product.product1cGroupId ? [product.product1cGroupId] : [],
    characteristics: product.productCharacteristics ?? [],
  };

  const { deletedIds } = await deleteProductsCascade([product]);
  const deleted = deletedIds.length > 0;

  if (!deleted) {
    // Удалить нельзя, но и продавать нечего: снимаем с витрины и оставляем
    // карточку жить ради истории заказов.
    await ProductModel.updateOne(
      { _id: product._id },
      {
        $set: {
          productIsAvailable: false,
          productOutOfStock: true,
          productStockQuantity: 0,
          ...(seenAt ? { product1cSeenAt: seenAt } : {}),
        },
      },
    );
    onIssue?.({ externalId, name, message: ONEC_HOLD_BLOCKED_MESSAGE });
    return { deleted: false, blocked: true };
  }

  await holdOneCProduct({
    sellerId,
    externalId,
    item: payload,
    stock,
    price,
    seenAt,
  });
  onIssue?.({ externalId, name, message: ONEC_HOLD_RULE_MESSAGE });

  return { deleted: true, blocked: false };
}

/**
 * Развернуть отложенную номенклатуру в настоящую карточку: остаток приехал.
 *
 * @param {{
 *   sellerId: string;
 *   held: Record<string, any>;
 *   resolver: {
 *     resolve: (groupIds: string[]) => Promise<{
 *       categoryWrite: Record<string, any>;
 *       mapped: boolean;
 *     }>;
 *   };
 *   sellerDefaults: Record<string, unknown>;
 *   price: number;
 *   stock: number;
 *   seenAt: Date;
 * }} params
 */
export async function materializeHeldOneCProduct({
  sellerId,
  held,
  resolver,
  sellerDefaults,
  price,
  stock,
  seenAt,
}) {
  const item = {
    name: held.name ?? "",
    description: held.description ?? "",
    article: held.article ?? "",
    groupIds: held.groupIds ?? [],
  };
  const characteristics = normalizeCharacteristics(held.characteristics);
  const { categoryWrite } = await resolver.resolve(item.groupIds);

  const commonFields = buildOneCProductCommonFields({
    item,
    characteristics,
    categoryWrite,
    images: null,
    seenAt,
  });

  const isAvailable =
    Boolean(categoryWrite.productCategoryId) && price > 0 && stock > 0;

  const created = await createOneCProduct({
    sellerId,
    externalId: held.externalId,
    sellerDefaults,
    commonFields,
    images: null,
    price,
    stock,
    isAvailable,
  });

  await OneCPendingProductModel.deleteOne({ _id: held._id });

  return created;
}
