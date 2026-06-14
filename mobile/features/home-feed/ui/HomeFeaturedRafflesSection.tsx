import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import type { FeaturedRaffle } from "@/entities/raffle/api/fetchFeaturedRaffles";
import { HOME_FEED_UI, RAFFLE_FEATURED_UI } from "@/shared/config";

type HomeFeaturedRafflesSectionProps = {
  raffles: FeaturedRaffle[];
};

export const HomeFeaturedRafflesSection = ({ raffles }: HomeFeaturedRafflesSectionProps) => {
  const router = useRouter();

  if (raffles.length === 0) {
    return null;
  }

  return (
    <View accessibilityLabel={HOME_FEED_UI.RAFFLES_SECTION_ARIA}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {raffles.map((raffle) => (
          <Pressable
            key={raffle._id}
            style={styles.card}
            onPress={() => router.push(`/raffle/${raffle._id}` as never)}
          >
            <Text style={styles.badge}>{RAFFLE_FEATURED_UI.BADGE}</Text>
            <Text style={styles.title}>{raffle.title?.trim() || "Розыгрыш"}</Text>
            {raffle.description ? (
              <Text style={styles.description} numberOfLines={2}>
                {raffle.description}
              </Text>
            ) : null}
            <Text style={styles.cta}>{RAFFLE_FEATURED_UI.OPEN_PRODUCTS}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 8,
    paddingBottom: 12,
    gap: 10,
  },
  card: {
    width: 260,
    borderRadius: 12,
    backgroundColor: "#fff4e5",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#f0c987",
    padding: 14,
  },
  badge: {
    fontSize: 11,
    fontWeight: "700",
    color: "#b45309",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: "#555",
    lineHeight: 18,
    marginBottom: 8,
  },
  cta: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1f6feb",
  },
});
