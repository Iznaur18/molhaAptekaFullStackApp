import { useRouter } from "expo-router";
import { useCallback } from "react";
import { View } from "react-native";

import type { RaffleFromApi } from "@/entities/raffle/model/types";
import { HomeFeaturedRafflesRevealButton } from "@/features/home-feed/ui/HomeFeaturedRafflesRevealButton";
import { HOME_FEED_UI } from "@/shared/config";
import { useRaffleFeaturedSectionStyles } from "@/shared/theme/raffleFeaturedStyles";

type HomeFeaturedRafflesSectionProps = {
  raffles: RaffleFromApi[];
};

export const HomeFeaturedRafflesSection = ({ raffles }: HomeFeaturedRafflesSectionProps) => {
  const sectionStyles = useRaffleFeaturedSectionStyles();
  const router = useRouter();
  const hasRaffles = raffles.length > 0;

  const openFirstRaffleProducts = useCallback(() => {
    const firstId = raffles[0]?._id;
    if (!firstId) {
      return;
    }
    router.push(`/raffle/${String(firstId)}` as never);
  }, [raffles, router]);

  if (!hasRaffles) {
    return null;
  }

  return (
    <View style={sectionStyles.root} accessibilityLabel={HOME_FEED_UI.RAFFLES_SECTION_ARIA}>
      <HomeFeaturedRafflesRevealButton onPress={openFirstRaffleProducts} />
    </View>
  );
};
