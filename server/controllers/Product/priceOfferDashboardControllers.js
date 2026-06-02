import {
    countIncomingPendingPriceOffersForSeller,
    countAuctionTabActionItems,
    getIncomingPriceOffersForSeller,
    getMyPriceOfferBids,
} from '../../utils/productPriceOfferHelpers.js';
import { errorRes, successRes } from '../../utils/index.js';

/** `GET /price-offers/my-bids` */
export const getMyPriceOfferBidsController = async (req, res) => {
    try {
        const bids = await getMyPriceOfferBids(req.userId);
        return successRes(res, { bids });
    } catch (error) {
        console.error('getMyPriceOfferBidsController error:', error);
        return errorRes(res, 500, 'Ошибка при загрузке ставок');
    }
};

/** `GET /price-offers/incoming` */
export const getIncomingPriceOffersController = async (req, res) => {
    try {
        const offers = await getIncomingPriceOffersForSeller(req.userId);
        return successRes(res, { offers });
    } catch (error) {
        console.error('getIncomingPriceOffersController error:', error);
        return errorRes(
            res,
            500,
            'Ошибка при загрузке входящих предложений',
        );
    }
};

/** `GET /price-offers/incoming/pending-count` */
export const getIncomingPriceOffersPendingCountController = async (
    req,
    res,
) => {
    try {
        const count = await countAuctionTabActionItems(req.userId);
        return successRes(res, { count });
    } catch (error) {
        console.error(
            'getIncomingPriceOffersPendingCountController error:',
            error,
        );
        return errorRes(res, 500, 'Ошибка при загрузке счётчика');
    }
};
