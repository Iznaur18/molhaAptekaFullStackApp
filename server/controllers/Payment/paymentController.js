import { createLoyaltyPointsTopUp } from "../../services/payments/loyaltyPointsTopUp.js";
import {
  createOrderPrepayment,
  isOrderPrepaymentAvailable,
} from "../../services/payments/orderPrepayment.js";
import {
  handleYookassaNotification,
  syncPaymentForUser,
} from "../../services/payments/yookassaWebhook.js";
import { resolvePlatformSellerUserIds } from "../../constants/yookassaConstants.js";
import { isYookassaConfigured } from "../../services/payments/yookassaClient.js";
import { successRes } from "../../services/http/index.js";
import { logServerEvent } from "../../utils/logServerEvent.js";

/** `GET /payments/config` — доступна ли оплата картой вообще. */
export const getPaymentConfigController = async (_req, res) => {
  return successRes(res, {
    cardPaymentEnabled: isYookassaConfigured(),
    // Id продавцов, за чей товар площадка принимает предоплату. Публичные
    // идентификаторы: по ним чекаут решает, показывать ли «картой заранее».
    cardPrepaidSellerIds: isOrderPrepaymentAvailable()
      ? resolvePlatformSellerUserIds()
      : [],
  });
};

/** `POST /payments/order/:orderId` — предоплата заказа картой. */
export const createOrderPaymentController = async (req, res) => {
  const result = await createOrderPrepayment({
    userId: String(req.userId),
    orderId: req.params.orderId,
    returnUrl: req.body.returnUrl,
    idempotencyKey: req.body.idempotencyKey,
  });
  return successRes(res, { payment: result });
};

/** `POST /payments/loyalty-points` — создать платёж на пополнение баллов. */
export const createLoyaltyPointsPaymentController = async (req, res) => {
  const result = await createLoyaltyPointsTopUp({
    userId: String(req.userId),
    amountRub: req.body.amountRub,
    returnUrl: req.body.returnUrl,
    idempotencyKey: req.body.idempotencyKey,
  });
  return successRes(res, { payment: result });
};

/** `GET /payments/:paymentId` — статус своего платежа после возврата с оплаты. */
export const getMyPaymentController = async (req, res) => {
  const payment = await syncPaymentForUser({
    userId: String(req.userId),
    paymentId: req.params.paymentId,
  });
  if (!payment) {
    return successRes(res, { payment: null });
  }
  return successRes(res, { payment });
};

/**
 * `POST /payments/yookassa/webhook` — уведомление от ЮKassa.
 *
 * Отвечаем 200 всегда и при любом исходе: на другой код ЮKassa повторяет
 * уведомление сутками, а наши внутренние сбои повторами не лечатся — их
 * добирает синхронизация при возврате пользователя.
 */
export const postYookassaWebhookController = async (req, res) => {
  try {
    const result = await handleYookassaNotification(req.body);
    logServerEvent("info", {
      event: "yookassa.webhook_handled",
      handled: result.handled === true,
      reason: result.reason ?? "",
    });
  } catch (error) {
    logServerEvent("error", {
      event: "yookassa.webhook_failed",
      message: error instanceof Error ? error.message : String(error),
    });
  }
  return res.status(200).json({ success: true });
};
