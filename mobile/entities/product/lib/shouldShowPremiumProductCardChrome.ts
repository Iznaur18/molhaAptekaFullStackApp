import { isPremiumActive } from "@/entities/user/lib/isPremiumActive";

type PremiumChromeProduct = Record<string, unknown>;

type ShouldShowPremiumProductCardChromeOptions = {
  product: PremiumChromeProduct;
  isMineMode?: boolean;
  isModerationQueue?: boolean;
};

export const shouldShowPremiumProductCardChrome = ({
  product,
  isMineMode = false,
  isModerationQueue = false,
}: ShouldShowPremiumProductCardChromeOptions): boolean => {
  if (isMineMode || isModerationQueue) {
    return false;
  }

  const seller = product.productSeller;
  if (seller == null || typeof seller !== "object") {
    return false;
  }

  return isPremiumActive(
    seller as { isPremiumUser?: boolean; premiumExpiresAt?: string | Date | null },
  );
};
