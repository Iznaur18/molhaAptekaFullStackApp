import mongoose from "mongoose";

import { ProductModel } from "../models/index.js";
import { withMongoSession } from "./mongoTransaction.js";

/**
 * @param {{
 *   incrementIds?: string[];
 *   decrementIds?: string[];
 *   session?: import('mongoose').ClientSession | null;
 * }} params
 */
export async function applyProductWishlistCountDelta({
  incrementIds = [],
  decrementIds = [],
  session = null,
}) {
  const toObjectIds = (ids) =>
    ids
      .map((id) => String(id))
      .filter((id) => mongoose.isValidObjectId(id))
      .map((id) => new mongoose.Types.ObjectId(id));

  const incOids = toObjectIds(incrementIds);
  const decOids = toObjectIds(decrementIds);

  if (incOids.length > 0) {
    await ProductModel.updateMany(
      { _id: { $in: incOids } },
      { $inc: { productWishlistCount: 1 } },
      withMongoSession({}, session),
    );
  }

  if (decOids.length > 0) {
    await ProductModel.updateMany(
      { _id: { $in: decOids } },
      { $inc: { productWishlistCount: -1 } },
      withMongoSession({}, session),
    );
    await ProductModel.updateMany(
      { _id: { $in: decOids }, productWishlistCount: { $lt: 0 } },
      { $set: { productWishlistCount: 0 } },
      withMongoSession({}, session),
    );
  }
}
