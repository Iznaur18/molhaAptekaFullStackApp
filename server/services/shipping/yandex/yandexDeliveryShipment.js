import {
  YANDEX_DELIVERY_DISABLED_MESSAGE,
  YANDEX_DELIVERY_NO_DROPOFF_MESSAGE,
  YANDEX_DELIVERY_NOT_CONNECTED_MESSAGE,
  YANDEX_DELIVERY_POINT_GONE_MESSAGE,
} from "@molha/api-contract";

import { AppError } from "../../../errors/AppError.js";
import { ProductModel } from "../../../models/index.js";

import { quoteYandexToPickupPoint } from "./yandexDeliveryPricing.js";
import {
  detectYandexGeoId,
  findYandexPoint,
  listYandexPoints,
  YANDEX_PAYMENT_CARD_ON_RECEIPT,
} from "./yandexDeliveryPoints.js";
import { resolveSellerYandexDeliveryCredentials } from "./yandexDeliverySellerCredentials.js";

/**
 * Яндекс Доставка в оформлении заказа: пункты выдачи, расчёт и снимок выбора.
 *
 * Как у СДЭК, одно отправление — один продавец: доставка идёт по его договору
 * с Яндексом, его токеном и из его пункта сдачи.
 */

const PRODUCT_SHIPPING_FIELDS =
  "productSeller productPrice productWeightG productLengthCm productWidthCm productHeightCm";

/**
 * @param {Array<{ productId: string; quantity: number }>} items
 */
async function loadSingleSellerLines(items) {
  const ids = items.map((item) => item.productId);
  const products = await ProductModel.find({ _id: { $in: ids } })
    .select(PRODUCT_SHIPPING_FIELDS)
    .lean();
  if (products.length === 0) {
    throw new AppError(404, "Товары не найдены");
  }
  const sellerIds = new Set(products.map((product) => String(product.productSeller)));
  if (sellerIds.size > 1) {
    throw new AppError(
      400,
      "Яндекс Доставка считается по одному продавцу: оформите товары разных продавцов отдельно",
    );
  }
  const byId = new Map(products.map((product) => [String(product._id), product]));
  const lines = items
    .filter((item) => byId.has(String(item.productId)))
    .map((item) => {
      const product = byId.get(String(item.productId));
      return {
        product,
        quantity: Math.max(1, Number(item.quantity) || 1),
        unitPriceRub: Math.max(0, Number(product.productPrice) || 0),
      };
    });
  return { sellerId: [...sellerIds][0], lines };
}

/**
 * Токен продавца для покупателя: только если он включил Яндекс и выбрал пункт.
 *
 * @param {string} sellerId
 */
async function resolveBuyerFacingCredentials(sellerId) {
  const credentials = await resolveSellerYandexDeliveryCredentials(sellerId, {
    requireEnabled: true,
  });
  if (!credentials.dropoffStationId) {
    throw new AppError(409, YANDEX_DELIVERY_NO_DROPOFF_MESSAGE);
  }
  return credentials;
}

/**
 * Пункты выдачи с оплатой картой в городе покупателя.
 *
 * @param {{ sellerId: string; city: string }} input
 */
export async function listYandexPointsForBuyer({ sellerId, city }) {
  const credentials = await resolveBuyerFacingCredentials(sellerId);
  const geoId = await detectYandexGeoId(credentials, city);
  if (!geoId) return { points: [], geoId: null };
  const points = await listYandexPoints(credentials, { geoId, purpose: "handout" });
  return { points, geoId };
}

/**
 * Расчёт для корзины. Нет подключения — не ошибка: у покупателя просто не
 * будет варианта Яндекса.
 *
 * @param {{ items: Array<{ productId: string; quantity: number }>; pickupPointId: string }} input
 */
export async function quoteYandexDeliveryShipment({ items, pickupPointId }) {
  const { sellerId, lines } = await loadSingleSellerLines(items);
  let credentials;
  try {
    credentials = await resolveBuyerFacingCredentials(sellerId);
  } catch (error) {
    const reasons = {
      [YANDEX_DELIVERY_NOT_CONNECTED_MESSAGE]: "not_connected",
      [YANDEX_DELIVERY_DISABLED_MESSAGE]: "disabled",
      [YANDEX_DELIVERY_NO_DROPOFF_MESSAGE]: "no_dropoff",
    };
    if (error instanceof AppError && reasons[error.message]) {
      return { available: false, reason: reasons[error.message] };
    }
    throw error;
  }

  const quote = await quoteYandexToPickupPoint(credentials, {
    sourceStationId: credentials.dropoffStationId,
    destinationPointId: pickupPointId,
    lines,
  });
  return {
    available: true,
    sellerId,
    deliverySumRub: quote.deliverySumRub,
    deliveryDays: quote.deliveryDays,
    // false — у части товаров нет веса и габаритов, цена — оценка.
    exact: quote.exact,
  };
}

/**
 * Проверка выбора Яндекса при оформлении. Покупатель присылает только пункт и
 * получателя — цену сервер пересчитывает сам, пункт проверяет заново: между
 * корзиной и оформлением его могли закрыть или лишить терминала.
 *
 * Доставка в сумму заказа не входит: покупатель платит её Яндексу картой в
 * пункте вместе с товаром (решение 22.09.2026).
 *
 * @param {{
 *   sellerId: string;
 *   items: Array<{ productId: string; quantity: number }>;
 *   selection: { pickupPointId: string; recipient: { name: string; phone: string } };
 * }} input
 */
export async function resolveYandexDeliveryOrderShipment({
  sellerId,
  items,
  selection,
}) {
  const credentials = await resolveBuyerFacingCredentials(sellerId);
  const { lines } = await loadSingleSellerLines(items);

  const point = await findYandexPoint(credentials, selection.pickupPointId);
  if (!point || !point.paymentMethods.includes(YANDEX_PAYMENT_CARD_ON_RECEIPT)) {
    throw new AppError(409, YANDEX_DELIVERY_POINT_GONE_MESSAGE);
  }
  const quote = await quoteYandexToPickupPoint(credentials, {
    sourceStationId: credentials.dropoffStationId,
    destinationPointId: point.id,
    lines,
  });

  return {
    // Снимок на момент заказа: цены Яндекса меняются, заказ — нет.
    snapshot: {
      deliverySumRub: quote.deliverySumRub,
      paymentCommissionRub: quote.paymentCommissionRub,
      deliveryDays: quote.deliveryDays,
      exact: quote.exact,
      environment: credentials.environment,
      dropoffStationId: credentials.dropoffStationId,
      recipient: { name: selection.recipient.name, phone: selection.recipient.phone },
      pickupPoint: {
        id: point.id,
        name: point.name,
        address: point.address,
        city: point.city,
        geoId: point.geoId,
        instruction: point.instruction,
      },
    },
    addressForOrder: {
      displayAddress: point.address,
      flat: "",
      fiasId: "",
      geo:
        point.lat != null && point.lon != null
          ? { lat: point.lat, lon: point.lon }
          : null,
    },
  };
}
