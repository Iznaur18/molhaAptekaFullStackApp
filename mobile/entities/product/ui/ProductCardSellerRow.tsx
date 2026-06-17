import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";

import { getProductSellerProfile } from "@/entities/product/lib/getProductSellerProfile";
import { PRODUCT_CARD_BADGE_LAYOUT } from "@/entities/product/lib/productCardBadgePalette";
import { UserPremiumDisplayName } from "@/entities/user/ui/UserPremiumDisplayName";
import { PRODUCT_CARD_UI } from "@/shared/config";
import { useProductCardSellerRowStyles } from "@/shared/theme/catalogProductStyles";

type ProductCardSellerRowProps = {
  product: Record<string, unknown>;
};

export const ProductCardSellerRow = ({ product }: ProductCardSellerRowProps) => {
  const router = useRouter();
  const styles = useProductCardSellerRowStyles();
  const sellerProfile = getProductSellerProfile(product);

  if (!sellerProfile) {
    return null;
  }

  const { sellerId, displayName, isPremiumUser, isUserDataConfirmed } = sellerProfile;

  if (!sellerId) {
    return (
      <View style={styles.root}>
        <UserPremiumDisplayName
          name={displayName}
          isPremium={isPremiumUser}
          isUserDataConfirmed={isUserDataConfirmed}
          badgeSize={PRODUCT_CARD_BADGE_LAYOUT.sellerBadgeSize}
          textStyle={styles.nameTextPlain}
        />
      </View>
    );
  }

  const nameNode = (
    <UserPremiumDisplayName
      name={displayName}
      isPremium={isPremiumUser}
      isUserDataConfirmed={isUserDataConfirmed}
      badgeSize={PRODUCT_CARD_BADGE_LAYOUT.sellerBadgeSize}
      textStyle={styles.nameText}
    />
  );

  return (
    <Pressable
      style={styles.root}
      onPress={() => router.push({ pathname: "/seller/[userId]", params: { userId: sellerId } })}
      accessibilityRole="link"
      accessibilityLabel={PRODUCT_CARD_UI.SELLER_PROFILE_ARIA(displayName)}
    >
      {nameNode}
    </Pressable>
  );
};
