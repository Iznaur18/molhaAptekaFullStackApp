import {
  PRODUCT_DELIVERY_CARRIER_LOBO,
  buildShippingBuyerRegionBlockMessage,
  isDeliveryCarrierAvailableInRegion,
  resolveProductDeliveryCarrier,
  resolveShippingBuyerRegionBlock,
} from "@molha/api-contract";

import { AppError } from "../../errors/AppError.js";
import { ProductModel, UserModel } from "../../models/index.js";
import { findSellerDeliveryRegionBlock } from "../order/sellerDeliveryRegionGuard.js";
import { verifyRuDeliveryAddress } from "../../utils/dadata/verifyRuDeliveryAddress.js";
import { logServerEvent } from "../../utils/logServerEvent.js";

import { estimateLoboDelivery, isLoboConfigured } from "./lobo/loboClient.js";

/**
 * Регион адреса покупателя. Пустая строка — определить не удалось.
 *
 * @param {string} addressLine
 */
const resolveBuyerRegionCode = async (addressLine) => {
  try {
    const verified = await verifyRuDeliveryAddress({ addressLine });
    return String(verified?.regionCode ?? "").trim();
  } catch (error) {
    logServerEvent("error", {
      event: "shipping_estimate_buyer_region_failed",
      error: error instanceof Error ? error.message : String(error),
    });
    return "";
  }
};

/**
 * Сколько будет стоить доставка этих товаров по этому адресу.
 *
 * Считаем до оформления: покупатель платит курьеру при получении, и сумма не
 * должна оказаться сюрпризом у двери. Цену спрашиваем у самой службы —
 * выдумывать её у нас нет права.
 *
 * @param {{
 *   productIds: string[];
 *   deliveryLat: number;
 *   deliveryLon: number;
 *   deliveryAddress?: string;
 * }} input
 */
export async function estimateShipmentDelivery({
  productIds,
  deliveryLat,
  deliveryLon,
  deliveryAddress = "",
}) {
  if (!Array.isArray(productIds) || productIds.length === 0) {
    throw new AppError(400, "Не указаны товары");
  }
  if (!Number.isFinite(deliveryLat) || !Number.isFinite(deliveryLon)) {
    throw new AppError(400, "Не указаны координаты адреса доставки");
  }

  const products = await ProductModel.find({ _id: { $in: productIds } })
    .select(
      "productSeller productDeliveryCarrier productDeliveryEnabled productCourierDeliveryEnabled productPickupAddress productPickupLat productPickupLon productRegionCode",
    )
    .lean();

  if (products.length === 0) {
    throw new AppError(404, "Товары не найдены");
  }

  // Старый клиент строку адреса не шлёт: его остановит сам createOrder.
  const addressLine = String(deliveryAddress ?? "").trim();

  // Продавец мог запретить доставку в чужие регионы. Говорим об этом здесь,
  // до оформления: тот же запрет в createOrder покупатель увидел бы уже
  // после кнопки.
  if (addressLine) {
    const sellerRegionBlock = await findSellerDeliveryRegionBlock({
      items: products.map((product) => ({
        sellerId: product.productSeller,
        carrier: resolveProductDeliveryCarrier(product),
        regionCode: product.productRegionCode,
      })),
      resolveBuyerRegionCode: () => resolveBuyerRegionCode(addressLine),
    });
    if (sellerRegionBlock) {
      return { available: false, blocking: true, ...sellerRegionBlock };
    }
  }

  // Считаем только то, что везёт внешняя служба: у доставки продавцом и
  // курьеров Gitorg цена берётся иначе.
  const external = products.filter(
    (product) =>
      resolveProductDeliveryCarrier(product) === PRODUCT_DELIVERY_CARRIER_LOBO,
  );
  if (external.length === 0) {
    return { available: false, reason: "not_external" };
  }
  if (!isLoboConfigured()) {
    return { available: false, reason: "not_configured" };
  }

  const first = external[0];
  const regionCode = String(first.productRegionCode ?? "").trim();
  if (!isDeliveryCarrierAvailableInRegion(PRODUCT_DELIVERY_CARRIER_LOBO, regionCode)) {
    return { available: false, reason: "region" };
  }

  // Зона службы касается и покупателя. Адрес разбираем тем же путём, что и
  // при оформлении, — иначе корзина пообещает то, что заказ потом отклонит.
  if (addressLine) {
    const block = resolveShippingBuyerRegionBlock(
      PRODUCT_DELIVERY_CARRIER_LOBO,
      await resolveBuyerRegionCode(addressLine),
    );
    if (block) {
      return {
        available: false,
        reason: block,
        blocking: true,
        message: buildShippingBuyerRegionBlockMessage(
          PRODUCT_DELIVERY_CARRIER_LOBO,
          block,
        ),
      };
    }
  }

  const pickupLat = Number(first.productPickupLat);
  const pickupLon = Number(first.productPickupLon);
  if (!Number.isFinite(pickupLat) || !Number.isFinite(pickupLon)) {
    return { available: false, reason: "no_pickup_geo" };
  }

  try {
    const quote = await estimateLoboDelivery({
      pickupLat,
      pickupLon,
      deliveryLat,
      deliveryLon,
    });
    return {
      available: true,
      carrier: PRODUCT_DELIVERY_CARRIER_LOBO,
      finalCost: quote.finalCost,
      approximate: quote.approximate === true,
      distanceKm: quote.distanceKm,
      durationMin: quote.durationMin,
      isSuburban: quote.isSuburban,
    };
  } catch (error) {
    // Недоступный расчёт не должен мешать оформить заказ: сумму назовёт
    // курьер, а мы честно скажем, что посчитать сейчас не смогли.
    logServerEvent("error", {
      event: "shipping_estimate_failed",
      error: error instanceof Error ? error.message : String(error),
    });
    return { available: false, reason: "carrier_unavailable" };
  }
}

/** @param {unknown} sellerId */
export const sellerRegionCode = async (sellerId) => {
  const seller = await UserModel.findById(sellerId).select("userRegionCode").lean();
  return String(seller?.userRegionCode ?? "").trim();
};
