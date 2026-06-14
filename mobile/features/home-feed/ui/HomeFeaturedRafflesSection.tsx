import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import type { FeaturedRaffle } from "@/entities/raffle/api/fetchFeaturedRaffles";
import { HOME_FEED_UI, RAFFLE_FEATURED_UI } from "@/shared/config";
import { useHomeFeaturedRafflesStyles } from "@/shared/theme/catalogProductStyles";

type HomeFeaturedRafflesSectionProps = {
  raffles: FeaturedRaffle[];
};

export const HomeFeaturedRafflesSection = ({ raffles }: HomeFeaturedRafflesSectionProps) => {
  const router = useRouter();
  const styles = useHomeFeaturedRafflesStyles();

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
