import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import type { TopPriceOffer } from "@/entities/product-price-offer/api/fetchTopPriceOffers";
import { UserPremiumDisplayName } from "@/entities/user/ui/UserPremiumDisplayName";
import { PRODUCT_PRICE_OFFER_UI, USER_LIST_ROW_UI } from "@/shared/config";
import { formatPriceRub } from "@/shared/lib";
import { useProductPriceOfferStyles } from "@/shared/theme/catalogProductStyles";

type ProductPriceOfferTopListProps = {
  top: TopPriceOffer[];
  highlightedOfferId?: string | null;
};

export const ProductPriceOfferTopList = ({
  top,
  highlightedOfferId = null,
}: ProductPriceOfferTopListProps) => {
  const router = useRouter();
  const styles = useProductPriceOfferStyles();

  if (top.length === 0) {
    return <Text style={styles.empty}>{PRODUCT_PRICE_OFFER_UI.EMPTY_TOP}</Text>;
  }

  return (
    <View style={styles.topList}>
      {top.map((row, index) => {
        const buyer = row.buyer;
        const userId = buyer?._id != null ? String(buyer._id) : null;
        const name = buyer?.userName?.trim() || USER_LIST_ROW_UI.MISSING_NAME;
        const canOpen = Boolean(userId);
        const isMine =
          highlightedOfferId != null && String(row._id) === String(highlightedOfferId);

        return (
          <View
            key={String(row._id)}
            style={[styles.topItem, isMine ? styles.topItemMine : null]}
          >
            <Text style={[styles.topRank, isMine ? styles.topRankMine : null]}>
              {index + 1}
            </Text>
            {canOpen ? (
              <Pressable
                style={styles.topBuyerPressable}
                onPress={() => router.push({ pathname: "/user/[id]", params: { id: userId! } })}
                accessibilityRole="link"
              >
                <UserPremiumDisplayName
                  name={name}
                  isPremium={buyer?.isPremiumUser === true}
                  isUserDataConfirmed={buyer?.isUserDataConfirmed === true}
                  textStyle={styles.topBuyerName}
                />
              </Pressable>
            ) : (
              <View style={styles.topBuyerPressable}>
                <UserPremiumDisplayName
                  name={name}
                  isPremium={buyer?.isPremiumUser === true}
                  isUserDataConfirmed={buyer?.isUserDataConfirmed === true}
                  textStyle={styles.topBuyerName}
                />
              </View>
            )}
            <Text style={[styles.topPrice, isMine ? styles.topPriceMine : null]}>
              {formatPriceRub(row.offerPrice)}
            </Text>
          </View>
        );
      })}
    </View>
  );
};
