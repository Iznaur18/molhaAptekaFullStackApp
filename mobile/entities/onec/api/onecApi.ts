import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

type ApiEnvelope = {
  success?: boolean;
  message?: string;
  data?: Record<string, unknown>;
};

const unwrap = (payload: ApiEnvelope | undefined): Record<string, unknown> => {
  if (payload?.success === true && payload.data && typeof payload.data === "object") {
    return payload.data;
  }
  throw new Error(payload?.message ?? API_CLIENT_UI.INVALID_SERVER_RESPONSE);
};

const rethrow = (error: unknown): never => {
  throw new Error(formatApiErrorMessage(error, "Ошибка запроса к 1С API"));
};

export type OneCSettings = {
  enabled?: boolean;
  channel?: "commerceml" | "pull" | string;
  baseUrl?: string;
  hasApiKey?: boolean;
  apiKeyMasked?: string;
  lastSyncStatus?: "success" | "error" | string | null;
  lastSyncAt?: string | null;
  lastSyncError?: string | null;
  exchange?: {
    endpointUrl?: string;
    login?: string;
    hasPassword?: boolean;
    priceTypeIds?: string[];
    warehouseIds?: string[];
    knownPriceTypes?: Array<{ externalId: string; name?: string }>;
    knownWarehouses?: Array<{ externalId: string; name?: string }>;
  };
};

export type OneCLog = {
  _id: string;
  status?: string;
  direction?: string;
  message?: string;
  createdAt?: string;
};

export type OneCCategoryMapping = {
  externalId: string;
  name?: string;
  pathNames?: string[];
  productCount?: number;
  categoryId?: string | null;
  categoryLabel?: string | null;
};

export type OneCImportJob = {
  id: string;
  status?: string;
  filename?: string;
  createdAt?: string;
  errorMessage?: string | null;
  stats?: Record<string, unknown> | null;
  issues?: Array<{ message?: string }> | null;
};

export async function fetchOneCSettings(): Promise<OneCSettings> {
  try {
    const { data } = await apiClient.get<ApiEnvelope>("/onec/settings");
    return (unwrap(data).settings ?? {}) as OneCSettings;
  } catch (error) {
    return rethrow(error);
  }
}

export async function putOneCSettings(body: Record<string, unknown>) {
  try {
    const { data } = await apiClient.put<ApiEnvelope>("/onec/settings", body);
    return unwrap(data);
  } catch (error) {
    return rethrow(error);
  }
}

export async function deleteOneCSettings() {
  try {
    const { data } = await apiClient.delete<ApiEnvelope>("/onec/settings");
    return unwrap(data);
  } catch (error) {
    return rethrow(error);
  }
}

export async function postOneCTest() {
  try {
    const { data } = await apiClient.post<ApiEnvelope>("/onec/test");
    return unwrap(data);
  } catch (error) {
    return rethrow(error);
  }
}

export async function postOneCSync() {
  try {
    const { data } = await apiClient.post<ApiEnvelope>("/onec/sync");
    return unwrap(data);
  } catch (error) {
    return rethrow(error);
  }
}

export async function fetchOneCLogs(
  params: { limit?: number } = {},
): Promise<OneCLog[]> {
  try {
    const { data } = await apiClient.get<ApiEnvelope>("/onec/logs", { params });
    const logs = unwrap(data).logs;
    return Array.isArray(logs) ? (logs as OneCLog[]) : [];
  } catch (error) {
    return rethrow(error);
  }
}

export async function postOneCExchangeCredentials() {
  try {
    const { data } = await apiClient.post<ApiEnvelope>("/onec/exchange-credentials");
    return unwrap(data) as {
      message?: string;
      credentials?: { password?: string; login?: string };
    };
  } catch (error) {
    return rethrow(error);
  }
}

export async function fetchOneCCategoryMappings(): Promise<OneCCategoryMapping[]> {
  try {
    const { data } = await apiClient.get<ApiEnvelope>("/onec/category-mappings");
    const mappings = unwrap(data).mappings;
    return Array.isArray(mappings) ? (mappings as OneCCategoryMapping[]) : [];
  } catch (error) {
    return rethrow(error);
  }
}

export async function putOneCCategoryMappings(
  items: Array<{ externalId: string; categoryId: string | null }>,
) {
  try {
    const { data } = await apiClient.put<ApiEnvelope>("/onec/category-mappings", {
      items,
    });
    return unwrap(data);
  } catch (error) {
    return rethrow(error);
  }
}

export async function fetchOneCImportJobs(
  params: { limit?: number } = {},
): Promise<OneCImportJob[]> {
  try {
    const { data } = await apiClient.get<ApiEnvelope>("/onec/import-jobs", { params });
    const jobs = unwrap(data).jobs;
    return Array.isArray(jobs) ? (jobs as OneCImportJob[]) : [];
  } catch (error) {
    return rethrow(error);
  }
}
