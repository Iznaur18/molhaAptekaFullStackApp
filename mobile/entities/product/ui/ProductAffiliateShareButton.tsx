import { Check, Share2 } from "@/shared/ui/productDetailsLucideIcons";
import { useEffect, useRef, useState } from "react";
import { Share } from "react-native";
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

const COPIED_ICON_MS = 1600;

type ProductAffiliateShareButtonProps = {
  product: Record<string, unknown>;
  onRequestLogin: () => void;
};

export const ProductAffiliateShareButton = ({
  product,
  onRequestLogin,
}: ProductAffiliateShareButtonProps) => {
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
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current != null) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const referralQuery = useQuery({
    queryKey: ["user", "me", "referral", "for-affiliate-share"],
    queryFn: fetchMyReferralProgram,
    enabled: isAuthorized && enabled && percent > 0 && !isOwn,
    staleTime: 60_000,
  });

  if (!enabled || percent <= 0 || isOwn) {
    return null;
  }

  const flashCopied = () => {
    setCopied(true);
    if (resetTimerRef.current != null) {
      clearTimeout(resetTimerRef.current);
    }
    resetTimerRef.current = setTimeout(() => {
      setCopied(false);
      resetTimerRef.current = null;
    }, COPIED_ICON_MS);
  };

  const handlePress = async () => {
    if (!isAuthorized) {
      onRequestLogin();
      return;
    }
    const code = String(referralQuery.data?.referralCode ?? "").trim();
    const productId = String(product._id ?? "");
    if (!code || !productId) {
      return;
    }
    const origin = WEB_APP_BASE_URL.replace(/\/$/, "");
    const url = `${origin}/product/${encodeURIComponent(productId)}?${AFFILIATE_QUERY_PARAM}=${encodeURIComponent(code)}`;
    try {
      await Clipboard.setStringAsync(url);
      try {
        await Share.share({ message: url });
      } catch {
        // cancelled
      }
      flashCopied();
    } catch {
      // parity: web logs only, no inline status
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
    <ProductDetailsFeatureCard
      icon={copied ? Check : Share2}
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
  );
};
