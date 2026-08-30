import {
  ONEC_API_KEY_MAX_LENGTH,
  ONEC_BASE_URL_MAX_LENGTH,
  ONEC_EXCHANGE_DIRECTION_TEST,
  ONEC_EXCHANGE_STATUS_ERROR,
  ONEC_EXCHANGE_STATUS_SUCCESS,
  ONEC_SYNC_STATUS_IDLE,
} from "../../constants/onecConstants.js";
import {
  ONEC_CHANNELS,
  ONEC_CHANNEL_COMMERCEML,
  ONEC_CHANNEL_PULL,
} from "../../constants/onecExchangeConstants.js";
import { buildOneCExchangeEndpointUrl } from "./exchange/buildOneCExchangeEndpointUrl.js";
import { AppError } from "../../errors/AppError.js";
import { OneCExchangeLogModel, UserModel } from "../../models/index.js";
import {
  maskOneCApiKey,
  openOneCSecret,
  sealOneCSecret,
} from "./onecCredentialsCrypto.js";
import {
  normalizeOneCBaseUrl,
  testOneCConnection,
} from "./onecHttpClient.js";

/** @returns {Record<string, unknown>} */
function emptyExchangeSettings() {
  return {
    login: "",
    hasPassword: false,
    endpointUrl: buildOneCExchangeEndpointUrl(),
    priceTypeIds: [],
    warehouseIds: [],
    knownPriceTypes: [],
    knownWarehouses: [],
    lastExchangeAt: null,
  };
}

/**
 * Пароль обмена наружу не отдаём никогда — он показывается ровно один раз при
 * генерации, дальше в базе только bcrypt-хэш.
 *
 * @param {Record<string, unknown> | null | undefined} raw
 */
function readExchangeSettings(raw) {
  if (!raw || typeof raw !== "object") return emptyExchangeSettings();
  return {
    login: typeof raw.login === "string" ? raw.login : "",
    hasPassword: Boolean(raw.passwordHash),
    endpointUrl: buildOneCExchangeEndpointUrl(),
    priceTypeIds: Array.isArray(raw.priceTypeIds) ? raw.priceTypeIds : [],
    warehouseIds: Array.isArray(raw.warehouseIds) ? raw.warehouseIds : [],
    knownPriceTypes: Array.isArray(raw.knownPriceTypes) ? raw.knownPriceTypes : [],
    knownWarehouses: Array.isArray(raw.knownWarehouses)
      ? raw.knownWarehouses
      : [],
    lastExchangeAt: raw.lastExchangeAt ?? null,
  };
}

/**
 * @param {import("mongoose").Document | Record<string, unknown> | null | undefined} user
 */
export function getOneCIntegrationFromUser(user) {
  const raw = user?.oneCIntegration;
  if (!raw || typeof raw !== "object") {
    return {
      enabled: false,
      channel: ONEC_CHANNEL_PULL,
      baseUrl: "",
      hasApiKey: false,
      apiKeyMasked: "",
      exchange: emptyExchangeSettings(),
      lastSyncAt: null,
      lastSyncStatus: ONEC_SYNC_STATUS_IDLE,
      lastSyncError: "",
      lastSyncSummary: null,
    };
  }

  let hasApiKey = false;
  let apiKeyMasked = "";
  try {
    if (raw.apiKeySealed) {
      const plain = openOneCSecret(raw.apiKeySealed);
      hasApiKey = Boolean(plain);
      apiKeyMasked = maskOneCApiKey(plain);
    }
  } catch {
    hasApiKey = Boolean(raw.apiKeySealed);
    apiKeyMasked = "••••";
  }

  return {
    enabled: raw.enabled === true,
    channel: ONEC_CHANNELS.includes(raw.channel) ? raw.channel : ONEC_CHANNEL_PULL,
    baseUrl: typeof raw.baseUrl === "string" ? raw.baseUrl : "",
    hasApiKey,
    apiKeyMasked,
    exchange: readExchangeSettings(raw.exchange),
    lastSyncAt: raw.lastSyncAt ?? null,
    lastSyncStatus: raw.lastSyncStatus ?? ONEC_SYNC_STATUS_IDLE,
    lastSyncError: typeof raw.lastSyncError === "string" ? raw.lastSyncError : "",
    lastSyncSummary: raw.lastSyncSummary ?? null,
  };
}

/**
 * @param {string} sellerId
 */
export async function getSellerOneCSettings(sellerId) {
  const user = await UserModel.findById(sellerId)
    .select("oneCIntegration")
    .lean();
  if (!user) {
    throw new AppError(404, "Пользователь не найден");
  }
  return getOneCIntegrationFromUser(user);
}

/**
 * @param {string} sellerId
 * @param {{
 *   enabled?: boolean;
 *   baseUrl?: string;
 *   apiKey?: string;
 *   clearApiKey?: boolean;
 * }} body
 */
export async function saveSellerOneCSettings(sellerId, body) {
  const user = await UserModel.findById(sellerId).select("oneCIntegration");
  if (!user) {
    throw new AppError(404, "Пользователь не найден");
  }

  const current = user.oneCIntegration?.toObject?.() ?? user.oneCIntegration ?? {};
  const next = { ...current };

  if (body.baseUrl !== undefined) {
    const baseUrl = String(body.baseUrl ?? "").trim();
    if (baseUrl.length > ONEC_BASE_URL_MAX_LENGTH) {
      throw new AppError(400, "URL слишком длинный");
    }
    next.baseUrl = baseUrl ? normalizeOneCBaseUrl(baseUrl) : "";
  }

  if (body.clearApiKey === true) {
    next.apiKeySealed = null;
  } else if (body.apiKey !== undefined && String(body.apiKey).trim()) {
    const apiKey = String(body.apiKey).trim();
    if (apiKey.length > ONEC_API_KEY_MAX_LENGTH) {
      throw new AppError(400, "API-ключ слишком длинный");
    }
    next.apiKeySealed = sealOneCSecret(apiKey);
  }

  if (body.channel !== undefined) {
    if (!ONEC_CHANNELS.includes(body.channel)) {
      throw new AppError(400, "Неизвестный канал обмена");
    }
    next.channel = body.channel;
  }
  if (!next.channel) next.channel = ONEC_CHANNEL_PULL;

  if (body.priceTypeIds !== undefined) {
    next.exchange = { ...(next.exchange ?? {}), priceTypeIds: body.priceTypeIds };
  }
  if (body.warehouseIds !== undefined) {
    next.exchange = { ...(next.exchange ?? {}), warehouseIds: body.warehouseIds };
  }

  if (body.enabled !== undefined) {
    next.enabled = body.enabled === true;
  }

  // Каналы включаются по-разному: pull требует адрес чужого HTTP-сервиса,
  // CommerceML — выданной пары логин/пароль, которую 1С вобьёт у себя.
  if (next.enabled && next.channel === ONEC_CHANNEL_COMMERCEML) {
    if (!next.exchange?.login || !next.exchange?.passwordHash) {
      throw new AppError(
        400,
        "Сначала сгенерируйте логин и пароль для обмена с 1С",
      );
    }
  }

  if (next.enabled && next.channel === ONEC_CHANNEL_PULL) {
    if (!next.baseUrl) {
      throw new AppError(400, "Для включения интеграции укажите URL 1С");
    }
    if (!next.apiKeySealed) {
      throw new AppError(400, "Для включения интеграции укажите API-ключ");
    }
  }

  if (!next.lastSyncStatus) {
    next.lastSyncStatus = ONEC_SYNC_STATUS_IDLE;
  }

  user.oneCIntegration = next;
  user.markModified("oneCIntegration");
  await user.save();

  return getOneCIntegrationFromUser(user);
}

/**
 * @param {string} sellerId
 */
export async function disconnectSellerOneC(sellerId) {
  const user = await UserModel.findById(sellerId).select("oneCIntegration");
  if (!user) {
    throw new AppError(404, "Пользователь не найден");
  }

  // `exchange` переживает отключение: логин уже вбит в узел обмена 1С, и
  // стирать его на «выключить на неделю» значит ломать настройку у продавца.
  user.oneCIntegration = {
    ...(user.oneCIntegration?.toObject?.() ?? user.oneCIntegration ?? {}),
    enabled: false,
    baseUrl: "",
    apiKeySealed: null,
    lastSyncAt: null,
    lastSyncStatus: ONEC_SYNC_STATUS_IDLE,
    lastSyncError: "",
    lastSyncSummary: null,
  };
  user.markModified("oneCIntegration");
  await user.save();

  return getOneCIntegrationFromUser(user);
}

/**
 * @param {string} sellerId
 * @returns {Promise<{ baseUrl: string; apiKey: string }>}
 */
export async function resolveSellerOneCCredentials(sellerId) {
  const user = await UserModel.findById(sellerId)
    .select("oneCIntegration")
    .lean();
  if (!user) {
    throw new AppError(404, "Пользователь не найден");
  }
  const integration = user.oneCIntegration;
  if (!integration?.enabled) {
    throw new AppError(400, "Интеграция с 1С выключена");
  }
  if (!integration.baseUrl) {
    throw new AppError(400, "Не задан URL 1С");
  }
  let apiKey;
  try {
    apiKey = openOneCSecret(integration.apiKeySealed);
  } catch {
    throw new AppError(400, "Не удалось прочитать API-ключ 1С — сохраните ключ заново");
  }
  if (!apiKey) {
    throw new AppError(400, "Не задан API-ключ 1С");
  }
  return {
    baseUrl: normalizeOneCBaseUrl(integration.baseUrl),
    apiKey,
  };
}

/**
 * @param {string} sellerId
 */
export async function testSellerOneCConnection(sellerId) {
  const creds = await resolveSellerOneCCredentials(sellerId);
  try {
    const data = await testOneCConnection(creds);
    await OneCExchangeLogModel.create({
      sellerId,
      direction: ONEC_EXCHANGE_DIRECTION_TEST,
      status: ONEC_EXCHANGE_STATUS_SUCCESS,
      message: "Соединение с 1С успешно",
      summary: data,
      triggeredBy: "manual",
    });
    return { ok: true, data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ошибка проверки соединения";
    await OneCExchangeLogModel.create({
      sellerId,
      direction: ONEC_EXCHANGE_DIRECTION_TEST,
      status: ONEC_EXCHANGE_STATUS_ERROR,
      message: message.slice(0, 2000),
      triggeredBy: "manual",
    });
    throw error;
  }
}

/**
 * @param {string} sellerId
 * @param {{ limit?: number }} [opts]
 */
export async function listSellerOneCLogs(sellerId, opts = {}) {
  const limit = Math.min(100, Math.max(1, Number(opts.limit) || 30));
  const logs = await OneCExchangeLogModel.find({ sellerId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return logs;
}

/**
 * @param {string} sellerId
 */
export async function isSellerOneCEnabled(sellerId) {
  const user = await UserModel.findById(sellerId)
    .select("oneCIntegration.enabled")
    .lean();
  return user?.oneCIntegration?.enabled === true;
}
