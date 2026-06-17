import {
  countIncomingPendingPriceOffersForSeller,
  countAuctionTabActionItems,
  getIncomingPriceOffersForSeller,
  getMyPriceOfferBids,
} from "../../utils/productPriceOfferHelpers.js";
import { successRes } from "../../services/http/index.js";

/** `GET /price-offers/my-bids` */
export const getMyPriceOfferBidsController = async (req, res) => {
const bids = await getMyPriceOfferBids(req.userId);
    return successRes(res, { bids });
};

/** `GET /price-offers/incoming` */
export const getIncomingPriceOffersController = async (req, res) => {
const offers = await getIncomingPriceOffersForSeller(req.userId);
    return successRes(res, { offers });
};

/** `GET /price-offers/incoming/pending-count` */
export const getIncomingPriceOffersPendingCountController = async (req, res) => {
const count = await countAuctionTabActionItems(req.userId);
    return successRes(res, { count });
};
