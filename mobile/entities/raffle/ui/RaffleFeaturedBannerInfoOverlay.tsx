import { Pressable, ScrollView, Text, View } from "react-native";

import type { RaffleFromApi } from "@/entities/raffle/model/types";
import { RAFFLE_FEATURED_BANNER_UI } from "@/shared/config";
import { useRaffleFeaturedBannerStyles } from "@/shared/theme/raffleFeaturedStyles";

type RaffleFeaturedBannerInfoOverlayProps = {
  raffle: RaffleFromApi;
  visible: boolean;
  onToggle: () => void;
  onBackdropText?: boolean;
};

export const RaffleFeaturedBannerInfoOverlay = ({
  raffle,
  visible,
  onToggle,
  onBackdropText = false,
}: RaffleFeaturedBannerInfoOverlayProps) => {
  const styles = useRaffleFeaturedBannerStyles();
  const textStyle = onBackdropText ? styles.copyOnBackdrop : undefined;

  return (
    <>
      <Pressable
        style={[styles.infoToggle, visible && styles.infoToggleOpen]}
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
          <Text style={[styles.infoTitle, textStyle]}>{raffle.title}</Text>
          {raffle.description ? (
            <Text style={[styles.infoDescription, textStyle]}>{raffle.description}</Text>
          ) : null}
        </ScrollView>
      </View>
    </>
  );
};
