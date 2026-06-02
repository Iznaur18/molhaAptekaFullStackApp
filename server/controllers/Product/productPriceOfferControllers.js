import { ProductPriceOfferModel } from '../../models/index.js';
import {
    IN_APP_NOTIFICATION_KIND_PRICE_OFFER_ACCEPTED,
    IN_APP_NOTIFICATION_KIND_PRICE_OFFER_REJECTED,
    IN_APP_NOTIFICATION_MESSAGE_PRICE_OFFER_ACCEPTED,
    IN_APP_NOTIFICATION_MESSAGE_PRICE_OFFER_REJECTED,
    PRICE_OFFER_PAYMENT_DEADLINE_MS,
    PRICE_OFFER_STATUS_ACCEPTED,
    PRICE_OFFER_STATUS_CANCELLED,
    PRICE_OFFER_STATUS_PENDING,
    PRICE_OFFER_STATUS_REJECTED,
} from '../../constants/productPriceOfferConstants.js';
import {
    assertBuyerCanSubmitPriceOffer,
    assertSellerOwnsProduct,
    getPublicTopPriceOffers,
    getSellerPriceOfferArchive,
    getSellerPriceOffers,
    hasActiveAcceptedOffer,
    loadProductForAuctionGate,
    normalizeOfferPrice,
    notifySellerAboutPriceOffer,
    releaseExpiredAcceptedOffers,
} from '../../utils/productPriceOfferHelpers.js';
import { assertAuctionAcceptsBids } from '../../utils/productAuction.js';
import { createUserInAppNotification } from '../../utils/userInAppNotifications.js';
import { errorRes, successRes } from '../../utils/index.js';

/**
 * `POST /product/:productId/price-offers`
 */
export const submitProductPriceOfferController = async (req, res) => {
    try {
        const buyerId = String(req.userId);
        const { productId } = req.params;

        let offerPrice;
        try {
            offerPrice = normalizeOfferPrice(req.body?.offerPrice);
        } catch (e) {
            return errorRes(
                res,
                400,
                e instanceof Error ? e.message : 'Некорректная цена',
            );
        }

        try {
            await assertBuyerCanSubmitPriceOffer(buyerId, productId);
        } catch (e) {
            return errorRes(
                res,
                400,
                e instanceof Error ? e.message : 'Нельзя отправить предложение',
            );
        }

        const existing = await ProductPriceOfferModel.findOne({
            productId,
            buyerUserId: buyerId,
            status: PRICE_OFFER_STATUS_PENDING,
        });

        if (existing) {
            existing.offerPrice = offerPrice;
            await existing.save();
            await notifySellerAboutPriceOffer(productId);
            return successRes(res, { offer: existing, message: 'Цена обновлена' });
        }

        const offer = await ProductPriceOfferModel.create({
            productId,
            buyerUserId: buyerId,
            offerPrice,
        });

        await notifySellerAboutPriceOffer(productId);
        return successRes(res, { offer, message: 'Предложение принято' });
    } catch (error) {
        if (error?.code === 11000) {
            return errorRes(res, 409, 'У вас уже есть активное предложение');
        }
        console.error('submitProductPriceOffer error:', error);
        return errorRes(res, 500, 'Ошибка при отправке предложения');
    }
};

/**
 * `PATCH /product/:productId/price-offers/me`
 */
export const patchMyProductPriceOfferController = async (req, res) => {
    try {
        const buyerId = String(req.userId);
        const { productId } = req.params;

        let offerPrice;
        try {
            offerPrice = normalizeOfferPrice(req.body?.offerPrice);
        } catch (e) {
            return errorRes(
                res,
                400,
                e instanceof Error ? e.message : 'Некорректная цена',
            );
        }

        try {
            await assertBuyerCanSubmitPriceOffer(buyerId, productId);
        } catch (e) {
            return errorRes(
                res,
                400,
                e instanceof Error ? e.message : 'Нельзя изменить предложение',
            );
        }

        const offer = await ProductPriceOfferModel.findOne({
            productId,
            buyerUserId: buyerId,
            status: PRICE_OFFER_STATUS_PENDING,
        });

        if (!offer) {
            return errorRes(res, 404, 'Активное предложение не найдено');
        }

        offer.offerPrice = offerPrice;
        await offer.save();
        await notifySellerAboutPriceOffer(productId);

        return successRes(res, { offer, message: 'Цена обновлена' });
    } catch (error) {
        console.error('patchMyProductPriceOffer error:', error);
        return errorRes(res, 500, 'Ошибка при обновлении предложения');
    }
};

/**
 * `DELETE /product/:productId/price-offers/me`
 */
export const cancelMyProductPriceOfferController = async (req, res) => {
    try {
        const buyerId = String(req.userId);
        const { productId } = req.params;

        const offer = await ProductPriceOfferModel.findOneAndUpdate(
            {
                productId,
                buyerUserId: buyerId,
                status: PRICE_OFFER_STATUS_PENDING,
            },
            { $set: { status: PRICE_OFFER_STATUS_CANCELLED } },
            { returnDocument: 'after' },
        );

        if (!offer) {
            return errorRes(res, 404, 'Активное предложение не найдено');
        }

        return successRes(res, { message: 'Предложение отменено' });
    } catch (error) {
        console.error('cancelMyProductPriceOffer error:', error);
        return errorRes(res, 500, 'Ошибка при отмене предложения');
    }
};

/**
 * `GET /product/:productId/price-offers/me`
 */
export const getMyProductPriceOfferController = async (req, res) => {
    try {
        const buyerId = String(req.userId);
        const { productId } = req.params;

        await releaseExpiredAcceptedOffers(productId);

        const offer = await ProductPriceOfferModel.findOne({
            productId,
            buyerUserId: buyerId,
            status: {
                $in: [
                    PRICE_OFFER_STATUS_PENDING,
                    PRICE_OFFER_STATUS_ACCEPTED,
                ],
            },
        })
            .sort({ updatedAt: -1 })
            .lean();

        return successRes(res, { offer: offer ?? null });
    } catch (error) {
        console.error('getMyProductPriceOffer error:', error);
        return errorRes(res, 500, 'Ошибка при загрузке предложения');
    }
};

/**
 * `GET /product/:productId/price-offers/top`
 */
export const getTopProductPriceOffersController = async (req, res) => {
    try {
        const { productId } = req.params;
        const top = await getPublicTopPriceOffers(productId);
        return successRes(res, { top });
    } catch (error) {
        console.error('getTopProductPriceOffers error:', error);
        return errorRes(res, 500, 'Ошибка при загрузке ставок');
    }
};

/**
 * `GET /product/:productId/price-offers` — только продавец
 */
export const getSellerProductPriceOffersController = async (req, res) => {
    try {
        const sellerId = String(req.userId);
        const { productId } = req.params;

        try {
            const offers = await getSellerPriceOffers(productId, sellerId);
            return successRes(res, { offers });
        } catch (e) {
            const message =
                e instanceof Error ? e.message : 'Нет доступа';
            const status = message === 'Товар не найден' ? 404 : 403;
            return errorRes(res, status, message);
        }
    } catch (error) {
        console.error('getSellerProductPriceOffers error:', error);
        return errorRes(res, 500, 'Ошибка при загрузке предложений');
    }
};

/**
 * `PATCH /product/:productId/price-offers/:offerId/accept`
 */
export const acceptProductPriceOfferController = async (req, res) => {
    try {
        const sellerId = String(req.userId);
        const { productId, offerId } = req.params;

        await releaseExpiredAcceptedOffers(productId);

        if (await hasActiveAcceptedOffer(productId)) {
            return errorRes(
                res,
                409,
                'Уже есть принятое предложение, ожидающее оплаты',
            );
        }

        const offer = await ProductPriceOfferModel.findOne({
            _id: offerId,
            productId,
            status: PRICE_OFFER_STATUS_PENDING,
        });

        if (!offer) {
            return errorRes(res, 404, 'Предложение не найдено');
        }

        try {
            await assertSellerOwnsProduct(productId, sellerId);
            const product = await loadProductForAuctionGate(productId);
            assertAuctionAcceptsBids(product);
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Нет доступа';
            const status =
                message === 'Товар не найден'
                    ? 404
                    : message.includes('аукцион')
                      ? 409
                      : 403;
            return errorRes(res, status, message);
        }

        const now = new Date();
        offer.status = PRICE_OFFER_STATUS_ACCEPTED;
        offer.acceptedAt = now;
        offer.paymentDeadlineAt = new Date(
            now.getTime() + PRICE_OFFER_PAYMENT_DEADLINE_MS,
        );
        offer.reviewedBy = sellerId;
        offer.reviewedAt = now;
        await offer.save();

        await createUserInAppNotification({
            userId: offer.buyerUserId,
            kind: IN_APP_NOTIFICATION_KIND_PRICE_OFFER_ACCEPTED,
            message: IN_APP_NOTIFICATION_MESSAGE_PRICE_OFFER_ACCEPTED,
            productId,
        });

        return successRes(res, { offer });
    } catch (error) {
        if (error?.code === 11000) {
            return errorRes(
                res,
                409,
                'Уже есть принятое предложение, ожидающее оплаты',
            );
        }
        console.error('acceptProductPriceOffer error:', error);
        return errorRes(res, 500, 'Ошибка при принятии предложения');
    }
};

/**
 * `PATCH /product/:productId/price-offers/:offerId/reject`
 */
export const rejectProductPriceOfferController = async (req, res) => {
    try {
        const sellerId = String(req.userId);
        const { productId, offerId } = req.params;

        const offer = await ProductPriceOfferModel.findOne({
            _id: offerId,
            productId,
            status: PRICE_OFFER_STATUS_PENDING,
        });

        if (!offer) {
            return errorRes(res, 404, 'Предложение не найдено');
        }

        try {
            await assertSellerOwnsProduct(productId, sellerId);
        } catch (e) {
            return errorRes(
                res,
                403,
                e instanceof Error ? e.message : 'Нет доступа',
            );
        }

        const now = new Date();
        offer.status = PRICE_OFFER_STATUS_REJECTED;
        offer.reviewedBy = sellerId;
        offer.reviewedAt = now;
        await offer.save();

        await createUserInAppNotification({
            userId: offer.buyerUserId,
            kind: IN_APP_NOTIFICATION_KIND_PRICE_OFFER_REJECTED,
            message: IN_APP_NOTIFICATION_MESSAGE_PRICE_OFFER_REJECTED,
            productId,
        });

        return successRes(res, { offer });
    } catch (error) {
        console.error('rejectProductPriceOffer error:', error);
        return errorRes(res, 500, 'Ошибка при отклонении предложения');
    }
};

/**
 * `GET /product/:productId/price-offers/archive` — только продавец
 */
export const getSellerProductPriceOfferArchiveController = async (req, res) => {
    try {
        const sellerId = String(req.userId);
        const { productId } = req.params;

        try {
            const offers = await getSellerPriceOfferArchive(productId, sellerId);
            return successRes(res, { offers });
        } catch (e) {
            const message =
                e instanceof Error ? e.message : 'Нет доступа';
            const status = message === 'Товар не найден' ? 404 : 403;
            return errorRes(res, status, message);
        }
    } catch (error) {
        console.error('getSellerProductPriceOfferArchive error:', error);
        return errorRes(res, 500, 'Ошибка при загрузке архива аукциона');
    }
};
