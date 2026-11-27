import { apiClient } from "@/shared/api";
import { formatApiErrorMessage } from "@/shared/lib";

export type YandexDeliveryDropoff = {
  stationId?: string;
  name?: string;
  address?: string;
  city?: string;
} | null;

export type YandexDeliveryConnection = {
  connected: boolean;
  enabled?: boolean;
  tokenMasked?: string;
  environment?: "prod" | "test";
  validatedAt?: string | null;
  dropoff?: YandexDeliveryDropoff;
};

export type YandexDropoffPoint = {
  id: string;
  name?: string;
  address?: string;
};

type YandexResponse = {
  success?: boolean;
  data?: { yandexDelivery?: YandexDeliveryConnection; points?: YandexDropoffPoint[] };
};

const PATH = "/user/me/yandex-delivery-credentials";

const rethrow = (error: unknown): never => {
  throw new Error(
    formatApiErrorMessage(error, "Не удалось связаться с Яндекс Доставкой"),
  );
};

export async function fetchYandexDeliveryConnection(): Promise<YandexDeliveryConnection | null> {
  try {
    const { data } = await apiClient.get<YandexResponse>(PATH);
    return data?.data?.yandexDelivery ?? null;
  } catch (error) {
    return rethrow(error);
  }
}

export async function saveYandexDeliveryConnection(payload: {
  token: string;
  environment?: "prod" | "test";
}): Promise<YandexDeliveryConnection | null> {
  try {
    const { data } = await apiClient.put<YandexResponse>(PATH, payload);
    return data?.data?.yandexDelivery ?? null;
  } catch (error) {
    return rethrow(error);
  }
}

export async function removeYandexDeliveryConnection(): Promise<YandexDeliveryConnection | null> {
  try {
    const { data } = await apiClient.delete<YandexResponse>(PATH);
    return data?.data?.yandexDelivery ?? null;
  } catch (error) {
    return rethrow(error);
  }
}

export async function toggleYandexDeliveryConnection(
  enabled: boolean,
): Promise<YandexDeliveryConnection | null> {
  try {
    const { data } = await apiClient.patch<YandexResponse>(PATH, { enabled });
    return data?.data?.yandexDelivery ?? null;
  } catch (error) {
    return rethrow(error);
  }
}

export async function fetchYandexDropoffPoints(
  city: string,
): Promise<YandexDropoffPoint[]> {
  try {
    const { data } = await apiClient.get<YandexResponse>(
      "/user/me/yandex-delivery-dropoff-points",
      { params: { city } },
    );
    return Array.isArray(data?.data?.points) ? data.data.points : [];
  } catch (error) {
    return rethrow(error);
  }
}

export async function saveYandexDropoff(
  stationId: string,
): Promise<YandexDeliveryConnection | null> {
  try {
    const { data } = await apiClient.put<YandexResponse>(
      "/user/me/yandex-delivery-dropoff",
      { stationId },
    );
    return data?.data?.yandexDelivery ?? null;
  } catch (error) {
    return rethrow(error);
  }
}
