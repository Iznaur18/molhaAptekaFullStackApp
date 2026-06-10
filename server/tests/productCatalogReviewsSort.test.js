import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import mongoose from "mongoose";

import { PRODUCT_MODERATION_APPROVED } from "../constants/productModerationConstants.js";
import { PRODUCT_SORT_REVIEWS } from "../constants/productCatalogSort.js";
import { ProductModel } from "../models/index.js";
import { findProductsPage } from "../utils/productCatalogQuery.js";
import {
  connectMongoTestReplSet,
  disconnectMongoTestReplSet,
} from "./helpers/mongoTestDb.js";

before(async () => {
  await connectMongoTestReplSet();
});

after(async () => {
  await disconnectMongoTestReplSet();
});

test("findProductsPage sort=reviews orders by averageRating then reviewCount", async () => {
  const sellerId = new mongoose.Types.ObjectId();

  const lowRated = await ProductModel.create({
    productName: "Low rated product",
    productPrice: 50,
    productSeller: sellerId,
    productCategory: "electronics",
    productModerationStatus: PRODUCT_MODERATION_APPROVED,
    productIsAvailable: true,
    productStockQuantity: 10,
    averageRating: 3,
    reviewCount: 5,
  });

  const highRatedFewReviews = await ProductModel.create({
    productName: "High rated few reviews",
    productPrice: 60,
    productSeller: sellerId,
    productCategory: "electronics",
    productModerationStatus: PRODUCT_MODERATION_APPROVED,
    productIsAvailable: true,
    productStockQuantity: 10,
    averageRating: 5,
    reviewCount: 1,
  });

  const highRatedManyReviews = await ProductModel.create({
    productName: "High rated many reviews",
    productPrice: 70,
    productSeller: sellerId,
    productCategory: "electronics",
    productModerationStatus: PRODUCT_MODERATION_APPROVED,
    productIsAvailable: true,
    productStockQuantity: 10,
    averageRating: 5,
    reviewCount: 10,
  });

  const page = await findProductsPage(
    {
      productModerationStatus: PRODUCT_MODERATION_APPROVED,
      reviewCount: { $gte: 1 },
      _id: { $in: [lowRated._id, highRatedFewReviews._id, highRatedManyReviews._id] },
    },
    PRODUCT_SORT_REVIEWS,
    0,
    10,
  );

  assert.equal(page.length, 3);
  assert.equal(String(page[0]._id), String(highRatedManyReviews._id));
  assert.equal(String(page[1]._id), String(highRatedFewReviews._id));
  assert.equal(String(page[2]._id), String(lowRated._id));
});
