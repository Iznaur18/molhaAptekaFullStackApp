import { MessageCircle } from "lucide-react";

import { PRODUCT_QA_UI } from "../../../../shared/config/appUiCopy.js";
import { ProductDetailsFeatureCard } from "./ProductDetailsFeatureCard.jsx";

/**
 * @param {{
 *   visible: boolean;
 *   onPress: () => void;
 * }} props
 */
export function ProductDetailsQaTeaser({ visible, onPress }) {
  if (!visible) {
    return null;
  }

  return (
    <ProductDetailsFeatureCard
      icon={MessageCircle}
      title={PRODUCT_QA_UI.DETAILS_TEASER_TITLE}
      subtitle={PRODUCT_QA_UI.DETAILS_TEASER_SUBTITLE}
      ariaLabel={PRODUCT_QA_UI.DETAILS_TEASER_ARIA}
      onClick={onPress}
    />
  );
}
