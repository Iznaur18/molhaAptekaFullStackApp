import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import mongoose from "mongoose";

import {
  ORDER_STATUS_CONFIRMED,
  ORDER_STATUS_PENDING,
} from "../constants/orderConstants.js";
import {
  PRODUCT_MODERATION_APPROVED,
  PRODUCT_MODERATION_PENDING,
} from "../constants/productModerationConstants.js";
import { OrderModel, ProductModel } from "../models/index.js";
import { explainUsesIndexScan } from "../utils/mongoExplain.js";
import {
  connectMongoTestReplSet,
  disconnectMongoTestReplSet,
} from "./helpers/mongoTestDb.js";

before(async () => {
  await connectMongoTestReplSet();
  await ProductModel.createIndexes();
  await OrderModel.createIndexes();
});

after(async () => {
  await disconnectMongoTestReplSet();
});

test("explain: catalog approved list uses catalog_approved_list index", async () => {
  const sellerId = new mongoose.Types.ObjectId();
  await ProductModel.create({
    productName: "Indexed Catalog Product",
    productPrice: 100,
    productSeller: sellerId,
    productCategory: "electronics",
    productModerationStatus: PRODUCT_MODERATION_APPROVED,
    productIsAvailable: true,
    productStockQuantity: 5,
  });

  const explain = await ProductModel.find({
    productModerationStatus: PRODUCT_MODERATION_APPROVED,
    productIsAvailable: { $ne: false },
    productStockQuantity: { $gt: 0 },
  })
    .sort({
      catalogPromotionActivatedAt: -1,
      catalogPromotionExpiresAt: -1,
      createdAt: -1,
    })
    .limit(24)
    .explain("executionStats");

  assert.equal(
    explainUsesIndexScan(explain, "catalog_approved_list"),
    true,
    "expected IXSCAN on catalog_approved_list",
  );
});

test("explain: moderation pending uses moderation_status_created_asc", async () => {
  await ProductModel.create({
    productName: "Pending Product",
    productPrice: 50,
    productSeller: new mongoose.Types.ObjectId(),
    productCategory: "electronics",
    productModerationStatus: PRODUCT_MODERATION_PENDING,
  });

  const explain = await ProductModel.find({
    productModerationStatus: PRODUCT_MODERATION_PENDING,
  })
    .sort({ createdAt: 1 })
    .limit(20)
    .explain("executionStats");

  assert.equal(
    explainUsesIndexScan(explain, "moderation_status_created_asc"),
    true,
    "expected IXSCAN on moderation_status_created_asc",
  );
});

test("explain: seller products uses seller_moderation_created", async () => {
  const sellerId = new mongoose.Types.ObjectId();
  await ProductModel.create({
    productName: "Seller Product",
    productPrice: 80,
    productSeller: sellerId,
    productCategory: "electronics",
    productModerationStatus: PRODUCT_MODERATION_APPROVED,
  });

  const explain = await ProductModel.find({ productSeller: sellerId })
    .sort({ createdAt: -1 })
    .limit(24)
    .explain("executionStats");

  assert.equal(
    explainUsesIndexScan(explain, "seller_moderation_created"),
    true,
    "expected IXSCAN on seller_moderation_created",
  );
});

test("explain: buyer orders uses userBuyerId_1_createdAt_-1", async () => {
  const buyerId = new mongoose.Types.ObjectId();
  const productId = new mongoose.Types.ObjectId();

  await OrderModel.create({
    userBuyerId: buyerId,
    items: [
      {
        productId,
        quantity: 1,
        unitPriceAtOrder: 100,
        productNameAtOrder: "Test",
        status: ORDER_STATUS_PENDING,
      },
    ],
    status: ORDER_STATUS_PENDING,
    totalAmount: 100,
    paymentMethod: "cashOnDelivery",
    deliveryAddress: "Москва, Тестовая 1",
    deliveryAddressFlat: "1",
  });

  const explain = await OrderModel.find({ userBuyerId: buyerId })
    .sort({ createdAt: -1 })
    .explain("executionStats");

  assert.equal(
    explainUsesIndexScan(explain, "userBuyerId_1_createdAt_-1"),
    true,
    "expected IXSCAN on userBuyerId_1_createdAt_-1",
  );
});

test("explain: order sales by productId uses items_productId_created", async () => {
  const productId = new mongoose.Types.ObjectId();

  await OrderModel.create({
    userBuyerId: new mongoose.Types.ObjectId(),
    items: [
      {
        productId,
        quantity: 2,
        unitPriceAtOrder: 50,
        productNameAtOrder: "Sale item",
        status: ORDER_STATUS_CONFIRMED,
      },
    ],
    status: ORDER_STATUS_CONFIRMED,
    totalAmount: 100,
    paymentMethod: "cashOnDelivery",
    deliveryAddress: "Москва, Тестовая 2",
    deliveryAddressFlat: "2",
  });

  const explain = await OrderModel.find({ "items.productId": productId })
    .sort({ createdAt: -1 })
    .limit(20)
    .explain("executionStats");

  assert.equal(
    explainUsesIndexScan(explain, "items_productId_created"),
    true,
    "expected IXSCAN on items_productId_created",
  );
});
