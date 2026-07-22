import { Pressable, ScrollView, Text, View } from "react-native";

import type { RaffleFromApi } from "@/entities/raffle/model/types";
import { RAFFLE_FEATURED_BANNER_UI } from "@/shared/config";
import { useRaffleFeaturedBannerStyles } from "@/shared/theme/raffleFeaturedStyles";

type RaffleFeaturedBannerInfoOverlayProps = {
  raffle: RaffleFromApi;
  visible: boolean;
  onToggle: () => void;
};

export const RaffleFeaturedBannerInfoToggle = ({
  visible,
  onToggle,
}: Pick<RaffleFeaturedBannerInfoOverlayProps, "visible" | "onToggle">) => {
  const styles = useRaffleFeaturedBannerStyles();

  return (
    <Pressable
      style={styles.infoToggleButton}
      accessibilityRole="button"
      accessibilityState={{ expanded: visible }}
      accessibilityLabel={
        visible
          ? RAFFLE_FEATURED_BANNER_UI.INFO_TOGGLE_CLOSE_ARIA
          : RAFFLE_FEATURED_BANNER_UI.INFO_TOGGLE_OPEN_ARIA
      }
      onPress={onToggle}
    >
      <Text style={styles.infoToggleText}>!</Text>
    </Pressable>
  );
};

export const RaffleFeaturedBannerInfoPanel = ({
  raffle,
  visible,
}: Pick<RaffleFeaturedBannerInfoOverlayProps, "raffle" | "visible">) => {
  const styles = useRaffleFeaturedBannerStyles();

  return (
    <View
      style={[styles.infoPanel, visible && styles.infoPanelOpen]}
      accessibilityElementsHidden={!visible}
      importantForAccessibility={visible ? "yes" : "no-hide-descendants"}
      pointerEvents={visible ? "auto" : "none"}
    >
      <ScrollView
        style={styles.infoPanelScroll}
        contentContainerStyle={styles.infoPanelContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.infoTitle}>{raffle.title}</Text>
        {raffle.description ? (
          <Text style={styles.infoDescription}>{raffle.description}</Text>
        ) : null}
      </ScrollView>
    </View>
  );
};

export const RaffleFeaturedBannerInfoOverlay = ({
  raffle,
  visible,
  onToggle,
}: RaffleFeaturedBannerInfoOverlayProps) => (
  <>
    <RaffleFeaturedBannerInfoToggle visible={visible} onToggle={onToggle} />
    <RaffleFeaturedBannerInfoPanel raffle={raffle} visible={visible} />
  </>
);
