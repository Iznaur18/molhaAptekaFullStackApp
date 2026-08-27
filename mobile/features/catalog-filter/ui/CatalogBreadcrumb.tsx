import { Text, View } from "react-native";

import { HOME_PAGE_UI } from "@/shared/config/homePageUi";
import { useCatalogBreadcrumbStyles } from "@/shared/theme/catalogProductStyles";

type CatalogBreadcrumbProps = {
  label: string | null;
  compactTop?: boolean;
};

export const CatalogBreadcrumb = ({ label, compactTop = false }: CatalogBreadcrumbProps) => {
  const styles = useCatalogBreadcrumbStyles();

  if (!label) {
    return null;
  }

  return (
    <View style={[styles.toolbar, compactTop && styles.toolbarCompactTop]}>
      <Text
        style={[styles.title, compactTop && styles.titleCompactTop]}
        accessibilityRole="header"
        accessibilityLabel={`${HOME_PAGE_UI.BREADCRUMB_CATALOG}: ${label}`}
      >
        {label}
      </Text>
    </View>
  );
};
