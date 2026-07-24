/**
 * Idempotency key для мутаций. `crypto.randomUUID` только в secure context
 * (https / localhost) — на LAN HTTP нужен fallback.
 *
 * @returns {string}
 */
export function createClientIdempotencyKey() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    try {
      return crypto.randomUUID();
    } catch {
      // insecure context
    }
  }

  const randomPart =
    typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function"
      ? Array.from(crypto.getRandomValues(new Uint8Array(8)), (byte) =>
          byte.toString(16).padStart(2, "0"),
        ).join("")
      : Math.random().toString(36).slice(2, 10);

  return `k-${Date.now().toString(36)}-${randomPart}`;
}
