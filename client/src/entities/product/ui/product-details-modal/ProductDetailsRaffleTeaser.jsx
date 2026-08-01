import { Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { isProductRaffleParticipant } from "../../../raffle/lib/isProductRaffleParticipant.js";
import { RAFFLE_FEATURED_BANNER_UI } from "../../../../shared/config/appUiCopy.js";
import { buildRafflePath } from "../../../../shared/lib/rafflePaths.js";
import { ProductDetailsFeatureCard } from "./ProductDetailsFeatureCard.jsx";

/**
 * @param {unknown} value
 * @returns {string}
 */
function resolveActiveRaffleId(value) {
  if (value == null) {
    return "";
  }
  if (typeof value === "object" && value !== null && "_id" in value) {
    return String(/** @type {{ _id: unknown }} */ (value)._id).trim();
  }
  return String(value).trim();
}

/**
 * @param {{
 *   product: import("../../model/types.js").ProductFromApi;
 * }} props
 */
export function ProductDetailsRaffleTeaser({ product }) {
  const navigate = useNavigate();
  const raffleId = resolveActiveRaffleId(product?.activeRaffleId);

  if (!isProductRaffleParticipant(product) || !raffleId) {
    return null;
  }

  return (
    <ProductDetailsFeatureCard
      icon={Gift}
      title={RAFFLE_FEATURED_BANNER_UI.DETAILS_TEASER_TITLE}
      subtitle={RAFFLE_FEATURED_BANNER_UI.DETAILS_TEASER_SUBTITLE}
      ariaLabel={RAFFLE_FEATURED_BANNER_UI.DETAILS_TEASER_ARIA}
      onClick={() => {
        navigate(buildRafflePath(raffleId));
      }}
    />
  );
}
