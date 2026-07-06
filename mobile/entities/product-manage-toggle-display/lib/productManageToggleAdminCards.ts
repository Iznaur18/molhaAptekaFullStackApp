import { PRODUCT_MANAGE_TOGGLE_KEY_VALUES } from "@izibuy/shared-lib";

import { CREATE_PRODUCT_UI } from "@/shared/config";

const MANAGE_TOGGLE_ADMIN_CARD_META = {
  auction: {
    variant: "auction" as const,
    title: CREATE_PRODUCT_UI.MANAGE_AUCTION_TITLE,
    description: CREATE_PRODUCT_UI.MANAGE_AUCTION_HINT,
  },
  installment: {
    variant: "installment" as const,
    title: CREATE_PRODUCT_UI.MANAGE_INSTALLMENT_TITLE,
    description: CREATE_PRODUCT_UI.MANAGE_INSTALLMENT_HINT,
  },
  raffle: {
    variant: "raffle" as const,
    title: CREATE_PRODUCT_UI.MANAGE_RAFFLE_TITLE,
    description: CREATE_PRODUCT_UI.MANAGE_RAFFLE_HINT,
  },
  visibility: {
    variant: "default" as const,
    title: CREATE_PRODUCT_UI.MANAGE_VISIBILITY_TITLE_VISIBLE,
    description: CREATE_PRODUCT_UI.MANAGE_VISIBILITY_HINT_VISIBLE,
  },
};

export const PRODUCT_MANAGE_TOGGLE_ADMIN_CARDS = PRODUCT_MANAGE_TOGGLE_KEY_VALUES.map(
  (toggleKey) => ({
    toggleKey,
    ...MANAGE_TOGGLE_ADMIN_CARD_META[toggleKey],
  }),
);
