import {
  PASSPORT_VAULT_DEFAULT_KEY_ID,
  PASSPORT_VAULT_KEK_HEX_LENGTH,
} from "../../constants/passportVaultConstants.js";

/**
 * @returns {string | null} 64-char hex KEK or null if unset
 */
export function resolvePassportVaultKekHex() {
  const raw = process.env.PASSPORT_VAULT_KEK?.trim() ?? "";
  if (!raw) {
    return null;
  }
  return raw;
}

/**
 * @returns {boolean}
 */
export function isPassportVaultEnabled() {
  const kek = resolvePassportVaultKekHex();
  if (!kek || kek.length !== PASSPORT_VAULT_KEK_HEX_LENGTH) {
    return false;
  }
  return /^[0-9a-fA-F]+$/.test(kek);
}

/**
 * @returns {string}
 */
export function resolvePassportVaultKeyId() {
  const id = process.env.PASSPORT_VAULT_KEY_ID?.trim();
  return id || PASSPORT_VAULT_DEFAULT_KEY_ID;
}

/**
 * @param {string | null} kekHex
 * @returns {Buffer}
 */
export function parsePassportVaultKek(kekHex) {
  if (!kekHex || kekHex.length !== PASSPORT_VAULT_KEK_HEX_LENGTH) {
    throw new Error(
      `PASSPORT_VAULT_KEK должен быть ${PASSPORT_VAULT_KEK_HEX_LENGTH} hex-символов (32 байта)`,
    );
  }
  if (!/^[0-9a-fA-F]+$/.test(kekHex)) {
    throw new Error("PASSPORT_VAULT_KEK должен быть hex");
  }
  return Buffer.from(kekHex, "hex");
}
