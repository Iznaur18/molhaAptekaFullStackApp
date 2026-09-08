import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { PRODUCT_IMAGE_URLS_MAX } from "../../../constants/productConstants.js";
import { PRODUCT_MODERATION_APPROVED } from "../../../constants/productModerationConstants.js";
import { ONEC_IMPORT_MAX_IMAGES_PER_PRODUCT } from "../../../constants/onecExchangeConstants.js";
import { ProductModel } from "../../../models/index.js";
import { productHasImages } from "../../product/productImagePresence.js";
import { importOneCLocalImage } from "./importOneCLocalImage.js";
import {
  dropHeldOneCProducts,
  findHeldOneCProducts,
  hideProductByOneCHoldRule,
  holdOneCProduct,
  shouldHoldOneCProduct,
} from "./onecHeldProducts.js";
import {
  buildOneCContentHash,
  buildOneCProductCommonFields,
  createOneCProduct,
  normalizeCharacteristics,
} from "./onecProductFields.js";

const MAX_IMAGES = Math.min(
  PRODUCT_IMAGE_URLS_MAX,
  ONEC_IMPORT_MAX_IMAGES_PER_PRODUCT,
);

/** Поля существующей карточки, которые нужны при обновлении и при удалении. */
const EXISTING_PRODUCT_FIELDS = [
  "_id",
  "product1cGuid",
  "productName",
  "productDescription",
  "productArticle",
  "productCharacteristics",
  "product1cGroupId",
  "productImageUrls",
  "product1cImageHashes",
  "productPreviewVideoUrl",
  "productPrice",
  "productStockQuantity",
  "productModerationStatus",
  "productPickupAddress",
  "productIsAvailable",
  "product1cContentHash",
  "product1cHeld",
].join(" ");

/**
 * Собрать картинки товара, не перезаливая то, что уже лежит в хранилище.
 *
 * @param {{
 *   product: { productImageUrls?: string[]; product1cImageHashes?: string[] } | null;
 *   imagePaths: string[];
 *   resolveImagePath: (relativePath: string) => string | null;
 *   onIssue: (message: string) => void;
 * }} params
 * @returns {Promise<{ urls: string[]; hashes: string[]; uploaded: number } | null>}
 */
async function resolveProductImages({
  product,
  imagePaths,
  resolveImagePath,
  onIssue,
}) {
  if (!Array.isArray(imagePaths) || imagePaths.length === 0) return null;

  const existingUrls = Array.isArray(product?.productImageUrls)
    ? product.productImageUrls
    : [];
  const existingHashes = Array.isArray(product?.product1cImageHashes)
    ? product.product1cImageHashes
    : [];
  /** @type {Map<string, string>} */
  const urlByHash = new Map();
  existingHashes.forEach((hash, index) => {
    if (hash && existingUrls[index]) urlByHash.set(hash, existingUrls[index]);
  });

  /** @type {string[]} */
  const urls = [];
  /** @type {string[]} */
  const hashes = [];
  let uploaded = 0;

  for (const relativePath of imagePaths.slice(0, MAX_IMAGES)) {
    const absolutePath = resolveImagePath(relativePath);
    if (!absolutePath) {
      onIssue(`Файл картинки не найден в архиве: ${relativePath}`);
      continue;
    }

    try {
      const buffer = await readFile(absolutePath);
      const sourceHash = createHash("md5").update(buffer).digest("hex");

      const known = urlByHash.get(sourceHash);
      if (known) {
        urls.push(known);
        hashes.push(sourceHash);
        continue;
      }

      const imported = await importOneCLocalImage({ filePath: absolutePath });
      if (!imported) {
        onIssue(`Не картинка или слишком большой файл: ${relativePath}`);
        continue;
      }
      urls.push(imported.url);
      hashes.push(sourceHash);
      uploaded += 1;
    } catch (error) {
      onIssue(
        `Не удалось загрузить ${relativePath}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  if (urls.length === 0) return null;
  return { urls, hashes, uploaded };
}

/**
 * Применить разобранный `import.xml` к товарам продавца.
 *
 * Что делает и, главное, чего НЕ делает:
 *  - каталог CommerceML не содержит цен и остатков, они приходят в
 *    `offers/prices/rests`. Новая карточка поэтому создаётся с ценой 0 и
 *    снятой с витрины — её «оживит» ближайший пакет предложений;
 *  - номенклатура без картинок и без остатка на сайт не заводится вовсе:
 *    ни карточки, ни залитых файлов — только строка в отстойнике
 *    (`OneCPendingProduct`), из которой товар развернётся, когда придёт
 *    остаток. Остаток на момент разбора каталога известен только для тех, кто
 *    уже был на сайте или уже лежит в отстойнике. Отстойник — только для
 *    номенклатуры без карточки: уже созданная под то же правило просто
 *    прячется с витрины и ждёт остатка на месте;
 *  - статус модерации проставляется только при создании. Перевыгрузка каталога
 *    не должна отправлять уже одобренный товар на повторную проверку;
 *  - карточка, в которой ничего не изменилось, не переписывается вовсе:
 *    сверяем отпечаток присланного с сохранённым на карточке. 1С шлёт полный
 *    каталог каждый обмен, поэтому без сверки тысяча карточек переписывалась бы
 *    десятки раз в сутки без единого изменения по существу;
 *  - без сопоставления группы 1С с категорией сайта товар остаётся
 *    в `uncategorized` и вне витрины: по `productCategoryId` его всё равно
 *    не найдёт ни один фильтр каталога.
 *
 * @param {{
 *   sellerId: string;
 *   resolver: Awaited<ReturnType<typeof import('./onecCategoryMappings.js').createOneCCategoryResolver>>;
 *   sellerDefaults: Record<string, unknown>;
 *   resolveImagePath: (relativePath: string) => string | null;
 *   onIssue: (issue: { externalId: string; name: string; message: string }) => void;
 *   seenAt?: Date;
 *   moderationTrusted?: boolean;
 * }} context
 */
export function createOneCCatalogApplier({
  sellerId,
  resolver,
  sellerDefaults,
  resolveImagePath,
  onIssue,
  seenAt = new Date(),
  moderationTrusted = false,
}) {
  const stats = {
    created: 0,
    updated: 0,
    /** Пришли без единого изменения — карточку не трогали. */
    unchanged: 0,
    archived: 0,
    uncategorized: 0,
    imagesUploaded: 0,
    /** Отложено правилом «нет картинок и нет остатка». */
    held: 0,
    /** Из них: существовавшие карточки, снятые с витрины (не удалённые). */
    heldHidden: 0,
  };
  /** @type {Map<string, number>} */
  const groupCounts = new Map();

  /**
   * @param {import('./parseCommerceMlCatalog.js').OneCCatalogProduct} item
   * @param {Record<string, any> | null} existing
   * @param {number | null} stock
   * @param {unknown[]} untouchedIds карточки, которым хватит отметки «видели»
   */
  async function moveToHold(item, existing, stock, untouchedIds) {
    if (existing) {
      const { hidden, alreadyHidden } = await hideProductByOneCHoldRule({
        sellerId,
        product: existing,
        item,
        seenAt,
        onIssue,
      });
      if (hidden) stats.heldHidden += 1;
      // Спрятана ещё в прошлый раз — ей нужна только отметка о том, что 1С её
      // всё ещё присылает, иначе уборка сочла бы товар исчезнувшим.
      if (alreadyHidden) untouchedIds.push(existing._id);
      stats.held += 1;
      return;
    }

    await holdOneCProduct({
      sellerId,
      externalId: item.externalId,
      item,
      stock,
      seenAt,
    });
    stats.held += 1;
  }

  /**
   * @param {import('./parseCommerceMlCatalog.js').OneCCatalogProduct[]} products
   */
  async function applyBatch(products) {
    if (products.length === 0) return;

    const externalIds = products.map((row) => row.externalId);
    const existingRows = await ProductModel.find({
      productSeller: sellerId,
      product1cGuid: { $in: externalIds },
    })
      .select(EXISTING_PRODUCT_FIELDS)
      .lean();
    const existingByGuid = new Map(
      existingRows.map((row) => [row.product1cGuid, row]),
    );
    const heldByGuid = await findHeldOneCProducts({ sellerId, externalIds });

    /** Карточки, у которых поменялось хоть что-то, — пишем одной пачкой. */
    /** @type {import('mongoose').AnyBulkWriteOperation[]} */
    const operations = [];
    /** Неизменившиеся: им нужна только метка «видели в этой выгрузке». */
    /** @type {unknown[]} */
    const untouchedIds = [];

    for (const item of products) {
      const existing = existingByGuid.get(item.externalId) ?? null;
      const held = heldByGuid.get(item.externalId) ?? null;

      if (item.deleted) {
        if (existing) {
          await ProductModel.updateOne(
            { _id: existing._id },
            {
              $set: {
                productIsAvailable: false,
                productStockQuantity: 0,
                product1cSeenAt: seenAt,
              },
            },
          );
          stats.archived += 1;
        }
        if (held) {
          await dropHeldOneCProducts({
            sellerId,
            externalIds: [item.externalId],
          });
        }
        continue;
      }

      if (!item.name) {
        onIssue({
          externalId: item.externalId,
          name: "",
          message: "У номенклатуры пустое наименование — пропущена",
        });
        continue;
      }

      const groupId = item.groupIds[0] ?? null;
      if (groupId) {
        groupCounts.set(groupId, (groupCounts.get(groupId) ?? 0) + 1);
      }

      // Остаток каталог не содержит: берём последний известный — из карточки,
      // если товар уже на сайте, иначе из отстойника.
      const knownStock = existing
        ? (existing.productStockQuantity ?? 0)
        : (held?.lastKnownStock ?? null);
      const existingHasImages = existing ? productHasImages(existing) : false;

      // Дешёвая отсечка до чтения файлов: картинок в выгрузке нет, остатка нет —
      // ничего не заливаем и не создаём.
      if (
        item.imagePaths.length === 0 &&
        shouldHoldOneCProduct({ hasImages: existingHasImages, stock: knownStock })
      ) {
        await moveToHold(item, existing, knownStock, untouchedIds);
        continue;
      }

      const { categoryWrite, mapped } = await resolver.resolve(item.groupIds);
      if (!mapped) stats.uncategorized += 1;

      const characteristics = normalizeCharacteristics(item.characteristics);
      const images = await resolveProductImages({
        product: existing,
        imagePaths: item.imagePaths,
        resolveImagePath,
        onIssue: (message) =>
          onIssue({ externalId: item.externalId, name: item.name, message }),
      });
      if (images) stats.imagesUploaded += images.uploaded;

      // Картинки в выгрузке были, но ни одна не пригодилась (битый файл, не
      // картинка, не нашлась в архиве) — правило то же самое.
      if (
        shouldHoldOneCProduct({
          hasImages: Boolean(images) || existingHasImages,
          stock: knownStock,
        })
      ) {
        await moveToHold(item, existing, knownStock, untouchedIds);
        continue;
      }

      const commonFields = buildOneCProductCommonFields({
        item,
        characteristics,
        categoryWrite,
        images,
        seenAt,
      });

      if (existing) {
        const contentHash = buildOneCContentHash(commonFields);

        // Точку самовывоза продавец мог завести уже ПОСЛЕ первого импорта:
        // карточки создались без адреса и сами бы его никогда не получили,
        // потому что дефолты применялись только при создании.
        const needsPickupDefaults =
          !existing.productPickupAddress && Boolean(sellerDefaults.productPickupAddress);
        // Снятие с витрины при потере категории: иначе карточка остаётся
        // «видимой», но недостижимой ни одним фильтром каталога.
        const needsUnlist = !mapped && existing.productIsAvailable !== false;
        // Товар вернулся под правило «есть картинки или остаток» — метка
        // спрятанной обменом карточки больше не нужна.
        const needsUnhold = existing.product1cHeld === true;

        if (
          contentHash === existing.product1cContentHash &&
          !needsPickupDefaults &&
          !needsUnlist &&
          !needsUnhold
        ) {
          untouchedIds.push(existing._id);
          stats.unchanged += 1;
          continue;
        }

        commonFields.product1cContentHash = contentHash;
        if (needsUnlist) commonFields.productIsAvailable = false;
        if (needsUnhold) commonFields.product1cHeld = false;
        if (needsPickupDefaults) Object.assign(commonFields, sellerDefaults);

        operations.push({
          updateOne: { filter: { _id: existing._id }, update: { $set: commonFields } },
        });
        stats.updated += 1;
        continue;
      }

      // У товара, вернувшегося из отстойника, цена и остаток уже известны с
      // прошлого обмена — не показываем его с нулями до ближайшего offers.xml.
      await createOneCProduct({
        sellerId,
        externalId: item.externalId,
        sellerDefaults,
        commonFields,
        images,
        price: held?.lastKnownPrice ?? 0,
        stock: held?.lastKnownStock ?? 0,
        ...(moderationTrusted
          ? { moderationStatus: PRODUCT_MODERATION_APPROVED }
          : {}),
      });
      stats.created += 1;

      // Товар вернулся на сайт (появились картинки) — в отстойнике ему больше
      // не место, иначе следующий пакет предложений создал бы дубль.
      if (held) {
        await dropHeldOneCProducts({ sellerId, externalIds: [item.externalId] });
      }
    }

    if (operations.length > 0) {
      await ProductModel.bulkWrite(operations, { ordered: false });
    }

    // Неизменившимся хватает отметки о том, что 1С их всё ещё присылает: без
    // неё уборка после полной выгрузки сняла бы их с витрины как исчезнувшие.
    if (untouchedIds.length > 0) {
      await ProductModel.updateMany(
        { _id: { $in: untouchedIds } },
        { $set: { product1cSeenAt: seenAt } },
        { timestamps: false },
      );
    }
  }

  return {
    applyBatch,
    stats,
    groupCounts,
  };
}

/**
 * @param {string} rootDir
 * @returns {(relativePath: string) => string | null}
 */
export function createArchiveImageResolver(rootDir) {
  return (relativePath) => {
    const normalized = String(relativePath ?? "")
      .replace(/\\/g, "/")
      .replace(/^\/+/, "");
    if (!normalized || normalized.split("/").includes("..")) return null;
    const resolved = path.resolve(rootDir, normalized);
    const root = path.resolve(rootDir);
    const withSeparator = root.endsWith(path.sep) ? root : root + path.sep;
    if (!resolved.startsWith(withSeparator)) return null;
    return existsSync(resolved) ? resolved : null;
  };
}
