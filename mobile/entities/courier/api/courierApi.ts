import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

const toMessage = (error: unknown) =>
  formatApiErrorMessage(error, API_CLIENT_UI.INVALID_SERVER_RESPONSE);

export type CourierProfile = {
  moderationStatus?: "none" | "pending" | "approved" | "rejected" | string;
  moderationComment?: string | null;
  vehicleMake?: string;
  vehicleColor?: string;
  vehiclePlate?: string;
  vehiclePhotoFrontUrl?: string;
  vehiclePhotoRearUrl?: string;
  driverLicensePhotoUrl?: string;
  vehicleRegistrationPhotoUrl?: string;
  hasAddress?: boolean;
  addressCity?: string | null;
};

export type CourierShipmentItem = {
  name?: string;
  productId?: string;
  quantity?: number;
  imageUrl?: string | null;
};

export type CourierFreeShipment = {
  orderId: string;
  sellerId: string;
  deliveryFeeRub?: number;
  distanceKm?: number | null;
  sellerName?: string;
  buyerName?: string;
  buyerId?: string;
  pickupAddress?: string;
  deliveryAreaHint?: string;
  items: CourierShipmentItem[];
};

export type CourierDelivery = {
  orderId: string;
  sellerId: string;
  status?: string;
  deliveryFeeRub?: number;
  sellerName?: string;
  sellerPhone?: string;
  buyerName?: string;
  buyerId?: string;
  buyerPhone?: string;
  pickupAddress?: string;
  deliveryAddress?: string;
  contactsUnlocked?: boolean;
  paymentMethod?: string;
  paymentConfirmed?: boolean;
  items: CourierShipmentItem[];
};

type Envelope = { success?: boolean; data?: Record<string, unknown> };

export async function fetchMyCourierProfile(): Promise<CourierProfile> {
  try {
    const { data } = await apiClient.get<Envelope>("/couriers/me");
    if (!data?.success || !data.data?.courier) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.courier as CourierProfile;
  } catch (error) {
    throw new Error(toMessage(error));
  }
}

export async function submitCourierApplication(
  payload: Record<string, string>,
): Promise<CourierProfile> {
  try {
    const { data } = await apiClient.post<Envelope>("/couriers/application", payload);
    if (!data?.success || !data.data?.courier) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.courier as CourierProfile;
  } catch (error) {
    throw new Error(toMessage(error));
  }
}

export async function fetchCourierOverview({
  lat = null,
  lon = null,
}: {
  lat?: number | null;
  lon?: number | null;
} = {}): Promise<{
  shipments: CourierFreeShipment[];
  regionCode?: string;
  radiusKm?: number;
}> {
  try {
    const params: Record<string, number> = {};
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      params.lat = Number(lat);
      params.lon = Number(lon);
    }
    const { data } = await apiClient.get<Envelope>("/couriers/overview", { params });
    if (!data?.success || !data.data) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    const shipments = Array.isArray(data.data.shipments)
      ? (data.data.shipments as CourierFreeShipment[])
      : [];
    return {
      shipments,
      regionCode: data.data.regionCode as string | undefined,
      radiusKm: data.data.radiusKm as number | undefined,
    };
  } catch (error) {
    throw new Error(toMessage(error));
  }
}

export async function fetchMyCourierDeliveries(): Promise<{
  deliveries: CourierDelivery[];
}> {
  try {
    const { data } = await apiClient.get<Envelope>("/couriers/my-deliveries");
    if (!data?.success || !data.data) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    const deliveries = Array.isArray(data.data.deliveries)
      ? (data.data.deliveries as CourierDelivery[])
      : [];
    return { deliveries };
  } catch (error) {
    throw new Error(toMessage(error));
  }
}

async function postCourierAction(path: string, body?: Record<string, unknown>) {
  try {
    const { data } = await apiClient.post<Envelope>(path, body);
    if (!data?.success || !data.data) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data;
  } catch (error) {
    throw new Error(toMessage(error));
  }
}

const shipmentBase = (orderId: string, sellerId: string) =>
  `/couriers/shipments/${orderId}/${sellerId}`;

export const acceptCourierShipment = ({
  orderId,
  sellerId,
}: {
  orderId: string;
  sellerId: string;
}) => postCourierAction(`${shipmentBase(orderId, sellerId)}/accept`);

export const confirmCourierHandover = ({
  orderId,
  sellerId,
  code,
}: {
  orderId: string;
  sellerId: string;
  code: string;
}) => postCourierAction(`${shipmentBase(orderId, sellerId)}/handover`, { code });

export const startCourierDelivery = ({
  orderId,
  sellerId,
}: {
  orderId: string;
  sellerId: string;
}) => postCourierAction(`${shipmentBase(orderId, sellerId)}/start-delivery`);

export const markCourierArrived = ({
  orderId,
  sellerId,
}: {
  orderId: string;
  sellerId: string;
}) => postCourierAction(`${shipmentBase(orderId, sellerId)}/arrived`);

export const completeCourierDelivery = ({
  orderId,
  sellerId,
  code,
}: {
  orderId: string;
  sellerId: string;
  code: string;
}) => postCourierAction(`${shipmentBase(orderId, sellerId)}/complete`, { code });

export const declineCourierShipment = ({
  orderId,
  sellerId,
}: {
  orderId: string;
  sellerId: string;
}) => postCourierAction(`${shipmentBase(orderId, sellerId)}/decline`);
