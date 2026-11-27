import { apiClient } from "@/shared/api";
import { formatApiErrorMessage } from "@/shared/lib";

export type CdekConnection = {
  connected: boolean;
  enabled?: boolean;
  accountMasked?: string;
  environment?: "prod" | "test";
  validatedAt?: string | null;
};

type CdekResponse = { success?: boolean; data?: { cdek?: CdekConnection } };

const rethrow = (error: unknown): never => {
  throw new Error(formatApiErrorMessage(error, "Не удалось связаться с СДЭК"));
};

export async function fetchCdekConnection(): Promise<CdekConnection | null> {
  try {
    const { data } = await apiClient.get<CdekResponse>("/user/me/cdek-credentials");
    return data?.data?.cdek ?? null;
  } catch (error) {
    return rethrow(error);
  }
}

export async function saveCdekConnection(credentials: {
  account: string;
  secure: string;
  environment?: "prod" | "test";
}): Promise<CdekConnection | null> {
  try {
    const { data } = await apiClient.put<CdekResponse>(
      "/user/me/cdek-credentials",
      credentials,
    );
    return data?.data?.cdek ?? null;
  } catch (error) {
    return rethrow(error);
  }
}

export async function removeCdekConnection(): Promise<CdekConnection | null> {
  try {
    const { data } = await apiClient.delete<CdekResponse>("/user/me/cdek-credentials");
    return data?.data?.cdek ?? null;
  } catch (error) {
    return rethrow(error);
  }
}

export async function toggleCdekConnection(
  enabled: boolean,
): Promise<CdekConnection | null> {
  try {
    const { data } = await apiClient.patch<CdekResponse>("/user/me/cdek-credentials", {
      enabled,
    });
    return data?.data?.cdek ?? null;
  } catch (error) {
    return rethrow(error);
  }
}
