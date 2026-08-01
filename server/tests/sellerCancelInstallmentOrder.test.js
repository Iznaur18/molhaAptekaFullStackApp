import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import mongoose from "mongoose";

import {
  INSTALLMENT_CONTRACT_STATUS_CANCELLED,
  INSTALLMENT_CONTRACT_STATUS_PENDING_FIRST_PAYMENT,
  INSTALLMENT_PAYMENT_STATUS_SCHEDULED,
} from "../constants/installmentConstants.js";
import { ORDER_STATUS_CANCELLED } from "../constants/orderConstants.js";
import { InstallmentContractModel, OrderModel } from "../models/index.js";
import { markOrderItemCancelled } from "../services/order/updateOrderItemStatus.js";
import {
  createOrderLoyaltyFixture,
  createOrderWithReserveTransaction,
} from "./helpers/orderLoyaltyTestHelpers.js";
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

test("seller cancel installment order also cancels InstallmentContract", async () => {
  const { seller, buyer, product } = await createOrderLoyaltyFixture({
    sellerPoints: 100,
    loyaltyPointsPerUnit: 10,
  });

  const order = await createOrderWithReserveTransaction({
    buyer,
    seller,
    product,
    quantity: 1,
  });

  const programId = new mongoose.Types.ObjectId();
  const planId = new mongoose.Types.ObjectId();
  const dueAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const contract = await InstallmentContractModel.create({
    productId: product._id,
    programId,
    planId,
    buyerUserId: buyer._id,
    sellerUserId: seller._id,
    orderId: order._id,
    quantity: 1,
    planTitle: "3 мес",
    monthsCount: 3,
    monthlyPaymentRub: 400,
    totalAmountRub: 1200,
    productNameAtContract: product.productName,
    productUnitPriceAtContract: 1000,
    status: INSTALLMENT_CONTRACT_STATUS_PENDING_FIRST_PAYMENT,
    payments: [
      {
        paymentIndex: 1,
        amountRub: 400,
        dueAt,
        status: INSTALLMENT_PAYMENT_STATUS_SCHEDULED,
      },
    ],
    finalDueAt: dueAt,
    nextPaymentDueAt: dueAt,
  });

  order.installmentContractId = contract._id;
  await order.save();

  await markOrderItemCancelled({
    orderId: String(order._id),
    itemIndex: 0,
    requestUserId: String(seller._id),
    userId: String(seller._id),
  });

  const contractAfter = await InstallmentContractModel.findById(contract._id).lean();
  assert.equal(contractAfter.status, INSTALLMENT_CONTRACT_STATUS_CANCELLED);
  assert.equal(String(contractAfter.cancelledByUserId), String(seller._id));
  assert.match(String(contractAfter.cancellationReason), /продавцом/i);

  const orderAfter = await OrderModel.findById(order._id).lean();
  assert.equal(orderAfter.status, ORDER_STATUS_CANCELLED);
  assert.equal(orderAfter.items[0].status, ORDER_STATUS_CANCELLED);
});
