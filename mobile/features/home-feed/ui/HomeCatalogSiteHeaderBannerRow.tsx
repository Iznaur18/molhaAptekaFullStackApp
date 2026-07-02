import { View } from "react-native";

import { SiteHeaderBannerSlot } from "@/features/home-feed/ui/SiteHeaderBannerSlot";
import { useHomeCatalogHeaderStyles } from "@/shared/theme/homeCatalogHeaderStyles";

type HomeCatalogSiteHeaderBannerRowProps = {
  visible: boolean;
};

export const HomeCatalogSiteHeaderBannerRow = ({
  visible,
}: HomeCatalogSiteHeaderBannerRowProps) => {
  const styles = useHomeCatalogHeaderStyles();

  return (
    <View style={[styles.bannerBelowPanel, styles.bannerListHeaderFullWidth]}>
      <SiteHeaderBannerSlot visible={visible} />
    </View>
  );
};
