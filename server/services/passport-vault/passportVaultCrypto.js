import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

import {
  PASSPORT_VAULT_ALGORITHM,
  PASSPORT_VAULT_MARKER,
} from "../../constants/passportVaultConstants.js";
import {
  isPassportVaultEnabled,
  parsePassportVaultKek,
  resolvePassportVaultKekHex,
  resolvePassportVaultKeyId,
} from "./passportVaultKey.js";

const IV_BYTE_LENGTH = 12;

/**
 * @param {unknown} value
 * @returns {value is { __vault: number; iv: string; tag: string; ciphertext: string; keyId: string }}
 */
export function isPassportVaultBlob(value) {
  if (!value || typeof value !== "object") {
    return false;
  }
  const blob = /** @type {Record<string, unknown>} */ (value);
  return (
    blob.__vault === PASSPORT_VAULT_MARKER &&
    typeof blob.iv === "string" &&
    typeof blob.tag === "string" &&
    typeof blob.ciphertext === "string"
  );
}

/**
 * @param {Record<string, unknown>} passport
 */
const serializePassportPlain = (passport) =>
  JSON.stringify({
    ...passport,
    birthDate:
      passport.birthDate instanceof Date
        ? passport.birthDate.toISOString()
        : passport.birthDate,
    issuedAt:
      passport.issuedAt instanceof Date
        ? passport.issuedAt.toISOString()
        : passport.issuedAt,
  });

/**
 * @param {Record<string, unknown>} parsed
 */
const revivePassportDates = (parsed) => ({
  ...parsed,
  birthDate: parsed.birthDate ? new Date(String(parsed.birthDate)) : parsed.birthDate,
  issuedAt: parsed.issuedAt ? new Date(String(parsed.issuedAt)) : parsed.issuedAt,
});

/**
 * @param {Record<string, unknown>} passportPlain
 * @returns {Record<string, unknown>}
 */
export function sealPassportPlain(passportPlain) {
  if (!passportPlain || typeof passportPlain !== "object") {
    throw new Error("passportPlain обязателен");
  }
  if (!isPassportVaultEnabled()) {
    return { ...passportPlain };
  }

  const key = parsePassportVaultKek(resolvePassportVaultKekHex());
  const iv = randomBytes(IV_BYTE_LENGTH);
  const cipher = createCipheriv(PASSPORT_VAULT_ALGORITHM, key, iv);
  const plaintext = Buffer.from(serializePassportPlain(passportPlain), "utf8");
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    __vault: PASSPORT_VAULT_MARKER,
    keyId: resolvePassportVaultKeyId(),
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    ciphertext: encrypted.toString("base64"),
  };
}

/**
 * @param {unknown} stored
 * @returns {Record<string, unknown> | null}
 */
export function openPassportStored(stored) {
  if (!stored || typeof stored !== "object") {
    return null;
  }

  if (!isPassportVaultBlob(stored)) {
    return /** @type {Record<string, unknown>} */ ({ ...stored });
  }

  if (!isPassportVaultEnabled()) {
    throw new Error(
      "Паспорт зашифрован, но PASSPORT_VAULT_KEK не задан — расшифровка невозможна",
    );
  }

  const key = parsePassportVaultKek(resolvePassportVaultKekHex());
  const iv = Buffer.from(stored.iv, "base64");
  const tag = Buffer.from(stored.tag, "base64");
  const ciphertext = Buffer.from(stored.ciphertext, "base64");
  const decipher = createDecipheriv(PASSPORT_VAULT_ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  const parsed = JSON.parse(decrypted.toString("utf8"));
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Некорректный payload паспорта после расшифровки");
  }
  return revivePassportDates(parsed);
}
