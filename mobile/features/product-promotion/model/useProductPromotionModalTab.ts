import { useEffect, useState } from "react";

import {
  PRODUCT_PROMOTION_MODAL_DEFAULT_TAB,
  PRODUCT_PROMOTION_MODAL_TAB_MANAGE,
  PRODUCT_PROMOTION_MODAL_TAB_PROMOTION,
  type ProductPromotionModalTabId,
} from "@/features/product-promotion/lib/productPromotionModalTabs";

type UseProductPromotionModalTabParams = {
  visible: boolean;
  showManageTab: boolean;
};

export const useProductPromotionModalTab = ({
  visible,
  showManageTab,
}: UseProductPromotionModalTabParams) => {
  const [activeTabId, setActiveTabId] = useState<ProductPromotionModalTabId>(
    PRODUCT_PROMOTION_MODAL_DEFAULT_TAB,
  );

  useEffect(() => {
    if (!visible) {
      setActiveTabId(PRODUCT_PROMOTION_MODAL_DEFAULT_TAB);
      return;
    }

    if (activeTabId === PRODUCT_PROMOTION_MODAL_TAB_MANAGE && !showManageTab) {
      setActiveTabId(PRODUCT_PROMOTION_MODAL_DEFAULT_TAB);
    }
  }, [activeTabId, showManageTab, visible]);

  return {
    activeTabId,
    setActiveTabId,
    isPromotionTab: activeTabId === PRODUCT_PROMOTION_MODAL_TAB_PROMOTION,
    isManageTab: activeTabId === PRODUCT_PROMOTION_MODAL_TAB_MANAGE,
  };
};
