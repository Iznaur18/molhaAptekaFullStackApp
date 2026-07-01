import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

import type { PassportSnapshot } from "@/entities/user-data-confirmation/lib/emptyPassportForm";

export type DataConfirmationRequest = {
  _id: string;
  createdAt?: string;
  passport?: Partial<PassportSnapshot>;
  passportSelfiePhotoUrl?: string | null;
  user?: { _id?: string; userName?: string; isPremiumUser?: boolean } | null;
};

export const fetchPendingDataConfirmationRequests = async () => {
  try {
    const { data } = await apiClient.get("/user/data-confirmation-requests/pending");
    if (!data?.success || !Array.isArray(data.data?.requests)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.requests as DataConfirmationRequest[];
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.FETCH_DATA_CONFIRMATION_QUEUE_FALLBACK),
    );
  }
};

export const resolveDataConfirmationRequest = async (
  requestId: string,
  body: { resolution: string; staffNote?: string },
) => {
  try {
    const { data } = await apiClient.patch(
      `/user/data-confirmation-requests/${requestId}/resolve`,
      body,
    );
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.RESOLVE_DATA_CONFIRMATION_FALLBACK),
    );
  }
};
