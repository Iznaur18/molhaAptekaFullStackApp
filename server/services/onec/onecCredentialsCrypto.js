import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_BYTE_LENGTH = 12;
const MARKER = 1;
const SCRYPT_SALT = "izibuy-onec-credentials-v1";

/**
 * @returns {Buffer}
 */
function resolveKek() {
  const hex = process.env.ONEC_CREDENTIALS_KEK?.trim();
  if (hex) {
    if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
      throw new Error(
        "ONEC_CREDENTIALS_KEK должен быть 64 hex-символа (32 байта)",
      );
    }
    return Buffer.from(hex, "hex");
  }

  const jwtSecret = process.env.JWT_SECRET?.trim();
  if (!jwtSecret) {
    throw new Error(
      "Задайте ONEC_CREDENTIALS_KEK или JWT_SECRET для шифрования ключей 1С",
    );
  }

  return scryptSync(jwtSecret, SCRYPT_SALT, 32);
}

/**
 * @param {unknown} value
 * @returns {value is { __onec: number; iv: string; tag: string; ciphertext: string }}
 */
export function isOneCSealedSecret(value) {
  if (!value || typeof value !== "object") return false;
  const blob = /** @type {Record<string, unknown>} */ (value);
  return (
    blob.__onec === MARKER &&
    typeof blob.iv === "string" &&
    typeof blob.tag === "string" &&
    typeof blob.ciphertext === "string"
  );
}

/**
 * @param {string} plaintext
 */
export function sealOneCSecret(plaintext) {
  if (typeof plaintext !== "string" || !plaintext) {
    throw new Error("API-ключ 1С пуст");
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
    __onec: MARKER,
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    ciphertext: encrypted.toString("base64"),
  };
}

/**
 * @param {unknown} stored
 * @returns {string}
 */
export function openOneCSecret(stored) {
  if (typeof stored === "string" && stored) {
    // legacy / local plain (не для prod)
    return stored;
  }
  if (!isOneCSealedSecret(stored)) {
    throw new Error("Секрет 1С отсутствует или повреждён");
  }
  const key = resolveKek();
  const iv = Buffer.from(stored.iv, "base64");
  const tag = Buffer.from(stored.tag, "base64");
  const ciphertext = Buffer.from(stored.ciphertext, "base64");
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

/**
 * @param {string} apiKey
 */
export function maskOneCApiKey(apiKey) {
  if (!apiKey || typeof apiKey !== "string") return "";
  if (apiKey.length <= 4) return "••••";
  return `••••${apiKey.slice(-4)}`;
}
