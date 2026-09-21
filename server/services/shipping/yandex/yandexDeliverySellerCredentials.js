import {
  YANDEX_DELIVERY_DISABLED_MESSAGE,
  YANDEX_DELIVERY_ENVIRONMENT_PROD,
  YANDEX_DELIVERY_NOT_CONNECTED_MESSAGE,
} from "@molha/api-contract";

import { AppError } from "../../../errors/AppError.js";
import { UserModel } from "../../../models/index.js";
import { logServerEvent } from "../../../utils/logServerEvent.js";

import { verifyYandexDeliveryToken } from "./yandexDeliveryClient.js";
import {
  detectYandexGeoId,
  findYandexPoint,
  listYandexPoints,
} from "./yandexDeliveryPoints.js";
import {
  openYandexDeliveryToken,
  sealYandexDeliveryToken,
  yandexDeliveryTokenNeedsReseal,
} from "./yandexDeliveryCredentialsCrypto.js";

/**
 * Подключение Яндекс Доставки у продавца: хранение токена, проверка, тумблер.
 * Схема та же, что у СДЭК (cdekSellerCredentials.js).
 */

/** @param {unknown} environment */
const normalizeEnvironment = (environment) =>
  environment === "test" ? "test" : YANDEX_DELIVERY_ENVIRONMENT_PROD;

/**
 * Что показываем продавцу. Токен наружу не выходит никогда — только хвост.
 *
 * @param {Record<string, any> | null | undefined} raw
 */
export function readYandexDeliveryConnectionState(raw) {
  const tail = typeof raw?.tokenTail === "string" ? raw.tokenTail : "";
  const dropoffId = String(raw?.dropoffStation?.id ?? "").trim();
  const dropoff = dropoffId
    ? {
        id: dropoffId,
        name: String(raw.dropoffStation.name ?? ""),
        address: String(raw.dropoffStation.address ?? ""),
      }
    : null;
  const connected = Boolean(raw?.tokenSealed);
  return {
    connected,
    enabled: raw?.enabled !== false,
    environment: normalizeEnvironment(raw?.environment),
    tokenMasked: tail ? `••••${tail}` : "",
    validatedAt: raw?.validatedAt ?? null,
    lastError: typeof raw?.lastError === "string" ? raw.lastError : "",
    dropoff,
    // Готово к продажам: токен есть и пункт сдачи выбран.
    ready: connected && dropoff !== null,
  };
}

/**
 * Предлагать ли Яндекс Доставку покупателям этого продавца.
 *
 * @param {Record<string, any> | null | undefined} raw
 */
export function isYandexDeliveryOfferedBySeller(raw) {
  const state = readYandexDeliveryConnectionState(raw);
  return state.ready && state.enabled;
}

/**
 * Токен для запроса к Яндексу.
 *
 * @param {string} sellerId
 * @param {{ requireEnabled?: boolean }} [options]
 * @returns {Promise<{ token: string; environment: string }>}
 */
export async function resolveSellerYandexDeliveryCredentials(
  sellerId,
  { requireEnabled = false } = {},
) {
  const seller = await UserModel.findById(sellerId)
    .select("yandexDeliveryIntegration")
    .lean();
  const raw = seller?.yandexDeliveryIntegration;
  if (!raw?.tokenSealed) {
    throw new AppError(409, YANDEX_DELIVERY_NOT_CONNECTED_MESSAGE);
  }
  if (requireEnabled && raw.enabled === false) {
    throw new AppError(409, YANDEX_DELIVERY_DISABLED_MESSAGE);
  }

  let token;
  try {
    token = openYandexDeliveryToken(raw.tokenSealed);
  } catch (error) {
    logServerEvent("yandex_delivery.token_unreadable", {
      sellerId: String(sellerId),
      error: error instanceof Error ? error.message : String(error),
    });
    throw new AppError(409, YANDEX_DELIVERY_NOT_CONNECTED_MESSAGE);
  }

  if (yandexDeliveryTokenNeedsReseal(raw.tokenSealed)) {
    await UserModel.updateOne(
      { _id: sellerId, "yandexDeliveryIntegration.tokenSealed": raw.tokenSealed },
      {
        $set: {
          "yandexDeliveryIntegration.tokenSealed": sealYandexDeliveryToken(token),
        },
      },
    ).catch(() => null);
  }

  return {
    token,
    environment: normalizeEnvironment(raw.environment),
    dropoffStationId: String(raw.dropoffStation?.id ?? "").trim() || null,
  };
}

/**
 * Сохранить токен продавца — только после проверки у Яндекса: нерабочий токен
 * в базе обещал бы покупателям доставку, которой не будет.
 *
 * @param {{ sellerId: string; token: string; environment?: string }} params
 */
export async function saveSellerYandexDeliveryToken({
  sellerId,
  token,
  environment = YANDEX_DELIVERY_ENVIRONMENT_PROD,
}) {
  const credentials = {
    token: token.trim(),
    environment: normalizeEnvironment(environment),
  };
  await verifyYandexDeliveryToken(credentials);

  const updated = await UserModel.findByIdAndUpdate(
    sellerId,
    {
      $set: {
        "yandexDeliveryIntegration.tokenSealed": sealYandexDeliveryToken(
          credentials.token,
        ),
        "yandexDeliveryIntegration.tokenTail": credentials.token.slice(-4),
        "yandexDeliveryIntegration.environment": credentials.environment,
        "yandexDeliveryIntegration.enabled": true,
        "yandexDeliveryIntegration.validatedAt": new Date(),
        "yandexDeliveryIntegration.lastError": "",
      },
    },
    { new: true, projection: "yandexDeliveryIntegration" },
  ).lean();
  if (!updated) {
    throw new AppError(404, "Пользователь не найден");
  }

  logServerEvent("yandex_delivery.token_saved", {
    sellerId: String(sellerId),
    environment: credentials.environment,
  });
  return readYandexDeliveryConnectionState(updated.yandexDeliveryIntegration);
}

/** @param {string} sellerId */
export async function removeSellerYandexDeliveryToken(sellerId) {
  const updated = await UserModel.findByIdAndUpdate(
    sellerId,
    {
      $set: {
        "yandexDeliveryIntegration.tokenSealed": null,
        "yandexDeliveryIntegration.tokenTail": "",
        "yandexDeliveryIntegration.validatedAt": null,
        "yandexDeliveryIntegration.lastError": "",
      },
    },
    { new: true, projection: "yandexDeliveryIntegration" },
  ).lean();
  if (!updated) {
    throw new AppError(404, "Пользователь не найден");
  }
  logServerEvent("yandex_delivery.token_removed", { sellerId: String(sellerId) });
  return readYandexDeliveryConnectionState(updated.yandexDeliveryIntegration);
}

/**
 * Тумблер «продавать через Яндекс Доставку». Без токена не включить.
 *
 * @param {{ sellerId: string; enabled: boolean }} params
 */
export async function setSellerYandexDeliveryEnabled({ sellerId, enabled }) {
  const seller = await UserModel.findById(sellerId)
    .select("yandexDeliveryIntegration")
    .lean();
  if (!seller) {
    throw new AppError(404, "Пользователь не найден");
  }
  if (
    enabled &&
    !readYandexDeliveryConnectionState(seller.yandexDeliveryIntegration).connected
  ) {
    throw new AppError(409, "Сначала вставьте токен Яндекс Доставки");
  }
  const updated = await UserModel.findByIdAndUpdate(
    sellerId,
    { $set: { "yandexDeliveryIntegration.enabled": enabled === true } },
    { new: true, projection: "yandexDeliveryIntegration" },
  ).lean();
  logServerEvent("yandex_delivery.toggled", {
    sellerId: String(sellerId),
    enabled: enabled === true,
  });
  return readYandexDeliveryConnectionState(updated?.yandexDeliveryIntegration);
}

/**
 * Пункты, куда продавец может сдать посылку, — ключом самого продавца.
 *
 * @param {{ sellerId: string; city: string }} params
 */
export async function listSellerYandexDropoffPoints({ sellerId, city }) {
  const credentials = await resolveSellerYandexDeliveryCredentials(sellerId);
  const geoId = await detectYandexGeoId(credentials, city);
  if (!geoId) return { points: [], geoId: null };
  const points = await listYandexPoints(credentials, { geoId, purpose: "dropoff" });
  return { points, geoId };
}

/**
 * Запомнить пункт сдачи. Проверяем у Яндекса, что он существует и принимает
 * отправления: с неверным id ни один расчёт у покупателя не прошёл бы.
 *
 * @param {{ sellerId: string; stationId: string }} params
 */
export async function setSellerYandexDropoffStation({ sellerId, stationId }) {
  const credentials = await resolveSellerYandexDeliveryCredentials(sellerId);
  const point = await findYandexPoint(credentials, stationId);
  if (!point || !point.availableForDropoff) {
    throw new AppError(
      409,
      "Этот пункт Яндекса не принимает отправления — выберите другой",
    );
  }
  const updated = await UserModel.findByIdAndUpdate(
    sellerId,
    {
      $set: {
        "yandexDeliveryIntegration.dropoffStation": {
          id: point.id,
          name: point.name,
          address: point.address,
          geoId: point.geoId,
        },
      },
    },
    { new: true, projection: "yandexDeliveryIntegration" },
  ).lean();
  logServerEvent("yandex_delivery.dropoff_set", { sellerId: String(sellerId) });
  return readYandexDeliveryConnectionState(updated?.yandexDeliveryIntegration);
}
