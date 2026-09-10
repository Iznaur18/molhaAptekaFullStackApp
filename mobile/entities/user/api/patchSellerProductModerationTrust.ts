import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export const patchSellerProductModerationTrust = async ({
  userId,
  trusted,
}: {
  userId: string;
  trusted: boolean;
}): Promise<{ productModerationTrusted: boolean }> => {
  try {
    const { data } = await apiClient.patch(
      `/staff/sellers/${encodeURIComponent(userId)}/product-moderation-trust`,
      { trusted },
    );
    const seller = data?.success ? data.data?.seller : null;
    if (!seller) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return { productModerationTrusted: seller.productModerationTrusted === true };
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.UPDATE_PROFILE_FALLBACK),
    );
  }
};
