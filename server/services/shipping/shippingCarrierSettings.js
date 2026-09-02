import {
  PRODUCT_DELIVERY_CARRIERS,
  PRODUCT_DELIVERY_CARRIER_LABEL_RU,
  PRODUCT_DELIVERY_CARRIER_LOBO,
  SHIPPING_PROVIDER_REGIONS,
  isShippingProviderLive,
} from "@molha/api-contract";

import { AppError } from "../../errors/AppError.js";
import { ShippingCarrierSettingModel } from "../../models/index.js";
import { logServerEvent } from "../../utils/logServerEvent.js";

import { isLoboConfigured } from "./lobo/loboClient.js";

/**
 * Дефолт по контракту: что действует, пока админ ничего не трогал.
 *
 * @param {string} carrierId
 */
function defaultEnabled(carrierId) {
  // «Доставка продавцом» и курьеры Gitorg — наши собственные способы, они не
  // зависят от чужих ключей и по умолчанию включены.
  if (!SHIPPING_PROVIDER_REGIONS[carrierId]) {
    return carrierId !== PRODUCT_DELIVERY_CARRIER_LOBO;
  }
  return isShippingProviderLive(carrierId);
}

/**
 * Настроена ли служба технически (ключи, доступы).
 *
 * Отделено от «включена админом»: выключенную можно включить кнопкой, а
 * ненастроенную — только вписав ключи.
 *
 * @param {string} carrierId
 */
export function isCarrierConfigured(carrierId) {
  if (carrierId === PRODUCT_DELIVERY_CARRIER_LOBO) {
    return isLoboConfigured();
  }
  return true;
}

/**
 * Все службы с их состоянием: для админки и для клиента.
 *
 * @returns {Promise<Array<{
 *   carrierId: string;
 *   label: string;
 *   enabled: boolean;
 *   configured: boolean;
 *   available: boolean;
 *   regions: string[] | null;
 *   updatedAt: Date | null;
 * }>>}
 */
export async function listShippingCarrierSettings() {
  const rows = await ShippingCarrierSettingModel.find({}).lean();
  const byId = new Map(rows.map((row) => [row.carrierId, row]));

  return PRODUCT_DELIVERY_CARRIERS.map((carrierId) => {
    const stored = byId.get(carrierId);
    const enabled = stored ? stored.enabled === true : defaultEnabled(carrierId);
    const configured = isCarrierConfigured(carrierId);
    return {
      carrierId,
      label: PRODUCT_DELIVERY_CARRIER_LABEL_RU[carrierId] ?? carrierId,
      enabled,
      configured,
      // Работает только то, что и включено, и настроено.
      available: enabled && configured,
      regions: SHIPPING_PROVIDER_REGIONS[carrierId] ?? null,
      updatedAt: stored?.updatedAt ?? null,
    };
  });
}

/**
 * Службы, доступные прямо сейчас: включены админом и настроены технически.
 *
 * @returns {Promise<string[]>}
 */
export async function listAvailableCarrierIds() {
  const settings = await listShippingCarrierSettings();
  return settings.filter((row) => row.available).map((row) => row.carrierId);
}

/**
 * Можно ли сейчас выбрать эту службу.
 *
 * Регион здесь не проверяем: это отдельное ограничение, и спрашивают о нём
 * там, где известен регион товара.
 *
 * @param {string | null | undefined} carrierId
 */
export async function isCarrierAvailable(carrierId) {
  if (!carrierId) return false;
  const available = await listAvailableCarrierIds();
  return available.includes(String(carrierId));
}

/**
 * Включить или выключить службу.
 *
 * @param {{ carrierId: string; enabled: boolean; adminId: string }} input
 */
export async function setShippingCarrierEnabled({ carrierId, enabled, adminId }) {
  if (!PRODUCT_DELIVERY_CARRIERS.includes(carrierId)) {
    throw new AppError(400, `Неизвестная служба доставки: ${carrierId}`);
  }
  // Включать ненастроенную бессмысленно: заказы по ней зависнут, а админ
  // будет думать, что всё работает.
  if (enabled && !isCarrierConfigured(carrierId)) {
    throw new AppError(
      409,
      "Служба не настроена: нет ключей API. Включать нечего",
    );
  }

  await ShippingCarrierSettingModel.updateOne(
    { carrierId },
    { $set: { enabled, updatedBy: adminId } },
    { upsert: true },
  );

  logServerEvent("info", {
    event: "shipping_carrier_toggled",
    carrierId,
    enabled,
    adminId: String(adminId),
  });

  return listShippingCarrierSettings();
}
