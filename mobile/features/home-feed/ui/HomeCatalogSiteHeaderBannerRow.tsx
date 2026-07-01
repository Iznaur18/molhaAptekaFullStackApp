import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SiteHeaderBannerSlot } from "@/features/home-feed/ui/SiteHeaderBannerSlot";
import {
  resolveHomeCatalogHeaderShellInset,
} from "@/shared/lib/homeCatalogHeaderLayout";
import { useHomeCatalogHeaderStyles } from "@/shared/theme/homeCatalogHeaderStyles";

type HomeCatalogSiteHeaderBannerRowProps = {
  visible: boolean;
};

export const HomeCatalogSiteHeaderBannerRow = ({
  visible,
}: HomeCatalogSiteHeaderBannerRowProps) => {
  const insets = useSafeAreaInsets();
  const styles = useHomeCatalogHeaderStyles();
  const marginHorizontal = resolveHomeCatalogHeaderShellInset(insets);

  return (
    <View style={[styles.bannerBelowPanel, { marginHorizontal }]}>
      <SiteHeaderBannerSlot visible={visible} />
    </View>
  );
};
