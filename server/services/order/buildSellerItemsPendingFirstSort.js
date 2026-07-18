import { ORDER_STATUS_PENDING } from "../../constants/orderConstants.js";

export const SELLER_ITEMS_PENDING_FIRST_FIELD = "_pendingFirst";

/**
 * `$addFields`: 0 если у продавца есть позиция «В обработке», иначе 1.
 *
 * @param {import("mongoose").Types.ObjectId[]} sellerProductIds
 */
export function buildSellerItemsPendingFirstAddFieldsStage(sellerProductIds) {
  return {
    $addFields: {
      [SELLER_ITEMS_PENDING_FIRST_FIELD]: {
        $cond: [
          {
            $anyElementTrue: {
              $map: {
                input: { $ifNull: ["$items", []] },
                as: "item",
                in: {
                  $and: [
                    { $in: ["$$item.productId", sellerProductIds] },
                    {
                      $eq: [
                        { $ifNull: ["$$item.status", ORDER_STATUS_PENDING] },
                        ORDER_STATUS_PENDING,
                      ],
                    },
                  ],
                },
              },
            },
          },
          0,
          1,
        ],
      },
    },
  };
}

/**
 * @param {boolean} pendingFirst
 */
export function buildMySalesSortStage(pendingFirst) {
  if (!pendingFirst) {
    return { $sort: { createdAt: -1 } };
  }
  return {
    $sort: {
      [SELLER_ITEMS_PENDING_FIRST_FIELD]: 1,
      createdAt: -1,
    },
  };
}
