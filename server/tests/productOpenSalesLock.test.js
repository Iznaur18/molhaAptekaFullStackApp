import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";

import {
  ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY,
  ORDER_STATUS_PENDING,
  ORDER_STATUS_RETURNED,
} from "../constants/orderConstants.js";
import { PRODUCT_MODERATION_APPROVED } from "../constants/productModerationConstants.js";
import { OrderModel, ProductModel, UserModel } from "../models/index.js";
import { getProductIdsWithOpenSales } from "../services/product/productOrderLocks.js";
import { patchMyProduct } from "../services/product/patchMyProduct.js";
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

let seq = 0;

const createSellerWithProduct = async () => {
  seq += 1;
  const seller = await UserModel.create({
    userName: `seller_lock_${seq}`,
    email: `s_lock_${seq}_${Date.now()}@t.local`,
    passwordHash: "h",
  });
  const buyer = await UserModel.create({
    userName: `buyer_lock_${seq}`,
    email: `b_lock_${seq}_${Date.now()}@t.local`,
    passwordHash: "h",
  });
  const product = await ProductModel.create({
    productName: "P",
    productPrice: 100,
    productSeller: seller._id,
    productCategory: "electronics",
    productModerationStatus: PRODUCT_MODERATION_APPROVED,
    productStockQuantity: 5,
    productIsAvailable: true,
  });
  return { seller, buyer, product };
};

/**
 * @param {{ buyerId: unknown; productId: unknown; status: string }} input
 */
const createOrderWithItemStatus = ({ buyerId, productId, status }) =>
  OrderModel.create({
    deliveryAddress: "Тест, д. 1",
    totalAmount: 100,
    paymentMethod: ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY,
    userBuyerId: buyerId,
    status,
    items: [
      {
        productId,
        quantity: 1,
        unitPriceAtOrder: 100,
        productNameAtOrder: "P",
        status,
      },
    ],
  });

test("returned позиции не держат товар: покупателю нечего подтверждать", async () => {
  const { buyer, product } = await createSellerWithProduct();
  await createOrderWithItemStatus({
    buyerId: buyer._id,
    productId: product._id,
    status: ORDER_STATUS_RETURNED,
  });

  const open = await getProductIdsWithOpenSales([String(product._id)]);
  assert.equal(open.has(String(product._id)), false);
});

test("patchMyProduct: правка описания проходит и при живом заказе", async () => {
  const { seller, buyer, product } = await createSellerWithProduct();
  await createOrderWithItemStatus({
    buyerId: buyer._id,
    productId: product._id,
    status: ORDER_STATUS_PENDING,
  });

  await patchMyProduct({
    userId: String(seller._id),
    productId: String(product._id),
    body: { productDescription: "Новое описание" },
  });

  const updated = await ProductModel.findById(product._id).lean();
  assert.equal(updated.productDescription, "Новое описание");
});

test("patchMyProduct: скрыть товар при живом заказе всё ещё нельзя", async () => {
  const { seller, buyer, product } = await createSellerWithProduct();
  await createOrderWithItemStatus({
    buyerId: buyer._id,
    productId: product._id,
    status: ORDER_STATUS_PENDING,
  });

  await assert.rejects(
    patchMyProduct({
      userId: String(seller._id),
      productId: String(product._id),
      body: { productIsAvailable: false },
    }),
    (error) => error.statusCode === 409,
  );
});

test("patchMyProduct: после возврата товар снова можно скрыть", async () => {
  const { seller, buyer, product } = await createSellerWithProduct();
  await createOrderWithItemStatus({
    buyerId: buyer._id,
    productId: product._id,
    status: ORDER_STATUS_RETURNED,
  });

  await patchMyProduct({
    userId: String(seller._id),
    productId: String(product._id),
    body: { productIsAvailable: false },
  });

  const updated = await ProductModel.findById(product._id).lean();
  assert.equal(updated.productIsAvailable, false);
});
