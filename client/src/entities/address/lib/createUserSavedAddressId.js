/**
 * @returns {string}
 */
export function createUserSavedAddressId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `addr_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}
