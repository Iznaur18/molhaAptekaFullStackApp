import { ProductModel } from "../../models/index.js";
import {
    PRODUCT_MODERATION_APPROVED,
    PRODUCT_MODERATION_PENDING,
} from "../../constants/productModerationConstants.js";
import { isUserAdmin } from "../../utils/adminUserGuard.js";
import { mergeProductImageUrlsFromBody } from "../../utils/mergeProductImageUrlsFromBody.js";
import { deleteUploadFileByUrl } from "../../utils/deleteUploadFileByUrl.js";
import {
    assertProductPreviewVideoRequiresPhotos,
    normalizeProductPreviewVideoUrl,
} from "../../utils/productPreviewVideo.js";
import { patchBodyTouchesModerationContent } from "../../utils/productModeration.js";
import {
    hasProductOpenSales,
    OPEN_SALES_BLOCK_MESSAGE,
} from "../../utils/productOrderLocks.js";
import { PRODUCT_SELLER_PUBLIC_SELECT } from "../../constants/productSellerPublicFields.js";
import { attachProductSellerSnapshot } from "../../utils/attachProductSellerSnapshots.js";
import { rejectAllPendingOffersForProduct } from "../../utils/productPriceOfferHelpers.js";
import {
    notifySellerAuctionToggledByAdmin,
} from "../../utils/productAuction.js";
import { PRODUCT_PROMOTION_STATUS_ACTIVE, PRODUCT_PROMOTION_STATUS_PENDING_STAFF } from "../../constants/productPromotionConstants.js";
import { cancelProductPromotionsForProduct } from "../../utils/productPromotionHelpers.js";
import {
    assertProductStockPatchAllowed,
    syncProductCatalogAfterStockChange,
} from "../../utils/productStock.js";
import {
    assertProductOldPricePair,
    normalizeProductOldPriceRub,
    normalizeProductPriceRub,
} from "../../utils/productDiscount.js";
import { errorRes, successRes } from "../../utils/index.js";

const PENDING_EDIT_BLOCK_MESSAGE =
    "Нельзя редактировать товар, пока он на модерации";

/** `PATCH /product/:productId` — своего товара или любого (admin), не в открытой продаже. */
export const patchMyProductController = async (req, res) => {
    try {
        const userId = req.userId;
        const { productId } = req.params;
        const isAdmin = await isUserAdmin(userId);

        if (await hasProductOpenSales(productId)) {
            return errorRes(res, 409, OPEN_SALES_BLOCK_MESSAGE);
        }

        const ownerFilter = isAdmin
            ? { _id: productId }
            : { _id: productId, productSeller: userId };

        const existing = await ProductModel.findOne(ownerFilter);
        if (!existing) {
            return errorRes(
                res,
                404,
                "Товар не найден или нет прав на изменение",
            );
        }

        const body = req.body;
        const $set = {};
        const touchesContent = patchBodyTouchesModerationContent(body);

        if (Object.prototype.hasOwnProperty.call(body, "productName")) {
            $set.productName = String(body.productName).trim();
        }
        if (Object.prototype.hasOwnProperty.call(body, "productDescription")) {
            $set.productDescription = String(body.productDescription).trim();
        }
        if (Object.prototype.hasOwnProperty.call(body, "productPrice")) {
            try {
                $set.productPrice = normalizeProductPriceRub(body.productPrice);
            } catch (priceError) {
                return errorRes(
                    res,
                    400,
                    priceError instanceof Error
                        ? priceError.message
                        : "Некорректная цена",
                );
            }
        }
        if (Object.prototype.hasOwnProperty.call(body, "productOldPrice")) {
            try {
                $set.productOldPrice = normalizeProductOldPriceRub(
                    body.productOldPrice,
                );
            } catch (priceError) {
                return errorRes(
                    res,
                    400,
                    priceError instanceof Error
                        ? priceError.message
                        : "Некорректная старая цена",
                );
            }
        }

        if (
            Object.prototype.hasOwnProperty.call($set, "productPrice") ||
            Object.prototype.hasOwnProperty.call($set, "productOldPrice")
        ) {
            try {
                const nextPrice = Object.prototype.hasOwnProperty.call(
                    $set,
                    "productPrice",
                )
                    ? $set.productPrice
                    : Math.floor(Number(existing.productPrice));
                const nextOldPrice = Object.prototype.hasOwnProperty.call(
                    $set,
                    "productOldPrice",
                )
                    ? $set.productOldPrice
                    : existing.productOldPrice == null
                      ? null
                      : Math.floor(Number(existing.productOldPrice));
                assertProductOldPricePair(nextOldPrice, nextPrice);
            } catch (priceError) {
                return errorRes(
                    res,
                    400,
                    priceError instanceof Error
                        ? priceError.message
                        : "Некорректная цена",
                );
            }
        }
        if (Object.prototype.hasOwnProperty.call(body, "productCategory")) {
            $set.productCategory = String(body.productCategory).trim();
        }
        if (
            Object.prototype.hasOwnProperty.call(body, "productImageUrls") ||
            Object.prototype.hasOwnProperty.call(body, "productImageUrl")
        ) {
            $set.productImageUrls = mergeProductImageUrlsFromBody(body);
        }

        if (Object.prototype.hasOwnProperty.call(body, "productPreviewVideoUrl")) {
            const nextPreviewVideoUrl = normalizeProductPreviewVideoUrl(
                body.productPreviewVideoUrl,
            );
            const nextImageUrls = Object.prototype.hasOwnProperty.call(
                $set,
                "productImageUrls",
            )
                ? $set.productImageUrls
                : Array.isArray(existing.productImageUrls)
                  ? existing.productImageUrls
                  : [];
            try {
                assertProductPreviewVideoRequiresPhotos(
                    nextPreviewVideoUrl,
                    nextImageUrls,
                );
            } catch (previewVideoError) {
                return errorRes(
                    res,
                    400,
                    previewVideoError instanceof Error
                        ? previewVideoError.message
                        : "Некорректное превью-видео",
                );
            }

            const prevPreviewVideoUrl = normalizeProductPreviewVideoUrl(
                existing.productPreviewVideoUrl,
            );
            if (
                prevPreviewVideoUrl &&
                prevPreviewVideoUrl !== nextPreviewVideoUrl
            ) {
                await deleteUploadFileByUrl(prevPreviewVideoUrl);
            }
            $set.productPreviewVideoUrl = nextPreviewVideoUrl;
        } else if (
            Object.prototype.hasOwnProperty.call($set, "productImageUrls")
        ) {
            const existingPreviewVideoUrl = normalizeProductPreviewVideoUrl(
                existing.productPreviewVideoUrl,
            );
            try {
                assertProductPreviewVideoRequiresPhotos(
                    existingPreviewVideoUrl,
                    $set.productImageUrls,
                );
            } catch (previewVideoError) {
                return errorRes(
                    res,
                    400,
                    previewVideoError instanceof Error
                        ? previewVideoError.message
                        : "Некорректное превью-видео",
                );
            }
        }

        if (!isAdmin) {
            const pendingAuctionOnly =
                existing.productModerationStatus === PRODUCT_MODERATION_PENDING &&
                Object.prototype.hasOwnProperty.call(
                    body,
                    "productAuctionEnabled",
                ) &&
                !touchesContent &&
                !Object.prototype.hasOwnProperty.call(body, "productIsAvailable");

            if (
                existing.productModerationStatus === PRODUCT_MODERATION_PENDING &&
                !pendingAuctionOnly
            ) {
                return errorRes(res, 409, PENDING_EDIT_BLOCK_MESSAGE);
            }

            const resubmitForModeration =
                !pendingAuctionOnly &&
                touchesContent &&
                existing.productModerationStatus !== PRODUCT_MODERATION_PENDING;

            if (resubmitForModeration) {
                $set.productModerationStatus = PRODUCT_MODERATION_PENDING;
                $set.productModerationComment = "";
                $set.productIsAvailable = false;
            } else if (
                Object.prototype.hasOwnProperty.call(body, "productIsAvailable")
            ) {
                if (existing.productModerationStatus !== PRODUCT_MODERATION_APPROVED) {
                    return errorRes(
                        res,
                        409,
                        "Видимость в каталоге можно менять только для одобренных товаров",
                    );
                }
                $set.productIsAvailable = Boolean(body.productIsAvailable);
            }
        } else if (Object.prototype.hasOwnProperty.call(body, "productIsAvailable")) {
            $set.productIsAvailable = Boolean(body.productIsAvailable);
        }

        if (Object.prototype.hasOwnProperty.call(body, "productStockQuantity")) {
            try {
                const nextStock = await assertProductStockPatchAllowed(
                    productId,
                    body.productStockQuantity,
                );
                $set.productStockQuantity = nextStock;
                if (nextStock === 0) {
                    $set.productIsAvailable = false;
                } else if (
                    existing.productModerationStatus === PRODUCT_MODERATION_APPROVED
                ) {
                    $set.productIsAvailable = true;
                }
            } catch (stockError) {
                return errorRes(
                    res,
                    400,
                    stockError instanceof Error
                        ? stockError.message
                        : "Некорректное количество в наличии",
                );
            }
        }

        let auctionEnabledChanged = false;
        let nextAuctionEnabled = existing.productAuctionEnabled === true;

        if (Object.prototype.hasOwnProperty.call(body, "productAuctionEnabled")) {
            nextAuctionEnabled = Boolean(body.productAuctionEnabled);
            auctionEnabledChanged =
                nextAuctionEnabled !==
                (existing.productAuctionEnabled === true);
            $set.productAuctionEnabled = nextAuctionEnabled;

            if (nextAuctionEnabled) {
                $set.productAuctionCompletedOnce = false;
            }
        }

        if (Object.keys($set).length === 0) {
            return errorRes(res, 400, "Нет полей для обновления");
        }

        const product = await ProductModel.findOneAndUpdate(
            ownerFilter,
            { $set },
            { returnDocument: 'after', runValidators: true },
        )
            .populate("productSeller", PRODUCT_SELLER_PUBLIC_SELECT)
            .lean();

        if (!product) {
            return errorRes(
                res,
                404,
                "Товар не найден или нет прав на изменение",
            );
        }

        if (product.productIsAvailable === false) {
            await rejectAllPendingOffersForProduct(productId, {
                notifyBuyers: true,
            });
            await cancelProductPromotionsForProduct({
                productId,
                statuses: [
                    PRODUCT_PROMOTION_STATUS_PENDING_STAFF,
                    PRODUCT_PROMOTION_STATUS_ACTIVE,
                ],
            });
        }

        if (auctionEnabledChanged && !nextAuctionEnabled) {
            await rejectAllPendingOffersForProduct(productId, {
                notifyBuyers: true,
            });
        }

        if (auctionEnabledChanged && isAdmin) {
            const sellerId = product.productSeller?._id ?? product.productSeller;
            if (sellerId != null) {
                await notifySellerAuctionToggledByAdmin({
                    productId,
                    sellerUserId: sellerId,
                    actorUserId: userId,
                    enabled: nextAuctionEnabled,
                });
            }
        }

        if (Object.prototype.hasOwnProperty.call($set, "productStockQuantity")) {
            await syncProductCatalogAfterStockChange(productId);
        }

        const productWithSeller = await attachProductSellerSnapshot(
            await ProductModel.findById(productId)
                .populate("productSeller", PRODUCT_SELLER_PUBLIC_SELECT)
                .lean(),
        );

        return successRes(res, {
            message: "Товар обновлён",
            product: productWithSeller,
        });
    } catch (error) {
        console.error(error);
        return errorRes(res, 500, "Ошибка при обновлении товара");
    }
};
