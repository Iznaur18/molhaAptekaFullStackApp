import { apiClient } from "@/shared/api";
import { API_CLIENT_UI, SAFE_DEAL_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

/** Заявка продавца на безопасную сделку (паритет web `model/types.js`). */
export type SellerSafeDeal = {
  moderationStatus: "none" | "pending" | "approved" | "rejected";
  legalForm: "" | "ip" | "ooo";
  inn: string;
  moderationComment: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  isApproved: boolean;
};

const readSafeDeal = (payload: unknown): SellerSafeDeal => {
  const data = payload as { success?: boolean; data?: { safeDeal?: unknown } } | null;
  if (!data?.success || data.data?.safeDeal == null) {
    throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
  }
  return data.data.safeDeal as SellerSafeDeal;
};

/** `GET /sellers/safe-deal/me` — статус собственной заявки. */
export const fetchMySellerSafeDeal = async (): Promise<SellerSafeDeal> => {
  try {
    const { data } = await apiClient.get("/sellers/safe-deal/me");
    return readSafeDeal(data);
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, SAFE_DEAL_UI.ERROR_GENERIC));
  }
};

/** `POST /sellers/safe-deal/application` — подать или переподать заявку. */
export const submitSellerSafeDealApplication = async (payload: {
  legalForm: string;
  inn: string;
}): Promise<SellerSafeDeal> => {
  try {
    const { data } = await apiClient.post("/sellers/safe-deal/application", payload);
    return readSafeDeal(data);
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, SAFE_DEAL_UI.ERROR_GENERIC));
  }
};
