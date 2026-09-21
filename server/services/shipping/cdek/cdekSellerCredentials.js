import {
  CDEK_DISABLED_MESSAGE,
  CDEK_ENVIRONMENT_PROD,
  CDEK_NOT_CONNECTED_MESSAGE,
  maskCdekAccount,
} from "@molha/api-contract";

import { AppError } from "../../../errors/AppError.js";
import { UserModel } from "../../../models/index.js";
import { logServerEvent } from "../../../utils/logServerEvent.js";

import { forgetCdekToken, verifyCdekCredentials } from "./cdekClient.js";
import {
  cdekSecretNeedsReseal,
  openCdekSecret,
  sealCdekSecret,
} from "./cdekCredentialsCrypto.js";

/**
 * Подключение СДЭК у конкретного продавца: хранение ключей, проверка и снятие.
 */

/**
 * Что показываем продавцу и стаффу. Секрет наружу не выходит никогда.
 *
 * @param {Record<string, unknown> | null | undefined} raw
 */
export function readCdekConnectionState(raw) {
  const account = typeof raw?.account === "string" ? raw.account : "";
  return {
    connected: Boolean(account && raw?.secureSealed),
    // Нет поля у старых записей — считаем включённым: ключ вводили, чтобы продавать.
    enabled: raw?.enabled !== false,
    environment: raw?.environment === "test" ? "test" : CDEK_ENVIRONMENT_PROD,
    accountMasked: maskCdekAccount(account),
    validatedAt: raw?.validatedAt ?? null,
    lastError: typeof raw?.lastError === "string" ? raw.lastError : "",
  };
}

/**
 * Продаёт ли продавец через СДЭК: ключ есть и тумблер не выключен.
 *
 * @param {Record<string, unknown> | null | undefined} raw
 */
export function isCdekOfferedBySeller(raw) {
  const state = readCdekConnectionState(raw);
  return state.connected && state.enabled;
}

/**
 * Ключи для запроса к СДЭК. Бросает, если продавец не подключил СДЭК: лучше
 * честная ошибка, чем попытка сходить в API без ключа.
 *
 * `requireEnabled` — для покупателя: выключенный тумблер значит «не предлагать».
 * Накладной по уже оформленному заказу тумблер не мешает — заказ принят.
 *
 * @param {string} sellerId
 * @param {{ requireEnabled?: boolean }} [options]
 * @returns {Promise<{ account: string; secure: string; environment: string }>}
 */
export async function resolveSellerCdekCredentials(
  sellerId,
  { requireEnabled = false } = {},
) {
  const seller = await UserModel.findById(sellerId).select("cdekIntegration").lean();
  const raw = seller?.cdekIntegration;
  const account = String(raw?.account ?? "").trim();
  if (!account || !raw?.secureSealed) {
    throw new AppError(409, CDEK_NOT_CONNECTED_MESSAGE);
  }
  if (requireEnabled && raw.enabled === false) {
    throw new AppError(409, CDEK_DISABLED_MESSAGE);
  }

  let secure;
  try {
    secure = openCdekSecret(raw.secureSealed);
  } catch (error) {
    logServerEvent("cdek.secret_unreadable", {
      sellerId: String(sellerId),
      error: error instanceof Error ? error.message : String(error),
    });
    throw new AppError(409, CDEK_NOT_CONNECTED_MESSAGE);
  }

  // Записано до появления CDEK_CREDENTIALS_KEK — перешифровываем на него.
  // Сбой тут не мешает работе: запись по-прежнему открывается старым ключом.
  if (cdekSecretNeedsReseal(raw.secureSealed)) {
    try {
      await UserModel.updateOne(
        { _id: sellerId, "cdekIntegration.secureSealed": raw.secureSealed },
        { $set: { "cdekIntegration.secureSealed": sealCdekSecret(secure) } },
      );
      logServerEvent("cdek.secret_resealed", { sellerId: String(sellerId) });
    } catch (error) {
      logServerEvent("cdek.secret_reseal_failed", {
        sellerId: String(sellerId),
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return {
    account,
    secure,
    environment: raw.environment === "test" ? "test" : CDEK_ENVIRONMENT_PROD,
  };
}

/**
 * Сохранить ключи продавца. Сначала проверяем их у СДЭК: нерабочий ключ в базе
 * хуже отсутствующего — он обещает доставку, которой не будет.
 *
 * @param {{ sellerId: string; account: string; secure: string; environment?: string }} params
 */
export async function saveSellerCdekCredentials({
  sellerId,
  account,
  secure,
  environment = CDEK_ENVIRONMENT_PROD,
}) {
  const credentials = { account: account.trim(), secure: secure.trim(), environment };
  await verifyCdekCredentials(credentials);

  const updated = await UserModel.findByIdAndUpdate(
    sellerId,
    {
      $set: {
        "cdekIntegration.account": credentials.account,
        "cdekIntegration.secureSealed": sealCdekSecret(credentials.secure),
        "cdekIntegration.environment": environment,
        "cdekIntegration.enabled": true,
        "cdekIntegration.validatedAt": new Date(),
        "cdekIntegration.lastError": "",
      },
    },
    { new: true, projection: "cdekIntegration" },
  ).lean();

  if (!updated) {
    throw new AppError(404, "Пользователь не найден");
  }

  logServerEvent("cdek.credentials_saved", {
    sellerId: String(sellerId),
    environment,
  });
  return readCdekConnectionState(updated.cdekIntegration);
}

/**
 * Отключить СДЭК у продавца: ключи стираются, токен из кэша выбрасывается.
 *
 * @param {string} sellerId
 */
export async function removeSellerCdekCredentials(sellerId) {
  const seller = await UserModel.findById(sellerId).select("cdekIntegration").lean();
  const account = String(seller?.cdekIntegration?.account ?? "").trim();
  if (account) {
    forgetCdekToken({
      account,
      secure: "",
      environment: seller?.cdekIntegration?.environment ?? CDEK_ENVIRONMENT_PROD,
    });
  }

  const updated = await UserModel.findByIdAndUpdate(
    sellerId,
    {
      $set: {
        "cdekIntegration.account": "",
        "cdekIntegration.secureSealed": null,
        "cdekIntegration.validatedAt": null,
        "cdekIntegration.lastError": "",
      },
    },
    { new: true, projection: "cdekIntegration" },
  ).lean();

  if (!updated) {
    throw new AppError(404, "Пользователь не найден");
  }

  logServerEvent("cdek.credentials_removed", { sellerId: String(sellerId) });
  return readCdekConnectionState(updated.cdekIntegration);
}

/**
 * Тумблер «продавать через СДЭК». Включить без ключей нельзя: покупатель
 * увидел бы службу, которая не посчитает ни одного тарифа.
 *
 * @param {{ sellerId: string; enabled: boolean }} params
 */
export async function setSellerCdekEnabled({ sellerId, enabled }) {
  const seller = await UserModel.findById(sellerId).select("cdekIntegration").lean();
  if (!seller) {
    throw new AppError(404, "Пользователь не найден");
  }
  if (enabled && !readCdekConnectionState(seller.cdekIntegration).connected) {
    throw new AppError(409, "Сначала подключите ключи СДЭК");
  }

  const updated = await UserModel.findByIdAndUpdate(
    sellerId,
    { $set: { "cdekIntegration.enabled": enabled === true } },
    { new: true, projection: "cdekIntegration" },
  ).lean();

  logServerEvent("cdek.toggled", {
    sellerId: String(sellerId),
    enabled: enabled === true,
  });
  return readCdekConnectionState(updated?.cdekIntegration);
}
