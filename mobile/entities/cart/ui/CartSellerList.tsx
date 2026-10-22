import { Feather } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { hasMixedDeliveryCarriers, type CartSellerGroup } from "@izibuy/shared-lib";

import { resolveCartGroupDeliveryHint } from "@/entities/cart/lib/resolveCartGroupDeliveryHint";
import type { CartCheckoutSummary } from "@/entities/cart/lib/selectCartCheckoutSummary";
import type { CartLine } from "@/entities/cart/lib/selectCartLines";
import { resolveProductImageUrl } from "@/entities/product/lib/resolveProductImageUrl";
import { pickUserProfilePhotoUrl } from "@/entities/user/lib/pickUserProfilePhotoUrl";
import { getUserAvatarFocus } from "@/entities/user/lib/profileImageFocus";
import { DEFAULT_USER_AVATAR_URL } from "@/entities/user/model/constants";
import { UserPremiumAvatar } from "@/entities/user/ui/UserPremiumAvatar";
import { UserPremiumDisplayName } from "@/entities/user/ui/UserPremiumDisplayName";
import { CART_PAGE_UI } from "@/shared/config";
import { formatPriceRub } from "@/shared/lib";
import { formatLoyaltyPointsAmount } from "@molha/api-contract";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import {
  CART_SELLER_ROW_STACK_MAX_WIDTH,
  useCartSellerListStyles,
} from "@/shared/theme/cartFulfillmentStyles";
import { CachedProductImage } from "@/shared/ui/CachedProductImage";

export type CartSellerEntry = {
  group: CartSellerGroup<CartLine>;
  summary: CartCheckoutSummary;
  productIds: string[];
};

/** Подпись о доставке в строке продавца; пусто — подсказать нечего. */
const formatDeliveryHint = (
  group: CartSellerGroup<CartLine>,
  goodsTotalRub: number,
): string => {
  const hint = resolveCartGroupDeliveryHint(group, goodsTotalRub);
  if (!hint) return "";
  if (hint.kind === "free") return CART_PAGE_UI.DELIVERY_HINT_FREE;
  if (hint.kind === "from") {
    return CART_PAGE_UI.DELIVERY_HINT_FROM(formatPriceRub(hint.baseFeeRub));
  }
  return CART_PAGE_UI.DELIVERY_HINT_BY_TARIFF;
};

const CartSellerRow = ({
  group,
  summary,
  onOpen,
}: {
  group: CartSellerGroup<CartLine>;
  summary: CartCheckoutSummary;
  onOpen: (cartGroupId: string) => void;
}) => {
  const styles = useCartSellerListStyles();
  const theme = useAppTheme();
  const { width: windowWidth } = useWindowDimensions();
  const isStacked = windowWidth <= CART_SELLER_ROW_STACK_MAX_WIDTH;
  const [avatarFailed, setAvatarFailed] = useState(false);

  const sellerForPhoto = useMemo(
    () => ({
      userAvatarUrl: group.sellerAvatarUrl,
      userAvatarFocus: group.sellerAvatarFocus,
    }),
    [group.sellerAvatarFocus, group.sellerAvatarUrl],
  );
  const picked = pickUserProfilePhotoUrl(sellerForPhoto);
  const avatarUri = !avatarFailed && picked ? picked : DEFAULT_USER_AVATAR_URL;
  const sellerName = group.sellerName.trim() || CART_PAGE_UI.SECTION_SELLER_FALLBACK;
  // Товары за баллы — отдельный заказ у того же продавца, и строка своя.
  const displayName = group.paidWithLoyaltyPoints
    ? `${sellerName} · ${CART_PAGE_UI.POINTS_GROUP_SUFFIX}`
    : sellerName;

  const itemsCount = summary.selectedLines.reduce(
    (sum, line) => sum + (Number(line.quantity) || 0),
    0,
  );
  const countForLabel = itemsCount > 0 ? itemsCount : group.lines.length;
  // Отмеченные товары везут разные службы — предупреждаем ещё до оформления.
  const mixedCarriers = hasMixedDeliveryCarriers(
    summary.selectedLines.map((line) => line.product),
  );
  // Цена доставки — ещё в списке, а не только на оформлении.
  const deliveryHint = mixedCarriers
    ? ""
    : formatDeliveryHint(group, summary.selectedTotal);
  const open = () => onOpen(group.cartGroupId);

  return (
    <View style={styles.row}>
      <View style={[styles.top, isStacked && styles.topStacked]}>
        <Pressable
          style={styles.main}
          onPress={open}
          accessibilityRole="button"
          accessibilityLabel={displayName}
        >
          <UserPremiumAvatar
            uri={avatarUri}
            isPremium={group.isPremiumUser}
            focus={getUserAvatarFocus(sellerForPhoto)}
            onError={() => setAvatarFailed(true)}
            style={styles.avatar}
          />
          <View style={styles.body}>
            <UserPremiumDisplayName
              name={displayName}
              isPremium={group.isPremiumUser}
              isUserDataConfirmed={group.isUserDataConfirmed}
              textStyle={styles.name}
              singleLine
            />
            <Text style={styles.meta}>
              {CART_PAGE_UI.ITEMS_COUNT(countForLabel)}
              {deliveryHint ? ` · ${deliveryHint}` : ""}
            </Text>
          </View>
        </Pressable>

        <Pressable
          style={[styles.checkout, isStacked && styles.checkoutStacked]}
          onPress={open}
          accessibilityRole="button"
        >
          <Text style={styles.checkoutPrice}>
            {group.paidWithLoyaltyPoints
              ? formatLoyaltyPointsAmount(summary.selectedPointsTotal)
              : formatPriceRub(summary.selectedTotal)}
          </Text>
          <View style={styles.checkoutLabel}>
            <Text style={styles.checkoutLabelText}>{CART_PAGE_UI.SELLER_ROW_OPEN}</Text>
            <Feather name="chevron-right" size={16} color={theme.colors.onContrast} />
          </View>
        </Pressable>
      </View>

      {group.lines.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.thumbs}
          contentContainerStyle={styles.thumbsContent}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {group.lines.map((line) => (
            <CachedProductImage
              key={line.productId}
              uri={resolveProductImageUrl(line.product)}
              style={styles.thumb}
            />
          ))}
        </ScrollView>
      ) : null}

      {mixedCarriers ? (
        <Text style={styles.note}>{CART_PAGE_UI.MIXED_CARRIERS_NOTE}</Text>
      ) : null}
    </View>
  );
};

/** Общий экран корзины: продавцы блоками, оформление — внутри продавца. */
export const CartSellerList = ({
  entries,
  onOpenSeller,
}: {
  entries: CartSellerEntry[];
  onOpenSeller: (cartGroupId: string) => void;
}) => {
  const styles = useCartSellerListStyles();

  if (entries.length === 0) {
    return null;
  }

  return (
    <View style={styles.list}>
      {entries.map(({ group, summary }) => (
        <CartSellerRow
          key={group.cartGroupId || "unknown-seller"}
          group={group}
          summary={summary}
          onOpen={onOpenSeller}
        />
      ))}
    </View>
  );
};
