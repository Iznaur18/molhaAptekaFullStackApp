import { randomUUID } from "node:crypto";

/**
 * @returns {string}
 */
export function generateRequestId() {
  return randomUUID();
}
