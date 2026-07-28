import { Pressable, StyleSheet, Text, View } from "react-native";

import { PRODUCT_PICKUP_UI } from "@/shared/config";
import { openYandexMapsRoute } from "@/shared/lib/openYandexMaps";
import { useProductDetailScreenStyles } from "@/shared/theme/catalogProductStyles";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";

type ProductPickupDetailsPanelProps = {
  product: Record<string, unknown>;
};

export const ProductPickupDetailsPanel = ({ product }: ProductPickupDetailsPanelProps) => {
  const styles = useProductDetailScreenStyles();
  const theme = useAppTheme();
  const address = String(product.productPickupAddress ?? "").trim();
  const lat =
    product.productPickupLat != null && Number.isFinite(Number(product.productPickupLat))
      ? Number(product.productPickupLat)
      : null;
  const lon =
    product.productPickupLon != null && Number.isFinite(Number(product.productPickupLon))
      ? Number(product.productPickupLon)
      : null;

  if (!address) {
    return <Text style={styles.descriptionText}>{PRODUCT_PICKUP_UI.DETAILS_NO_ADDRESS}</Text>;
  }

  const routeLabel =
    lat != null && lon != null
      ? PRODUCT_PICKUP_UI.DETAILS_ROUTE
      : PRODUCT_PICKUP_UI.DETAILS_OPEN_MAP;

  return (
    <View style={panelStyles.wrap}>
      <Text style={[panelStyles.title, { color: theme.colors.text }]}>
        {PRODUCT_PICKUP_UI.DETAILS_TITLE}
      </Text>
      <Text style={styles.descriptionText}>{address}</Text>
      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [
          panelStyles.routeButton,
          {
            borderColor: theme.colors.actionBorder,
            backgroundColor: pressed ? theme.colors.actionSoft : theme.colors.actionSurface,
          },
        ]}
        onPress={() => {
          void openYandexMapsRoute({ lat, lon, address });
        }}
      >
        <Text style={[panelStyles.routeButtonText, { color: theme.colors.action }]}>
          {routeLabel}
        </Text>
      </Pressable>
    </View>
  );
};

const panelStyles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
  },
  routeButton: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  routeButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
