import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type InstallmentModerationSeller = {
  _id: string;
  userName?: string | null;
  email?: string | null;
};

export type InstallmentModerationBuyer = InstallmentModerationSeller;

export type PendingInstallmentPlan = {
  _id?: string;
  title?: string;
  monthsCount?: number;
  monthlyAmountRub?: number;
};

export type PendingInstallmentProgram = {
  productId: string;
  sellerId?: string;
  productName?: string | null;
  moderationStatus?: string;
  seller?: InstallmentModerationSeller | null;
  buyers?: InstallmentModerationBuyer[];
  plans: PendingInstallmentPlan[];
};

export type PendingInstallmentModerationQueue = {
  programs: PendingInstallmentProgram[];
};

export type InstallmentDispute = {
  _id: string;
  contractId: string;
  reason: string;
  status?: string;
  createdAt?: string;
  openedByUserId?: string;
  productName?: string | null;
  seller?: InstallmentModerationSeller | null;
  buyer?: InstallmentModerationBuyer | null;
};

export const fetchPendingInstallmentModeration = async (): Promise<PendingInstallmentModerationQueue> => {
  try {
    const { data } = await apiClient.get("/product/installment/moderation/pending");
    if (!data?.success || !Array.isArray(data.data?.programs)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return { programs: data.data.programs as PendingInstallmentProgram[] };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось загрузить очередь рассрочки"));
  }
};

export const approveInstallmentModeration = async (productId: string) => {
  try {
    const { data } = await apiClient.patch(
      `/product/${productId}/installment/moderation/approve`,
    );
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось одобрить программу"));
  }
};

export const rejectInstallmentModeration = async (
  productId: string,
  moderationComment = "",
) => {
  try {
    const { data } = await apiClient.patch(
      `/product/${productId}/installment/moderation/reject`,
      { moderationComment: moderationComment.trim() || undefined },
    );
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось отклонить программу"));
  }
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
