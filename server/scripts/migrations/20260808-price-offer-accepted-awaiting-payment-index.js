import { ProductPriceOfferModel } from "../../models/index.js";

const STALE_ACCEPTED_INDEX = "productId_1";

/**
 * Unique «один accepted на товар» → только пока orderId == null
 * (ожидание оплаты). Иначе после заказа / re-open аукциона accept ломается.
 */
export const up = async () => {
  const collection = ProductPriceOfferModel.collection;
  const indexes = await collection.indexes();
  const stale = indexes.find(
    (index) =>
      index.name === STALE_ACCEPTED_INDEX &&
      index.unique === true &&
      index.partialFilterExpression?.status === "accepted" &&
      !("orderId" in (index.partialFilterExpression ?? {})),
  );

  if (stale) {
    try {
      await collection.dropIndex(STALE_ACCEPTED_INDEX);
    } catch (error) {
      const code = /** @type {{ code?: number }} */ (error)?.code;
      if (code !== 27 && code !== 26) {
        throw error;
      }
    }
  }

  await ProductPriceOfferModel.syncIndexes();
};
