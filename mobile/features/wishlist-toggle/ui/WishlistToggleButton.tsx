import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet } from "react-native";

import { isCurrentUserProductSeller } from "@/entities/product/lib/isCurrentUserProductSeller";
import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { useWishlist } from "@/entities/wishlist/model/WishlistProvider";
import { WISHLIST_TOGGLE_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";

type WishlistToggleButtonProps = {
  productId: string;
  product?: {
    productSeller?: string | { _id?: string } | null;
  } | null;
  variant?: "card" | "inline" | "detailHero";
};

export const WishlistToggleButton = ({
  productId,
  product = null,
  variant = "card",
}: WishlistToggleButtonProps) => {
  const router = useRouter();
  const theme = useAppTheme();
  const isAuthorized = useIsAuthorized();
  const sessionQuery = useAuthSessionQuery();
  const { isInWishlist, toggleItem } = useWishlist();
  const id = String(productId);
  const currentUserId = sessionQuery.data?.user?._id ?? null;

  if (product && isCurrentUserProductSeller(product, currentUserId)) {
    return null;
  }

  const active = isInWishlist(id);

  const handlePress = () => {
    if (!isAuthorized) {
      router.push("/(auth)/login");
      return;
    }
    toggleItem(id);
  };

  return (
    <Pressable
      style={[
        styles.root,
        variant === "card" && styles.card,
        variant === "detailHero" && styles.detailHero,
        active && { backgroundColor: theme.colors.danger },
      ]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={active ? WISHLIST_TOGGLE_UI.REMOVE_ARIA : WISHLIST_TOGGLE_UI.ADD_ARIA}
      accessibilityState={{ selected: active }}
    >
      <MaterialIcons
        name={active ? "favorite" : "favorite-border"}
        size={variant === "card" || variant === "detailHero" ? 20 : 24}
        color={active ? theme.colors.onContrast : theme.colors.text}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    padding: 6,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  detailHero: {
    position: "absolute",
    top: 10.4,
    right: 10.4,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.92)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
});
