import { emptyPassportForm } from "./emptyPassportForm.js";
import {
  PASSPORT_FORM_STEP_IDENTITY,
  PASSPORT_FORM_STEP_SELFIE,
} from "./validatePassportFormStep.js";

const STORAGE_KEY_PREFIX = "izibuy.dataConfirmationFormDraft.v1.";

/**
 * @typedef {{
 *   form: import('../model/types.js').PassportSnapshot;
 *   step: number;
 * }} DataConfirmationFormDraft
 */

/**
 * @param {string | null | undefined} userId
 * @returns {string | null}
 */
function storageKeyForUser(userId) {
  const id = typeof userId === "string" ? userId.trim() : "";
  if (!id) {
    return null;
  }
  return `${STORAGE_KEY_PREFIX}${id}`;
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function asString(value) {
  return typeof value === "string" ? value : "";
}

/**
 * @param {unknown} rawForm
 * @returns {import('../model/types.js').PassportSnapshot}
 */
function normalizeForm(rawForm) {
  const empty = emptyPassportForm();
  const form = rawForm && typeof rawForm === "object" ? rawForm : {};
  return {
    lastName: asString(form.lastName),
    firstName: asString(form.firstName),
    middleName: asString(form.middleName),
    birthDate: asString(form.birthDate),
    series: asString(form.series),
    number: asString(form.number),
    issuedBy: asString(form.issuedBy),
    issuedAt: asString(form.issuedAt),
    departmentCode: asString(form.departmentCode),
  };
}

/**
 * @param {unknown} step
 * @returns {number}
 */
function normalizeStep(step) {
  const n = typeof step === "number" ? step : Number(step);
  if (!Number.isInteger(n)) {
    return PASSPORT_FORM_STEP_IDENTITY;
  }
  if (n < PASSPORT_FORM_STEP_IDENTITY || n > PASSPORT_FORM_STEP_SELFIE) {
    return PASSPORT_FORM_STEP_IDENTITY;
  }
  return n;
}

/**
 * @param {string | null | undefined} userId
 * @returns {DataConfirmationFormDraft | null}
 */
export function readDataConfirmationFormDraft(userId) {
  if (typeof window === "undefined") {
    return null;
  }
  const key = storageKeyForUser(userId);
  if (!key) {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }
    return {
      form: normalizeForm(parsed.form),
      step: normalizeStep(parsed.step),
    };
  } catch {
    return null;
  }
}

/**
 * @param {string | null | undefined} userId
 * @param {DataConfirmationFormDraft} draft
 */
export function persistDataConfirmationFormDraft(userId, draft) {
  if (typeof window === "undefined") {
    return;
  }
  const key = storageKeyForUser(userId);
  if (!key || !draft || typeof draft !== "object") {
    return;
  }
  try {
    window.localStorage.setItem(
      key,
      JSON.stringify({
        form: normalizeForm(draft.form),
        step: normalizeStep(draft.step),
      }),
    );
  } catch {
    // ignore quota / private mode
  }
}

/**
 * @param {string | null | undefined} userId
 */
export function clearDataConfirmationFormDraft(userId) {
  if (typeof window === "undefined") {
    return;
  }
  const key = storageKeyForUser(userId);
  if (!key) {
    return;
  }
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

/** Сносит черновики всех userId (logout). */
export function clearAllDataConfirmationFormDrafts() {
  if (typeof window === "undefined") {
    return;
  }
  try {
    const keys = [];
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
        keys.push(key);
      }
    }
    for (const key of keys) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // ignore
  }
}
