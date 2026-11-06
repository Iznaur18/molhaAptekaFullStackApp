import {
  CATEGORY_DEAL_TYPE_SERVICE,
  PRODUCT_DELIVERY_CARRIER_GITORG,
  PRODUCT_DELIVERY_CARRIER_LABEL_RU,
  PRODUCT_DELIVERY_CARRIER_LOBO,
  PRODUCT_SERVICE_LOCATION_LABELS_RU,
  isCartDealType,
  normalizeCategoryDealType,
  normalizeProductServiceLocations,
  productPickupLocationsFromProduct,
  productShipsToBuyer,
  resolveProductDeliveryCarrier,
} from "@molha/api-contract";
import { Pressable, Text, View } from "react-native";

import { PRODUCT_PICKUP_DETAILS_PANEL_LAYOUT as PL } from "@/entities/product/lib/productPickupDetailsPanelLayout";
import { PRODUCT_PICKUP_UI } from "@/shared/config";
import { openYandexMapsRoute } from "@/shared/lib/openYandexMaps";
import { useAppThemeSettings } from "@/shared/theme/AppThemeProvider";
import {
  useProductDetailScreenStyles,
  useProductPickupDetailsPanelStyles,
} from "@/shared/theme/catalogProductStyles";
import {
  Building2,
  Car,
  MapPin,
  MonitorSmartphone,
  Truck,
  type LucideIcon,
} from "@/shared/ui/productDetailsLucideIcons";

/** Иконка к каждому месту оказания услуги (паритет web). */
const SERVICE_LOCATION_ICONS: Record<string, LucideIcon> = {
  at_client: Car,
  at_provider: Building2,
  online: MonitorSmartphone,
};

type ProductPickupDetailsPanelProps = {
  product: Record<string, unknown>;
};

/** Вкладка «Получение» / «Осмотр» / «Адрес» — паритет web `ProductPickupDetailsPanel`. */
export const ProductPickupDetailsPanel = ({
  product,
}: ProductPickupDetailsPanelProps) => {
  const detailStyles = useProductDetailScreenStyles();
  const styles = useProductPickupDetailsPanelStyles();
  const { colorScheme } = useAppThemeSettings();
  const isDark = colorScheme === "dark";

  // Авто, недвижимость и услуги: адрес — место встречи, доставки нет. Флаги
  // самовывоза и доставки на товаре остаются, но покупателю их не показываем.
  const dealType = normalizeCategoryDealType(product.productDealType);
  const isCartDeal = isCartDealType(dealType);
  const pickupOn = !isCartDeal || product.productPickupEnabled !== false;
  // Перевозчик — из поля товара: у ЛОБО старые флаги доставки сняты.
  const deliveryOn = isCartDeal && productShipsToBuyer(product);
  const detailsTitle = isCartDeal
    ? PRODUCT_PICKUP_UI.DETAILS_TITLE
    : (PRODUCT_PICKUP_UI.DEAL_DETAILS_TITLE[dealType] ??
      PRODUCT_PICKUP_UI.DETAILS_TITLE);
  const noAddressLabel = isCartDeal
    ? PRODUCT_PICKUP_UI.DETAILS_NO_ADDRESS
    : (PRODUCT_PICKUP_UI.DEAL_DETAILS_NO_ADDRESS[dealType] ??
      PRODUCT_PICKUP_UI.DETAILS_NO_ADDRESS);
  const carrier = resolveProductDeliveryCarrier(product);
  const locations = productPickupLocationsFromProduct(product);
  // Услуга: где её оказывают — рядом с адресом, это про то же «куда идти».
  const serviceLocations: string[] =
    dealType === CATEGORY_DEAL_TYPE_SERVICE
      ? normalizeProductServiceLocations(product.productServiceLocations)
      : [];

  const serviceLocationRows = serviceLocations.map((value) => {
    const Icon = SERVICE_LOCATION_ICONS[value] ?? MapPin;
    return (
      <View key={value} style={styles.method}>
        <View style={styles.iconWrap}>
          <Icon
            size={PL.iconGlyphSize}
            color={styles.iconColor.color}
            strokeWidth={PL.iconStrokeWidth}
          />
        </View>
        <View style={styles.textWrap}>
          <Text style={[styles.title, isDark && styles.titleDark]}>
            {(PRODUCT_SERVICE_LOCATION_LABELS_RU as Record<string, string>)[value]}
          </Text>
          <Text style={[styles.subtitle, styles.subtitleMuted]}>
            {PRODUCT_PICKUP_UI.DEAL_SERVICE_LOCATION_HINTS[value]}
          </Text>
        </View>
      </View>
    );
  });

  const noAddress = (
    <>
      <Text style={detailStyles.descriptionText}>{noAddressLabel}</Text>
      {serviceLocationRows.length > 0 ? (
        <View style={styles.panel}>{serviceLocationRows}</View>
      ) : null}
    </>
  );

  if (!pickupOn && !deliveryOn) {
    return noAddress;
  }

  if (pickupOn && locations.length === 0 && !deliveryOn) {
    return noAddress;
  }

  const deliveryTitle =
    carrier === PRODUCT_DELIVERY_CARRIER_LOBO
      ? `${PRODUCT_PICKUP_UI.FULFILLMENT_DELIVERY_ANY} ${PRODUCT_DELIVERY_CARRIER_LABEL_RU[carrier]}`
      : carrier === PRODUCT_DELIVERY_CARRIER_GITORG
        ? PRODUCT_PICKUP_UI.FULFILLMENT_COURIER
        : PRODUCT_PICKUP_UI.FULFILLMENT_DELIVERY;
  const deliveryHint =
    carrier === PRODUCT_DELIVERY_CARRIER_LOBO
      ? PRODUCT_PICKUP_UI.DETAILS_LOBO_HINT
      : PRODUCT_PICKUP_UI.DETAILS_DELIVERY_HINT;

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
              ? `${detailsTitle}: ${location.label}`
              : detailsTitle;
            const subtitle = [
              address,
              location.isDefault
                ? ` · ${PRODUCT_PICKUP_UI.DETAILS_LOCATION_DEFAULT}`
                : "",
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
                  <Text style={[styles.title, isDark && styles.titleDark]}>
                    {title}
                  </Text>
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
              {deliveryTitle}
            </Text>
            <Text style={[styles.subtitle, styles.subtitleMuted]}>{deliveryHint}</Text>
          </View>
        </View>
      ) : null}
      {serviceLocationRows}
    </View>
  );
};
