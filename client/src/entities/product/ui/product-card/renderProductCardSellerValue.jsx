import { COMMON_UI, PRODUCT_CARD_UI } from "../../../../shared/config/appUiCopy.js";
import { UserPremiumDisplayName } from "../../../user/ui/UserPremiumDisplayName.jsx";

/**
 * @param {{
 *   raw: unknown;
 *   display: string;
 *   onSellerNameClick?: (userId: string) => void;
 * }} params
 */
export function renderProductCardSellerValue({ raw, display, onSellerNameClick }) {
  const isPopulatedSeller = raw != null && typeof raw === "object" && raw._id != null;
  if (!isPopulatedSeller || display === COMMON_UI.EM_DASH) {
    return display;
  }

  const canOpenSellerProfile =
    typeof onSellerNameClick === "function" && display !== COMMON_UI.EM_DASH;

  const nameNode = (
    <UserPremiumDisplayName
      name={display}
      isPremium={raw.isPremiumUser === true}
      isUserDataConfirmed={raw.isUserDataConfirmed === true}
      className="product-card__seller-display-name"
      textClassName="product-card__seller-display-name__text"
    />
  );

  if (canOpenSellerProfile) {
    return (
      <button
        type="button"
        className="product-card__seller-name"
        aria-label={PRODUCT_CARD_UI.SELLER_PROFILE_ARIA(display)}
        onClick={(event) => {
          event.stopPropagation();
          onSellerNameClick(String(raw._id));
        }}
      >
        {nameNode}
      </button>
    );
  }

  return nameNode;
}
