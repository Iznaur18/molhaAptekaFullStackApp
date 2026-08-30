import { apiClient } from "../../../shared/api/apiClient.js";

/**
 * @param {unknown} payload
 */
function unwrapApiData(payload) {
  if (
    payload &&
    typeof payload === "object" &&
    payload.success === true &&
    "data" in payload
  ) {
    return payload.data;
  }
  const message =
    payload && typeof payload === "object" && typeof payload.message === "string"
      ? payload.message
      : "Некорректный ответ сервера";
  throw new Error(message);
}

/**
 * @param {unknown} error
 */
function rethrowApiError(error) {
  const message =
    error?.response?.data?.message ??
    error?.message ??
    "Ошибка запроса к 1С API";
  throw new Error(message);
}

export async function fetchOneCSettings() {
  try {
    const { data } = await apiClient.get("/onec/settings");
    return unwrapApiData(data).settings;
  } catch (error) {
    rethrowApiError(error);
  }
}

/**
 * @param {{
 *   enabled?: boolean;
 *   baseUrl?: string;
 *   apiKey?: string | null;
 *   clearApiKey?: boolean;
 * }} body
 */
export async function putOneCSettings(body) {
  try {
    const { data } = await apiClient.put("/onec/settings", body);
    return unwrapApiData(data);
  } catch (error) {
    rethrowApiError(error);
  }
}

export async function deleteOneCSettings() {
  try {
    const { data } = await apiClient.delete("/onec/settings");
    return unwrapApiData(data);
  } catch (error) {
    rethrowApiError(error);
  }
}

export async function postOneCTest() {
  try {
    const { data } = await apiClient.post("/onec/test");
    return unwrapApiData(data);
  } catch (error) {
    rethrowApiError(error);
  }
}

export async function postOneCSync() {
  try {
    const { data } = await apiClient.post("/onec/sync");
    return unwrapApiData(data);
  } catch (error) {
    rethrowApiError(error);
  }
}

/**
 * @param {{ limit?: number }} [params]
 */
export async function fetchOneCLogs(params = {}) {
  try {
    const { data } = await apiClient.get("/onec/logs", { params });
    return unwrapApiData(data).logs ?? [];
  } catch (error) {
    rethrowApiError(error);
  }
}

/**
 * Выдать (или перевыпустить) логин и пароль, которые продавец вбивает
 * в узел «Обмен с сайтом» своей 1С.
 *
 * Пароль приходит только в этом ответе — на сервере лежит один bcrypt-хэш.
 */
export async function postOneCExchangeCredentials() {
  try {
    const { data } = await apiClient.post("/onec/exchange-credentials");
    return unwrapApiData(data);
  } catch (error) {
    rethrowApiError(error);
  }
}

export async function fetchOneCCategoryMappings() {
  try {
    const { data } = await apiClient.get("/onec/category-mappings");
    return unwrapApiData(data).mappings ?? [];
  } catch (error) {
    rethrowApiError(error);
  }
}

/**
 * @param {Array<{ externalId: string; categoryId: string | null }>} items
 */
export async function putOneCCategoryMappings(items) {
  try {
    const { data } = await apiClient.put("/onec/category-mappings", { items });
    return unwrapApiData(data);
  } catch (error) {
    rethrowApiError(error);
  }
}

/**
 * @param {{ limit?: number }} [params]
 */
export async function fetchOneCImportJobs(params = {}) {
  try {
    const { data } = await apiClient.get("/onec/import-jobs", { params });
    return unwrapApiData(data).jobs ?? [];
  } catch (error) {
    rethrowApiError(error);
  }
}
