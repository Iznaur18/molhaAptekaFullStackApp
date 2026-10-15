import { reportClientIssue } from "@/shared/lib/reportClientIssue";
/**
 * Идентификатор нового адреса. Порт `client/.../createUserSavedAddressId.js`:
 * `crypto.randomUUID` в RN может отсутствовать, поэтому есть запасной путь.
 */
export const createUserSavedAddressId = (): string => {
  const globalCrypto = (globalThis as { crypto?: Crypto }).crypto;

  if (typeof globalCrypto?.randomUUID === "function") {
    try {
      return globalCrypto.randomUUID();
    } catch (error) {
      // Hermes без поддержки — уходим на запасной путь.
      reportClientIssue("createUserSavedAddressId", error);
    }
  }

  const randomPart =
    typeof globalCrypto?.getRandomValues === "function"
      ? Array.from(globalCrypto.getRandomValues(new Uint8Array(8)), (byte) =>
          byte.toString(16).padStart(2, "0"),
        ).join("")
      : Math.random().toString(36).slice(2, 10);

  return `addr_${Date.now().toString(36)}_${randomPart}`;
};
