import { ORDER_FULFILLMENT_DELIVERY } from "@molha/api-contract";

import {
  COURIER_MODERATION_APPROVED,
  COURIER_NOT_APPROVED_MESSAGE,
  COURIER_OVERVIEW_RADIUS_KM,
} from "../../constants/courierConstants.js";
import {
  ORDER_STATUS_READY_TO_SHIP,
  ORDER_TERMINAL_STATUSES,
} from "../../constants/orderConstants.js";
import { AppError } from "../../errors/AppError.js";
import { OrderModel, ProductModel, UserModel } from "../../models/index.js";
import { resolveItemSellerId } from "../order/orderShipments.js";
import { buildOrderStatusFromItems } from "../order/orderStatus.js";

const TERMINAL = new Set(ORDER_TERMINAL_STATUSES);
const EARTH_RADIUS_KM = 6371;

/**
 * Расстояние по прямой. Курьеру нужен порядок величины, а не маршрут —
 * гонять роутинг ради сортировки списка незачем.
 *
 * @param {{ lat: number; lon: number }} a
 * @param {{ lat: number; lon: number }} b
 */
export function haversineKm(a, b) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Точка, откуда курьер забирает отправление.
 *
 * У доставочных позиций точка самовывоза не проставляется при оформлении —
 * её незачем было хранить. Поэтому берём адрес товара, а если его нет,
 * профильный адрес продавца.
 *
 * @param {Array<Record<string, any>>} products
 * @param {Record<string, any> | null} seller
 */
const resolvePickupPoint = (products, seller) => {
  for (const product of products) {
    const address = String(product?.productPickupAddress ?? "").trim();
    if (address) {
      return {
        address,
        lat: Number.isFinite(product.productPickupLat)
          ? product.productPickupLat
          : null,
        lon: Number.isFinite(product.productPickupLon)
          ? product.productPickupLon
          : null,
      };
    }
  }

  const geo = seller?.userAddressGeo;
  return {
    address: String(seller?.userAddress ?? "").trim(),
    lat: Number.isFinite(geo?.lat) ? geo.lat : null,
    lon: Number.isFinite(geo?.lon) ? geo.lon : null,
  };
};

/**
 * Свободные отправления в регионе курьера.
 *
 * Регион берётся из адреса профиля, а не из геолокации: на разрешение
 * геолокации завязывать доступ к списку нельзя, её часто не дают.
 * Геопозиция, если она есть, влияет только на порядок.
 *
 * @param {{
 *   courierId: string;
 *   lat?: number | null;
 *   lon?: number | null;
 *   limit?: number;
 * }} input
 */
export async function listCourierOverview({ courierId, lat = null, lon = null, limit = 30 }) {
  const courier = await UserModel.findById(courierId)
    .select("courierProfile.moderationStatus userRegionCode userAddressGeo")
    .lean();

  if (courier?.courierProfile?.moderationStatus !== COURIER_MODERATION_APPROVED) {
    throw new AppError(403, COURIER_NOT_APPROVED_MESSAGE);
  }

  const regionCode = String(courier.userRegionCode ?? "").trim();
  if (!regionCode) {
    throw new AppError(400, "Укажите адрес в профиле — по нему подбираются заказы");
  }

  const safeLimit = Math.min(100, Math.max(1, Math.floor(Number(limit) || 30)));

  const orders = await OrderModel.find({
    shipments: {
      $elemMatch: {
        fulfillmentMethod: ORDER_FULFILLMENT_DELIVERY,
        courierId: null,
      },
    },
  })
    .select(
      "items shipments deliveryAddress deliveryAddressFlat createdAt userBuyerId",
    )
    .sort({ createdAt: -1 })
    .limit(safeLimit * 5)
    .lean();

  /** @type {Array<Record<string, any>>} */
  const candidates = [];
  const sellerIds = new Set();
  const productIds = new Set();

  for (const order of orders) {
    for (const shipment of order.shipments ?? []) {
      if (shipment.fulfillmentMethod !== ORDER_FULFILLMENT_DELIVERY) continue;
      if (shipment.courierId) continue;
      if (
        (shipment.declinedCourierIds ?? []).some(
          (id) => String(id) === String(courierId),
        )
      ) {
        continue;
      }

      const sellerId = String(shipment.sellerId);
      const items = (order.items ?? []).filter(
        (item) =>
          resolveItemSellerId(item) === sellerId && !TERMINAL.has(item.status),
      );
      if (items.length === 0) continue;
      if (buildOrderStatusFromItems(items) !== ORDER_STATUS_READY_TO_SHIP) continue;

      sellerIds.add(sellerId);
      for (const item of items) {
        if (item.productId) productIds.add(String(item.productId));
      }
      candidates.push({ order, shipment, sellerId, items });
    }
  }

  if (candidates.length === 0) {
    return { regionCode, radiusKm: COURIER_OVERVIEW_RADIUS_KM, shipments: [] };
  }

  const [sellers, products] = await Promise.all([
    UserModel.find({ _id: { $in: [...sellerIds] } })
      .select("userName userRegionCode userAddress userAddressGeo userPhoneNumber")
      .lean(),
    ProductModel.find({ _id: { $in: [...productIds] } })
      .select(
        "productName productCharacteristics productPickupAddress productPickupLat productPickupLon",
      )
      .lean(),
  ]);

  const sellerById = new Map(sellers.map((row) => [String(row._id), row]));
  const productById = new Map(products.map((row) => [String(row._id), row]));

  const origin =
    Number.isFinite(lat) && Number.isFinite(lon)
      ? { lat: Number(lat), lon: Number(lon) }
      : Number.isFinite(courier.userAddressGeo?.lat) &&
          Number.isFinite(courier.userAddressGeo?.lon)
        ? { lat: courier.userAddressGeo.lat, lon: courier.userAddressGeo.lon }
        : null;

  const rows = [];
  for (const { order, shipment, sellerId, items } of candidates) {
    const seller = sellerById.get(sellerId);
    // Регион продавца — единственный фильтр доступа. Без него курьер видел бы
    // всю страну.
    if (String(seller?.userRegionCode ?? "") !== regionCode) continue;

    const shipmentProducts = items
      .map((item) => productById.get(String(item.productId)))
      .filter(Boolean);
    const pickup = resolvePickupPoint(shipmentProducts, seller);

    const distanceKm =
      origin && Number.isFinite(pickup.lat) && Number.isFinite(pickup.lon)
        ? haversineKm(origin, { lat: pickup.lat, lon: pickup.lon })
        : null;

    if (distanceKm != null && distanceKm > COURIER_OVERVIEW_RADIUS_KM) continue;

    rows.push({
      orderId: String(order._id),
      sellerId,
      sellerName: seller?.userName ?? "",
      deliveryFeeRub: Number(shipment.deliveryFeeRub) || 0,
      createdAt: order.createdAt,
      distanceKm: distanceKm == null ? null : Math.round(distanceKm * 10) / 10,
      pickupAddress: pickup.address,
      // Точный адрес и телефон покупателя откроются только после передачи
      // товара — до неё курьеру хватает района.
      deliveryAreaHint: String(order.deliveryAddress ?? "")
        .split(",")
        .slice(0, 2)
        .join(",")
        .trim(),
      items: items.map((item) => {
        const product = productById.get(String(item.productId));
        return {
          name: item.productNameAtOrder,
          quantity: item.quantity,
          // Габаритов у товара нет — курьер решает по характеристикам.
          characteristics: product?.productCharacteristics ?? [],
        };
      }),
    });
  }

  rows.sort((a, b) => {
    if (a.distanceKm == null && b.distanceKm == null) return 0;
    if (a.distanceKm == null) return 1;
    if (b.distanceKm == null) return -1;
    return a.distanceKm - b.distanceKm;
  });

  return {
    regionCode,
    radiusKm: COURIER_OVERVIEW_RADIUS_KM,
    shipments: rows.slice(0, safeLimit),
  };
}
