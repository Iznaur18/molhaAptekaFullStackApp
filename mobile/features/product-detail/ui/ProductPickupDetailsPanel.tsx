import { Pressable, StyleSheet, Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

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
  const pickupOn = product.productPickupEnabled !== false;
  const deliveryOn = product.productDeliveryEnabled === true;
  const address = String(product.productPickupAddress ?? "").trim();
  const lat =
    product.productPickupLat != null && Number.isFinite(Number(product.productPickupLat))
      ? Number(product.productPickupLat)
      : null;
  const lon =
    product.productPickupLon != null && Number.isFinite(Number(product.productPickupLon))
      ? Number(product.productPickupLon)
      : null;

  if (!pickupOn && !deliveryOn) {
    return <Text style={styles.descriptionText}>{PRODUCT_PICKUP_UI.DETAILS_NO_ADDRESS}</Text>;
  }

  if (pickupOn && !address && !deliveryOn) {
    return <Text style={styles.descriptionText}>{PRODUCT_PICKUP_UI.DETAILS_NO_ADDRESS}</Text>;
  }

  const routeLabel =
    lat != null && lon != null
      ? PRODUCT_PICKUP_UI.DETAILS_ROUTE
      : PRODUCT_PICKUP_UI.DETAILS_OPEN_MAP;

  return (
    <View style={panelStyles.wrap}>
      {pickupOn ? (
        address ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${PRODUCT_PICKUP_UI.DETAILS_TITLE}: ${routeLabel}`}
            style={({ pressed }) => [
              styles.featureCard,
              panelStyles.pickupCard,
              {
                backgroundColor: pressed ? theme.colors.actionSoft : theme.colors.surface,
                borderColor: pressed ? theme.colors.actionBorder : theme.colors.border,
              },
            ]}
            onPress={() => {
              void openYandexMapsRoute({ lat, lon, address });
            }}
          >
            <View style={styles.featureCardIcon}>
              <MaterialIcons name="place" size={20} color={theme.colors.action} />
            </View>
            <View style={styles.featureCardText}>
              <Text style={styles.featureCardTitle}>{PRODUCT_PICKUP_UI.DETAILS_TITLE}</Text>
              <Text style={styles.featureCardSubtitle}>{address}</Text>
              <View
                style={[
                  panelStyles.action,
                  { backgroundColor: theme.colors.surfaceMuted, alignSelf: "flex-start" },
                ]}
              >
                <Text style={[panelStyles.actionText, { color: theme.colors.action }]}>
                  {routeLabel}
                </Text>
              </View>
            </View>
          </Pressable>
        ) : (
          <View style={styles.featureCard}>
            <View style={styles.featureCardIcon}>
              <MaterialIcons name="place" size={20} color={theme.colors.action} />
            </View>
            <View style={styles.featureCardText}>
              <Text style={styles.featureCardTitle}>{PRODUCT_PICKUP_UI.DETAILS_TITLE}</Text>
              <Text style={[styles.featureCardSubtitle, { color: theme.colors.textMuted }]}>
                {PRODUCT_PICKUP_UI.DETAILS_NO_ADDRESS}
              </Text>
            </View>
          </View>
        )
      ) : null}
      {deliveryOn ? (
        <View style={styles.featureCard}>
          <View style={styles.featureCardIcon}>
            <MaterialIcons name="local-shipping" size={20} color={theme.colors.action} />
          </View>
          <View style={styles.featureCardText}>
            <Text style={styles.featureCardTitle}>{PRODUCT_PICKUP_UI.FULFILLMENT_DELIVERY}</Text>
            <Text style={[styles.featureCardSubtitle, { color: theme.colors.textMuted }]}>
              {PRODUCT_PICKUP_UI.DETAILS_DELIVERY_HINT}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
};

const panelStyles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  pickupCard: {
    alignItems: "flex-start",
  },
  action: {
    marginTop: 6,
    maxWidth: 160,
    paddingVertical: 8,
    paddingHorizontal: 11,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 15,
    textAlign: "center",
  },
});
