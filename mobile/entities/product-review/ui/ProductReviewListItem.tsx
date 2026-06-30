import { Text, View } from "react-native";

import { UserDataConfirmedBadge } from "@/entities/user/ui/UserDataConfirmedBadge";
import { UserPremiumVerifiedBadge } from "@/entities/user/ui/UserPremiumVerifiedBadge";
import { useProductDetailTabStyles } from "@/shared/theme/catalogProductStyles";

import type { ProductReview } from "../api/productReviewApi";

const STAR_VALUES = [1, 2, 3, 4, 5] as const;
const ANONYMOUS_AUTHOR = "Покупатель";

type ProductReviewListItemProps = {
  review: ProductReview;
};

export const ProductReviewListItem = ({ review }: ProductReviewListItemProps) => {
  const styles = useProductDetailTabStyles();
  const authorName = review.author?.userName?.trim() || ANONYMOUS_AUTHOR;
  const dateLabel = new Date(review.createdAt).toLocaleDateString("ru-RU");
  const isPremium = review.author?.isPremiumUser === true;
  const isUserDataConfirmed = review.author?.isUserDataConfirmed === true;

  return (
    <View style={styles.item}>
      <View style={styles.itemHeader}>
        <View style={styles.itemAuthor}>
          <Text style={styles.itemAuthorName} numberOfLines={1}>
            {authorName}
          </Text>
          {isPremium ? (
            <View style={styles.itemAuthorBadge}>
              <UserPremiumVerifiedBadge size={16} />
            </View>
          ) : null}
          {isUserDataConfirmed ? (
            <View style={styles.itemAuthorBadge}>
              <UserDataConfirmedBadge size={16} />
            </View>
          ) : null}
        </View>
        <Text style={styles.itemDate}>{dateLabel}</Text>
      </View>
      <View style={styles.itemStars}>
        {STAR_VALUES.map((value) => (
          <Text
            key={value}
            style={[
              styles.itemStarChar,
              value <= review.rating ? styles.itemStarActive : styles.itemStarMuted,
            ]}
          >
            ★
          </Text>
        ))}
      </View>
      {review.text?.trim() ? <Text style={styles.itemBody}>{review.text.trim()}</Text> : null}
    </View>
  );
};
