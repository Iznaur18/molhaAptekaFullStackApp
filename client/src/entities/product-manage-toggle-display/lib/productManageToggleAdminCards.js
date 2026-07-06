import { PRODUCT_MANAGE_TOGGLE_KEY_VALUES } from "@izibuy/shared-lib";

import { CREATE_PRODUCT_MODAL_UI } from "../../../shared/config/appUiCopy.js";

/** @type {Record<string, { variant: import("@izibuy/shared-lib").ProductManageToggleRowVariant; title: string; description: string; checked?: boolean }>} */
const MANAGE_TOGGLE_ADMIN_CARD_META = {
  auction: {
    variant: "auction",
    title: CREATE_PRODUCT_MODAL_UI.MANAGE_AUCTION_TITLE,
    description: CREATE_PRODUCT_MODAL_UI.MANAGE_AUCTION_HINT,
    checked: true,
  },
  installment: {
    variant: "installment",
    title: CREATE_PRODUCT_MODAL_UI.MANAGE_INSTALLMENT_TITLE,
    description: CREATE_PRODUCT_MODAL_UI.MANAGE_INSTALLMENT_HINT,
    checked: true,
  },
  raffle: {
    variant: "raffle",
    title: CREATE_PRODUCT_MODAL_UI.MANAGE_RAFFLE_TITLE,
    description: CREATE_PRODUCT_MODAL_UI.MANAGE_RAFFLE_HINT,
    checked: true,
  },
  visibility: {
    variant: "default",
    title: CREATE_PRODUCT_MODAL_UI.MANAGE_VISIBILITY_TITLE_VISIBLE,
    description: CREATE_PRODUCT_MODAL_UI.MANAGE_VISIBILITY_HINT_VISIBLE,
    checked: true,
  },
};

export const PRODUCT_MANAGE_TOGGLE_ADMIN_CARDS = PRODUCT_MANAGE_TOGGLE_KEY_VALUES.map(
  (toggleKey) => ({
    toggleKey,
    ...MANAGE_TOGGLE_ADMIN_CARD_META[toggleKey],
  }),
);
