import {
  createProductBodySchema,
  PRODUCT_DESCRIPTION_MAX_CHARS,
  PRODUCT_DESCRIPTION_MIN_CHARS,
  PRODUCT_LISTING_ORIGIN_MANUFACTURER,
  PRODUCT_LISTING_ORIGIN_OWN,
  PRODUCT_LISTING_ORIGIN_RESALE,
  PRODUCT_LISTING_ORIGIN_VALUES,
  PRODUCT_NAME_MAX_LENGTH,
  PRODUCT_NAME_MIN_LENGTH,
  PRODUCT_PRICE_RUB_MAX,
  PRODUCT_STOCK_QUANTITY_MAX,
  PRODUCT_STOCK_QUANTITY_MIN,
  SELLER_PRODUCTS_LIMIT_PREMIUM,
} from "@molha/api-contract";

import {
  PRODUCT_BULK_IMPORT_MAX_IMAGE_URLS_PER_ROW,
  PRODUCT_BULK_IMPORT_MAX_ROWS_PREMIUM,
  PRODUCT_BULK_IMPORT_MAX_ROWS_REGULAR,
} from "../../../constants/productBulkImportConstants.js";
import ProductModel from "../../../models/ProductModel.js";
import { countSellerProducts, getSellerProductsLimit } from "../sellerProductsLimit.js";
import {
  parseBulkImportImageUrls,
  prevalidateBulkImportImageUrl,
} from "./prevalidateBulkImportImageUrl.js";
import { createCategoryBreadcrumbResolver } from "./createCategoryBreadcrumbResolver.js";
import { resolveCategoryByBreadcrumbPath } from "./resolveCategoryByBreadcrumbPath.js";

/**
 * @typedef {{ row: number; field: string; message: string }} BulkImportValidationError
 * @typedef {{
 *   rowNumber: number;
 *   body: Record<string, unknown>;
 *   imageUrls: string[];
 *   productArticle: string;
 * }} BulkImportValidatedRow
 */

const LISTING_ORIGIN_ALIASES = new Map([
  ["own", PRODUCT_LISTING_ORIGIN_OWN],
  ["resale", PRODUCT_LISTING_ORIGIN_RESALE],
  ["manufacturer", PRODUCT_LISTING_ORIGIN_MANUFACTURER],
  ["продаю свое", PRODUCT_LISTING_ORIGIN_OWN],
  ["приобретен на продажу", PRODUCT_LISTING_ORIGIN_RESALE],
  ["являюсь производителем", PRODUCT_LISTING_ORIGIN_MANUFACTURER],
]);

/**
 * @param {string | undefined} raw
 * @param {boolean} defaultValue
 */
const parseYesNoCell = (raw, defaultValue) => {
  const value = String(raw ?? "").trim().toLowerCase();
  if (value === "") {
    return defaultValue;
  }
  if (["да", "yes", "true", "1", "y", "д"].includes(value)) {
    return true;
  }
  if (["нет", "no", "false", "0", "n", "н"].includes(value)) {
    return false;
  }
  throw new Error("Укажите «да» или «нет»");
};

/**
 * @param {string | undefined} raw
 */
const parseListingOriginCell = (raw) => {
  const value = String(raw ?? "").trim().toLowerCase();
  const mapped = LISTING_ORIGIN_ALIASES.get(value);
  if (mapped) {
    return mapped;
  }
  if (PRODUCT_LISTING_ORIGIN_VALUES.includes(value)) {
    return value;
  }
  throw new Error(
    "Укажите own, resale или manufacturer (или русское название статуса)",
  );
};

/**
 * @param {string | undefined} raw
 */
const parseOptionalPriceCell = (raw) => {
  const value = String(raw ?? "").trim();
  if (value === "") {
    return null;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > PRODUCT_PRICE_RUB_MAX) {
    throw new Error("Некорректная старая цена");
  }
  return parsed;
};

/**
 * @param {BulkImportValidationError[]} errors
 * @param {number} row
 * @param {string} field
 * @param {unknown} error
 */
const pushRowError = (errors, row, field, error) => {
  errors.push({
    row,
    field,
    message: error instanceof Error ? error.message : String(error),
  });
};

/**
 * @param {{
 *   parsedRows: Array<Record<string, string> & { __rowNumber: number }>;
 *   sellerId: string;
 *   sellerPickup: {
 *     productPickupAddress: string;
 *     productPickupLat: number;
 *     productPickupLon: number;
 *   };
 *   user: { isPremiumUser?: boolean; premiumExpiresAt?: Date | string | null } | null;
 * }} input
 */
export async function validateProductBulkImportRows(input) {
  const { parsedRows, sellerId, sellerPickup, user } = input;
  /** @type {BulkImportValidationError[]} */
  const errors = [];

  if (parsedRows.length === 0) {
    return {
      ok: false,
      errors: [{ row: 1, field: "файл", message: "Файл не содержит строк с товарами" }],
    };
  }

  const maxRows =
    getSellerProductsLimit(user) === SELLER_PRODUCTS_LIMIT_PREMIUM
      ? PRODUCT_BULK_IMPORT_MAX_ROWS_PREMIUM
      : PRODUCT_BULK_IMPORT_MAX_ROWS_REGULAR;

  if (parsedRows.length > maxRows) {
    return {
      ok: false,
      errors: [
        {
          row: 1,
          field: "файл",
          message: `Слишком много строк: максимум ${maxRows} за один импорт`,
        },
      ],
    };
  }

  const currentCount = await countSellerProducts(sellerId);
  const remainingSlots = Math.max(0, getSellerProductsLimit(user) - currentCount);
  if (parsedRows.length > remainingSlots) {
    return {
      ok: false,
      errors: [
        {
          row: 1,
          field: "файл",
          message: `Недостаточно слотов каталога: можно добавить ещё ${remainingSlots} товар(ов)`,
        },
      ],
    };
  }

  /** @type {BulkImportValidatedRow[]} */
  const validatedRows = [];
  const articlesInFile = new Set();
  const categoryResolver = await createCategoryBreadcrumbResolver();

  for (const row of parsedRows) {
    const rowNumber = row.__rowNumber;
    try {
      const productName = String(row.название ?? "").trim();
      if (productName.length < PRODUCT_NAME_MIN_LENGTH) {
        throw new Error(`Название не короче ${PRODUCT_NAME_MIN_LENGTH} символов`);
      }
      if (productName.length > PRODUCT_NAME_MAX_LENGTH) {
        throw new Error(`Название не длиннее ${PRODUCT_NAME_MAX_LENGTH} символов`);
      }

      const productDescription = String(row.описание ?? "").trim();
      if (productDescription.length < PRODUCT_DESCRIPTION_MIN_CHARS) {
        throw new Error(
          `Описание не короче ${PRODUCT_DESCRIPTION_MIN_CHARS} символов`,
        );
      }
      if (productDescription.length > PRODUCT_DESCRIPTION_MAX_CHARS) {
        throw new Error(
          `Описание не длиннее ${PRODUCT_DESCRIPTION_MAX_CHARS} символов`,
        );
      }

      const productPriceRaw = String(row.цена ?? "").trim();
      const productPrice = Number.parseInt(productPriceRaw, 10);
      if (
        !Number.isFinite(productPrice) ||
        productPrice < 0 ||
        productPrice > PRODUCT_PRICE_RUB_MAX
      ) {
        throw new Error("Некорректная цена");
      }

      const stockRaw = String(row.остаток ?? "").trim();
      const productStockQuantity = Number.parseInt(stockRaw, 10);
      if (
        !Number.isFinite(productStockQuantity) ||
        productStockQuantity < PRODUCT_STOCK_QUANTITY_MIN ||
        productStockQuantity > PRODUCT_STOCK_QUANTITY_MAX
      ) {
        throw new Error(
          `Остаток от ${PRODUCT_STOCK_QUANTITY_MIN} до ${PRODUCT_STOCK_QUANTITY_MAX}`,
        );
      }

      const productListingOrigin = parseListingOriginCell(row.тип_происхождения);
      const productOldPrice = parseOptionalPriceCell(row.старая_цена);
      if (productOldPrice != null && productOldPrice <= productPrice) {
        throw new Error("Старая цена должна быть выше текущей");
      }

      const imageUrls = parseBulkImportImageUrls(row.фото_url);
      if (imageUrls.length === 0) {
        throw new Error("Укажите хотя бы один URL фото");
      }
      if (imageUrls.length > PRODUCT_BULK_IMPORT_MAX_IMAGE_URLS_PER_ROW) {
        throw new Error(
          `Не больше ${PRODUCT_BULK_IMPORT_MAX_IMAGE_URLS_PER_ROW} фото на товар`,
        );
      }

      const categoryPath = String(row.категория ?? "").trim();
      if (!categoryPath) {
        throw new Error("Укажите категорию");
      }

      const productArticle = String(row.артикул ?? "").trim();
      if (productArticle.length > 64) {
        throw new Error("Артикул не длиннее 64 символов");
      }
      if (productArticle) {
        const articleKey = productArticle.toLowerCase();
        if (articlesInFile.has(articleKey)) {
          throw new Error("Артикул повторяется в файле");
        }
        articlesInFile.add(articleKey);
      }

      const productPickupEnabled = parseYesNoCell(row.самовывоз, true);
      const productDeliveryEnabled = parseYesNoCell(row.доставка, false);
      if (!productPickupEnabled && !productDeliveryEnabled) {
        throw new Error("Включите самовывоз и/или доставку");
      }

      const categoryWrite = await resolveCategoryByBreadcrumbPath(
        categoryPath,
        categoryResolver,
      );

      /** @type {string[]} */
      const normalizedImageUrls = [];
      for (const imageUrl of imageUrls) {
        normalizedImageUrls.push(await prevalidateBulkImportImageUrl(imageUrl));
      }

      const body = {
        productName,
        productDescription,
        productPrice,
        productOldPrice,
        productIsAvailable: productStockQuantity > 0,
        productStockQuantity,
        productListingOrigin,
        productCategoryId: String(categoryWrite.productCategoryId),
        productPickupAddress: sellerPickup.productPickupAddress,
        productPickupLat: sellerPickup.productPickupLat,
        productPickupLon: sellerPickup.productPickupLon,
        productPickupEnabled,
        productDeliveryEnabled,
        productImageUrls: normalizedImageUrls,
      };

      createProductBodySchema.parse(body);

      validatedRows.push({
        rowNumber,
        body,
        imageUrls: normalizedImageUrls,
        productArticle,
      });
    } catch (error) {
      const field =
        error instanceof Error && error.message.includes("категор")
          ? "категория"
          : error instanceof Error && error.message.includes("фото")
            ? "фото_url"
            : "строка";
      pushRowError(errors, rowNumber, field, error);
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  if (articlesInFile.size > 0) {
    const existingArticles = await ProductModel.find({
      productSeller: sellerId,
      productArticle: { $ne: "" },
    })
      .select("productArticle")
      .lean();

    const existingSet = new Set(
      existingArticles
        .map((item) => String(item.productArticle ?? "").trim().toLowerCase())
        .filter(Boolean),
    );

    for (const row of validatedRows) {
      const articleKey = row.productArticle.trim().toLowerCase();
      if (!articleKey) {
        continue;
      }
      if (existingSet.has(articleKey)) {
        return {
          ok: false,
          errors: [
            {
              row: row.rowNumber,
              field: "артикул",
              message: `Артикул «${row.productArticle}» уже используется в вашем каталоге`,
            },
          ],
        };
      }
    }
  }

  return { ok: true, rows: validatedRows };
}
