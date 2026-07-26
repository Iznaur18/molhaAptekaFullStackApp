import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import mongoose from "mongoose";

import {
  INSTALLMENT_CONTRACT_STATUS_ACTIVE,
  INSTALLMENT_PAYMENT_STATUS_PAID,
  INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION,
  INSTALLMENT_PAYMENT_STATUS_SCHEDULED,
} from "../constants/installmentConstants.js";
import { ORDER_STATUS_SHIPPED } from "../constants/orderConstants.js";
import {
  InstallmentContractModel,
  InstallmentOperationLogModel,
  OrderModel,
} from "../models/index.js";
import {
  confirmInstallmentPayment,
  markInstallmentPaymentPaid,
} from "../services/installment/installmentPaymentActions.js";
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

/**
 * @param {{
 *   seller: { _id: unknown };
 *   buyer: { _id: unknown };
 *   product: { _id: unknown; productName: string };
 *   order: { _id: unknown };
 * }} ctx
 */
async function createPendingPaymentContract(ctx) {
  const programId = new mongoose.Types.ObjectId();
  const planId = new mongoose.Types.ObjectId();
  const dueAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const contract = await InstallmentContractModel.create({
    productId: ctx.product._id,
    programId,
    planId,
    buyerUserId: ctx.buyer._id,
    sellerUserId: ctx.seller._id,
    orderId: ctx.order._id,
    quantity: 1,
    planTitle: "3 мес",
    monthsCount: 3,
    monthlyPaymentRub: 400,
    totalAmountRub: 1200,
    paidAmountRub: 0,
    productNameAtContract: ctx.product.productName,
    productUnitPriceAtContract: 1000,
    status: INSTALLMENT_CONTRACT_STATUS_ACTIVE,
    payments: [
      {
        paymentIndex: 1,
        amountRub: 400,
        dueAt,
        status: INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION,
        buyerMarkedPaidAt: new Date(),
      },
      {
        paymentIndex: 2,
        amountRub: 400,
        dueAt: new Date(dueAt.getTime() + 30 * 24 * 60 * 60 * 1000),
        status: INSTALLMENT_PAYMENT_STATUS_SCHEDULED,
      },
      {
        paymentIndex: 3,
        amountRub: 400,
        dueAt: new Date(dueAt.getTime() + 60 * 24 * 60 * 60 * 1000),
        status: INSTALLMENT_PAYMENT_STATUS_SCHEDULED,
      },
    ],
    finalDueAt: new Date(dueAt.getTime() + 60 * 24 * 60 * 60 * 1000),
    nextPaymentDueAt: dueAt,
  });

  await OrderModel.findByIdAndUpdate(ctx.order._id, {
    status: ORDER_STATUS_SHIPPED,
    installmentContractId: contract._id,
    "items.0.status": ORDER_STATUS_SHIPPED,
  });

  return contract;
}

test("confirmInstallmentPayment: concurrent confirms do not double paidAmountRub", async () => {
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
  const contract = await createPendingPaymentContract({
    seller,
    buyer,
    product,
    order,
  });

  const [first, second] = await Promise.allSettled([
    confirmInstallmentPayment({
      userId: String(seller._id),
      contractId: String(contract._id),
      paymentIndex: 1,
      idempotencyKey: "race-a",
    }),
    confirmInstallmentPayment({
      userId: String(seller._id),
      contractId: String(contract._id),
      paymentIndex: 1,
      idempotencyKey: "race-b",
    }),
  ]);

  const fulfilled = [first, second].filter((row) => row.status === "fulfilled");
  assert.equal(fulfilled.length >= 1, true);

  const after = await InstallmentContractModel.findById(contract._id).lean();
  assert.equal(after.payments[0].status, INSTALLMENT_PAYMENT_STATUS_PAID);
  assert.equal(after.paidAmountRub, 400);
});

test("confirmInstallmentPayment: same idempotencyKey is duplicate-safe", async () => {
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
  const contract = await createPendingPaymentContract({
    seller,
    buyer,
    product,
    order,
  });

  const key = "confirm-retry-1";
  const first = await confirmInstallmentPayment({
    userId: String(seller._id),
    contractId: String(contract._id),
    paymentIndex: 1,
    idempotencyKey: key,
  });
  assert.equal(first.message, "Платёж подтверждён");
  assert.notEqual(first.duplicate, true);

  const second = await confirmInstallmentPayment({
    userId: String(seller._id),
    contractId: String(contract._id),
    paymentIndex: 1,
    idempotencyKey: key,
  });
  assert.equal(second.duplicate, true);
  assert.equal(second.message, "Платёж подтверждён");

  const after = await InstallmentContractModel.findById(contract._id).lean();
  assert.equal(after.paidAmountRub, 400);

  const logs = await InstallmentOperationLogModel.find({
    contractId: contract._id,
  }).lean();
  assert.equal(logs.length, 1);
  assert.equal(logs[0].action, "confirm_payment");
  assert.equal(String(logs[0].actorUserId), String(seller._id));
});

test("markInstallmentPaymentPaid: writes audit log with key", async () => {
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
  const dueAt = new Date();
  const contract = await InstallmentContractModel.create({
    productId: product._id,
    programId,
    planId,
    buyerUserId: buyer._id,
    sellerUserId: seller._id,
    orderId: order._id,
    quantity: 1,
    planTitle: "2 мес",
    monthsCount: 2,
    monthlyPaymentRub: 500,
    totalAmountRub: 1000,
    paidAmountRub: 0,
    productNameAtContract: product.productName,
    productUnitPriceAtContract: 1000,
    status: INSTALLMENT_CONTRACT_STATUS_ACTIVE,
    payments: [
      {
        paymentIndex: 1,
        amountRub: 500,
        dueAt,
        status: INSTALLMENT_PAYMENT_STATUS_SCHEDULED,
      },
      {
        paymentIndex: 2,
        amountRub: 500,
        dueAt: new Date(dueAt.getTime() + 30 * 24 * 60 * 60 * 1000),
        status: INSTALLMENT_PAYMENT_STATUS_SCHEDULED,
      },
    ],
    finalDueAt: new Date(dueAt.getTime() + 30 * 24 * 60 * 60 * 1000),
    nextPaymentDueAt: dueAt,
  });

  await OrderModel.findByIdAndUpdate(order._id, {
    status: ORDER_STATUS_SHIPPED,
    installmentContractId: contract._id,
    "items.0.status": ORDER_STATUS_SHIPPED,
  });

  await markInstallmentPaymentPaid({
    userId: String(buyer._id),
    contractId: String(contract._id),
    paymentIndex: 1,
    idempotencyKey: "mark-paid-1",
  });

  const after = await InstallmentContractModel.findById(contract._id).lean();
  assert.equal(after.payments[0].status, INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION);

  const logs = await InstallmentOperationLogModel.find({
    contractId: contract._id,
    action: "mark_payment_paid",
  }).lean();
  assert.equal(logs.length, 1);
});
