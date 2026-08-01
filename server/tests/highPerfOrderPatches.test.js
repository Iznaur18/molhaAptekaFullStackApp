import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";

import {
  ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY,
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_CONFIRMED,
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_PENDING,
  ORDER_STATUS_SHIPPED,
} from "../constants/orderConstants.js";
import { PRODUCT_MODERATION_APPROVED } from "../constants/productModerationConstants.js";
import { OrderModel, ProductModel, UserModel } from "../models/index.js";
import { fetchMyOrdersPageIds } from "../services/order/fetchMyOrdersPageIds.js";
import { getSellerCommerceStatsBySellerIds } from "../services/order/sellerTotalSalesAmount.js";
import { getProductIdsWithOpenSales } from "../services/product/productOrderLocks.js";
import {
  clearMongoCollections,
  connectMongoTestReplSet,
  disconnectMongoTestReplSet,
} from "./helpers/mongoTestDb.js";

before(async () => {
  await connectMongoTestReplSet();
});

after(async () => {
  await disconnectMongoTestReplSet();
});

beforeEach(async () => {
  await clearMongoCollections();
});

/**
 * @param {Record<string, unknown>} overrides
 */
const createOrder = (overrides) =>
  OrderModel.create({
    deliveryAddress: "Тест, д. 1",
    totalAmount: 100,
    paymentMethod: ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY,
    ...overrides,
  });

test("getProductIdsWithOpenSales: only loads orders with open item statuses", async () => {
  const seller = await UserModel.create({
    userName: "seller_open",
    email: `s_open_${Date.now()}@t.local`,
    passwordHash: "h",
  });
  const buyer = await UserModel.create({
    userName: "buyer_open",
    email: `b_open_${Date.now()}@t.local`,
    passwordHash: "h",
  });
  const product = await ProductModel.create({
    productName: "P",
    productPrice: 100,
    productSeller: seller._id,
    productCategory: "electronics",
    productModerationStatus: PRODUCT_MODERATION_APPROVED,
    productStockQuantity: 5,
  });

  await createOrder({
    userBuyerId: buyer._id,
    status: ORDER_STATUS_CONFIRMED,
    totalAmount: 100,
    items: [
      {
        productId: product._id,
        quantity: 1,
        unitPriceAtOrder: 100,
        productNameAtOrder: "P",
        status: ORDER_STATUS_CONFIRMED,
      },
    ],
  });
  await createOrder({
    userBuyerId: buyer._id,
    status: ORDER_STATUS_SHIPPED,
    totalAmount: 100,
    items: [
      {
        productId: product._id,
        quantity: 1,
        unitPriceAtOrder: 100,
        productNameAtOrder: "P",
        status: ORDER_STATUS_SHIPPED,
      },
    ],
  });

  const open = await getProductIdsWithOpenSales([String(product._id)]);
  assert.equal(open.has(String(product._id)), true);
});

test("getSellerCommerceStatsBySellerIds: counts sold lines without scanning unrelated orders", async () => {
  const seller = await UserModel.create({
    userName: "seller_stats",
    email: `s_stats_${Date.now()}@t.local`,
    passwordHash: "h",
  });
  const other = await UserModel.create({
    userName: "other_stats",
    email: `o_stats_${Date.now()}@t.local`,
    passwordHash: "h",
  });
  const buyer = await UserModel.create({
    userName: "buyer_stats",
    email: `b_stats_${Date.now()}@t.local`,
    passwordHash: "h",
  });

  const product = await ProductModel.create({
    productName: "Sold",
    productPrice: 50,
    productSeller: seller._id,
    productCategory: "electronics",
    productModerationStatus: PRODUCT_MODERATION_APPROVED,
    productStockQuantity: 3,
  });
  const otherProduct = await ProductModel.create({
    productName: "Other",
    productPrice: 999,
    productSeller: other._id,
    productCategory: "electronics",
    productModerationStatus: PRODUCT_MODERATION_APPROVED,
    productStockQuantity: 3,
  });

  await createOrder({
    userBuyerId: buyer._id,
    status: ORDER_STATUS_CONFIRMED,
    totalAmount: 100,
    items: [
      {
        productId: product._id,
        quantity: 2,
        unitPriceAtOrder: 50,
        productNameAtOrder: "Sold",
        status: ORDER_STATUS_CONFIRMED,
      },
    ],
  });
  await createOrder({
    userBuyerId: buyer._id,
    status: ORDER_STATUS_DELIVERED,
    totalAmount: 999,
    items: [
      {
        productId: otherProduct._id,
        quantity: 1,
        unitPriceAtOrder: 999,
        productNameAtOrder: "Other",
        status: ORDER_STATUS_DELIVERED,
      },
    ],
  });

  const stats = await getSellerCommerceStatsBySellerIds([String(seller._id)]);
  assert.equal(stats[String(seller._id)].totalSalesAmount, 100);
  assert.equal(stats[String(seller._id)].totalSalesCount, 1);
});

test("fetchMyOrdersPageIds: paginates in DB pending-first", async () => {
  const buyer = await UserModel.create({
    userName: "buyer_page",
    email: `b_page_${Date.now()}@t.local`,
    passwordHash: "h",
  });
  const seller = await UserModel.create({
    userName: "seller_page",
    email: `s_page_${Date.now()}@t.local`,
    passwordHash: "h",
  });
  const product = await ProductModel.create({
    productName: "X",
    productPrice: 10,
    productSeller: seller._id,
    productCategory: "electronics",
    productModerationStatus: PRODUCT_MODERATION_APPROVED,
    productStockQuantity: 10,
  });

  const mk = async (status, createdAt) =>
    createOrder({
      userBuyerId: buyer._id,
      status,
      createdAt,
      totalAmount: 10,
      items: [
        {
          productId: product._id,
          quantity: 1,
          unitPriceAtOrder: 10,
          productNameAtOrder: "X",
          status,
        },
      ],
    });

  const oldConfirmed = await mk(ORDER_STATUS_CONFIRMED, new Date("2024-01-01"));
  const pending = await mk(ORDER_STATUS_PENDING, new Date("2024-01-02"));
  await mk(ORDER_STATUS_CANCELLED, new Date("2024-01-03"));

  const page1 = await fetchMyOrdersPageIds({
    buyerUserId: String(buyer._id),
    skip: 0,
    limit: 1,
  });
  assert.equal(page1.total, 3);
  assert.equal(String(page1.orderIds[0]), String(pending._id));

  const page2 = await fetchMyOrdersPageIds({
    buyerUserId: String(buyer._id),
    skip: 1,
    limit: 10,
  });
  assert.equal(page2.orderIds.length, 2);
  assert.equal(
    page2.orderIds.some((id) => String(id) === String(oldConfirmed._id)),
    true,
  );
});
