import { useState } from "react";

import { SellerPersonalCategoryCampaignModerationSection } from "../../intro-ad-moderation/ui/SellerPersonalCategoryCampaignModerationSection.jsx";
import { SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI } from "../../../shared/config/appUiCopy.js";

import "./SellerPersonalCategoryModerationPage.css";

/**
 * @param {{
 *   refreshPendingSellerPersonalCategoryModerationCount?: () => void;
 * }} props
 */
export function SellerPersonalCategoryModerationPage({
  refreshPendingSellerPersonalCategoryModerationCount,
}) {
  const [actionError, setActionError] = useState("");

  return (
    <section
      className="seller-personal-category-moderation-page"
      aria-label={SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.TITLE}
    >
      <SellerPersonalCategoryCampaignModerationSection
        onQueueChanged={refreshPendingSellerPersonalCategoryModerationCount}
        actionError={actionError}
        onActionError={setActionError}
      />
    </section>
  );
}
