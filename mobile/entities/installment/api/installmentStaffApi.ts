import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type InstallmentDisputeParty = {
  _id: string;
  userName?: string | null;
  email?: string | null;
};

export type InstallmentDispute = {
  _id: string;
  contractId: string;
  reason: string;
  status?: string;
  createdAt?: string;
  openedByUserId?: string;
  productName?: string | null;
  seller?: InstallmentDisputeParty | null;
  buyer?: InstallmentDisputeParty | null;
};

export const fetchPendingInstallmentDisputes = async () => {
  try {
    const { data } = await apiClient.get("/installment/disputes/pending");
    if (!data?.success || !Array.isArray(data.data?.disputes)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.disputes as InstallmentDispute[];
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось загрузить споры"));
  }
};

export const resolveInstallmentDispute = async (
  disputeId: string,
  body: { action: string; resolutionNote?: string; partialRefundRub?: number },
) => {
  try {
    const { data } = await apiClient.patch(`/installment/disputes/${disputeId}/resolve`, body);
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось закрыть спор"));
  }
};
