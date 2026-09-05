import {
  PLATFORM_COMMISSION_PERCENT_DEFAULT,
  splitOrderAmountForPlatform,
} from "@molha/api-contract";

import {
  ESCROW_AUTO_RELEASE_MS,
  ESCROW_RELEASE_REASON_BUYER,
  ESCROW_RELEASE_REASON_TIMEOUT,
  ESCROW_STATE_HELD,
  ESCROW_STATE_RELEASABLE,
} from "../../constants/escrowConstants.js";
import { EscrowLedgerEntryModel } from "../../models/index.js";
import { logMoneyEvent } from "../loyalty/logMoneyEvent.js";

/**
 * Деньги отправления, разложенные по получателям.
 *
 * Товары считаем по позициям заказа, а не по `totalAmount`: в смешанном заказе
 * общая сумма к одному продавцу отношения не имеет.
 *
 * @param {Record<string, any>} order
 * @param {string} sellerId
 */
export function buildEscrowAmountsForShipment(order, sellerId) {
  const items = Array.isArray(order?.items) ? order.items : [];
  let goodsRub = 0;

  for (const item of items) {
    if (String(item?.sellerIdAtOrder ?? "") !== String(sellerId)) {
      continue;
    }
    const unitPrice = Number(item.unitPriceAtOrder) || 0;
    const quantity = Math.max(0, Math.floor(Number(item.quantity) || 0));
    // Бесплатные единицы «N+1» покупатель не оплачивал — в эскроу их нет.
    const freeUnits = Math.max(0, Math.floor(Number(item.buyNFreeUnitsAtOrder) || 0));
    goodsRub += unitPrice * Math.max(0, quantity - freeUnits);
  }

  const shipment = (Array.isArray(order?.shipments) ? order.shipments : []).find(
    (row) => String(row?.sellerId ?? "") === String(sellerId),
  );
  // Курьерская `deliveryFeeRub` сюда не идёт: те деньги покупатель отдаёт
  // курьеру из рук в руки, площадка их не проводит и держать не может.
  const deliveryRub = Number(shipment?.sellerDeliveryFeeRub) || 0;
  const commissionPercent =
    shipment?.platformCommissionPercentAtOrder ?? PLATFORM_COMMISSION_PERCENT_DEFAULT;

  return splitOrderAmountForPlatform({ goodsRub, deliveryRub, commissionPercent });
}

/**
 * Открыть эскроу по оплаченному заказу — по записи на продавца.
 *
 * Вызывается там, где деньги реально пришли (подтверждение платежа), а не при
 * создании заказа: до оплаты держать нечего.
 *
 * Идемпотентно за счёт уникального индекса `orderId + sellerId`: повторный
 * вебхук от провайдера не создаст вторую запись на те же деньги.
 *
 * @param {{ order: Record<string, any>; paymentId?: unknown }} input
 */
export async function openEscrowForPaidOrder({ order, paymentId = null }) {
  const sellerIds = [
    ...new Set(
      (Array.isArray(order?.items) ? order.items : [])
        .map((item) => String(item?.sellerIdAtOrder ?? ""))
        .filter(Boolean),
    ),
  ];

  /** @type {Array<Record<string, any>>} */
  const opened = [];

  for (const sellerId of sellerIds) {
    const amounts = buildEscrowAmountsForShipment(order, sellerId);
    if (amounts.totalRub <= 0) {
      continue;
    }

    // upsert, а не create: повтор вебхука не должен ронять обработку платежа
    // ошибкой дубликата ключа.
    const entry = await EscrowLedgerEntryModel.findOneAndUpdate(
      { orderId: order._id, sellerId },
      {
        $setOnInsert: {
          orderId: order._id,
          sellerId,
          buyerId: order.userBuyerId,
          paymentId,
          state: ESCROW_STATE_HELD,
          totalRub: amounts.totalRub,
          goodsRub: amounts.goodsRub,
          deliveryRub: amounts.deliveryRub,
          commissionPercent: amounts.commissionPercent,
          commissionRub: amounts.commissionRub,
          sellerRub: amounts.sellerRub,
          heldAt: new Date(),
        },
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    ).lean();

    opened.push(entry);
    logMoneyEvent("info", "escrow_held", {
      orderId: String(order._id),
      sellerId,
      amount: amounts.totalRub,
      commission: amounts.commissionRub,
      sellerAmount: amounts.sellerRub,
      currency: "RUB",
    });
  }

  return opened;
}

/**
 * Товар вручён — запускаем обратный отсчёт до автоматической выплаты.
 *
 * Срок ставится от вручения, а не от оплаты: пока товар не доехал, продавцу
 * платить не за что, и «неделя» не должна тикать.
 *
 * Срок не сдвигается, если уже стоял: иначе продавец, дважды нажавший
 * «вручено», каждый раз отодвигал бы себе выплату.
 *
 * @param {{ orderId: unknown; sellerId: unknown; deliveredAt?: Date }} input
 */
export async function scheduleEscrowAutoRelease({
  orderId,
  sellerId,
  deliveredAt = new Date(),
}) {
  const releaseDueAt = new Date(deliveredAt.getTime() + ESCROW_AUTO_RELEASE_MS);

  const updated = await EscrowLedgerEntryModel.findOneAndUpdate(
    {
      orderId,
      sellerId,
      state: ESCROW_STATE_HELD,
      releaseDueAt: null,
    },
    { $set: { releaseDueAt } },
    { returnDocument: "after" },
  ).lean();

  if (updated) {
    logMoneyEvent("info", "escrow_release_scheduled", {
      orderId: String(orderId),
      sellerId: String(sellerId),
      releaseDueAt: releaseDueAt.toISOString(),
    });
  }

  return updated;
}

/**
 * Разморозить деньги: покупатель подтвердил или вышел срок.
 *
 * Фильтр по `state: held` — это и есть защита от гонки: подтверждение
 * покупателя и срабатывание таймера могут прийти одновременно, и второй
 * просто не найдёт записи.
 *
 * @param {{ orderId: unknown; sellerId: unknown; reason?: string }} input
 */
export async function markEscrowReleasable({
  orderId,
  sellerId,
  reason = ESCROW_RELEASE_REASON_BUYER,
}) {
  const releasableAt = new Date();
  const updated = await EscrowLedgerEntryModel.findOneAndUpdate(
    { orderId, sellerId, state: ESCROW_STATE_HELD },
    {
      $set: {
        state: ESCROW_STATE_RELEASABLE,
        releasableAt,
        releaseReason: reason,
      },
    },
    { returnDocument: "after" },
  ).lean();

  if (!updated) {
    return null;
  }

  logMoneyEvent("info", "escrow_released", {
    orderId: String(orderId),
    sellerId: String(sellerId),
    reason,
    sellerAmount: updated.sellerRub,
    commission: updated.commissionRub,
    currency: "RUB",
  });

  return updated;
}

/**
 * Записи, которым пора уходить продавцу по сроку.
 *
 * @param {{ now?: Date; limit?: number }} [options]
 */
export function findEscrowEntriesDueForRelease({ now = new Date(), limit = 200 } = {}) {
  return EscrowLedgerEntryModel.find({
    state: ESCROW_STATE_HELD,
    releaseDueAt: { $ne: null, $lte: now },
  })
    .select("orderId sellerId")
    .limit(limit)
    .lean();
}

export { ESCROW_RELEASE_REASON_TIMEOUT };
