import { PRODUCT_PROMOTION_UI } from "@/shared/config";
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
  const tabs: { id: string; label: string }[] = [
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
      variant="segment"
    />
  );
};
