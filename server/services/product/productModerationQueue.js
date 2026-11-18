import {
  PRODUCT_MODERATION_APPROVED,
  PRODUCT_MODERATION_PENDING,
  PRODUCT_MODERATION_REJECTED,
} from "../../constants/productModerationConstants.js";
import { PRODUCT_SELLER_PUBLIC_SELECT } from "../../constants/productSellerPublicFields.js";
import { AppError } from "../../errors/AppError.js";
import { ProductModel } from "../../models/index.js";
import { formatLogError, logServerEvent } from "../../utils/logServerEvent.js";
import { emitProductPublishedEvent } from "../analytics-events/index.js";
import { resolveActiveSellerPersonalCategoryId } from "../seller-personal-category/sellerPersonalCategoryHelpers.js";
import { isSellerStorePaused } from "../seller/sellerStorePause.js";
import { notifyFollowersOfSellerNewCatalogProduct } from "../user/userFollowHelpers.js";
import {
  attachProductSellerSnapshot,
  attachProductSellerSnapshots,
} from "./attachProductSellerSnapshots.js";
import { buildProductSearchBlobFromFields } from "./buildProductSearchBlob.js";
import { buildProductModerationFingerprint } from "./productContentFingerprint.js";
import {
  computeProductDiscountPercent,
  notifyFollowersOfSellerProductDiscount,
} from "./productDiscount.js";
import { refreshProductPriceMarketStatus } from "./refreshProductPriceMarketStatus.js";
import {
  resolveDefaultLeafIdForLegacyCategory,
  resolveProductCategoryWriteFromId,
} from "./resolveProductCategoryWrite.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * @param {{ page?: unknown; limit?: unknown }} query
 */
const parsePagination = (query) => {
  const page = Math.max(1, Number(query.page) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(query.limit) || DEFAULT_LIMIT));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * @param {{ page?: unknown; limit?: unknown }} args
 */
export async function listPendingModerationProducts({ page, limit } = {}) {
  const pagination = parsePagination({ page, limit });

  const filter = { productModerationStatus: PRODUCT_MODERATION_PENDING };

  const [products, total] = await Promise.all([
    ProductModel.find(filter)
      .sort({ createdAt: 1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate("productSeller", PRODUCT_SELLER_PUBLIC_SELECT)
      .lean(),
    ProductModel.countDocuments(filter),
  ]);

  const productsWithSeller = await attachProductSellerSnapshots(products);

  return {
    products: productsWithSeller,
    total,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.ceil(total / pagination.limit) || 0,
  };
}

export async function countPendingModerationProducts() {
  const totalPending = await ProductModel.countDocuments({
    productModerationStatus: PRODUCT_MODERATION_PENDING,
  });
  return { totalPending };
}

/**
 * @param {{ productId: string; requestId?: string }} args
 */
export async function approveProductModeration({ productId, requestId }) {
  const product = await ProductModel.findById(productId);
  if (!product) {
    throw new AppError(404, "Товар не найден");
  }
  if (product.productModerationStatus !== PRODUCT_MODERATION_PENDING) {
    throw new AppError(409, "Товар не ожидает модерации");
  }

  const previousApprovedDiscountPercent = product.productLastApprovedDiscountPercent;

  product.productModerationStatus = PRODUCT_MODERATION_APPROVED;
  product.productModerationComment = "";
  const stock = Math.max(0, Math.floor(Number(product.productStockQuantity) || 0));
  product.productIsAvailable = stock > 0;
  if (stock === 0) {
    product.productStockQuantity = 0;
  }
  // Магазин на паузе: одобренный товар ждёт скрытым и вернётся на витрину
  // вместе с остальными.
  if (
    product.productIsAvailable &&
    (await isSellerStorePaused(product.productSeller))
  ) {
    product.productIsAvailable = false;
    product.productPausedWithStore = true;
  }
  product.productLastApprovedDiscountPercent = computeProductDiscountPercent(
    product.productOldPrice,
    product.productPrice,
  );
  if (!product.productCategoryId && product.productCategory) {
    const leafId = await resolveDefaultLeafIdForLegacyCategory(product.productCategory);
    if (leafId) {
      try {
        const categoryWrite = await resolveProductCategoryWriteFromId(leafId);
        product.productCategoryId = categoryWrite.productCategoryId;
        product.categoryPathIds = categoryWrite.categoryPathIds;
        product.categoryBreadcrumbRu = categoryWrite.categoryBreadcrumbRu;
        product.productCategory = categoryWrite.productCategory;
        product.productDealType = categoryWrite.productDealType;
      } catch (error) {
        // Одобрение не срываем: товар остаётся со старой категорией.
        logServerEvent("warn", {
          event: "product.moderation_category_resolve_failed",
          requestId,
          productId: String(product._id),
          ...formatLogError(error),
        });
      }
    }
  }

  let categorySearchExtras = {
    categoryPathLabelRu: [],
    categorySearchKeywords: [],
  };
  if (product.productCategoryId) {
    try {
      const categoryWrite = await resolveProductCategoryWriteFromId(
        product.productCategoryId,
      );
      categorySearchExtras = {
        categoryPathLabelRu: categoryWrite.categoryPathLabelRu,
        categorySearchKeywords: categoryWrite.categorySearchKeywords,
      };
    } catch (error) {
      // Поиск соберётся без ключевых слов категории — не повод срывать одобрение.
      logServerEvent("warn", {
        event: "product.moderation_category_keywords_failed",
        requestId,
        productId: String(product._id),
        ...formatLogError(error),
      });
    }
  }

  product.productSearchBlob = buildProductSearchBlobFromFields({
    productName: product.productName,
    productDescription: product.productDescription,
    productCharacteristics: product.productCharacteristics,
    productCategory: product.productCategory,
    categoryBreadcrumbRu: product.categoryBreadcrumbRu ?? "",
    ...categorySearchExtras,
  });

  const sellerPersonalCategoryId = await resolveActiveSellerPersonalCategoryId(
    product.productSeller,
  );
  if (sellerPersonalCategoryId) {
    product.sellerPersonalCategoryId = sellerPersonalCategoryId;
  }

  // Снимок того, что человек сейчас посмотрел и одобрил: по нему потом видно,
  // изменилось ли с тех пор содержимое карточки, или приезжали только цена и
  // остаток из обмена.
  product.productModerationApprovedHash = buildProductModerationFingerprint(product);

  await product.save();
  emitProductPublishedEvent({
    productId: String(product._id),
    sellerId: String(product.productSeller),
  });
  await product.populate("productSeller", PRODUCT_SELLER_PUBLIC_SELECT);

  let enriched = await attachProductSellerSnapshot(product.toObject());

  try {
    const marketStatus = await refreshProductPriceMarketStatus(String(product._id), {
      refreshPeers: true,
    });
    enriched = { ...enriched, productPriceMarketStatus: marketStatus };
  } catch (marketError) {
    logServerEvent("error", {
      event: "refreshproductpricemarketstatus_after_approve",
      error: marketError instanceof Error ? marketError.message : String(marketError),
    });
  }

  try {
    await notifyFollowersOfSellerNewCatalogProduct(enriched);
  } catch (notifyError) {
    logServerEvent("error", {
      event: "notifyfollowersofsellernewcatalogproduct",
      error: notifyError instanceof Error ? notifyError.message : String(notifyError),
    });
  }

  try {
    await notifyFollowersOfSellerProductDiscount(
      enriched,
      previousApprovedDiscountPercent,
    );
  } catch (notifyError) {
    logServerEvent("error", {
      event: "notifyfollowersofsellerproductdiscount",
      error: notifyError instanceof Error ? notifyError.message : String(notifyError),
    });
  }

  return {
    message: "Товар одобрен и опубликован в каталоге",
    product: enriched,
  };
}

/**
 * @param {{ productId: string; productModerationComment?: unknown }} args
 */
export async function rejectProductModeration({ productId, productModerationComment }) {
  const comment =
    productModerationComment == null
      ? ""
      : String(productModerationComment).trim().slice(0, 2000);

  const product = await ProductModel.findById(productId);
  if (!product) {
    throw new AppError(404, "Товар не найден");
  }
  if (product.productModerationStatus !== PRODUCT_MODERATION_PENDING) {
    throw new AppError(409, "Товар не ожидает модерации");
  }

  product.productModerationStatus = PRODUCT_MODERATION_REJECTED;
  product.productModerationComment = comment;
  product.productIsAvailable = false;
  await product.save();
  await product.populate("productSeller", PRODUCT_SELLER_PUBLIC_SELECT);

  const enriched = await attachProductSellerSnapshot(product.toObject());

  return {
    message: "Товар отклонён",
    product: enriched,
  };
}
