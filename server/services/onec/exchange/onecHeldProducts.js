import { PRODUCT_MODERATION_APPROVED } from "../../../constants/productModerationConstants.js";
import { OneCPendingProductModel, ProductModel } from "../../../models/index.js";
import { buildProductModerationFingerprint } from "../../product/productContentFingerprint.js";
import {
  buildOneCProductCommonFields,
  createOneCProduct,
  normalizeCharacteristics,
} from "./onecProductFields.js";

/**
 * Правило приёмки: на сайт не попадает номенклатура 1С без картинок.
 * Остаток без фото не спасает — карточку всё равно нельзя нормально показать
 * в каталоге и «Мои товары».
 *
 * Правило жёсткое, без настройки, и работает в обоих каналах (CommerceML и
 * pull). Особенность CommerceML — картинки приходят в `import.xml`, остаток
 * позже в offers/rests: без картинок номенклатура лежит в `OneCPendingProduct`
 * и разворачивается в товар только когда в каталоге появятся файлы картинок.
 */
export const ONEC_HOLD_RULE_MESSAGE = "Нет картинок — карточка на сайте не заводится";

export const ONEC_HOLD_HIDDEN_MESSAGE =
  "Нет картинок — карточка снята с витрины до появления фото в выгрузке";

/**
 * @param {{ hasImages: boolean; stock?: number | null | undefined }} params
 */
export function shouldHoldOneCProduct({ hasImages, stock: _stock }) {
  return !hasImages;
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
 *   moderationStatus?: string;
 *   moderationHash?: string;
 * }} params
 */
export async function holdOneCProduct({
  sellerId,
  externalId,
  item = null,
  stock = null,
  price = null,
  seenAt = null,
  moderationStatus = "",
  moderationHash = "",
}) {
  /** @type {Record<string, unknown>} */
  const set = {};

  // Пишется только теми путями, которые карточку всё-таки убирают с сайта
  // (наследие прежнего поведения). Правило приёмки живые карточки больше не
  // удаляет, поэтому обычно эти поля остаются пустыми.
  if (moderationStatus) set.moderationStatus = moderationStatus;
  if (moderationHash) set.moderationHash = moderationHash;

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
 * Карточку, попавшую под правило, снимаем с витрины — и только.
 *
 * Раньше здесь стоял `deleteProductsCascade`, а вернувшийся остаток создавал
 * товар заново. Цена такого «оборота» оказалась несопоставима с пользой:
 * у карточки менялся `_id`, терялись отзывы, вопросы, избранное и внешние
 * ссылки, а весь каталог продавца заново вставал в очередь модерации — при
 * тысяче позиций и обмене раз в десять минут это делало модерацию
 * неработоспособной. Пустая карточка и так недостижима: `productIsAvailable`
 * убирает её из витрины и поиска.
 *
 * Отстойник (`OneCPendingProduct`) остаётся только для номенклатуры, у которой
 * карточки на сайте никогда не было, — там он по-прежнему нужен.
 *
 * @param {{
 *   sellerId: string;
 *   product: Record<string, any>;
 *   item?: Record<string, any> | null;
 *   seenAt?: Date | null;
 *   onIssue?: (issue: { externalId: string; name: string; message: string }) => void;
 * }} params
 * Уже спрятанную карточку не трогаем вовсе: у продавца, чья 1С картинок не
 * выгружает, под правилом живёт половина каталога, и переписывать её на каждом
 * обмене — та же бессмысленная работа, от которой уходим. Отметку «видели в
 * выгрузке» такой карточке ставит вызывающий, одним запросом на пачку.
 *
 * @returns {Promise<{ hidden: boolean; alreadyHidden: boolean }>}
 */
export async function hideProductByOneCHoldRule({
  sellerId: _sellerId,
  product,
  item = null,
  seenAt = null,
  onIssue,
}) {
  const externalId = String(product.product1cGuid ?? "");
  const name = String(item?.name ?? product.productName ?? "");

  const alreadyHidden =
    product.product1cHeld === true &&
    product.productIsAvailable === false &&
    (product.productStockQuantity ?? 0) === 0;

  if (alreadyHidden) return { hidden: false, alreadyHidden: true };

  await ProductModel.updateOne(
    { _id: product._id },
    {
      $set: {
        productIsAvailable: false,
        productOutOfStock: true,
        productStockQuantity: 0,
        product1cHeld: true,
        ...(seenAt ? { product1cSeenAt: seenAt } : {}),
      },
    },
  );
  onIssue?.({ externalId, name, message: ONEC_HOLD_HIDDEN_MESSAGE });

  return { hidden: true, alreadyHidden: false };
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
 *   moderationTrusted?: boolean;
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
  moderationTrusted = false,
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

  // Карточка уже была одобрена под этим `Ид`, и с тех пор в ней не изменилось
  // ничего из того, что смотрит модератор, — значит, смотреть заново нечего.
  const fingerprint = buildProductModerationFingerprint({
    ...commonFields,
    productImageUrls: [],
    productCategoryId: categoryWrite.productCategoryId,
  });
  const keepsApproval =
    moderationTrusted ||
    (held.moderationStatus === PRODUCT_MODERATION_APPROVED &&
      Boolean(held.moderationHash) &&
      held.moderationHash === fingerprint);

  const created = await createOneCProduct({
    sellerId,
    externalId: held.externalId,
    sellerDefaults,
    commonFields,
    images: null,
    price,
    stock,
    isAvailable,
    ...(keepsApproval
      ? {
          moderationStatus: PRODUCT_MODERATION_APPROVED,
          moderationHash: fingerprint,
        }
      : {}),
  });

  await OneCPendingProductModel.deleteOne({ _id: held._id });

  return created;
}
