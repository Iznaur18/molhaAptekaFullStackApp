import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

import type { PassportSnapshot } from "../lib/emptyPassportForm";

type SubmitDataConfirmationRequestBody = {
  passport: PassportSnapshot;
  passportSelfiePhotoUrl: string;
};

export const submitDataConfirmationRequest = async (
  body: SubmitDataConfirmationRequestBody,
): Promise<void> => {
  try {
    const { data } = await apiClient.post("/user/me/data-confirmation-request", body);

    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.SUBMIT_DATA_CONFIRMATION_FALLBACK));
  }
};
