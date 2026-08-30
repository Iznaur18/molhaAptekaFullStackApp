import { randomBytes, timingSafeEqual } from "node:crypto";

import bcrypt from "bcrypt";

import {
  ONEC_EXCHANGE_LOGIN_PREFIX,
  ONEC_EXCHANGE_LOGIN_RANDOM_BYTES,
  ONEC_EXCHANGE_PASSWORD_BYTES,
} from "../../../constants/onecExchangeConstants.js";
import { AppError } from "../../../errors/AppError.js";
import { UserModel } from "../../../models/index.js";
import { DUMMY_PASSWORD_HASH } from "../../auth/dummyPasswordHash.js";

const BCRYPT_ROUNDS = 10;

/**
 * Пароль без символов, которые 1С экранирует в строке подключения
 * (`:` разделяет пару в Basic, кавычки ломают ввод в форме узла обмена).
 */
const PASSWORD_ALPHABET =
  "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** @returns {string} */
export function generateOneCExchangeLogin() {
  const suffix = randomBytes(ONEC_EXCHANGE_LOGIN_RANDOM_BYTES).toString("hex");
  return `${ONEC_EXCHANGE_LOGIN_PREFIX}${suffix}`;
}

/** @returns {string} */
export function generateOneCExchangePassword() {
  const bytes = randomBytes(ONEC_EXCHANGE_PASSWORD_BYTES);
  let out = "";
  for (const byte of bytes) {
    out += PASSWORD_ALPHABET[byte % PASSWORD_ALPHABET.length];
  }
  return out;
}

/**
 * Выдать продавцу новую пару логин/пароль. Пароль возвращается **один раз** —
 * в базе только bcrypt-хэш.
 *
 * @param {string} sellerId
 * @returns {Promise<{ login: string; password: string }>}
 */
export async function regenerateOneCExchangeCredentials(sellerId) {
  const user = await UserModel.findById(sellerId).select("oneCIntegration");
  if (!user) {
    throw new AppError(404, "Пользователь не найден");
  }

  const existingLogin = user.oneCIntegration?.exchange?.login;
  // Логин переживает смену пароля: он уже вбит в узел обмена 1С, и менять его
  // без нужды значит заставлять продавца править настройки во всех базах.
  const login = existingLogin || generateOneCExchangeLogin();
  const password = generateOneCExchangePassword();
  const passwordHash = await bcrypt.hash(
    password,
    await bcrypt.genSalt(BCRYPT_ROUNDS),
  );

  await UserModel.updateOne(
    { _id: sellerId },
    {
      $set: {
        "oneCIntegration.exchange.login": login,
        "oneCIntegration.exchange.passwordHash": passwordHash,
      },
    },
  );

  return { login, password };
}

/**
 * Разбор заголовка `Authorization: Basic base64(login:password)`.
 *
 * @param {string | undefined} header
 * @returns {{ login: string; password: string } | null}
 */
export function parseBasicAuthHeader(header) {
  const raw = String(header ?? "").trim();
  if (!/^basic\s+/i.test(raw)) return null;

  const encoded = raw.replace(/^basic\s+/i, "").trim();
  if (!encoded) return null;

  let decoded;
  try {
    decoded = Buffer.from(encoded, "base64").toString("utf8");
  } catch {
    return null;
  }

  const separator = decoded.indexOf(":");
  if (separator < 0) return null;

  return {
    login: decoded.slice(0, separator).trim(),
    password: decoded.slice(separator + 1),
  };
}

/**
 * Проверить пару логин/пароль из Basic-заголовка 1С.
 *
 * При неизвестном логине всё равно считаем bcrypt по фиктивному хэшу — иначе
 * время ответа выдаёт, какие логины существуют.
 *
 * @param {{ login: string; password: string }} credentials
 * @returns {Promise<{ sellerId: string; login: string } | null>}
 */
export async function verifyOneCExchangeCredentials({ login, password }) {
  const normalizedLogin = String(login ?? "").trim();
  if (!normalizedLogin || !password) return null;

  const user = await UserModel.findOne({
    "oneCIntegration.exchange.login": normalizedLogin,
  })
    .select("_id oneCIntegration.enabled oneCIntegration.channel oneCIntegration.exchange.passwordHash")
    .lean();

  const passwordHash =
    user?.oneCIntegration?.exchange?.passwordHash || DUMMY_PASSWORD_HASH;
  const matches = await bcrypt.compare(String(password), passwordHash);

  if (!user || !matches) return null;

  return { sellerId: String(user._id), login: normalizedLogin };
}

/**
 * Сравнение значений cookie сессии за постоянное время.
 *
 * @param {string} a
 * @param {string} b
 */
export function safeEqual(a, b) {
  const left = Buffer.from(String(a ?? ""), "utf8");
  const right = Buffer.from(String(b ?? ""), "utf8");
  if (left.length !== right.length || left.length === 0) return false;
  return timingSafeEqual(left, right);
}
