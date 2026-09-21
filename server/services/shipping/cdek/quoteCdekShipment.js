import { CDEK_DISABLED_MESSAGE, CDEK_NOT_CONNECTED_MESSAGE } from "@molha/api-contract";

import { AppError } from "../../../errors/AppError.js";
import { ProductModel } from "../../../models/index.js";

import { listCdekDeliveryPoints, resolveCdekCityCode } from "./cdekDeliveryPoints.js";
import { resolveSellerCdekCredentials } from "./cdekSellerCredentials.js";
import { quoteCdekPickupTariffs } from "./cdekTariffs.js";

/**
 * Расчёт доставки СДЭК для корзины и список пунктов выдачи рядом с покупателем.
 *
 * Один расчёт — один продавец: отправление идёт по его договору со СДЭК
 * (docs/product/cdek-per-seller-v1.md). Корзину из двух магазинов покупатель
 * оформляет как два заказа, иначе непонятно, чьим ключом создавать накладную.
 */

/**
 * @param {string[]} productIds
 */
async function resolveSingleSellerShipment(productIds) {
  const products = await ProductModel.find({ _id: { $in: productIds } })
    .select(
      "productSeller productPickupAddress productRegionCode productWeightG productLengthCm productWidthCm productHeightCm",
    )
    .lean();

  if (products.length === 0) {
    throw new AppError(404, "Товары не найдены");
  }

  const sellerIds = new Set(products.map((product) => String(product.productSeller)));
  if (sellerIds.size > 1) {
    throw new AppError(
      400,
      "СДЭК считается по одному продавцу: оформите товары разных продавцов отдельно",
    );
  }

  return {
    sellerId: [...sellerIds][0],
    products,
    fromAddress: String(products[0].productPickupAddress ?? "").trim(),
  };
}

/**
 * @param {{
 *   productIds: string[];
 *   toCityCode?: number | null;
 *   toPostalCode?: string | null;
 *   toAddress?: string | null;
 * }} input
 */
export async function quoteCdekShipment({
  productIds,
  toCityCode,
  toPostalCode,
  toAddress,
}) {
  const shipment = await resolveSingleSellerShipment(productIds);

  let credentials;
  try {
    credentials = await resolveSellerCdekCredentials(shipment.sellerId, {
      requireEnabled: true,
    });
  } catch (error) {
    // Нет ключей — это не сбой: у покупателя просто не будет варианта СДЭК.
    if (error instanceof AppError && error.message === CDEK_NOT_CONNECTED_MESSAGE) {
      return { available: false, reason: "not_connected", options: [] };
    }
    if (error instanceof AppError && error.message === CDEK_DISABLED_MESSAGE) {
      return { available: false, reason: "disabled", options: [] };
    }
    throw error;
  }

  if (!shipment.fromAddress) {
    return { available: false, reason: "no_pickup_address", options: [] };
  }

  const { options, exact } = await quoteCdekPickupTariffs(credentials, {
    from: { address: shipment.fromAddress },
    to: { code: toCityCode, postalCode: toPostalCode, address: toAddress },
    products: shipment.products,
  });

  if (options.length === 0) {
    return { available: false, reason: "no_tariffs", options: [], exact };
  }

  return {
    available: true,
    sellerId: shipment.sellerId,
    options,
    // Дешёвый вариант показываем по умолчанию, остальные — выбором.
    best: options[0],
    // false — у части товаров нет веса и габаритов, цена приблизительная.
    exact,
  };
}

/**
 * Пункты выдачи для экрана выбора. Город ищем по коду, индексу или названию:
 * у покупателя в адресе редко есть код справочника СДЭК.
 *
 * @param {{
 *   sellerId: string;
 *   cityCode?: number | null;
 *   postalCode?: string | null;
 *   city?: string | null;
 * }} input
 */
export async function listCdekPointsForBuyer({ sellerId, cityCode, postalCode, city }) {
  const credentials = await resolveSellerCdekCredentials(sellerId, {
    requireEnabled: true,
  });

  let code = cityCode ?? null;
  if (!code) {
    code = await resolveCdekCityCode(credentials, { city, postalCode });
  }
  if (!code && !postalCode) {
    return { points: [], reason: "city_unknown" };
  }

  const points = await listCdekDeliveryPoints(credentials, {
    cityCode: code,
    postalCode: code ? null : postalCode,
  });
  return { points, cityCode: code ?? null };
}
