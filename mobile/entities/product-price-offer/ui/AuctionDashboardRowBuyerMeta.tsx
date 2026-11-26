import { Pressable, Text, View } from "react-native";

import type { PriceOfferBuyerPreview } from "@/entities/product-price-offer/api/incomingPriceOffersApi";
import { UserPremiumDisplayName } from "@/entities/user/ui/UserPremiumDisplayName";
import { USER_LIST_ROW_UI } from "@/shared/config";
import { formatIsoDateTime } from "@/shared/lib";
import { useAuctionDashboardRowStyles } from "@/shared/theme/auctionPageStyles";

const AUCTION_BUYER_BADGE_SIZE = 14;

type AuctionDashboardRowBuyerMetaProps = {
  buyer?: PriceOfferBuyerPreview | null;
  createdAt?: string;
  onBuyerClick?: (userId: string) => void;
};

/** Паритет web meta: `buyer · date` в одной строке. */
export const AuctionDashboardRowBuyerMeta = ({
  buyer,
  createdAt,
  onBuyerClick,
}: AuctionDashboardRowBuyerMetaProps) => {
  const styles = useAuctionDashboardRowStyles();
  const buyerId = buyer?._id != null ? String(buyer._id) : null;
  const buyerName = buyer?.userName?.trim() || USER_LIST_ROW_UI.MISSING_NAME;
  const isBuyerClickable = Boolean(buyerId && onBuyerClick);
  const dateLabel = createdAt ? formatIsoDateTime(createdAt) : null;

  const buyerNameNode = (
    <UserPremiumDisplayName
      name={buyerName}
      isPremium={buyer?.isPremiumUser === true}
      isUserDataConfirmed={buyer?.isUserDataConfirmed === true}
      badgeSize={AUCTION_BUYER_BADGE_SIZE}
      textStyle={isBuyerClickable ? styles.metaBuyerNameLink : styles.metaBuyerName}
    />
  );

  return (
    <View style={styles.metaInline}>
      {isBuyerClickable ? (
        <Pressable
          style={styles.metaBuyerPressable}
          onPress={() => onBuyerClick?.(buyerId!)}
          accessibilityRole="button"
        >
          {buyerNameNode}
        </Pressable>
      ) : (
        buyerNameNode
      )}
      {dateLabel ? (
        <Text style={styles.metaDate} numberOfLines={1}>
          {" · "}
          {dateLabel}
        </Text>
      ) : null}
    </View>
  );
};
