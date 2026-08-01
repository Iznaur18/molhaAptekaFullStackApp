import { ProductModel } from "../../models/index.js";
import {
  PRODUCT_MODERATION_APPROVED,
  PRODUCT_MODERATION_PENDING,
  PRODUCT_MODERATION_REJECTED,
} from "../../constants/productModerationConstants.js";
import { PRODUCT_SELLER_PUBLIC_SELECT } from "../../constants/productSellerPublicFields.js";
import {
  attachProductSellerSnapshot,
  attachProductSellerSnapshots,
} from "../../utils/attachProductSellerSnapshots.js";
import { notifyFollowersOfSellerNewCatalogProduct } from "../../services/user/userFollowHelpers.js";
import {
  computeProductDiscountPercent,
  notifyFollowersOfSellerProductDiscount,
} from "../../utils/productDiscount.js";
import { buildProductSearchBlobFromFields } from "../../utils/buildProductSearchBlob.js";
import { resolveActiveSellerPersonalCategoryId } from "../../services/seller-personal-category/sellerPersonalCategoryHelpers.js";
import {
  resolveDefaultLeafIdForLegacyCategory,
  resolveProductCategoryWriteFromId,
} from "../../utils/resolveProductCategoryWrite.js";
import { errorRes, successRes } from "../../services/http/index.js";
import { refreshProductPriceMarketStatus } from "../../services/product/refreshProductPriceMarketStatus.js";
import { logServerEvent } from "../../utils/logServerEvent.js";
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const parsePagination = (query) => {
  const page = Math.max(1, Number(query.page) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(query.limit) || DEFAULT_LIMIT));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/** `GET /product/moderation/pending` — очередь на модерацию (FIFO). */
export const getPendingModerationProductsController = async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);

  const filter = { productModerationStatus: PRODUCT_MODERATION_PENDING };

  const [products, total] = await Promise.all([
    ProductModel.find(filter)
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate("productSeller", PRODUCT_SELLER_PUBLIC_SELECT)
      .lean(),
    ProductModel.countDocuments(filter),
  ]);

  const productsWithSeller = await attachProductSellerSnapshots(products);

  return successRes(res, {
    products: productsWithSeller,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 0,
  });
};

/** `GET /product/moderation/pending/count` */
export const getPendingModerationProductsCountController = async (req, res) => {
  const totalPending = await ProductModel.countDocuments({
    productModerationStatus: PRODUCT_MODERATION_PENDING,
  });

  return successRes(res, { totalPending });
};

/** `PATCH /product/:productId/moderation/approve` */
export const approveProductModerationController = async (req, res) => {
  const { productId } = req.params;

  const product = await ProductModel.findById(productId);
  if (!product) {
    return errorRes(res, 404, "Товар не найден");
  }
  if (product.productModerationStatus !== PRODUCT_MODERATION_PENDING) {
    return errorRes(res, 409, "Товар не ожидает модерации");
  }

  const previousApprovedDiscountPercent = product.productLastApprovedDiscountPercent;

  product.productModerationStatus = PRODUCT_MODERATION_APPROVED;
  product.productModerationComment = "";
  const stock = Math.max(0, Math.floor(Number(product.productStockQuantity) || 0));
  product.productIsAvailable = stock > 0;
  if (stock === 0) {
    product.productStockQuantity = 0;
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
      } catch {
        /* keep legacy only */
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
    } catch {
      /* blob without node keywords */
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

  await product.save();
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

  return successRes(res, {
    message: "Товар одобрен и опубликован в каталоге",
    product: enriched,
  });
};

/** `PATCH /product/:productId/moderation/reject` */
export const rejectProductModerationController = async (req, res) => {
  const { productId } = req.params;
  const commentRaw = req.body?.productModerationComment;
  const comment = commentRaw == null ? "" : String(commentRaw).trim().slice(0, 2000);

  const product = await ProductModel.findById(productId);
  if (!product) {
    return errorRes(res, 404, "Товар не найден");
  }
  if (product.productModerationStatus !== PRODUCT_MODERATION_PENDING) {
    return errorRes(res, 409, "Товар не ожидает модерации");
  }

  product.productModerationStatus = PRODUCT_MODERATION_REJECTED;
  product.productModerationComment = comment;
  product.productIsAvailable = false;
  await product.save();
  await product.populate("productSeller", PRODUCT_SELLER_PUBLIC_SELECT);

  const enriched = await attachProductSellerSnapshot(product.toObject());

  return successRes(res, {
    message: "Товар отклонён",
    product: enriched,
  });
};
