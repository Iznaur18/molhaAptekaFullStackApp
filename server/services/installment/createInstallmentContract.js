import {
  INSTALLMENT_CONTRACT_STATUS_ACTIVE,
  INSTALLMENT_CONTRACT_STATUS_PENDING_FIRST_PAYMENT,
  INSTALLMENT_MODERATION_APPROVED,
  INSTALLMENT_PROGRAM_NOT_AVAILABLE_MESSAGE,
} from "../../constants/installmentConstants.js";
import { ORDER_STATUS_PENDING } from "../../constants/orderConstants.js";
import { PRODUCT_MODERATION_APPROVED } from "../../constants/productModerationConstants.js";
import { AppError } from "../../errors/AppError.js";
import {
  InstallmentContractModel,
  OrderModel,
  ProductInstallmentProgramModel,
  ProductModel,
} from "../../models/index.js";
import { assertUserCanBuyInstallment } from "./installmentAccess.js";
import { checkUserEmailVerified } from "../auth/assertEmailVerified.js";
import {
  buildInstallmentPaymentSchedule,
  notifySellerNewInstallmentContract,
} from "./installmentHelpers.js";
import {
  buildOrderLineLoyaltySnapshot,
  reserveLoyaltyPointsForNewOrder,
} from "../order/orderLoyaltyPoints.js";
import { runInTransaction, withMongoSession } from "../../utils/mongoTransaction.js";
import { assertOrderItemsWithinAvailableStock } from "../product/productStock.js";

import {
  ORDER_BUYER_PUBLIC_FIELDS,
  ORDER_ITEMS_POPULATE,
} from "../order/orderQueries.js";
import { buildInstallmentContractPayload } from "./installmentHelpers.js";

import { appendOrderToUserBuyList } from "./installmentContractHelpers.js";

/**
 * @param {{
 *   buyerUserId: string;
 *   productId: string;
 *   planId: string;
 *   quantity: number;
 *   paymentMethod: string;
 *   verifiedDeliveryAddress: {
 *     displayAddress: string;
 *     flat?: string;
 *     fiasId?: string;
 *   };
 * }} input
 */
export async function createInstallmentContract({
  buyerUserId,
  productId,
  planId,
  quantity,
  paymentMethod,
  verifiedDeliveryAddress,
}) {
  try {
    await assertUserCanBuyInstallment(buyerUserId);
  } catch (error) {
    throw new AppError(403, error instanceof Error ? error.message : "Нет прав");
  }

  const emailCheck = await checkUserEmailVerified(buyerUserId);
  if (!emailCheck.ok) {
    throw new AppError(403, emailCheck.message);
  }

  const program = await ProductInstallmentProgramModel.findOne({
    productId,
    isEnabled: true,
    moderationStatus: INSTALLMENT_MODERATION_APPROVED,
  });
  if (!program || program.plans.length === 0) {
    throw new AppError(404, INSTALLMENT_PROGRAM_NOT_AVAILABLE_MESSAGE);
  }

  const plan = program.plans.id(planId);
  if (!plan) {
    throw new AppError(404, "План рассрочки не найден");
  }

  const product = await ProductModel.findOne({
    _id: productId,
    productModerationStatus: PRODUCT_MODERATION_APPROVED,
    productIsAvailable: { $ne: false },
    productStockQuantity: { $gt: 0 },
  }).lean();

  if (!product) {
    throw new AppError(404, "Товар недоступен");
  }
  if (String(product.productSeller) === String(buyerUserId)) {
    throw new AppError(400, "Нельзя купить свой товар");
  }

  const items = [{ productId, quantity }];
  try {
    await assertOrderItemsWithinAvailableStock(items, buyerUserId);
  } catch (error) {
    throw new AppError(400, error instanceof Error ? error.message : "Недостаточно товара");
  }

  const firstPaymentRequiredNow = plan.firstPaymentRequiredNow !== false;
  const schedule = buildInstallmentPaymentSchedule({
    plan: {
      title: plan.title,
      monthsCount: plan.monthsCount,
      monthlyAmountRub: plan.monthlyAmountRub,
      firstPaymentRequiredNow,
    },
    quantity,
  });

  const startsActive = !firstPaymentRequiredNow;
  const loyaltyLine = buildOrderLineLoyaltySnapshot({
    loyaltyPointsPerUnit: product.loyaltyPointsPerUnit,
    quantity,
  });
  const orderItems = [
    {
      productId,
      quantity,
      unitPriceAtOrder: product.productPrice,
      productNameAtOrder: product.productName,
      ...loyaltyLine,
    },
  ];
  const itemsForReserve = [
    {
      ...orderItems[0],
      productId: { productSeller: product.productSeller },
    },
  ];

  let contract;
  let order;

  try {
    ({ contract, order } = await runInTransaction(async (session) => {
      await reserveLoyaltyPointsForNewOrder(itemsForReserve, session);

      const [createdContract] = await InstallmentContractModel.create(
        [
          {
            productId,
            programId: program._id,
            planId: plan._id,
            buyerUserId,
            sellerUserId: product.productSeller,
            quantity,
            planTitle: plan.title,
            monthsCount: plan.monthsCount,
            monthlyPaymentRub: schedule.monthlyPaymentRub,
            totalAmountRub: schedule.totalAmountRub,
            paidAmountRub: 0,
            productNameAtContract: product.productName,
            productUnitPriceAtContract: product.productPrice,
            status: startsActive
              ? INSTALLMENT_CONTRACT_STATUS_ACTIVE
              : INSTALLMENT_CONTRACT_STATUS_PENDING_FIRST_PAYMENT,
            payments: schedule.payments,
            finalDueAt: schedule.finalDueAt,
            nextPaymentDueAt: schedule.nextPaymentDueAt,
          },
        ],
        withMongoSession({}, session),
      );

      const [createdOrder] = await OrderModel.create(
        [
          {
            userBuyerId: buyerUserId,
            items: orderItems,
            totalAmount: product.productPrice * quantity,
            deliveryAddress: verifiedDeliveryAddress.displayAddress,
            deliveryAddressFlat: verifiedDeliveryAddress.flat,
            deliveryAddressFiasId: verifiedDeliveryAddress.fiasId,
            paymentMethod,
            status: ORDER_STATUS_PENDING,
            installmentContractId: createdContract._id,
          },
        ],
        withMongoSession({}, session),
      );

      createdContract.orderId = createdOrder._id;
      await createdContract.save({ session });

      const isUserUpdated = await appendOrderToUserBuyList(
        buyerUserId,
        createdOrder._id,
        session,
      );
      if (!isUserUpdated) {
        throw new AppError(404, "Пользователь не найден");
      }

      return { contract: createdContract, order: createdOrder };
    }));
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    const message =
      error instanceof Error ? error.message : "Недостаточно баллов у продавца";
    throw new AppError(400, message);
  }

  await notifySellerNewInstallmentContract(
    String(product.productSeller),
    productId,
    product.productName,
  );

  await order.populate("userBuyerId", ORDER_BUYER_PUBLIC_FIELDS);
  await order.populate(ORDER_ITEMS_POPULATE);

  return {
    message: "Рассрочка оформлена",
    contract: await buildInstallmentContractPayload(contract),
    order,
  };
}
