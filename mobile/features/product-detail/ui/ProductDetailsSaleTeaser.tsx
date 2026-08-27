import { Tag } from "@/shared/ui/productDetailsLucideIcons";
import { useRouter } from "expo-router";

import { getProductPurchaseLimit } from "@/entities/product/lib/getProductPurchaseLimit";
import { isProductOnSale } from "@/entities/product/lib/isProductOnSale";
import { PRODUCT_SALE_UI } from "@/shared/config";

import { ProductDetailsFeatureCard } from "@/entities/product/ui/ProductDetailsFeatureCard";

type ProductDetailsSaleTeaserProps = {
  product: Record<string, unknown>;
  sellerId: string;
};

export const ProductDetailsSaleTeaser = ({
  product,
  sellerId,
}: ProductDetailsSaleTeaserProps) => {
  const router = useRouter();
  const trimmedSellerId = sellerId.trim();

  if (!isProductOnSale(product) || trimmedSellerId.length === 0) {
    return null;
  }

  const remainingCount = getProductPurchaseLimit(product);

  return (
    <ProductDetailsFeatureCard
      icon={Tag}
      title={PRODUCT_SALE_UI.DETAILS_TEASER_TITLE}
      subtitle={PRODUCT_SALE_UI.DETAILS_TEASER_REMAINING(remainingCount)}
      ariaLabel={PRODUCT_SALE_UI.DETAILS_TEASER_ARIA}
      onPress={() => {
        router.push({ pathname: "/seller/[userId]", params: { userId: trimmedSellerId } });
      }}
    />
  );
};
