import { Pressable, Text, View } from "react-native";

import { HOME_PAGE_UI } from "@/shared/config/homePageUi";
import { useCatalogCityFilterBannerStyles } from "@/shared/theme/catalogProductStyles";

type CatalogCityFilterBannerProps = {
  cityLabel: string;
  onShowAllCities: () => void;
};

export const CatalogCityFilterBanner = ({
  cityLabel,
  onShowAllCities,
}: CatalogCityFilterBannerProps) => {
  const styles = useCatalogCityFilterBannerStyles();

  return (
    <View style={styles.root} accessibilityRole="text">
      <Text style={styles.text}>{HOME_PAGE_UI.CATALOG_CITY_FILTER_BANNER(cityLabel)}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={onShowAllCities}
        hitSlop={8}
      >
        <Text style={styles.action}>{HOME_PAGE_UI.CATALOG_CITY_FILTER_SHOW_ALL}</Text>
      </Pressable>
    </View>
  );
};
