import {
  FREE_SELLER_DELIVERY_TARIFF,
  PRODUCT_DELIVERY_CARRIER_SELLER,
  SELLER_DELIVERY_REGION_LIMITED_CARRIERS,
  SELLER_PAYOUT_REQUISITES_MAX_LENGTH,
  normalizeSellerDeliveryTariff,
} from "@molha/api-contract";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { userSavedAddressesFromUser } from "@/entities/address/lib/userSavedAddressesFromUser";
import { CdekConnectionCard } from "@/entities/cdek/ui/CdekConnectionCard";
import type { ProductPickupLocationValue as PickupPointValue } from "@/entities/product/lib/productPickupLocationsFromSavedAddresses";
import { ProductPickupLocationFields } from "@/entities/product/ui/ProductPickupLocationFields";
import type {
  SellerCommerceDefaults,
  SellerDeliveryTariff,
} from "@/entities/seller-commerce-defaults/api/sellerCommerceDefaultsApi";
import {
  useMySellerCommerceDefaultsQuery,
  useSaveSellerCommerceDefaultsMutation,
} from "@/entities/seller-commerce-defaults/model/useSellerCommerceDefaults";
import { SellerDeliveryTariffFields } from "@/entities/seller-commerce-defaults/ui/SellerDeliveryTariffFields";
import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { usePatchUserProfileMutation } from "@/entities/user/model/usePatchUserProfileMutation";
import { YandexDeliveryConnectionCard } from "@/entities/yandex-delivery/ui/YandexDeliveryConnectionCard";
import {
  ORDER_PAYMENT_METHOD_CARD_ON_DELIVERY,
  ORDER_PAYMENT_METHOD_CARD_PREPAID,
  ORDER_PAYMENT_METHOD_LABEL_RU,
  ORDER_PAYMENT_METHODS,
  type OrderPaymentMethod,
} from "@/entities/order/model/constants";
import { useProfileAccountNestedListScroll } from "@/features/profile-tab/model/ProfileAccountScrollContext";
import { ProfileAccountScrollBody } from "@/features/profile-tab/ui/ProfileAccountScrollBody";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import {
  AUTH_UI,
  CDEK_CONNECTION_UI,
  MY_PROFILE_PAGE_UI,
  SELLER_COMMERCE_DEFAULTS_UI,
  YANDEX_DELIVERY_CONNECTION_UI,
} from "@/shared/config";
import { useProfileAdaptiveLayout } from "@/shared/model/useProfileAdaptiveLayout";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useDeliveryPaymentPageStyles } from "@/shared/theme/deliveryPaymentPageStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { ModalSectionTabs } from "@/shared/ui/ModalSectionTabs";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

const DELIVERY_SECTION_TAB_MAIN = "main";
const DELIVERY_SECTION_TAB_CDEK = "cdek";
const DELIVERY_SECTION_TAB_YANDEX = "yandex";

const SECTION_TABS = [
  {
    id: DELIVERY_SECTION_TAB_MAIN,
    label: SELLER_COMMERCE_DEFAULTS_UI.SECTION_TAB_MAIN,
  },
  { id: DELIVERY_SECTION_TAB_CDEK, label: CDEK_CONNECTION_UI.TITLE },
  { id: DELIVERY_SECTION_TAB_YANDEX, label: YANDEX_DELIVERY_CONNECTION_UI.TITLE },
] as const;

const PAYMENT_METHOD_HINT: Partial<Record<OrderPaymentMethod, string>> = {
  [ORDER_PAYMENT_METHOD_CARD_ON_DELIVERY]:
    SELLER_COMMERCE_DEFAULTS_UI.PAYMENT_PAYOUT_HINT,
  [ORDER_PAYMENT_METHOD_CARD_PREPAID]: SELLER_COMMERCE_DEFAULTS_UI.PAYMENT_PREPAID_HINT,
};

type DeliveryPaymentForm = {
  productPickupLocations: PickupPointValue[];
  productPickupAddress: string;
  productPickupLat: number | null;
  productPickupLon: number | null;
  productPickupSelectedFromSuggest: boolean;
  productPickupEnabled: boolean;
  productDeliveryCarrier: string;
  productRegionCode: string;
  deliveryTariff: SellerDeliveryTariff;
  deliveryOutsideRegionEnabled: boolean;
  paymentMethods: string[];
};

const emptyForm = (): DeliveryPaymentForm => ({
  productPickupLocations: [],
  productPickupAddress: "",
  productPickupLat: null,
  productPickupLon: null,
  productPickupSelectedFromSuggest: false,
  productPickupEnabled: true,
  productDeliveryCarrier: "",
  productRegionCode: "",
  deliveryTariff: { ...FREE_SELLER_DELIVERY_TARIFF },
  deliveryOutsideRegionEnabled: true,
  paymentMethods: [...ORDER_PAYMENT_METHODS],
});

const formFromDefaults = (
  defaults: SellerCommerceDefaults | undefined,
): DeliveryPaymentForm => {
  const locations = (defaults?.pickupLocations ?? []).map((item, index) => ({
    id: String(item.id ?? `loc-${index}`),
    label: String(item.label ?? ""),
    address: String(item.address ?? ""),
    lat: Number(item.lat),
    lon: Number(item.lon),
    isDefault: item.isDefault === true,
  }));
  const defaultPoint = locations.find((item) => item.isDefault) ?? locations[0] ?? null;

  return {
    productPickupLocations: locations,
    productPickupAddress: defaultPoint?.address ?? "",
    productPickupLat: defaultPoint?.lat ?? null,
    productPickupLon: defaultPoint?.lon ?? null,
    productPickupSelectedFromSuggest: defaultPoint != null,
    productPickupEnabled: defaults?.pickupEnabled !== false,
    productDeliveryCarrier: String(defaults?.deliveryCarrier ?? ""),
    productRegionCode: String(defaults?.regionCode ?? ""),
    deliveryTariff: normalizeSellerDeliveryTariff(defaults?.deliveryTariff),
    deliveryOutsideRegionEnabled: defaults?.deliveryOutsideRegionEnabled !== false,
    paymentMethods:
      Array.isArray(defaults?.paymentMethods) && defaults.paymentMethods.length > 0
        ? defaults.paymentMethods
        : [...ORDER_PAYMENT_METHODS],
  };
};

const validateDeliveryPaymentForm = (input: {
  paymentMethods: string[];
  ownDelivery: boolean;
  deliveryTariff: SellerDeliveryTariff;
  userId: string;
}): string => {
  if (input.paymentMethods.length === 0) {
    return SELLER_COMMERCE_DEFAULTS_UI.PAYMENT_REQUIRED;
  }
  if (
    input.ownDelivery &&
    input.deliveryTariff?.paid &&
    !input.deliveryTariff.baseFeeRub &&
    !input.deliveryTariff.perKmRub
  ) {
    return SELLER_COMMERCE_DEFAULTS_UI.TARIFF_EMPTY_ERROR;
  }
  if (!input.userId) {
    return SELLER_COMMERCE_DEFAULTS_UI.ERROR_GENERIC;
  }
  return "";
};

export const DeliveryPaymentPage = () => {
  const router = useRouter();
  const styles = useDeliveryPaymentPageStyles();
  const { isDrawerLayout } = useProfileAdaptiveLayout();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const { outerScrollOwns, scrollEnabled } = useProfileAccountNestedListScroll();
  const isAuthorized = useIsAuthorized();
  const sessionQuery = useAuthSessionQuery();
  const defaultsQuery = useMySellerCommerceDefaultsQuery(isAuthorized);
  const saveMutation = useSaveSellerCommerceDefaultsMutation();
  const patchMutation = usePatchUserProfileMutation();

  const [form, setForm] = useState<DeliveryPaymentForm>(() => emptyForm());
  const [sellerPayoutRequisites, setSellerPayoutRequisites] = useState("");
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [sectionTab, setSectionTab] = useState<string>(DELIVERY_SECTION_TAB_MAIN);
  const [navSheetVisible, setNavSheetVisible] = useState(false);

  const user = sessionQuery.data?.user as
    | {
        _id?: string;
        sellerPayoutRequisites?: string;
        userSavedAddresses?: unknown;
      }
    | undefined;
  const userId = user?._id ? String(user._id) : "";
  const defaults = defaultsQuery.data;

  useEffect(() => {
    if (!defaults) return;
    setForm(formFromDefaults(defaults));
  }, [defaults]);

  useEffect(() => {
    setSellerPayoutRequisites(String(user?.sellerPayoutRequisites ?? ""));
  }, [user?.sellerPayoutRequisites]);

  const savedAddresses = useMemo(
    () =>
      user != null ? userSavedAddressesFromUser(user as Record<string, unknown>) : [],
    [user],
  );

  const isSubmitting = saveMutation.isPending || patchMutation.isPending;
  const ownDelivery =
    String(form.productDeliveryCarrier ?? "") === PRODUCT_DELIVERY_CARRIER_SELLER;
  const regionLimitApplies = (
    SELLER_DELIVERY_REGION_LIMITED_CARRIERS as readonly string[]
  ).includes(String(form.productDeliveryCarrier ?? ""));
  const followingCount = defaults?.followingProductCount ?? 0;
  const isConfigured = defaults?.fulfillmentConfigured === true;
  const statusText = isConfigured
    ? SELLER_COMMERCE_DEFAULTS_UI.FOLLOWING_COUNT(followingCount)
    : SELLER_COMMERCE_DEFAULTS_UI.NOT_CONFIGURED_HINT;
  const isMainSection = sectionTab === DELIVERY_SECTION_TAB_MAIN;

  const togglePaymentMethod = (method: string) => {
    setSavedMessage("");
    setForm((prev) => {
      const current = new Set(prev.paymentMethods);
      if (current.has(method)) {
        current.delete(method);
      } else {
        current.add(method);
      }
      return {
        ...prev,
        paymentMethods: ORDER_PAYMENT_METHODS.filter((item) => current.has(item)),
      };
    });
  };

  const handleSubmit = async () => {
    setError("");
    setSavedMessage("");

    const validationError = validateDeliveryPaymentForm({
      paymentMethods: form.paymentMethods,
      ownDelivery,
      deliveryTariff: form.deliveryTariff,
      userId,
    });
    if (validationError) {
      setError(validationError);
      return;
    }

    const trimmedPayout = String(sellerPayoutRequisites ?? "").trim();
    const locations =
      form.productPickupLocations.length > 0
        ? form.productPickupLocations
        : form.productPickupAddress.trim() &&
            form.productPickupLat != null &&
            form.productPickupLon != null
          ? [
              {
                id: "primary",
                label: "",
                address: form.productPickupAddress.trim(),
                lat: form.productPickupLat,
                lon: form.productPickupLon,
                isDefault: true,
              },
            ]
          : [];

    try {
      await patchMutation.mutateAsync({
        userId,
        body: { sellerPayoutRequisites: trimmedPayout },
      });

      const saved = await saveMutation.mutateAsync({
        pickupLocations: locations.map((item) => ({
          id: item.id,
          label: item.label ?? "",
          address: item.address,
          lat: Number(item.lat),
          lon: Number(item.lon),
          isDefault: item.isDefault === true,
        })),
        pickupEnabled: form.productPickupEnabled !== false,
        deliveryCarrier: String(form.productDeliveryCarrier ?? ""),
        paymentMethods: form.paymentMethods,
        deliveryTariff: ownDelivery
          ? form.deliveryTariff
          : { ...FREE_SELLER_DELIVERY_TARIFF },
        deliveryOutsideRegionEnabled: form.deliveryOutsideRegionEnabled !== false,
        ...(form.productRegionCode
          ? { regionCode: String(form.productRegionCode) }
          : {}),
      });

      setSavedMessage(
        saved?.syncedProductCount
          ? SELLER_COMMERCE_DEFAULTS_UI.SAVED_WITH_SYNC(saved.syncedProductCount)
          : SELLER_COMMERCE_DEFAULTS_UI.SAVED,
      );
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : SELLER_COMMERCE_DEFAULTS_UI.ERROR_GENERIC,
      );
    }
  };

  if (!isAuthorized) {
    return (
      <View style={styles.centered}>
        <Text style={styles.muted}>{SELLER_COMMERCE_DEFAULTS_UI.LOGIN_HINT}</Text>
        <AppButton
          label={AUTH_UI.LOGIN_BUTTON}
          variant="primary"
          onPress={() => router.push("/(auth)/login")}
        />
      </View>
    );
  }

  if (defaultsQuery.isPending) {
    return <ScreenLoadingState message={SELLER_COMMERCE_DEFAULTS_UI.LOADING} />;
  }

  if (defaultsQuery.isError) {
    return (
      <ScreenErrorState
        message={defaultsQuery.error.message}
        onRetry={() => void defaultsQuery.refetch()}
      />
    );
  }

  return (
    <>
      <ProfileAccountScrollBody
        style={[styles.container, scrollEnabled ? centeredContentStyle : null]}
        contentContainerStyle={[
          styles.scroll,
          styles.content,
          !isDrawerLayout ? styles.contentInAccountShell : null,
          { paddingBottom: outerScrollOwns ? 0 : contentPaddingBottom },
        ]}
        accessibilityLabel={SELLER_COMMERCE_DEFAULTS_UI.TITLE}
      >
        <View style={styles.root}>
          <ProfileMobileSectionToggle
            activeLabel={MY_PROFILE_PAGE_UI.TAB_DELIVERY_PAYMENT}
            onPress={() => setNavSheetVisible(true)}
          />

          <ModalSectionTabs
            tabs={SECTION_TABS}
            activeTabId={sectionTab}
            onTabChange={setSectionTab}
            ariaLabel={SELLER_COMMERCE_DEFAULTS_UI.SECTION_TABS_ARIA}
          />

          {isMainSection ? (
            <>
              <View style={styles.header}>
                <Text style={styles.title} accessibilityRole="header">
                  {SELLER_COMMERCE_DEFAULTS_UI.TITLE}
                </Text>
                <Text style={styles.intro}>{SELLER_COMMERCE_DEFAULTS_UI.INTRO}</Text>
                <View
                  style={[
                    styles.status,
                    isConfigured ? styles.statusOk : styles.statusWarn,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      isConfigured ? styles.statusTextOk : styles.statusTextWarn,
                    ]}
                  >
                    {statusText}
                  </Text>
                </View>
              </View>

              <View style={styles.block}>
                <Text style={styles.legend}>
                  {SELLER_COMMERCE_DEFAULTS_UI.SECTION_PAYOUT}
                </Text>
                <TextInput
                  style={styles.input}
                  value={sellerPayoutRequisites}
                  onChangeText={(value) => {
                    setSavedMessage("");
                    setSellerPayoutRequisites(value);
                  }}
                  maxLength={SELLER_PAYOUT_REQUISITES_MAX_LENGTH}
                  placeholder={SELLER_COMMERCE_DEFAULTS_UI.PAYOUT_PLACEHOLDER}
                  editable={!isSubmitting}
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessibilityLabel={SELLER_COMMERCE_DEFAULTS_UI.SECTION_PAYOUT}
                />
                <Text style={styles.blockHint}>
                  {SELLER_COMMERCE_DEFAULTS_UI.PAYOUT_HINT}
                </Text>
              </View>

              <View style={styles.block}>
                <Text style={styles.legend}>
                  {SELLER_COMMERCE_DEFAULTS_UI.SECTION_FULFILLMENT}
                </Text>
                <ProductPickupLocationFields
                  savedAddresses={savedAddresses}
                  pickupLocations={form.productPickupLocations}
                  onPickupLocationsChange={(productPickupLocations) => {
                    setSavedMessage("");
                    setForm((prev) => ({ ...prev, productPickupLocations }));
                  }}
                  address={form.productPickupAddress}
                  lat={form.productPickupLat}
                  lon={form.productPickupLon}
                  pickupEnabled={form.productPickupEnabled !== false}
                  deliveryEnabled={
                    form.productDeliveryCarrier === PRODUCT_DELIVERY_CARRIER_SELLER
                  }
                  selectedFromSuggest={form.productPickupSelectedFromSuggest}
                  disabled={isSubmitting}
                  addressLineDisplayOnly
                  onChange={(next) => {
                    setSavedMessage("");
                    setForm((prev) => ({
                      ...prev,
                      productPickupAddress: next.productPickupAddress,
                      productPickupLat: next.productPickupLat,
                      productPickupLon: next.productPickupLon,
                      productPickupEnabled: next.productPickupEnabled !== false,
                      productPickupSelectedFromSuggest:
                        next.productPickupSelectedFromSuggest === true,
                      productDeliveryCarrier:
                        next.productDeliveryEnabled === true
                          ? PRODUCT_DELIVERY_CARRIER_SELLER
                          : "",
                      ...(next.productRegionCode
                        ? { productRegionCode: next.productRegionCode }
                        : {}),
                    }));
                  }}
                />
              </View>

              {regionLimitApplies ? (
                <View style={styles.block}>
                  <Text style={styles.legend}>
                    {SELLER_COMMERCE_DEFAULTS_UI.SECTION_DELIVERY_ZONE}
                  </Text>
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{
                      checked: form.deliveryOutsideRegionEnabled,
                      disabled: isSubmitting,
                    }}
                    disabled={isSubmitting}
                    onPress={() => {
                      setSavedMessage("");
                      setForm((prev) => ({
                        ...prev,
                        deliveryOutsideRegionEnabled:
                          !prev.deliveryOutsideRegionEnabled,
                      }));
                    }}
                    style={[
                      styles.method,
                      form.deliveryOutsideRegionEnabled && styles.methodOn,
                    ]}
                  >
                    <View style={styles.methodCopy}>
                      <Text style={styles.methodTitle}>
                        {SELLER_COMMERCE_DEFAULTS_UI.OUTSIDE_REGION_LABEL}
                      </Text>
                      <Text style={styles.methodHint}>
                        {SELLER_COMMERCE_DEFAULTS_UI.OUTSIDE_REGION_HINT}
                      </Text>
                    </View>
                  </Pressable>
                </View>
              ) : null}

              {ownDelivery ? (
                <View style={styles.block}>
                  <Text style={styles.legend}>
                    {SELLER_COMMERCE_DEFAULTS_UI.SECTION_TARIFF}
                  </Text>
                  <SellerDeliveryTariffFields
                    value={form.deliveryTariff}
                    disabled={isSubmitting}
                    onChange={(deliveryTariff) => {
                      setSavedMessage("");
                      setForm((prev) => ({ ...prev, deliveryTariff }));
                    }}
                  />
                </View>
              ) : null}

              <View style={styles.block}>
                <Text style={styles.legend}>
                  {SELLER_COMMERCE_DEFAULTS_UI.SECTION_PAYMENT}
                </Text>
                <Text style={styles.blockHint}>
                  {SELLER_COMMERCE_DEFAULTS_UI.PAYMENT_HINT}
                </Text>
                <View style={styles.methods}>
                  {ORDER_PAYMENT_METHODS.map((method) => {
                    const checked = form.paymentMethods.includes(method);
                    const hint = PAYMENT_METHOD_HINT[method as OrderPaymentMethod];
                    return (
                      <Pressable
                        key={method}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked, disabled: isSubmitting }}
                        disabled={isSubmitting}
                        onPress={() => togglePaymentMethod(method)}
                        style={[styles.method, checked && styles.methodOn]}
                      >
                        <View style={styles.methodCopy}>
                          <Text style={styles.methodTitle}>
                            {
                              ORDER_PAYMENT_METHOD_LABEL_RU[
                                method as OrderPaymentMethod
                              ]
                            }
                          </Text>
                          {hint ? <Text style={styles.methodHint}>{hint}</Text> : null}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {error ? (
                <Text style={styles.error} accessibilityRole="alert">
                  {error}
                </Text>
              ) : null}
              {savedMessage ? (
                <Text style={styles.success} accessibilityRole="text">
                  {savedMessage}
                </Text>
              ) : null}

              <AppButton
                label={
                  isSubmitting
                    ? SELLER_COMMERCE_DEFAULTS_UI.SAVING
                    : SELLER_COMMERCE_DEFAULTS_UI.SAVE
                }
                variant="primary"
                disabled={isSubmitting}
                onPress={() => void handleSubmit()}
              />
            </>
          ) : sectionTab === DELIVERY_SECTION_TAB_CDEK ? (
            <CdekConnectionCard />
          ) : (
            <YandexDeliveryConnectionCard />
          )}
        </View>
      </ProfileAccountScrollBody>

      <ProfileMobileNavSheet
        visible={navSheetVisible}
        activeSectionId="delivery-payment"
        onClose={() => setNavSheetVisible(false)}
        onOverviewPress={() => router.replace("/(tabs)/me")}
      />
    </>
  );
};
