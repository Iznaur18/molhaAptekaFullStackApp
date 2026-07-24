import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type ReferralProgramPayload = {
  referralCode: string;
  inviteUrl: string;
  cashbackPercent: number;
  partnerBalance: number;
  totalReferrals: number;
  totalReferralsSpend: number;
  totalCashbackEarned: number;
  referrals: Array<{
    userId: string;
    userName: string;
    registeredAt: string | null;
    isDeleted: boolean;
    pointsSpentTotal: number;
    cashbackEarnedTotal: number;
  }>;
};

export async function fetchMyReferralProgram(): Promise<ReferralProgramPayload> {
  try {
    const { data } = await apiClient.get("/user/me/referral");
    if (!data?.success || !data?.data) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data as ReferralProgramPayload;
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, "Не удалось загрузить партнёрскую программу"),
    );
  }
}

export async function convertPartnerBalance(
  amount: number,
  idempotencyKey?: string,
) {
  try {
    const payload: { amount: number; idempotencyKey?: string } = { amount };
    if (idempotencyKey) {
      payload.idempotencyKey = idempotencyKey;
    }
    const { data } = await apiClient.post("/user/me/referral/convert", payload);
    if (!data?.success || !data?.data) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data as {
      converted: number;
      partnerBalance: number;
      loyaltyPointsBalance: number;
    };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось конвертировать баланс"));
  }
}
