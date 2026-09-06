import {
  PLATFORM_COMMISSION_PERCENT_DEFAULT,
  splitOrderAmountForPlatform,
} from "@molha/api-contract";

import {
  ESCROW_AUTO_RELEASE_MS,
  ESCROW_LINE_KIND_DELIVERY,
  ESCROW_LINE_KIND_GOODS,
  ESCROW_REFUND_REASON_ITEM_CANCELLED,
  ESCROW_REFUND_REASON_ITEM_RETURNED,
  ESCROW_REFUND_REASON_SHIPMENT_UNDELIVERED,
  ESCROW_RELEASE_REASON_BUYER,
  ESCROW_RELEASE_REASON_SHIPMENT_DELIVERED,
  ESCROW_RELEASE_REASON_TIMEOUT,
  ESCROW_STATE_HELD,
  ESCROW_STATE_OPENNESS_ORDER,
  ESCROW_STATE_PAID_OUT,
  ESCROW_STATE_REFUNDABLE,
  ESCROW_STATE_REFUNDED,
  ESCROW_STATE_RELEASABLE,
} from "../../constants/escrowConstants.js";
import {
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_RETURNED,
} from "../../constants/orderConstants.js";
import { EscrowLedgerEntryModel } from "../../models/index.js";
import { logMoneyEvent } from "../loyalty/logMoneyEvent.js";

/** Позиции, по которым деньги пришли, но сделка уже не состоится. */
const REFUND_REASON_BY_ITEM_STATUS = Object.freeze({
  [ORDER_STATUS_CANCELLED]: ESCROW_REFUND_REASON_ITEM_CANCELLED,
  [ORDER_STATUS_RETURNED]: ESCROW_REFUND_REASON_ITEM_RETURNED,
});

/** @param {unknown} value */
const toIndex = (value) => {
  const index = Math.floor(Number(value));
  return Number.isFinite(index) && index >= 0 ? index : null;
};

/**
 * Сколько покупатель заплатил за позицию.
 *
 * Бесплатные единицы по акции «N+1» он не оплачивал — в эскроу их нет.
 *
 * @param {Record<string, any>} item
 */
function paidGoodsRubForItem(item) {
  const unitPrice = Number(item?.unitPriceAtOrder) || 0;
  const quantity = Math.max(0, Math.floor(Number(item?.quantity) || 0));
  const freeUnits = Math.max(0, Math.floor(Number(item?.buyNFreeUnitsAtOrder) || 0));
  return unitPrice * Math.max(0, quantity - freeUnits);
}

/**
 * Деньги отправления, разложенные по строкам.
 *
 * Строка на позицию плюс одна на доставку. Комиссия считается по каждой
 * позиции отдельно, а не с общей суммы: возвращать деньги придётся тоже по
 * позициям, и доля площадки в возврате должна быть той же, что при
 * начислении. Округление вниз на каждой строке работает в пользу продавца —
 * как и задумано в `splitOrderAmountForPlatform`.
 *
 * @param {Record<string, any>} order
 * @param {string} sellerId
 */
export function buildEscrowLinesForShipment(order, sellerId) {
  const items = Array.isArray(order?.items) ? order.items : [];
  const shipment = (Array.isArray(order?.shipments) ? order.shipments : []).find(
    (row) => String(row?.sellerId ?? "") === String(sellerId),
  );
  const commissionPercent =
    shipment?.platformCommissionPercentAtOrder ?? PLATFORM_COMMISSION_PERCENT_DEFAULT;

  /** @type {Array<Record<string, any>>} */
  const lines = [];

  items.forEach((item, itemIndex) => {
    if (String(item?.sellerIdAtOrder ?? "") !== String(sellerId)) {
      return;
    }
    const goodsRub = paidGoodsRubForItem(item);
    if (goodsRub <= 0) {
      return;
    }
    const split = splitOrderAmountForPlatform({ goodsRub, commissionPercent });
    // Позиция могла отмениться между подтверждением заказа и оплатой: деньги
    // за неё покупатель всё равно внёс, значит это сразу долг перед ним, а не
    // повод выкинуть строку и потерять сумму.
    const refundReason = REFUND_REASON_BY_ITEM_STATUS[String(item?.status ?? "")] ?? null;

    lines.push({
      kind: ESCROW_LINE_KIND_GOODS,
      itemIndex,
      state: refundReason ? ESCROW_STATE_REFUNDABLE : ESCROW_STATE_HELD,
      totalRub: split.totalRub,
      commissionRub: split.commissionRub,
      sellerRub: split.sellerRub,
      refundableAt: refundReason ? new Date() : null,
      refundReason,
    });
  });

  // Курьерская `deliveryFeeRub` сюда не идёт: те деньги покупатель отдаёт
  // курьеру из рук в руки, площадка их не проводит и держать не может.
  const deliveryRub = Math.max(
    0,
    Math.round(Number(shipment?.sellerDeliveryFeeRub) || 0),
  );
  if (deliveryRub > 0) {
    lines.push({
      kind: ESCROW_LINE_KIND_DELIVERY,
      itemIndex: null,
      state: ESCROW_STATE_HELD,
      totalRub: deliveryRub,
      commissionRub: 0,
      sellerRub: deliveryRub,
      refundableAt: null,
      refundReason: null,
    });
  }

  return { lines, commissionPercent, deliveryRub };
}

/**
 * Итоги отправления — суммы строк.
 *
 * Отдельной формулы у итогов нет намеренно: разойтись со строками они не
 * должны, а два независимых способа посчитать одни и те же деньги — это ровно
 * тот случай, когда они однажды разойдутся.
 *
 * @param {Record<string, any>} order
 * @param {string} sellerId
 */
export function buildEscrowAmountsForShipment(order, sellerId) {
  const { lines, commissionPercent, deliveryRub } = buildEscrowLinesForShipment(
    order,
    sellerId,
  );

  const goodsRub = lines
    .filter((line) => line.kind === ESCROW_LINE_KIND_GOODS)
    .reduce((sum, line) => sum + line.totalRub, 0);

  return {
    lines,
    totalRub: lines.reduce((sum, line) => sum + line.totalRub, 0),
    goodsRub,
    deliveryRub,
    commissionPercent,
    commissionRub: lines.reduce((sum, line) => sum + line.commissionRub, 0),
    sellerRub: lines.reduce((sum, line) => sum + line.sellerRub, 0),
  };
}

/**
 * Сводное состояние записи — самое незакрытое среди строк.
 *
 * @param {Array<{ state: string }>} lines
 */
export function summarizeEscrowState(lines) {
  const states = new Set((Array.isArray(lines) ? lines : []).map((line) => line.state));
  return (
    ESCROW_STATE_OPENNESS_ORDER.find((state) => states.has(state)) ?? ESCROW_STATE_HELD
  );
}

/**
 * Пересчитать сводку по строкам.
 *
 * Отдельным обновлением после каждой правки строк: сводка производная, и
 * запоздать она может максимум до следующего перехода.
 *
 * @param {Record<string, any> | null} entry
 */
async function syncEntryState(entry) {
  if (!entry) {
    return null;
  }
  const state = summarizeEscrowState(entry.lines);
  if (state === entry.state) {
    return entry;
  }
  await EscrowLedgerEntryModel.updateOne({ _id: entry._id }, { $set: { state } });
  return { ...entry, state };
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
          state: summarizeEscrowState(amounts.lines),
          lines: amounts.lines,
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
      lines: amounts.lines.length,
      currency: "RUB",
    });
  }

  return opened;
}

/**
 * Товар вручён — запускаем обратный отсчёт по этой позиции.
 *
 * Срок ставится от вручения, а не от оплаты: пока товар не доехал, продавцу
 * платить не за что, и «неделя» не должна тикать.
 *
 * Срок не сдвигается, если уже стоял: иначе продавец, дважды нажавший
 * «вручено», каждый раз отодвигал бы себе выплату. По той же причине первое
 * вручение в отправлении заводит часы и для доставки — второй раз продавец
 * никуда не ездил.
 *
 * @param {{
 *   orderId: unknown;
 *   sellerId: unknown;
 *   itemIndex: unknown;
 *   deliveredAt?: Date;
 * }} input
 */
export async function scheduleEscrowAutoRelease({
  orderId,
  sellerId,
  itemIndex,
  deliveredAt = new Date(),
}) {
  const index = toIndex(itemIndex);
  if (index === null) {
    return null;
  }
  const releaseDueAt = new Date(deliveredAt.getTime() + ESCROW_AUTO_RELEASE_MS);

  const updated = await EscrowLedgerEntryModel.findOneAndUpdate(
    {
      orderId,
      sellerId,
      lines: {
        $elemMatch: {
          kind: ESCROW_LINE_KIND_GOODS,
          itemIndex: index,
          state: ESCROW_STATE_HELD,
          releaseDueAt: null,
        },
      },
    },
    { $set: { "lines.$[line].releaseDueAt": releaseDueAt } },
    {
      arrayFilters: [
        {
          "line.kind": ESCROW_LINE_KIND_GOODS,
          "line.itemIndex": index,
          "line.state": ESCROW_STATE_HELD,
          "line.releaseDueAt": null,
        },
      ],
      returnDocument: "after",
    },
  ).lean();

  if (!updated) {
    return null;
  }

  // Доставка ждёт того же срока: везли один раз, и её судьба решается вместе
  // с первой доехавшей позицией.
  await EscrowLedgerEntryModel.updateOne(
    { _id: updated._id },
    { $set: { "lines.$[line].releaseDueAt": releaseDueAt } },
    {
      arrayFilters: [
        {
          "line.kind": ESCROW_LINE_KIND_DELIVERY,
          "line.state": ESCROW_STATE_HELD,
          "line.releaseDueAt": null,
        },
      ],
    },
  );

  logMoneyEvent("info", "escrow_release_scheduled", {
    orderId: String(orderId),
    sellerId: String(sellerId),
    itemIndex: index,
    releaseDueAt: releaseDueAt.toISOString(),
  });

  return updated;
}

/**
 * Разморозить деньги за позицию: покупатель подтвердил или вышел срок.
 *
 * Размораживается ровно одна строка. Раньше переводилась вся запись, и
 * подтверждение одной позиции отдавало продавцу деньги за те, что ещё едут
 * или даже не отгружены.
 *
 * Фильтр по `state: held` — это и есть защита от гонки: подтверждение
 * покупателя и срабатывание таймера могут прийти одновременно, и второй
 * просто не найдёт строку.
 *
 * @param {{
 *   orderId: unknown;
 *   sellerId: unknown;
 *   itemIndex: unknown;
 *   reason?: string;
 * }} input
 */
export async function markEscrowLineReleasable({
  orderId,
  sellerId,
  itemIndex,
  reason = ESCROW_RELEASE_REASON_BUYER,
}) {
  const index = toIndex(itemIndex);
  if (index === null) {
    return null;
  }
  const releasableAt = new Date();

  const updated = await EscrowLedgerEntryModel.findOneAndUpdate(
    {
      orderId,
      sellerId,
      lines: {
        $elemMatch: {
          kind: ESCROW_LINE_KIND_GOODS,
          itemIndex: index,
          state: ESCROW_STATE_HELD,
        },
      },
    },
    {
      $set: {
        "lines.$[line].state": ESCROW_STATE_RELEASABLE,
        "lines.$[line].releasableAt": releasableAt,
        "lines.$[line].releaseReason": reason,
      },
    },
    {
      arrayFilters: [
        {
          "line.kind": ESCROW_LINE_KIND_GOODS,
          "line.itemIndex": index,
          "line.state": ESCROW_STATE_HELD,
        },
      ],
      returnDocument: "after",
    },
  ).lean();

  if (!updated) {
    return null;
  }

  const released = updated.lines.find(
    (line) => line.kind === ESCROW_LINE_KIND_GOODS && line.itemIndex === index,
  );

  logMoneyEvent("info", "escrow_released", {
    orderId: String(orderId),
    sellerId: String(sellerId),
    itemIndex: index,
    reason,
    sellerAmount: released?.sellerRub ?? 0,
    commission: released?.commissionRub ?? 0,
    currency: "RUB",
  });

  // Дошла хоть одна позиция — значит продавец выезжал, и доставка его.
  const withDelivery = await releaseDeliveryLineAfterFirstDelivery(updated);

  return syncEntryState(withDelivery);
}

/**
 * Деньги за позицию причитаются покупателю: отмена или возврат.
 *
 * Не `refunded`, а `refundable`: возврата у провайдера пока нет, и эта пометка
 * фиксирует долг. Без неё отменённая позиция уезжала бы продавцу вместе с
 * остальными — деньги за товар, которого он не отдал.
 *
 * @param {{
 *   orderId: unknown;
 *   sellerId: unknown;
 *   itemIndex: unknown;
 *   reason: string;
 * }} input
 */
export async function markEscrowLineRefundable({
  orderId,
  sellerId,
  itemIndex,
  reason,
}) {
  const index = toIndex(itemIndex);
  if (index === null) {
    return null;
  }
  const refundableAt = new Date();

  const updated = await EscrowLedgerEntryModel.findOneAndUpdate(
    {
      orderId,
      sellerId,
      lines: {
        $elemMatch: {
          kind: ESCROW_LINE_KIND_GOODS,
          itemIndex: index,
          state: ESCROW_STATE_HELD,
        },
      },
    },
    {
      $set: {
        "lines.$[line].state": ESCROW_STATE_REFUNDABLE,
        "lines.$[line].refundableAt": refundableAt,
        "lines.$[line].refundReason": reason,
        // Отсчёт до автоматической выплаты снимаем: платить больше не за что.
        "lines.$[line].releaseDueAt": null,
      },
    },
    {
      arrayFilters: [
        {
          "line.kind": ESCROW_LINE_KIND_GOODS,
          "line.itemIndex": index,
          "line.state": ESCROW_STATE_HELD,
        },
      ],
      returnDocument: "after",
    },
  ).lean();

  if (!updated) {
    return null;
  }

  const refunded = updated.lines.find(
    (line) => line.kind === ESCROW_LINE_KIND_GOODS && line.itemIndex === index,
  );

  logMoneyEvent("info", "escrow_refundable", {
    orderId: String(orderId),
    sellerId: String(sellerId),
    itemIndex: index,
    reason,
    amount: refunded?.totalRub ?? 0,
    buyerAmount: refunded?.totalRub ?? 0,
    currency: "RUB",
  });

  const withDelivery = await refundDeliveryLineIfNothingDelivered(updated);

  return syncEntryState(withDelivery);
}

/**
 * Доставка уходит продавцу вместе с первой размороженной позицией.
 *
 * @param {Record<string, any>} entry
 */
async function releaseDeliveryLineAfterFirstDelivery(entry) {
  const delivery = entry.lines.find((line) => line.kind === ESCROW_LINE_KIND_DELIVERY);
  if (!delivery || delivery.state !== ESCROW_STATE_HELD) {
    return entry;
  }

  await EscrowLedgerEntryModel.updateOne(
    { _id: entry._id },
    {
      $set: {
        "lines.$[line].state": ESCROW_STATE_RELEASABLE,
        "lines.$[line].releasableAt": new Date(),
        "lines.$[line].releaseReason": ESCROW_RELEASE_REASON_SHIPMENT_DELIVERED,
      },
    },
    {
      arrayFilters: [
        { "line.kind": ESCROW_LINE_KIND_DELIVERY, "line.state": ESCROW_STATE_HELD },
      ],
    },
  );

  logMoneyEvent("info", "escrow_released", {
    orderId: String(entry.orderId),
    sellerId: String(entry.sellerId),
    reason: ESCROW_RELEASE_REASON_SHIPMENT_DELIVERED,
    sellerAmount: delivery.sellerRub,
    commission: 0,
    currency: "RUB",
  });

  return EscrowLedgerEntryModel.findById(entry._id).lean();
}

/**
 * Доставка возвращается покупателю, только если продавец никуда не ездил.
 *
 * Признак выезда — размороженная или уже выплаченная позиция: раньше вручения
 * разморозка невозможна. Пока хоть одна позиция висит в `held`, решать рано:
 * она ещё может доехать.
 *
 * @param {Record<string, any>} entry
 */
async function refundDeliveryLineIfNothingDelivered(entry) {
  const delivery = entry.lines.find((line) => line.kind === ESCROW_LINE_KIND_DELIVERY);
  if (!delivery || delivery.state !== ESCROW_STATE_HELD) {
    return entry;
  }

  const goods = entry.lines.filter((line) => line.kind === ESCROW_LINE_KIND_GOODS);
  const sellerEarnedSomething = goods.some(
    (line) =>
      line.state === ESCROW_STATE_RELEASABLE || line.state === ESCROW_STATE_PAID_OUT,
  );
  const allSettledAgainstBuyer = goods.every(
    (line) =>
      line.state === ESCROW_STATE_REFUNDABLE || line.state === ESCROW_STATE_REFUNDED,
  );
  if (sellerEarnedSomething || !allSettledAgainstBuyer) {
    return entry;
  }

  await EscrowLedgerEntryModel.updateOne(
    { _id: entry._id },
    {
      $set: {
        "lines.$[line].state": ESCROW_STATE_REFUNDABLE,
        "lines.$[line].refundableAt": new Date(),
        "lines.$[line].refundReason": ESCROW_REFUND_REASON_SHIPMENT_UNDELIVERED,
        "lines.$[line].releaseDueAt": null,
      },
    },
    {
      arrayFilters: [
        { "line.kind": ESCROW_LINE_KIND_DELIVERY, "line.state": ESCROW_STATE_HELD },
      ],
    },
  );

  logMoneyEvent("info", "escrow_refundable", {
    orderId: String(entry.orderId),
    sellerId: String(entry.sellerId),
    reason: ESCROW_REFUND_REASON_SHIPMENT_UNDELIVERED,
    amount: delivery.totalRub,
    buyerAmount: delivery.totalRub,
    currency: "RUB",
  });

  return EscrowLedgerEntryModel.findById(entry._id).lean();
}

/**
 * Строки, которым пора уходить продавцу по сроку.
 *
 * @param {{ now?: Date; limit?: number }} [options]
 */
export async function findEscrowLinesDueForRelease({
  now = new Date(),
  limit = 200,
} = {}) {
  const entries = await EscrowLedgerEntryModel.find({
    lines: {
      $elemMatch: {
        kind: ESCROW_LINE_KIND_GOODS,
        state: ESCROW_STATE_HELD,
        releaseDueAt: { $ne: null, $lte: now },
      },
    },
  })
    .select("orderId sellerId lines")
    .limit(limit)
    .lean();

  /** @type {Array<{ orderId: unknown; sellerId: unknown; itemIndex: number }>} */
  const due = [];
  for (const entry of entries) {
    for (const line of entry.lines) {
      if (
        line.kind !== ESCROW_LINE_KIND_GOODS ||
        line.state !== ESCROW_STATE_HELD ||
        !line.releaseDueAt ||
        line.releaseDueAt > now
      ) {
        continue;
      }
      due.push({
        orderId: entry.orderId,
        sellerId: entry.sellerId,
        itemIndex: line.itemIndex,
      });
      if (due.length >= limit) {
        return due;
      }
    }
  }

  return due;
}

export {
  ESCROW_REFUND_REASON_ITEM_CANCELLED,
  ESCROW_REFUND_REASON_ITEM_RETURNED,
  ESCROW_RELEASE_REASON_TIMEOUT,
};
