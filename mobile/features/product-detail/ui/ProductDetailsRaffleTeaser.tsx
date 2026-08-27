import { Gift } from "@/shared/ui/productDetailsLucideIcons";
import { useRouter } from "expo-router";

import { isProductRaffleParticipant } from "@/entities/raffle/lib/isProductRaffleParticipant";
import { RAFFLE_FEATURED_BANNER_UI } from "@/shared/config";

import { ProductDetailsFeatureCard } from "@/entities/product/ui/ProductDetailsFeatureCard";

type ProductDetailsRaffleTeaserProps = {
  product: Record<string, unknown>;
};

const resolveActiveRaffleId = (value: unknown): string => {
  if (value == null) {
    return "";
  }
  if (typeof value === "object" && value !== null && "_id" in value) {
    return String((value as { _id: unknown })._id).trim();
  }
  return String(value).trim();
};

export const ProductDetailsRaffleTeaser = ({
  product,
}: ProductDetailsRaffleTeaserProps) => {
  const router = useRouter();
  const raffleId = resolveActiveRaffleId(product.activeRaffleId);

  if (!isProductRaffleParticipant(product) || !raffleId) {
    return null;
  }

  return (
    <ProductDetailsFeatureCard
      icon={Gift}
      title={RAFFLE_FEATURED_BANNER_UI.DETAILS_TEASER_TITLE}
      subtitle={RAFFLE_FEATURED_BANNER_UI.DETAILS_TEASER_SUBTITLE}
      ariaLabel={RAFFLE_FEATURED_BANNER_UI.DETAILS_TEASER_ARIA}
      onPress={() => {
        router.push({ pathname: "/raffle/[id]", params: { id: raffleId } });
      }}
    />
  );
};
