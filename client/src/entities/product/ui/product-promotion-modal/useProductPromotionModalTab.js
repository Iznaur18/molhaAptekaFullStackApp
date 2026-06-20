import { useEffect, useState } from "react";

import {
  PRODUCT_PROMOTION_MODAL_DEFAULT_TAB,
  PRODUCT_PROMOTION_MODAL_TAB_MANAGE,
  PRODUCT_PROMOTION_MODAL_TAB_PROMOTION,
} from "./productPromotionModalTabs.js";

/**
 * @param {{
 *   isOpen: boolean;
 *   showManageTab: boolean;
 * }} params
 */
export function useProductPromotionModalTab({ isOpen, showManageTab }) {
  const [activeTabId, setActiveTabId] = useState(PRODUCT_PROMOTION_MODAL_DEFAULT_TAB);

  useEffect(() => {
    if (!isOpen) {
      setActiveTabId(PRODUCT_PROMOTION_MODAL_DEFAULT_TAB);
      return;
    }

    if (activeTabId === PRODUCT_PROMOTION_MODAL_TAB_MANAGE && !showManageTab) {
      setActiveTabId(PRODUCT_PROMOTION_MODAL_DEFAULT_TAB);
    }
  }, [activeTabId, isOpen, showManageTab]);

  return {
    activeTabId,
    setActiveTabId,
    isPromotionTab: activeTabId === PRODUCT_PROMOTION_MODAL_TAB_PROMOTION,
    isManageTab: activeTabId === PRODUCT_PROMOTION_MODAL_TAB_MANAGE,
  };
}
