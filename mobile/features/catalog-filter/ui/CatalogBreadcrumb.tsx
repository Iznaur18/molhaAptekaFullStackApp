import { Text, View } from "react-native";

import { HOME_PAGE_UI } from "@/shared/config/homePageUi";
import { useCatalogBreadcrumbStyles } from "@/shared/theme/catalogProductStyles";

type CatalogBreadcrumbProps = {
  label: string | null;
};

export const CatalogBreadcrumb = ({ label }: CatalogBreadcrumbProps) => {
  const styles = useCatalogBreadcrumbStyles();

  if (!label) {
    return null;
  }

  return (
    <View
      style={styles.toolbar}
      accessibilityRole="text"
      accessibilityLabel={`${HOME_PAGE_UI.BREADCRUMB_CATALOG}: ${label}`}
    >
      <Text style={styles.current}>{label}</Text>
    </View>
  );
};
