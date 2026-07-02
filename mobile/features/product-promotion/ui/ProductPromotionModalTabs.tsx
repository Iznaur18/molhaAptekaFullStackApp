import { CREATE_PRODUCT_UI, PRODUCT_PROMOTION_UI } from "@/shared/config";
import { ModalSectionTabs } from "@/shared/ui/ModalSectionTabs";

import {
  PRODUCT_PROMOTION_MODAL_TAB_MANAGE,
  PRODUCT_PROMOTION_MODAL_TAB_PROMOTION,
} from "@/features/product-promotion/lib/productPromotionModalTabs";

type ProductPromotionModalTabsProps = {
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  showManageTab: boolean;
};

export const ProductPromotionModalTabs = ({
  activeTabId,
  onTabChange,
  showManageTab,
}: ProductPromotionModalTabsProps) => {
  const tabs = [
    { id: PRODUCT_PROMOTION_MODAL_TAB_PROMOTION, label: PRODUCT_PROMOTION_UI.TAB_PROMOTION },
  ];

  if (showManageTab) {
    tabs.push({
      id: PRODUCT_PROMOTION_MODAL_TAB_MANAGE,
      label: CREATE_PRODUCT_UI.MANAGE_SECTION_TITLE,
    });
  }

  return (
    <ModalSectionTabs
      tabs={tabs}
      activeTabId={activeTabId}
      onTabChange={onTabChange}
      ariaLabel={PRODUCT_PROMOTION_UI.TABS_ARIA}
      variant="inHeader"
    />
  );
};
