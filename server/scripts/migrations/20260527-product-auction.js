import { ProductModel } from "../../models/index.js";

export const up = async () => {
  await ProductModel.updateMany(
    {
      $or: [
        { productAuctionEnabled: { $exists: false } },
        { productAuctionCompletedOnce: { $exists: false } },
      ],
    },
    {
      $set: {
        productAuctionEnabled: false,
        productAuctionCompletedOnce: false,
      },
    },
  );
};
