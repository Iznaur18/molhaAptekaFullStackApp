import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { isProductRaffleParticipant } from "@/entities/raffle/lib/isProductRaffleParticipant";
import { RAFFLE_FEATURED_BANNER_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useProductDetailScreenStyles } from "@/shared/theme/catalogProductStyles";

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
  const theme = useAppTheme();
  const styles = useProductDetailScreenStyles();
  const router = useRouter();
  const raffleId = resolveActiveRaffleId(product.activeRaffleId);

  if (!isProductRaffleParticipant(product) || !raffleId) {
    return null;
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.featureCard,
        pressed ? { opacity: 0.92, borderColor: theme.colors.actionBorder } : null,
      ]}
      onPress={() => {
        router.push({ pathname: "/raffle/[id]", params: { id: raffleId } });
      }}
      accessibilityRole="button"
      accessibilityLabel={RAFFLE_FEATURED_BANNER_UI.DETAILS_TEASER_ARIA}
    >
      <View style={styles.featureCardIcon}>
        <MaterialIcons name="card-giftcard" size={20} color={theme.colors.action} />
      </View>
      <View style={styles.featureCardText}>
        <Text style={styles.featureCardTitle}>
          {RAFFLE_FEATURED_BANNER_UI.DETAILS_TEASER_TITLE}
        </Text>
        <Text style={styles.featureCardSubtitle}>
          {RAFFLE_FEATURED_BANNER_UI.DETAILS_TEASER_SUBTITLE}
        </Text>
      </View>
      <MaterialIcons
        name="chevron-right"
        size={22}
        color={theme.colors.action}
        style={styles.featureCardChevron}
      />
    </Pressable>
  );
};
