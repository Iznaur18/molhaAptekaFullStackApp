import { CREATE_PRODUCT_INITIAL_FORM } from "./createProductFormState.js";
import { createImageRow } from "./productImageRowHelpers.js";

const CREATE_PRODUCT_FORM_DRAFT_STORAGE_KEY = "izibuy.createProductFormDraft.v1";

/**
 * @typedef {{
 *   form: Record<string, unknown>;
 *   stepIndex: number;
 *   savedAt: number | null;
 * }} CreateProductFormDraft
 */

/** @param {unknown} value */
const trimmed = (value) => String(value ?? "").trim();

/**
 * Есть ли в черновике хоть что-то, введённое продавцом вручную.
 * Поля самовывоза сюда НЕ входят — они подставляются из профиля
 * автоматически, иначе пустая только что открытая форма считалась бы
 * черновиком и «восстанавливалась» бы при каждом открытии.
 *
 * @param {unknown} form
 * @returns {boolean}
 */
export function isCreateProductFormDraftMeaningful(form) {
  if (!form || typeof form !== "object") {
    return false;
  }
  const record = /** @type {Record<string, unknown>} */ (form);
  if (
    trimmed(record.productName) ||
    trimmed(record.productDescription) ||
    trimmed(record.productPreviewVideoUrl) ||
    trimmed(record.productPrice) ||
    trimmed(record.productOldPrice)
  ) {
    return true;
  }
  if (record.productListingOrigin) {
    return true;
  }
  if (record.productCategoryId != null) {
    return true;
  }
  if (
    Array.isArray(record.productImageRows) &&
    record.productImageRows.some((row) => trimmed(row?.url))
  ) {
    return true;
  }
  const rowHasText = (row) => trimmed(row?.key) || trimmed(row?.value);
  if (
    Array.isArray(record.productCharacteristicRows) &&
    record.productCharacteristicRows.some(rowHasText)
  ) {
    return true;
  }
  if (Array.isArray(record.returnTermRows) && record.returnTermRows.some(rowHasText)) {
    return true;
  }
  return false;
}

/**
 * @param {unknown} rows
 * @returns {import('./productImageRowHelpers.js').ProductImageRow[]}
 */
function normalizeImageRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return [createImageRow("")];
  }
  const mapped = rows.map((row) =>
    createImageRow(typeof row?.url === "string" ? row.url : ""),
  );
  return mapped.length > 0 ? mapped : [createImageRow("")];
}

/**
 * @returns {CreateProductFormDraft | null}
 */
export function readCreateProductFormDraft() {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(CREATE_PRODUCT_FORM_DRAFT_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !parsed.form || typeof parsed.form !== "object") {
      return null;
    }
    if (!isCreateProductFormDraftMeaningful(parsed.form)) {
      return null;
    }
    // Мержим поверх дефолтов: если схема формы расширилась после сохранения,
    // новые поля получат значения по умолчанию, а не undefined.
    const form = { ...CREATE_PRODUCT_INITIAL_FORM, ...parsed.form };
    form.productImageRows = normalizeImageRows(parsed.form.productImageRows);
    const stepIndex = Number.isFinite(Number(parsed.stepIndex))
      ? Math.max(0, Math.floor(Number(parsed.stepIndex)))
      : 0;
    const savedAt = typeof parsed.savedAt === "number" ? parsed.savedAt : null;
    return { form, stepIndex, savedAt };
  } catch {
    return null;
  }
}

/**
 * Сохраняет черновик, только если во форме есть содержательные данные.
 * Пустая форма — no-op (НЕ удаляем прежний черновик): на первом рендере после
 * открытия форма ещё не гидратирована из черновика, и удаление здесь стёрло бы
 * восстановленный черновик. Явную очистку делают {@link clearCreateProductFormDraft}
 * на успешной публикации и при «Начать заново».
 *
 * @param {{ form: Record<string, unknown>; stepIndex?: number }} draft
 */
export function persistCreateProductFormDraft(draft) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    if (!draft || !isCreateProductFormDraftMeaningful(draft.form)) {
      return;
    }
    const stepIndex = Number.isFinite(Number(draft.stepIndex))
      ? Math.max(0, Math.floor(Number(draft.stepIndex)))
      : 0;
    window.localStorage.setItem(
      CREATE_PRODUCT_FORM_DRAFT_STORAGE_KEY,
      JSON.stringify({ form: draft.form, stepIndex, savedAt: Date.now() }),
    );
  } catch {
    // ignore quota / private mode
  }
}

export function clearCreateProductFormDraft() {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.removeItem(CREATE_PRODUCT_FORM_DRAFT_STORAGE_KEY);
  } catch {
    // ignore
  }
}
