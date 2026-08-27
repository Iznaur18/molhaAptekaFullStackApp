import { Share2 } from "@/shared/ui/productDetailsLucideIcons";
import { useState } from "react";
import { Share, Text } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { AFFILIATE_QUERY_PARAM } from "@izibuy/shared-lib";
import * as Clipboard from "expo-clipboard";

import { getProductSellerId } from "@/entities/product/lib/getProductSellerId";
import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { fetchMyReferralProgram } from "@/entities/user/api/referralProgram";
import { ProductDetailsFeatureCard } from "@/entities/product/ui/ProductDetailsFeatureCard";
import { PRODUCT_DETAILS_MODAL_UI } from "@/shared/config";
import { WEB_APP_BASE_URL } from "@/shared/config/webAppBaseUrl";
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
      <ProductDetailsFeatureCard
        icon={Share2}
        title={title}
        subtitle={subtitle}
        ariaLabel={
          isAuthorized
            ? PRODUCT_DETAILS_MODAL_UI.AFFILIATE_SHARE
            : PRODUCT_DETAILS_MODAL_UI.AFFILIATE_SHARE_LOGIN
        }
        onPress={() => {
          void handlePress();
        }}
        disabled={busy}
      />
      {status ? (
        <Text style={{ fontSize: 12, color: theme.colors.textMuted }}>{status}</Text>
      ) : null}
    </>
  );
};
