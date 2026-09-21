import { CDEK_POINT_GONE_MESSAGE, CDEK_TARIFF_GONE_MESSAGE } from "@molha/api-contract";

import { AppError } from "../../../errors/AppError.js";
import { ProductModel } from "../../../models/index.js";

import { findCdekDeliveryPoint } from "./cdekDeliveryPoints.js";
import { resolveSellerCdekCredentials } from "./cdekSellerCredentials.js";
import { quoteCdekPickupTariffs } from "./cdekTariffs.js";

/**
 * Проверка выбора СДЭК при оформлении заказа.
 *
 * Покупатель присылает только тариф, пункт и город. Цену и срок сервер
 * пересчитывает сам ключом продавца — иначе в заказ можно было бы вписать
 * любую сумму. Пункт тоже проверяем: между выбором в корзине и оформлением
 * его могли закрыть.
 *
 * Деньги за доставку в сумму заказа не входят: покупатель платит СДЭК при
 * получении (решение 21.09.2026), поэтому здесь только снимок для продавца и
 * покупателя.
 *
 * @param {{
 *   sellerId: string;
 *   productIds: string[];
 *   selection: {
 *     tariffCode: number;
 *     pickupPointCode: string;
 *     toCityCode: number;
 *     recipient?: { name: string; phone: string };
 *   };
 * }} input
 */
export async function resolveCdekOrderShipment({ sellerId, productIds, selection }) {
  const credentials = await resolveSellerCdekCredentials(sellerId, {
    requireEnabled: true,
  });

  const products = await ProductModel.find({ _id: { $in: productIds } })
    .select(
      "productPickupAddress productWeightG productLengthCm productWidthCm productHeightCm",
    )
    .lean();
  const fromAddress = String(products[0]?.productPickupAddress ?? "").trim();
  if (!fromAddress) {
    throw new AppError(409, "У продавца не указан адрес отправки для СДЭК");
  }

  const [quote, point] = await Promise.all([
    quoteCdekPickupTariffs(credentials, {
      from: { address: fromAddress },
      to: { code: selection.toCityCode },
      products,
    }),
    findCdekDeliveryPoint(credentials, selection.pickupPointCode),
  ]);

  const option = quote.options.find((row) => row.tariffCode === selection.tariffCode);
  if (!option) {
    throw new AppError(409, CDEK_TARIFF_GONE_MESSAGE);
  }
  if (!point) {
    throw new AppError(409, CDEK_POINT_GONE_MESSAGE);
  }

  return {
    // Снимок на момент заказа: тарифы СДЭК меняются, заказ — нет.
    snapshot: {
      tariffCode: option.tariffCode,
      tariffName: option.tariffName,
      deliveryMode: option.deliveryMode,
      deliverySumRub: option.deliverySumRub,
      periodMinDays: option.periodMinDays,
      periodMaxDays: option.periodMaxDays,
      // false — у части товаров нет веса и габаритов, цена была оценкой.
      exact: quote.exact,
      environment: credentials.environment,
      // Кому СДЭК отдаст посылку и куда позвонит о прибытии.
      recipient: selection.recipient
        ? { name: selection.recipient.name, phone: selection.recipient.phone }
        : null,
      pickupPoint: {
        code: point.code,
        name: point.name,
        address: point.address,
        cityCode: point.cityCode,
        city: point.city,
        workTime: point.workTime,
      },
    },
    // Адрес заказа — это пункт выдачи.
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
