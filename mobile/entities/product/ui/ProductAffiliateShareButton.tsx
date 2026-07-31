import { useState } from "react";
import { Pressable, Share, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { AFFILIATE_QUERY_PARAM } from "@izibuy/shared-lib";
import * as Clipboard from "expo-clipboard";

import { getProductSellerId } from "@/entities/product/lib/getProductSellerId";
import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { fetchMyReferralProgram } from "@/entities/user/api/referralProgram";
import { PRODUCT_DETAILS_MODAL_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";

type ProductAffiliateShareButtonProps = {
  product: Record<string, unknown>;
  onRequestLogin: () => void;
};

export const ProductAffiliateShareButton = ({
  product,
  onRequestLogin,
}: ProductAffiliateShareButtonProps) => {
  const theme = useAppTheme();
  const isAuthorized = useIsAuthorized();
  const sessionQuery = useAuthSessionQuery();
  const enabled = product.affiliateEnabled === true;
  const percent = Math.floor(Number(product.affiliatePercent) || 0);
  const sellerId = getProductSellerId(product);
  const currentUserId =
    sessionQuery.data?.user?._id != null
      ? String(sessionQuery.data.user._id)
      : null;
  const isOwn =
    currentUserId != null &&
    sellerId != null &&
    currentUserId === String(sellerId);
  const [status, setStatus] = useState("");

  const referralQuery = useQuery({
    queryKey: ["user", "me", "referral", "for-affiliate-share"],
    queryFn: fetchMyReferralProgram,
    enabled: isAuthorized && enabled && percent > 0 && !isOwn,
    staleTime: 60_000,
  });

  if (!enabled || percent <= 0 || isOwn) {
    return null;
  }

  const handlePress = async () => {
    if (!isAuthorized) {
      onRequestLogin();
      return;
    }
    const code = String(referralQuery.data?.referralCode ?? "").trim();
    const productId = String(product._id ?? "");
    if (!code || !productId) {
      setStatus(PRODUCT_DETAILS_MODAL_UI.AFFILIATE_SHARE_FAILED);
      return;
    }
    const url = `https://izibuy.ru/product/${encodeURIComponent(productId)}?${AFFILIATE_QUERY_PARAM}=${encodeURIComponent(code)}`;
    try {
      await Clipboard.setStringAsync(url);
      setStatus(PRODUCT_DETAILS_MODAL_UI.AFFILIATE_SHARE_COPIED);
      try {
        await Share.share({ message: url, url });
      } catch {
        // cancelled
      }
    } catch {
      setStatus(PRODUCT_DETAILS_MODAL_UI.AFFILIATE_SHARE_FAILED);
    }
  };

  return (
    <View style={{ gap: 8, marginTop: 10 }}>
      <Text style={{ fontSize: 13, color: theme.colors.textMuted }}>
        {PRODUCT_DETAILS_MODAL_UI.AFFILIATE_PERCENT_HINT}
      </Text>
      <Pressable
        onPress={() => {
          void handlePress();
        }}
        disabled={isAuthorized && referralQuery.isLoading}
        style={{
          alignSelf: "flex-start",
          paddingVertical: 10,
          paddingHorizontal: 14,
          borderRadius: 10,
          backgroundColor: theme.colors.surfaceElevated,
          borderWidth: 1,
          borderColor: theme.colors.border,
        }}
      >
        <Text style={{ fontWeight: "700", color: theme.colors.text }}>
          {isAuthorized
            ? PRODUCT_DETAILS_MODAL_UI.AFFILIATE_SHARE
            : PRODUCT_DETAILS_MODAL_UI.AFFILIATE_SHARE_LOGIN}
        </Text>
      </Pressable>
      {status ? (
        <Text style={{ fontSize: 12, color: theme.colors.textMuted }}>{status}</Text>
      ) : null}
    </View>
  );
};
