import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

/**
 * Secure password продавца лежит в базе только зашифрованным: это доступ к
 * чужому договору со СДЭК, по нему можно создавать отправки за его счёт.
 * Схема та же, что у ключей 1С (server/services/onec/onecCredentialsCrypto.js).
 */
const ALGORITHM = "aes-256-gcm";
const IV_BYTE_LENGTH = 12;
const MARKER = 1;
const SCRYPT_SALT = "izibuy-cdek-credentials-v1";

/**
 * @returns {Buffer}
 */
function resolveKek() {
  const hex = process.env.CDEK_CREDENTIALS_KEK?.trim();
  if (hex) {
    if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
      throw new Error("CDEK_CREDENTIALS_KEK должен быть 64 hex-символа (32 байта)");
    }
    return Buffer.from(hex, "hex");
  }

  const jwtSecret = process.env.JWT_SECRET?.trim();
  if (!jwtSecret) {
    throw new Error(
      "Задайте CDEK_CREDENTIALS_KEK или JWT_SECRET для шифрования ключей СДЭК",
    );
  }

  return scryptSync(jwtSecret, SCRYPT_SALT, 32);
}

/**
 * @param {unknown} value
 * @returns {value is { __cdek: number; iv: string; tag: string; ciphertext: string }}
 */
export function isCdekSealedSecret(value) {
  if (!value || typeof value !== "object") return false;
  const blob = /** @type {Record<string, unknown>} */ (value);
  return (
    blob.__cdek === MARKER &&
    typeof blob.iv === "string" &&
    typeof blob.tag === "string" &&
    typeof blob.ciphertext === "string"
  );
}

/**
 * @param {string} plaintext
 */
export function sealCdekSecret(plaintext) {
  if (typeof plaintext !== "string" || !plaintext) {
    throw new Error("Secure password СДЭК пуст");
  }
  const key = resolveKek();
  const iv = randomBytes(IV_BYTE_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(Buffer.from(plaintext, "utf8")),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return {
    __cdek: MARKER,
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    ciphertext: encrypted.toString("base64"),
  };
}

/**
 * @param {unknown} stored
 * @returns {string}
 */
export function openCdekSecret(stored) {
  if (!isCdekSealedSecret(stored)) {
    // В отличие от 1С legacy-строк тут не бывает: поле появилось сразу
    // зашифрованным, и открытый текст означал бы порчу данных.
    throw new Error("Secure password СДЭК отсутствует или повреждён");
  }
  const key = resolveKek();
  const iv = Buffer.from(stored.iv, "base64");
  const tag = Buffer.from(stored.tag, "base64");
  const ciphertext = Buffer.from(stored.ciphertext, "base64");
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString("utf8");
}
