import { useState } from "react";
import { AFFILIATE_QUERY_PARAM } from "@izibuy/shared-lib";
import { useQuery } from "@tanstack/react-query";

import { PRODUCT_DETAILS_MODAL_UI } from "../../../../shared/config/appUiCopy.js";
import { resolveProductAffiliateOffer } from "../../lib/resolveProductAffiliateOffer.js";
import { fetchMyReferralProgram } from "../../../user/api/referralProgram.js";
import { getProductSellerId } from "../../lib/getProductSellerId.js";

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
  const [status, setStatus] = useState("");

  const referralQuery = useQuery({
    queryKey: ["user", "me", "referral", "for-affiliate-share"],
    queryFn: fetchMyReferralProgram,
    enabled: isAuthorized && offer.enabled && !isOwn,
    staleTime: 60_000,
  });

  if (!offer.enabled || isOwn) {
    return null;
  }

  const handleClick = async () => {
    if (!isAuthorized) {
      onRequestLogin();
      return;
    }
    const code = String(referralQuery.data?.referralCode ?? "").trim();
    if (!code) {
      setStatus(PRODUCT_DETAILS_MODAL_UI.AFFILIATE_SHARE_FAILED);
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
      setStatus(PRODUCT_DETAILS_MODAL_UI.AFFILIATE_SHARE_COPIED);
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
      setStatus(PRODUCT_DETAILS_MODAL_UI.AFFILIATE_SHARE_FAILED);
    }
  };

  return (
    <div className="product-details-modal__affiliate-share">
      <p className="product-details-modal__affiliate-share-hint">
        {PRODUCT_DETAILS_MODAL_UI.AFFILIATE_PERCENT_HINT}
      </p>
      <button
        type="button"
        className="app-btn app-btn--secondary"
        onClick={() => {
          void handleClick();
        }}
        disabled={isAuthorized && referralQuery.isLoading}
      >
        {isAuthorized
          ? PRODUCT_DETAILS_MODAL_UI.AFFILIATE_SHARE
          : PRODUCT_DETAILS_MODAL_UI.AFFILIATE_SHARE_LOGIN}
      </button>
      {status ? (
        <p className="product-details-modal__affiliate-share-status" role="status">
          {status}
        </p>
      ) : null}
    </div>
  );
}
