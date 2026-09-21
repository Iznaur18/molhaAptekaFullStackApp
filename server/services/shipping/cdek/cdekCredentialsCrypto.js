import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

/**
 * Secure password продавца лежит в базе только зашифрованным: это доступ к
 * чужому договору со СДЭК, по нему можно создавать отправки за его счёт.
 * Схема та же, что у ключей 1С (server/services/onec/onecCredentialsCrypto.js).
 *
 * Ключей шифрования два, и в blob пишем, каким зашифровано (`kid`):
 * - `kek` — отдельный CDEK_CREDENTIALS_KEK, основной;
 * - `jwt` — производный от JWT_SECRET, запасной. Им зашифровано всё, что
 *   сохранили до появления KEK (такие blob-ы без `kid`). Смена JWT_SECRET
 *   ломала бы все подключения СДЭК, поэтому такие записи при первом чтении
 *   перешифровываются на KEK (resolveSellerCdekCredentials).
 */
const ALGORITHM = "aes-256-gcm";
const IV_BYTE_LENGTH = 12;
const MARKER = 1;
const SCRYPT_SALT = "izibuy-cdek-credentials-v1";

const KID_KEK = "kek";
const KID_JWT = "jwt";

/** @returns {Buffer | null} */
function resolveDedicatedKek() {
  const hex = process.env.CDEK_CREDENTIALS_KEK?.trim();
  if (!hex) return null;
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error("CDEK_CREDENTIALS_KEK должен быть 64 hex-символа (32 байта)");
  }
  return Buffer.from(hex, "hex");
}

/** @returns {Buffer} */
function resolveJwtDerivedKey() {
  const jwtSecret = process.env.JWT_SECRET?.trim();
  if (!jwtSecret) {
    throw new Error(
      "Задайте CDEK_CREDENTIALS_KEK или JWT_SECRET для шифрования ключей СДЭК",
    );
  }
  return scryptSync(jwtSecret, SCRYPT_SALT, 32);
}

/**
 * Каким ключом шифровать новое.
 *
 * @returns {{ kid: string; key: Buffer }}
 */
function resolveSealingKey() {
  const kek = resolveDedicatedKek();
  return kek
    ? { kid: KID_KEK, key: kek }
    : { kid: KID_JWT, key: resolveJwtDerivedKey() };
}

/**
 * @param {unknown} value
 * @returns {value is { __cdek: number; kid?: string; iv: string; tag: string; ciphertext: string }}
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
  const { kid, key } = resolveSealingKey();
  const iv = randomBytes(IV_BYTE_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(Buffer.from(plaintext, "utf8")),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return {
    __cdek: MARKER,
    kid,
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
  let key;
  if (stored.kid === KID_KEK) {
    key = resolveDedicatedKek();
    if (!key) {
      throw new Error(
        "Ключ СДЭК зашифрован CDEK_CREDENTIALS_KEK, а его нет в окружении",
      );
    }
  } else {
    key = resolveJwtDerivedKey();
  }
  const iv = Buffer.from(stored.iv, "base64");
  const tag = Buffer.from(stored.tag, "base64");
  const ciphertext = Buffer.from(stored.ciphertext, "base64");
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString("utf8");
}

/**
 * Зашифровано запасным ключом, хотя основной уже задан — пора перешифровать.
 *
 * @param {unknown} stored
 */
export function cdekSecretNeedsReseal(stored) {
  if (!isCdekSealedSecret(stored)) return false;
  return stored.kid !== KID_KEK && resolveDedicatedKek() !== null;
}
