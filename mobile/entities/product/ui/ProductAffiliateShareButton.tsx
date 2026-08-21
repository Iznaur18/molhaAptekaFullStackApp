import { useState } from "react";
import { Pressable, Share, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import { AFFILIATE_QUERY_PARAM } from "@izibuy/shared-lib";
import * as Clipboard from "expo-clipboard";

import { getProductSellerId } from "@/entities/product/lib/getProductSellerId";
import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { fetchMyReferralProgram } from "@/entities/user/api/referralProgram";
import { PRODUCT_DETAILS_MODAL_UI } from "@/shared/config";
import { WEB_APP_BASE_URL } from "@/shared/config/webAppBaseUrl";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useProductDetailScreenStyles } from "@/shared/theme/catalogProductStyles";

type ProductAffiliateShareButtonProps = {
  product: Record<string, unknown>;
  onRequestLogin: () => void;
};

export const ProductAffiliateShareButton = ({
  product,
  onRequestLogin,
}: ProductAffiliateShareButtonProps) => {
  const theme = useAppTheme();
  const styles = useProductDetailScreenStyles();
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
    const origin = WEB_APP_BASE_URL.replace(/\/$/, "");
    const url = `${origin}/product/${encodeURIComponent(productId)}?${AFFILIATE_QUERY_PARAM}=${encodeURIComponent(code)}`;
    try {
      await Clipboard.setStringAsync(url);
      setStatus(PRODUCT_DETAILS_MODAL_UI.AFFILIATE_SHARE_COPIED);
      try {
        await Share.share({ message: url });
      } catch {
        // cancelled
      }
    } catch {
      setStatus(PRODUCT_DETAILS_MODAL_UI.AFFILIATE_SHARE_FAILED);
    }
  };

  const title = isAuthorized
    ? PRODUCT_DETAILS_MODAL_UI.AFFILIATE_SHARE_TITLE
    : PRODUCT_DETAILS_MODAL_UI.AFFILIATE_SHARE_LOGIN_TITLE;
  const subtitle = isAuthorized
    ? PRODUCT_DETAILS_MODAL_UI.AFFILIATE_SHARE_SUBTITLE(percent)
    : PRODUCT_DETAILS_MODAL_UI.AFFILIATE_SHARE_LOGIN_SUBTITLE;
  const busy = isAuthorized && referralQuery.isLoading;

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          isAuthorized
            ? PRODUCT_DETAILS_MODAL_UI.AFFILIATE_SHARE
            : PRODUCT_DETAILS_MODAL_UI.AFFILIATE_SHARE_LOGIN
        }
        onPress={() => {
          void handlePress();
        }}
        disabled={busy}
        style={({ pressed }) => [
          styles.featureCard,
          {
            opacity: busy ? 0.65 : pressed ? 0.92 : 1,
            borderColor: pressed ? theme.colors.actionBorder : "transparent",
          },
        ]}
      >
        <View style={styles.featureCardIcon}>
          <Feather name="share-2" size={20} color={theme.colors.action} />
        </View>
        <View style={styles.featureCardText}>
          <Text style={styles.featureCardTitle}>{title}</Text>
          <Text style={styles.featureCardSubtitle}>{subtitle}</Text>
        </View>
        <Feather
          name="chevron-right"
          size={22}
          color={theme.colors.action}
          style={styles.featureCardChevron}
        />
      </Pressable>
      {status ? (
        <Text style={{ fontSize: 12, color: theme.colors.textMuted }}>{status}</Text>
      ) : null}
    </>
  );
};
