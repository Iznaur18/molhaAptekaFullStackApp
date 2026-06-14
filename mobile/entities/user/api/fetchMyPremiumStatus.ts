import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type MyPremiumStatus = {
  isActive: boolean;
  premiumExpiresAt: string | null;
  canPurchase: boolean;
  pricePoints: number;
  loyaltyPointsBalance: number;
};

export const fetchMyPremiumStatus = async (): Promise<MyPremiumStatus> => {
  try {
    const { data } = await apiClient.get("/user/me/premium/status");
    if (!data?.success || !data.data) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    const loyaltyPointsBalance = Number(data.data.loyaltyPointsBalance);
    return {
      isActive: Boolean(data.data.isActive),
      premiumExpiresAt:
        typeof data.data.premiumExpiresAt === "string" ? data.data.premiumExpiresAt : null,
      canPurchase: Boolean(data.data.canPurchase),
      pricePoints: Number(data.data.pricePoints) || 0,
      loyaltyPointsBalance: Number.isFinite(loyaltyPointsBalance) ? loyaltyPointsBalance : 0,
    };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.FETCH_PREMIUM_STATUS_FALLBACK));
  }
};
