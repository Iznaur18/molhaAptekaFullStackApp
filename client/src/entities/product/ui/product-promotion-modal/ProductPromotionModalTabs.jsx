import { PRODUCT_PROMOTION_UI } from "../../../../shared/config/appUiCopy.js";
import { ModalSectionTabs } from "../../../../shared/ui/ModalSectionTabs/ModalSectionTabs.jsx";
import {
  PRODUCT_PROMOTION_MODAL_TAB_MANAGE,
  PRODUCT_PROMOTION_MODAL_TAB_PROMOTION,
} from "./productPromotionModalTabs.js";

/**
 * @param {{
 *   activeTabId: string;
 *   onTabChange: (tabId: string) => void;
 *   showManageTab: boolean;
 * }} props
 */
export function ProductPromotionModalTabs({
  activeTabId,
  onTabChange,
  showManageTab,
}) {
  const tabs = [
    { id: PRODUCT_PROMOTION_MODAL_TAB_PROMOTION, label: PRODUCT_PROMOTION_UI.TAB_PROMOTION },
  ];

  if (showManageTab) {
    tabs.push({
      id: PRODUCT_PROMOTION_MODAL_TAB_MANAGE,
      label: PRODUCT_PROMOTION_UI.TAB_MANAGE,
    });
  }

  return (
    <ModalSectionTabs
      tabs={tabs}
      activeTabId={activeTabId}
      onTabChange={onTabChange}
      ariaLabel={PRODUCT_PROMOTION_UI.TABS_ARIA}
      className="modal-section-tabs_in-header"
    />
  );
}
