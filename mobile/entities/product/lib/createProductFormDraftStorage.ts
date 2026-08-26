import { Directory, File, Paths } from "expo-file-system";
import { Platform } from "react-native";

/**
 * Черновик формы создания товара.
 *
 * Хранилище выбрано под специфику RN, а не скопировано с веба:
 *
 * — `localStorage` в RN нет, а `expo-secure-store` (единственное, что было в
 *   проекте) режет значение на 2048 байтах и обещает в будущих SDK кидать
 *   ошибку — одно описание товара его переполняет. Зато новый API
 *   `expo-file-system` v19 **синхронный** (`textSync`/`write`/`exists`), так
 *   что чтение остаётся таким же мгновенным, как `localStorage` в вебе, и
 *   форме не нужен экран ожидания с риском затереть черновик пустыми полями.
 * — модуль уже в графе автолинковки (от него зависит сам `expo`), поэтому
 *   пересобирать dev-client не нужно.
 * — на вебе `expo-file-system` не работает (модуль сам предупреждает об
 *   этом), поэтому там `localStorage` — та же развилка, что в
 *   `entities/region/lib/viewerRegion.ts`.
 */
export const CREATE_PRODUCT_FORM_DRAFT_STORAGE_KEY = "molha.createProductFormDraft.v1";

const DRAFT_FILE_NAME = "create-product-form-draft-v1.json";

export type CreateProductFormDraft<TForm = Record<string, unknown>> = {
  form: TForm;
  stepIndex: number;
  savedAt: number | null;
};

const USE_WEB_STORAGE = Platform.OS === "web";

const webStorage = (): Storage | null => {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
};

const draftFile = () => new File(Paths.document, DRAFT_FILE_NAME);

const readRaw = (): string | null => {
  try {
    if (USE_WEB_STORAGE) {
      return webStorage()?.getItem(CREATE_PRODUCT_FORM_DRAFT_STORAGE_KEY) ?? null;
    }
    const file = draftFile();
    return file.exists ? file.textSync() : null;
  } catch {
    return null;
  }
};

const writeRaw = (raw: string): void => {
  try {
    if (USE_WEB_STORAGE) {
      webStorage()?.setItem(CREATE_PRODUCT_FORM_DRAFT_STORAGE_KEY, raw);
      return;
    }
    const directory = new Directory(Paths.document);
    if (!directory.exists) {
      directory.create({ intermediates: true, idempotent: true });
    }
    draftFile().write(raw);
  } catch {
    // Диск заполнен или недоступен: черновик — удобство, ронять из-за него
    // мастер нельзя.
  }
};

export const clearCreateProductFormDraft = (): void => {
  try {
    if (USE_WEB_STORAGE) {
      webStorage()?.removeItem(CREATE_PRODUCT_FORM_DRAFT_STORAGE_KEY);
      return;
    }
    const file = draftFile();
    if (file.exists) {
      file.delete();
    }
  } catch {
    // см. writeRaw
  }
};

const trimmed = (value: unknown) => String(value ?? "").trim();

const rowHasText = (row: unknown) => {
  const record = row as { key?: unknown; value?: unknown } | null;
  return Boolean(trimmed(record?.key) || trimmed(record?.value));
};

/**
 * Есть ли в черновике хоть что-то, введённое продавцом руками.
 *
 * Поля самовывоза сюда НЕ входят — они подставляются из профиля сами, иначе
 * только что открытая пустая форма считалась бы черновиком и «восстанавливалась»
 * при каждом входе. Ровно та же оговорка, что в вебе.
 */
export const isCreateProductFormDraftMeaningful = (form: unknown): boolean => {
  if (form == null || typeof form !== "object") {
    return false;
  }
  const record = form as Record<string, unknown>;

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
  if (Array.isArray(record.imageUrls) && record.imageUrls.some((url) => trimmed(url))) {
    return true;
  }
  if (Array.isArray(record.characteristicRows) && record.characteristicRows.some(rowHasText)) {
    return true;
  }
  if (Array.isArray(record.returnTermRows) && record.returnTermRows.some(rowHasText)) {
    return true;
  }
  if (record.productReturnEnabled != null) {
    return true;
  }

  return false;
};

export const readCreateProductFormDraft = <TForm = Record<string, unknown>>(
  stepCount: number,
): CreateProductFormDraft<TForm> | null => {
  const raw = readRaw();
  if (!raw) {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Битый файл — не повод показывать продавцу ошибку, просто забываем его.
    clearCreateProductFormDraft();
    return null;
  }

  const record = parsed as Partial<CreateProductFormDraft<TForm>> | null;
  if (record == null || typeof record !== "object" || record.form == null) {
    clearCreateProductFormDraft();
    return null;
  }
  if (!isCreateProductFormDraftMeaningful(record.form)) {
    clearCreateProductFormDraft();
    return null;
  }

  const stepIndex = Number(record.stepIndex);
  return {
    form: record.form as TForm,
    stepIndex: Number.isFinite(stepIndex)
      ? Math.max(0, Math.min(Math.floor(stepIndex), Math.max(0, stepCount - 1)))
      : 0,
    savedAt: Number.isFinite(Number(record.savedAt)) ? Number(record.savedAt) : null,
  };
};

/**
 * Незначимый черновик не пишем, а стираем: иначе выход из пустой формы
 * оставлял бы файл, из-за которого следующий вход показывал бы баннер
 * восстановления ни о чём.
 */
export const writeCreateProductFormDraft = (
  form: unknown,
  stepIndex: number,
): void => {
  if (!isCreateProductFormDraftMeaningful(form)) {
    clearCreateProductFormDraft();
    return;
  }
  const payload: CreateProductFormDraft = {
    form: form as Record<string, unknown>,
    stepIndex: Math.max(0, Math.floor(Number(stepIndex) || 0)),
    savedAt: Date.now(),
  };
  try {
    writeRaw(JSON.stringify(payload));
  } catch {
    // JSON.stringify упал на цикле — черновик просто не сохранится.
  }
};
