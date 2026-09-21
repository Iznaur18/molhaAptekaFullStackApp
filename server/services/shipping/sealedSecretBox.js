import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

/**
 * Шифрование чужих ключей служб доставки (СДЭК, Яндекс Доставка): это доступ к
 * договору продавца, по нему можно создавать отправки за его счёт.
 *
 * Ключей шифрования два, и в blob пишем, каким зашифровано (`kid`):
 * - `kek` — отдельный ключ из окружения (CDEK_CREDENTIALS_KEK), основной;
 * - `jwt` — производный от JWT_SECRET, запасной. Им зашифровано всё, что
 *   сохранили до появления KEK (такие blob-ы без `kid`); при первом чтении
 *   такие записи перешифровываются на KEK.
 */
const ALGORITHM = "aes-256-gcm";
const IV_BYTE_LENGTH = 12;
const MARKER_VERSION = 1;
const KID_KEK = "kek";
const KID_JWT = "jwt";

/**
 * @param {{
 *   marker: string;       поле-метка в blob, по нему узнаём «свой» формат
 *   salt: string;         соль для ключа из JWT_SECRET — своя у каждой службы
 *   kekEnvName: string;   переменная окружения с основным ключом
 *   label: string;        как назвать секрет в ошибках
 * }} options
 */
export function createSealedSecretBox({ marker, salt, kekEnvName, label }) {
  /** @returns {Buffer | null} */
  const resolveDedicatedKek = () => {
    const hex = process.env[kekEnvName]?.trim();
    if (!hex) return null;
    if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
      throw new Error(`${kekEnvName} должен быть 64 hex-символа (32 байта)`);
    }
    return Buffer.from(hex, "hex");
  };

  /** @returns {Buffer} */
  const resolveJwtDerivedKey = () => {
    const jwtSecret = process.env.JWT_SECRET?.trim();
    if (!jwtSecret) {
      throw new Error(`Задайте ${kekEnvName} или JWT_SECRET для шифрования: ${label}`);
    }
    return scryptSync(jwtSecret, salt, 32);
  };

  /**
   * @param {unknown} value
   * @returns {value is Record<string, string | number> & { iv: string; tag: string; ciphertext: string; kid?: string }}
   */
  const isSealed = (value) => {
    if (!value || typeof value !== "object") return false;
    const blob = /** @type {Record<string, unknown>} */ (value);
    return (
      blob[marker] === MARKER_VERSION &&
      typeof blob.iv === "string" &&
      typeof blob.tag === "string" &&
      typeof blob.ciphertext === "string"
    );
  };

  /** @param {string} plaintext */
  const seal = (plaintext) => {
    if (typeof plaintext !== "string" || !plaintext) {
      throw new Error(`${label}: пусто`);
    }
    const kek = resolveDedicatedKek();
    const kid = kek ? KID_KEK : KID_JWT;
    const key = kek ?? resolveJwtDerivedKey();
    const iv = randomBytes(IV_BYTE_LENGTH);
    const cipher = createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([
      cipher.update(Buffer.from(plaintext, "utf8")),
      cipher.final(),
    ]);
    return {
      [marker]: MARKER_VERSION,
      kid,
      iv: iv.toString("base64"),
      tag: cipher.getAuthTag().toString("base64"),
      ciphertext: encrypted.toString("base64"),
    };
  };

  /**
   * @param {unknown} stored
   * @returns {string}
   */
  const open = (stored) => {
    if (!isSealed(stored)) {
      throw new Error(`${label}: отсутствует или повреждён`);
    }
    let key;
    if (stored.kid === KID_KEK) {
      key = resolveDedicatedKek();
      if (!key) {
        throw new Error(`${label} зашифрован ${kekEnvName}, а его нет в окружении`);
      }
    } else {
      key = resolveJwtDerivedKey();
    }
    const decipher = createDecipheriv(
      ALGORITHM,
      key,
      Buffer.from(String(stored.iv), "base64"),
    );
    decipher.setAuthTag(Buffer.from(String(stored.tag), "base64"));
    return Buffer.concat([
      decipher.update(Buffer.from(String(stored.ciphertext), "base64")),
      decipher.final(),
    ]).toString("utf8");
  };

  /**
   * Зашифровано запасным ключом, хотя основной уже задан — пора перешифровать.
   *
   * @param {unknown} stored
   */
  const needsReseal = (stored) =>
    isSealed(stored) && stored.kid !== KID_KEK && resolveDedicatedKek() !== null;

  return { isSealed, seal, open, needsReseal };
}
