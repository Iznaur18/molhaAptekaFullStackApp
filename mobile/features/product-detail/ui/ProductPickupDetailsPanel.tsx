import { productPickupLocationsFromProduct } from "@molha/api-contract";
import { Pressable, Text, View } from "react-native";

import { PRODUCT_PICKUP_DETAILS_PANEL_LAYOUT as PL } from "@/entities/product/lib/productPickupDetailsPanelLayout";
import { PRODUCT_PICKUP_UI } from "@/shared/config";
import { openYandexMapsRoute } from "@/shared/lib/openYandexMaps";
import { useAppThemeSettings } from "@/shared/theme/AppThemeProvider";
import {
  useProductDetailScreenStyles,
  useProductPickupDetailsPanelStyles,
} from "@/shared/theme/catalogProductStyles";
import { MapPin, Truck } from "@/shared/ui/productDetailsLucideIcons";

type ProductPickupDetailsPanelProps = {
  product: Record<string, unknown>;
};

export const ProductPickupDetailsPanel = ({ product }: ProductPickupDetailsPanelProps) => {
  const detailStyles = useProductDetailScreenStyles();
  const styles = useProductPickupDetailsPanelStyles();
  const { colorScheme } = useAppThemeSettings();
  const isDark = colorScheme === "dark";

  const pickupOn = product.productPickupEnabled !== false;
  const deliveryOn = product.productDeliveryEnabled === true;
  const locations = productPickupLocationsFromProduct(product);

  if (!pickupOn && !deliveryOn) {
    return <Text style={detailStyles.descriptionText}>{PRODUCT_PICKUP_UI.DETAILS_NO_ADDRESS}</Text>;
  }

  if (pickupOn && locations.length === 0 && !deliveryOn) {
    return <Text style={detailStyles.descriptionText}>{PRODUCT_PICKUP_UI.DETAILS_NO_ADDRESS}</Text>;
  }

  return (
    <View style={styles.panel}>
      {pickupOn
        ? locations.map((location) => {
            const address = String(location.address ?? "").trim();
            const lat =
              location.lat != null && Number.isFinite(Number(location.lat))
                ? Number(location.lat)
                : null;
            const lon =
              location.lon != null && Number.isFinite(Number(location.lon))
                ? Number(location.lon)
                : null;
            const routeLabel =
              lat != null && lon != null
                ? PRODUCT_PICKUP_UI.DETAILS_ROUTE
                : PRODUCT_PICKUP_UI.DETAILS_OPEN_MAP;
            const title = location.label
              ? `${PRODUCT_PICKUP_UI.DETAILS_TITLE}: ${location.label}`
              : PRODUCT_PICKUP_UI.DETAILS_TITLE;
            const subtitle = [
              address,
              location.isDefault ? ` · ${PRODUCT_PICKUP_UI.DETAILS_LOCATION_DEFAULT}` : "",
            ].join("");

            return (
              <Pressable
                key={location.id}
                accessibilityRole="button"
                accessibilityLabel={`${title}: ${routeLabel}`}
                style={({ pressed }) => [
                  styles.method,
                  pressed ? styles.methodPressed : null,
                ]}
                onPress={() => {
                  void openYandexMapsRoute({ lat, lon, address });
                }}
              >
                <View style={styles.iconWrap}>
                  <MapPin
                    size={PL.iconGlyphSize}
                    color={styles.iconColor.color}
                    strokeWidth={PL.iconStrokeWidth}
                  />
                </View>
                <View style={styles.textWrap}>
                  <Text style={[styles.title, isDark && styles.titleDark]}>{title}</Text>
                  <Text style={styles.subtitle}>{subtitle}</Text>
                </View>
                <View style={styles.action}>
                  <Text style={styles.actionText}>{routeLabel}</Text>
                </View>
              </Pressable>
            );
          })
        : null}
      {deliveryOn ? (
        <View style={styles.method}>
          <View style={styles.iconWrap}>
            <Truck
              size={PL.iconGlyphSize}
              color={styles.iconColor.color}
              strokeWidth={PL.iconStrokeWidth}
            />
          </View>
          <View style={styles.textWrap}>
            <Text style={[styles.title, isDark && styles.titleDark]}>
              {PRODUCT_PICKUP_UI.FULFILLMENT_DELIVERY}
            </Text>
            <Text style={[styles.subtitle, styles.subtitleMuted]}>
              {PRODUCT_PICKUP_UI.DETAILS_DELIVERY_HINT}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
};
