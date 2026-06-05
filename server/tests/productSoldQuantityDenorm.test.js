import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import mongoose from "mongoose";

import {
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_CONFIRMED,
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_PENDING,
  ORDER_STATUS_SHIPPED,
} from "../constants/orderConstants.js";
import { PRODUCT_MODERATION_APPROVED } from "../constants/productModerationConstants.js";
import { OrderModel, ProductModel } from "../models/index.js";
import { findProductsPage } from "../utils/productCatalogQuery.js";
import { PRODUCT_SORT_PURCHASES } from "../constants/productCatalogSort.js";
import {
  applySoldQuantityDeltaForItemStatusChange,
  computeProductSoldQuantityDelta,
  rebuildAllProductSoldQuantities,
} from "../utils/productSoldQuantityDenorm.js";
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

test("computeProductSoldQuantityDelta: shipped → delivered increments", () => {
  assert.equal(
    computeProductSoldQuantityDelta(ORDER_STATUS_SHIPPED, ORDER_STATUS_DELIVERED, 2),
    2,
  );
});

test("computeProductSoldQuantityDelta: delivered → confirmed is noop", () => {
  assert.equal(
    computeProductSoldQuantityDelta(
      ORDER_STATUS_DELIVERED,
      ORDER_STATUS_CONFIRMED,
      3,
    ),
    0,
  );
});

test("computeProductSoldQuantityDelta: delivered → cancelled decrements", () => {
  assert.equal(
    computeProductSoldQuantityDelta(
      ORDER_STATUS_DELIVERED,
      ORDER_STATUS_CANCELLED,
      4,
    ),
    -4,
  );
});

test("applySoldQuantityDeltaForItemStatusChange updates Product.soldQuantity", async () => {
  const sellerId = new mongoose.Types.ObjectId();
  const product = await ProductModel.create({
    productName: "Sold qty denorm product",
    productPrice: 100,
    productSeller: sellerId,
    productCategory: "electronics",
    productModerationStatus: PRODUCT_MODERATION_APPROVED,
    soldQuantity: 0,
  });

  await applySoldQuantityDeltaForItemStatusChange({
    productId: product._id,
    previousStatus: ORDER_STATUS_PENDING,
    nextStatus: ORDER_STATUS_DELIVERED,
    quantity: 5,
  });

  const updated = await ProductModel.findById(product._id).lean();
  assert.equal(updated?.soldQuantity, 5);
});

test("rebuildAllProductSoldQuantities matches orders aggregate", async () => {
  const sellerId = new mongoose.Types.ObjectId();
  const buyerId = new mongoose.Types.ObjectId();
  const product = await ProductModel.create({
    productName: "Rebuild sold qty product",
    productPrice: 200,
    productSeller: sellerId,
    productCategory: "electronics",
    productModerationStatus: PRODUCT_MODERATION_APPROVED,
    soldQuantity: 0,
  });

  await OrderModel.create({
    userBuyerId: buyerId,
    items: [
      {
        productId: product._id,
        quantity: 2,
        status: ORDER_STATUS_DELIVERED,
        unitPriceAtOrder: 200,
        productNameAtOrder: "Rebuild sold qty product",
      },
      {
        productId: product._id,
        quantity: 1,
        status: ORDER_STATUS_CONFIRMED,
        unitPriceAtOrder: 200,
        productNameAtOrder: "Rebuild sold qty product",
      },
    ],
    totalAmount: 600,
    deliveryAddress: "Москва, Тверская 1",
    deliveryAddressFlat: "10",
    paymentMethod: "cashOnDelivery",
    status: ORDER_STATUS_DELIVERED,
  });

  await rebuildAllProductSoldQuantities();

  const updated = await ProductModel.findById(product._id).lean();
  assert.equal(updated?.soldQuantity, 3);
});

test("findProductsPage sort=purchases uses denorm soldQuantity without lookup", async () => {
  const sellerId = new mongoose.Types.ObjectId();

  const low = await ProductModel.create({
    productName: "Low sales product",
    productPrice: 50,
    productSeller: sellerId,
    productCategory: "electronics",
    productModerationStatus: PRODUCT_MODERATION_APPROVED,
    productIsAvailable: true,
    productStockQuantity: 10,
    soldQuantity: 1,
  });

  const high = await ProductModel.create({
    productName: "High sales product",
    productPrice: 60,
    productSeller: sellerId,
    productCategory: "electronics",
    productModerationStatus: PRODUCT_MODERATION_APPROVED,
    productIsAvailable: true,
    productStockQuantity: 10,
    soldQuantity: 99,
  });

  const page = await findProductsPage(
    {
      productModerationStatus: PRODUCT_MODERATION_APPROVED,
      _id: { $in: [low._id, high._id] },
    },
    PRODUCT_SORT_PURCHASES,
    0,
    10,
  );

  assert.equal(page.length, 2);
  assert.equal(String(page[0]._id), String(high._id));
  assert.equal(page[0].soldQuantity, 99);
});
