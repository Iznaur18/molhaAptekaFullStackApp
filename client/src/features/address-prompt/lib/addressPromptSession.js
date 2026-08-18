import { ADDRESS_PROMPT_SESSION_STORAGE_KEY } from "../model/addressPromptConstants.js";

/**
 * @param {unknown} userId
 */
export function resolveAddressPromptUserId(userId) {
  return String(userId ?? "").trim();
}

function readSeenByUserId() {
  try {
    const raw = sessionStorage.getItem(ADDRESS_PROMPT_SESSION_STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    return /** @type {Record<string, unknown>} */ (parsed);
  } catch {
    return {};
  }
}

/**
 * @param {unknown} userId
 */
export function hasSeenAddressPromptThisSession(userId) {
  const id = resolveAddressPromptUserId(userId);
  if (!id) {
    return false;
  }
  return readSeenByUserId()[id] === true;
}

/**
 * @param {unknown} userId
 */
export function markAddressPromptSeenThisSession(userId) {
  const id = resolveAddressPromptUserId(userId);
  if (!id) {
    return;
  }
  try {
    const store = readSeenByUserId();
    store[id] = true;
    sessionStorage.setItem(ADDRESS_PROMPT_SESSION_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // private mode
  }
}
