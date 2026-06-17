import {
  acceptProductPriceOffer,
  cancelMyProductPriceOffer,
  getMyProductPriceOffer,
  getSellerProductPriceOfferArchive,
  getSellerProductPriceOffers,
  getTopProductPriceOffers,
  patchMyProductPriceOffer,
  rejectProductPriceOffer,
  submitProductPriceOffer,
} from "../../services/product/productPriceOffer.js";
import { successRes } from "../../services/http/index.js";

/** `POST /product/:productId/price-offers` */
export const submitProductPriceOfferController = async (req, res) => {
  const result = await submitProductPriceOffer({
    buyerId: String(req.userId),
    productId: req.params.productId,
    offerPrice: req.body?.offerPrice,
  });

  return successRes(res, result);
};

/** `PATCH /product/:productId/price-offers/me` */
export const patchMyProductPriceOfferController = async (req, res) => {
  const result = await patchMyProductPriceOffer({
    buyerId: String(req.userId),
    productId: req.params.productId,
    offerPrice: req.body?.offerPrice,
  });

  return successRes(res, result);
};

/** `DELETE /product/:productId/price-offers/me` */
export const cancelMyProductPriceOfferController = async (req, res) => {
  const result = await cancelMyProductPriceOffer({
    buyerId: String(req.userId),
    productId: req.params.productId,
  });

  return successRes(res, result);
};

/** `GET /product/:productId/price-offers/me` */
export const getMyProductPriceOfferController = async (req, res) => {
  const result = await getMyProductPriceOffer({
    buyerId: String(req.userId),
    productId: req.params.productId,
  });

  return successRes(res, result);
};

/** `GET /product/:productId/price-offers/top` */
export const getTopProductPriceOffersController = async (req, res) => {
  const result = await getTopProductPriceOffers({ productId: req.params.productId });
  return successRes(res, result);
};

/** `GET /product/:productId/price-offers` — только продавец */
export const getSellerProductPriceOffersController = async (req, res) => {
  const result = await getSellerProductPriceOffers({
    sellerId: String(req.userId),
    productId: req.params.productId,
  });

  return successRes(res, result);
};

/** `PATCH /product/:productId/price-offers/:offerId/accept` */
export const acceptProductPriceOfferController = async (req, res) => {
  const result = await acceptProductPriceOffer({
    sellerId: String(req.userId),
    productId: req.params.productId,
    offerId: req.params.offerId,
  });

  return successRes(res, result);
};

/** `PATCH /product/:productId/price-offers/:offerId/reject` */
export const rejectProductPriceOfferController = async (req, res) => {
  const result = await rejectProductPriceOffer({
    sellerId: String(req.userId),
    productId: req.params.productId,
    offerId: req.params.offerId,
  });

  return successRes(res, result);
};

/** `GET /product/:productId/price-offers/archive` — только продавец */
export const getSellerProductPriceOfferArchiveController = async (req, res) => {
  const result = await getSellerProductPriceOfferArchive({
    sellerId: String(req.userId),
    productId: req.params.productId,
  });

  return successRes(res, result);
};
