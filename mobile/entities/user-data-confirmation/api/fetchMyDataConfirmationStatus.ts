import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type DataConfirmationRequest = {
  status?: string;
  staffNote?: string | null;
} | null;

export type MyDataConfirmationStatus = {
  isUserDataConfirmed: boolean;
  request: DataConfirmationRequest;
};

export const fetchMyDataConfirmationStatus = async (): Promise<MyDataConfirmationStatus> => {
  try {
    const { data } = await apiClient.get("/user/me/data-confirmation-request");
    if (!data?.success || data.data == null) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return {
      isUserDataConfirmed: data.data.isUserDataConfirmed === true,
      request: data.data.request ?? null,
    };
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.FETCH_DATA_CONFIRMATION_STATUS_FALLBACK),
    );
  }
};
