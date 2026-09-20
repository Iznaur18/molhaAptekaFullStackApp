import {
  CDEK_ENVIRONMENT_PROD,
  CDEK_NOT_CONNECTED_MESSAGE,
  maskCdekAccount,
} from "@molha/api-contract";

import { AppError } from "../../../errors/AppError.js";
import { UserModel } from "../../../models/index.js";
import { logServerEvent } from "../../../utils/logServerEvent.js";

import { forgetCdekToken, verifyCdekCredentials } from "./cdekClient.js";
import { openCdekSecret, sealCdekSecret } from "./cdekCredentialsCrypto.js";

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
    environment:
      raw?.environment === "test" ? "test" : CDEK_ENVIRONMENT_PROD,
    accountMasked: maskCdekAccount(account),
    validatedAt: raw?.validatedAt ?? null,
    lastError: typeof raw?.lastError === "string" ? raw.lastError : "",
  };
}

/**
 * Ключи для запроса к СДЭК. Бросает, если продавец не подключил СДЭК: лучше
 * честная ошибка, чем попытка сходить в API без ключа.
 *
 * @param {string} sellerId
 * @returns {Promise<{ account: string; secure: string; environment: string }>}
 */
export async function resolveSellerCdekCredentials(sellerId) {
  const seller = await UserModel.findById(sellerId).select("cdekIntegration").lean();
  const raw = seller?.cdekIntegration;
  const account = String(raw?.account ?? "").trim();
  if (!account || !raw?.secureSealed) {
    throw new AppError(409, CDEK_NOT_CONNECTED_MESSAGE);
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
