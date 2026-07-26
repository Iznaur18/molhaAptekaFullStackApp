import { useState } from "react";

import { resolvePriceOfferProductImageUrl } from "../lib/resolvePriceOfferProductImageUrl.js";

/**
 * @param {{
 *   product?: import('../model/types.js').PriceOfferProductPreview | null;
 * }} props
 */
export function AuctionDashboardProductThumb({ product }) {
  const [failed, setFailed] = useState(false);
  const imageUrl = failed ? null : resolvePriceOfferProductImageUrl(product);

  if (!imageUrl) {
    return (
      <span className="auction-dashboard-row__thumb auction-dashboard-row__thumb_placeholder">
        —
      </span>
    );
  }

  return (
    <img
      className="auction-dashboard-row__thumb"
      src={imageUrl}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
