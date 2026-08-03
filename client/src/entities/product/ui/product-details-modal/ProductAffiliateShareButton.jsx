import { useEffect, useRef, useState } from "react";
import { Check, Share2 } from "lucide-react";
import { AFFILIATE_QUERY_PARAM } from "@izibuy/shared-lib";
import { useQuery } from "@tanstack/react-query";

import { PRODUCT_DETAILS_MODAL_UI } from "../../../../shared/config/appUiCopy.js";
import { resolveProductAffiliateOffer } from "../../lib/resolveProductAffiliateOffer.js";
import { fetchMyReferralProgram } from "../../../user/api/referralProgram.js";
import { getProductSellerId } from "../../lib/getProductSellerId.js";
import { ProductDetailsFeatureCard } from "./ProductDetailsFeatureCard.jsx";

const COPIED_ICON_MS = 1600;

/**
 * @param {{
 *   product: import("../../model/types.js").ProductFromApi;
 *   isAuthorized: boolean;
 *   currentUserId?: string | null;
 *   onRequestLogin: () => void;
 * }} props
 */
export function ProductAffiliateShareButton({
  product,
  isAuthorized,
  currentUserId = null,
  onRequestLogin,
}) {
  const offer = resolveProductAffiliateOffer(product);
  const sellerId = getProductSellerId(product);
  const isOwn =
    currentUserId != null &&
    sellerId != null &&
    String(currentUserId) === String(sellerId);
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef(/** @type {ReturnType<typeof setTimeout> | null} */ (null));

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
    enabled: isAuthorized && offer.enabled && !isOwn,
    staleTime: 60_000,
  });

  if (!offer.enabled || isOwn) {
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

  const handleClick = async () => {
    if (!isAuthorized) {
      onRequestLogin();
      return;
    }
    const code = String(referralQuery.data?.referralCode ?? "").trim();
    if (!code) {
      return;
    }
    const productId = String(product._id ?? "");
    const url = `${window.location.origin}/product/${encodeURIComponent(productId)}?${AFFILIATE_QUERY_PARAM}=${encodeURIComponent(code)}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const area = document.createElement("textarea");
        area.value = url;
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        area.remove();
      }
      flashCopied();
      if (typeof navigator.share === "function") {
        try {
          await navigator.share({
            title: String(product.productName ?? ""),
            url,
          });
        } catch {
          // user cancelled share — copy already done
        }
      }
    } catch {
      // copy/share unavailable
    }
  };

  const title = isAuthorized
    ? PRODUCT_DETAILS_MODAL_UI.AFFILIATE_SHARE_TITLE
    : PRODUCT_DETAILS_MODAL_UI.AFFILIATE_SHARE_LOGIN_TITLE;
  const subtitle = isAuthorized
    ? PRODUCT_DETAILS_MODAL_UI.AFFILIATE_SHARE_SUBTITLE(offer.percent)
    : PRODUCT_DETAILS_MODAL_UI.AFFILIATE_SHARE_LOGIN_SUBTITLE;
  const ariaLabel = isAuthorized
    ? PRODUCT_DETAILS_MODAL_UI.AFFILIATE_SHARE
    : PRODUCT_DETAILS_MODAL_UI.AFFILIATE_SHARE_LOGIN;

  return (
    <ProductDetailsFeatureCard
      icon={copied ? Check : Share2}
      title={title}
      subtitle={subtitle}
      ariaLabel={ariaLabel}
      disabled={isAuthorized && referralQuery.isLoading}
      onClick={() => {
        void handleClick();
      }}
    />
  );
}
