import {
  REQUEST_ID_INCOMING_PATTERN,
  REQUEST_ID_MAX_LENGTH,
  REQUEST_ID_MIN_LENGTH,
} from "../constants/requestLogConstants.js";

/**
 * @param {string | undefined | null} raw
 * @returns {string | null}
 */
export function normalizeIncomingRequestId(raw) {
  if (typeof raw !== "string") {
    return null;
  }

  const trimmed = raw.trim();
  if (
    trimmed.length < REQUEST_ID_MIN_LENGTH ||
    trimmed.length > REQUEST_ID_MAX_LENGTH ||
    !REQUEST_ID_INCOMING_PATTERN.test(trimmed)
  ) {
    return null;
  }

  return trimmed;
}
