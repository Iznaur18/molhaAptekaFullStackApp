import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Alert,
  Pressable,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ORDER_FULFILLMENT_DELIVERY,
  ORDER_FULFILLMENT_PICKUP,
  PRODUCT_DELIVERY_FULFILLMENT_ENABLED,
  SHIPPING_PROVIDER_CDEK,
  SHIPPING_PROVIDER_YANDEX_DELIVERY,
  SHIPPING_PROVIDERS_CHECKOUT_SOON_HINT,
} from "@molha/api-contract";
import {
  resolveCheckoutChosenCarrier,
  resolveCheckoutPaymentMethodOptions,
  resolveCardOnlyAllowedPaymentMethods,
  type CartSellerDelivery,
  type CdekOrderSelection,
  type YandexDeliveryOrderSelection,
} from "@izibuy/shared-lib";

import { addressValueFromUser } from "@/entities/address/lib/addressValueFromUser";
import { validateRuDeliveryAddressForm } from "@/entities/address/lib/validateRuDeliveryAddressForm";
import type { OrderFulfillmentMethod } from "@/entities/order/api/createOrder";
import {
  ORDER_PAYMENT_METHOD_CARD_ON_DELIVERY,
  ORDER_PAYMENT_METHOD_DEFAULT,
  type OrderPaymentMethod,
} from "@/entities/order/model/constants";
import type { RuDeliveryAddressValue } from "@/entities/address/model/types";
import {
  buildPickupSelectionsPayload,
  resolveInitialPickupSelections,
  type CheckoutProductPickupGroup,
} from "@/entities/cart/lib/buildCheckoutPickupLocations";
import { CHECKOUT_FORM_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useCheckoutFormStyles } from "@/shared/theme/formChromeStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { CheckoutPaymentMethodPicker } from "@/features/checkout/ui/CheckoutPaymentMethodPicker";
import { CdekPickupPointPicker } from "@/features/checkout/ui/CdekPickupPointPicker";
import {
  YandexPickupPointPicker,
  type YandexCheckoutItem,
} from "@/features/checkout/ui/YandexPickupPointPicker";
import {
  CheckoutShippingProviderPicker,
  type CheckoutCarrierOption,
} from "@/features/checkout/ui/CheckoutShippingProviderPicker";
import {
  CHECKOUT_SAVED_ADDRESS_CUSTOM_ID,
  deliveryAddressFromSaved,
  matchCheckoutSavedAddressId,
  resolveInitialCheckoutSavedAddressId,
} from "@/entities/address/lib/deliveryAddressFromSaved";
import { userSavedAddressesFromUser } from "@/entities/address/lib/userSavedAddressesFromUser";
import { AddressSuggestInput } from "@/entities/address/ui/AddressSuggestInput";
import { CheckoutSavedAddressPicker } from "@/features/checkout/ui/CheckoutSavedAddressPicker";
import { CheckoutSellerDeliveryCost } from "@/features/checkout/ui/CheckoutSellerDeliveryCost";

const EMPTY_PRODUCT_IDS: readonly string[] = [];

/** Что нужно пикеру СДЭК: чей договор, какие товары и кто получатель. */
export type CheckoutCdekConfig = {
  sellerId: string;
  productIds: readonly string[];
  recipientName?: string;
  recipientPhone?: string;
};

/** Что нужно пикеру Яндекса: чей договор, какие товары и кто получатель. */
export type CheckoutYandexConfig = {
  sellerId: string;
  items: readonly YandexCheckoutItem[];
  recipientName?: string;
  recipientPhone?: string;
};

/**
 * Что форма отдаёт итогу корзины, когда стоит прямо на странице (паритет web
 * `<button form=…>` в `.cart-fulfillment__dock`): отправка, её доступность,
 * сообщения и цена доставки продавцом — она показывается в итоге, а не в форме.
 */
export type CheckoutFormFooter = {
  submit: () => void;
  submitDisabled: boolean;
  isSubmitting: boolean;
  error: string;
  success: string;
  /** Блок цены своей доставки продавца; `null` — самовывоз, служба или тарифа нет. */
  deliveryCost: ReactNode | null;
};

type CheckoutFormProps = {
  defaultUser?: Record<string, unknown> | null;
  pickupGroups?: CheckoutProductPickupGroup[];
  deliveryAvailable?: boolean;
  pickupAvailable?: boolean;
  /** Что принимают продавцы оформляемых товаров; `null` — ограничений нет. */
  allowedPaymentMethods?: readonly string[] | null;
  /** Продавцы входят в список предоплаты площадки — доступна СБП. */
  cardPrepaidAvailable?: boolean;
  /** Товары за баллы: рублями платится только доставка. */
  paidWithLoyaltyPoints?: boolean;
  /** Везёт ли продавец сам; по умолчанию — как `deliveryAvailable`. */
  sellerDeliveryAvailable?: boolean;
  /** СДЭК у этого продавца подключён; `null` — службы нет. */
  cdek?: CheckoutCdekConfig | null;
  /** Яндекс Доставка у этого продавца подключена; null — службы нет. */
  yandex?: CheckoutYandexConfig | null;
  /** Тариф собственной доставки продавца; `null` — считать нечего. */
  sellerDelivery?: CartSellerDelivery | null;
  /** Товары, которые везут: по ним считается расстояние. */
  deliveryProductIds?: readonly string[];
  /** Способ, выбранный покупателем у этого продавца раньше. */
  initialFulfillmentMethod?: OrderFulfillmentMethod | null;
  onFulfillmentMethodChange?: (method: OrderFulfillmentMethod) => void;
  isSubmitting: boolean;
  submitError: string;
  submitSuccess: string;
  isDisabled?: boolean;
  showHeading?: boolean;
  pinSubmitToBottom?: boolean;
  /**
   * Форма на странице корзины: своей кнопки, сообщений и цены доставки не
   * рисует — всё уходит в итог, который рисует этот рендер.
   */
  renderFooter?: (footer: CheckoutFormFooter) => ReactNode;
  /** Отступы полей — на странице корзины они стоят в одну линию с итогом. */
  fieldsStyle?: StyleProp<ViewStyle>;
  onSubmit: (payload: {
    fulfillmentMethod: OrderFulfillmentMethod;
    deliveryAddress: string;
    deliveryAddressFlat: string;
    paymentMethod: OrderPaymentMethod;
    pickupSelections?: Array<{ productId: string; pickupLocationId: string }>;
    /** Выбор СДЭК: тариф, пункт, город и получатель. Цену считает сервер. */
    cdekShipment?: CdekOrderSelection;
    /** Выбор Яндекса: пункт и получатель. Цену считает сервер. */
    yandexDeliveryShipment?: YandexDeliveryOrderSelection;
  }) => void | Promise<void>;
};

export const CheckoutForm = ({
  defaultUser,
  pickupGroups = [],
  deliveryAvailable = false,
  pickupAvailable = true,
  allowedPaymentMethods = null,
  cardPrepaidAvailable = false,
  paidWithLoyaltyPoints = false,
  sellerDeliveryAvailable,
  cdek = null,
  yandex = null,
  sellerDelivery = null,
  deliveryProductIds = EMPTY_PRODUCT_IDS,
  initialFulfillmentMethod = null,
  onFulfillmentMethodChange,
  isSubmitting,
  submitError,
  submitSuccess,
  isDisabled = false,
  showHeading = true,
  pinSubmitToBottom = false,
  renderFooter,
  fieldsStyle,
  onSubmit,
}: CheckoutFormProps) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const checkoutStyles = useCheckoutFormStyles();
  const [fulfillmentMethod, setFulfillmentMethod] = useState<OrderFulfillmentMethod>(
    initialFulfillmentMethod ?? ORDER_FULFILLMENT_PICKUP,
  );
  // Корзина помнит способ по продавцам: по нему считается доставка в итоге.
  useEffect(() => {
    onFulfillmentMethodChange?.(fulfillmentMethod);
  }, [fulfillmentMethod, onFulfillmentMethodChange]);
  /** Книга адресов профиля — источник для выбора без повторного ввода. */
  const savedAddresses = useMemo(
    () => (defaultUser != null ? userSavedAddressesFromUser(defaultUser) : []),
    [defaultUser],
  );
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState(() =>
    resolveInitialCheckoutSavedAddressId(savedAddresses),
  );
  const [deliveryAddress, setDeliveryAddress] = useState<RuDeliveryAddressValue>(() => {
    const initialId = resolveInitialCheckoutSavedAddressId(savedAddresses);
    if (initialId !== CHECKOUT_SAVED_ADDRESS_CUSTOM_ID) {
      const item = savedAddresses.find((address) => address.id === initialId);
      if (item) {
        return deliveryAddressFromSaved(item);
      }
    }
    return addressValueFromUser(defaultUser);
  });
  const [paymentMethod, setPaymentMethod] = useState<OrderPaymentMethod>(
    ORDER_PAYMENT_METHOD_DEFAULT,
  );
  /** Служба внутри «Доставки»: null — своя доставка продавца. */
  const [carrierChoice, setCarrierChoice] = useState<string | null>(null);
  const [cdekSelection, setCdekSelection] = useState<CdekOrderSelection | null>(null);
  const [yandexSelection, setYandexSelection] =
    useState<YandexDeliveryOrderSelection | null>(null);
  const [localError, setLocalError] = useState("");
  const [selectedPickupByProductId, setSelectedPickupByProductId] = useState<
    Record<string, string>
  >(() => resolveInitialPickupSelections(pickupGroups));

  useEffect(() => {
    setSelectedPickupByProductId(resolveInitialPickupSelections(pickupGroups));
  }, [pickupGroups]);

  // Профиль подгрузился позже открытия формы — переезжаем на адрес по умолчанию.
  useEffect(() => {
    const initialId = resolveInitialCheckoutSavedAddressId(savedAddresses);
    setSelectedSavedAddressId(initialId);
    if (initialId !== CHECKOUT_SAVED_ADDRESS_CUSTOM_ID) {
      const item = savedAddresses.find((address) => address.id === initialId);
      if (item) {
        setDeliveryAddress(deliveryAddressFromSaved(item));
        return;
      }
    }
    setDeliveryAddress(addressValueFromUser(defaultUser));
  }, [defaultUser, savedAddresses]);

  const handleSavedAddressSelect = (nextId: string) => {
    setSelectedSavedAddressId(nextId);
    if (nextId === CHECKOUT_SAVED_ADDRESS_CUSTOM_ID) {
      setDeliveryAddress({
        line: "",
        flat: "",
        fiasId: "",
        geo: null,
        regionCode: null,
        selectedFromSuggest: false,
      });
      return;
    }

    const item = savedAddresses.find((address) => address.id === nextId);
    if (item) {
      setDeliveryAddress(deliveryAddressFromSaved(item));
    }
  };

  /** Правка руками — подсветка сама переезжает на совпавший адрес или «другой». */
  const handleDeliveryAddressChange = (nextAddress: RuDeliveryAddressValue) => {
    setDeliveryAddress(nextAddress);
    setSelectedSavedAddressId(matchCheckoutSavedAddressId(nextAddress, savedAddresses));
  };

  const deliverySelectable = PRODUCT_DELIVERY_FULFILLMENT_ENABLED && deliveryAvailable;
  const pickupSelectable = pickupAvailable;
  // «Доставка» доступна и тогда, когда у продавца есть только СДЭК: своя
  // доставка продавца — отдельный вопрос.
  const sellerDeliverySelectable =
    deliverySelectable && (sellerDeliveryAvailable ?? deliveryAvailable);

  // СДЭК — служба внутри доставки: вместо адреса покупателя нужен пункт
  // выдачи. Какая служба выбрана, решает общее правило из shared-lib.
  const carrierCards = useMemo<CheckoutCarrierOption[]>(
    () => [
      ...(cdek
        ? [
            {
              id: SHIPPING_PROVIDER_CDEK,
              label: CHECKOUT_FORM_UI.SHIPPING_PROVIDER_CDEK,
            },
          ]
        : []),
      ...(yandex
        ? [
            {
              id: SHIPPING_PROVIDER_YANDEX_DELIVERY,
              label: CHECKOUT_FORM_UI.SHIPPING_PROVIDER_YANDEX,
            },
          ]
        : []),
    ],
    [cdek, yandex],
  );
  const chosenCarrier = resolveCheckoutChosenCarrier({
    needsDelivery: fulfillmentMethod === ORDER_FULFILLMENT_DELIVERY,
    carrierOptions: carrierCards.map((card) => card.id),
    carrierChoice,
    sellerDeliveryAvailable: sellerDeliverySelectable,
  });
  const cdekChosen = chosenCarrier === SHIPPING_PROVIDER_CDEK;
  // Яндекс берёт в пункте только карту — и за товар, и за доставку.
  const yandexChosen = chosenCarrier === SHIPPING_PROVIDER_YANDEX_DELIVERY;
  // Продавец сужает способы оплаты, служба «только карта» — ещё раз.
  const effectiveAllowedPaymentMethods = useMemo(
    () =>
      yandexChosen
        ? resolveCardOnlyAllowedPaymentMethods(allowedPaymentMethods)
        : allowedPaymentMethods,
    [yandexChosen, allowedPaymentMethods],
  );
  const availablePaymentMethods = useMemo(
    () =>
      resolveCheckoutPaymentMethodOptions({
        cardPrepaidAvailable,
        allowedMethods: effectiveAllowedPaymentMethods,
      }).availableMethods,
    [effectiveAllowedPaymentMethods, cardPrepaidAvailable],
  );
  // Выбранный способ продавец или служба могли не принимать (или он
  // единственный и показан строкой) — форма сама встаёт на первый доступный.
  useEffect(() => {
    if (
      availablePaymentMethods.length > 0 &&
      !availablePaymentMethods.includes(paymentMethod)
    ) {
      setPaymentMethod(availablePaymentMethods[0]);
    }
  }, [availablePaymentMethods, paymentMethod]);

  useEffect(() => {
    if (!deliverySelectable && fulfillmentMethod === ORDER_FULFILLMENT_DELIVERY) {
      if (pickupSelectable) {
        setFulfillmentMethod(ORDER_FULFILLMENT_PICKUP);
      }
      return;
    }
    if (!pickupSelectable && fulfillmentMethod === ORDER_FULFILLMENT_PICKUP) {
      if (deliverySelectable) {
        setFulfillmentMethod(ORDER_FULFILLMENT_DELIVERY);
      }
    }
  }, [deliverySelectable, pickupSelectable, fulfillmentMethod]);

  const isPickup = fulfillmentMethod === ORDER_FULFILLMENT_PICKUP;
  const pickupReady = pickupGroups.length > 0;
  const showPickupTitles = pickupGroups.length > 1;

  const isAddressValid = useMemo(() => {
    if (isPickup) {
      return pickupSelectable && pickupReady;
    }
    if (cdekChosen) {
      return deliverySelectable && cdekSelection != null;
    }
    if (yandexChosen) {
      return deliverySelectable && yandexSelection != null;
    }
    return (
      deliverySelectable &&
      validateRuDeliveryAddressForm(deliveryAddress, { required: true }) === null
    );
  }, [
    cdekChosen,
    cdekSelection,
    yandexChosen,
    yandexSelection,
    deliveryAddress,
    deliverySelectable,
    isPickup,
    pickupReady,
    pickupSelectable,
  ]);

  const deliveryOptionHint = !PRODUCT_DELIVERY_FULFILLMENT_ENABLED
    ? SHIPPING_PROVIDERS_CHECKOUT_SOON_HINT
    : !deliveryAvailable
      ? CHECKOUT_FORM_UI.FULFILLMENT_DELIVERY_UNAVAILABLE
      : null;

  const pickupOptionHint = !pickupAvailable
    ? CHECKOUT_FORM_UI.FULFILLMENT_PICKUP_UNAVAILABLE
    : null;

  const handleSubmit = () => {
    if (isPickup) {
      if (!pickupSelectable || !pickupReady) {
        setLocalError(pickupOptionHint || CHECKOUT_FORM_UI.ERROR_PICKUP_REQUIRED);
        return;
      }
      setLocalError("");
      void onSubmit({
        fulfillmentMethod: ORDER_FULFILLMENT_PICKUP,
        deliveryAddress: "",
        deliveryAddressFlat: "",
        paymentMethod,
        pickupSelections: buildPickupSelectionsPayload(selectedPickupByProductId),
      });
      return;
    }

    if (!deliverySelectable) {
      setLocalError(
        deliveryOptionHint || CHECKOUT_FORM_UI.FULFILLMENT_DELIVERY_UNAVAILABLE,
      );
      return;
    }

    if (yandexChosen) {
      if (!yandexSelection) {
        setLocalError(CHECKOUT_FORM_UI.YANDEX_POINT_REQUIRED);
        return;
      }
      if (paymentMethod !== ORDER_PAYMENT_METHOD_CARD_ON_DELIVERY) {
        setLocalError(CHECKOUT_FORM_UI.YANDEX_CARD_ONLY);
        return;
      }
      setLocalError("");
      // Адрес заказа сервер возьмёт из пункта выдачи, цену пересчитает сам.
      void onSubmit({
        fulfillmentMethod: ORDER_FULFILLMENT_DELIVERY,
        deliveryAddress: "",
        deliveryAddressFlat: "",
        paymentMethod,
        yandexDeliveryShipment: yandexSelection,
      });
      return;
    }

    if (cdekChosen) {
      if (!cdekSelection) {
        setLocalError(CHECKOUT_FORM_UI.CDEK_POINT_REQUIRED);
        return;
      }
      setLocalError("");
      // Адрес заказа сервер возьмёт из пункта выдачи, цену пересчитает сам.
      void onSubmit({
        fulfillmentMethod: ORDER_FULFILLMENT_DELIVERY,
        deliveryAddress: "",
        deliveryAddressFlat: "",
        paymentMethod,
        cdekShipment: cdekSelection,
      });
      return;
    }

    const validationError = validateRuDeliveryAddressForm(deliveryAddress, {
      required: true,
    });
    if (validationError) {
      setLocalError(validationError);
      return;
    }
    setLocalError("");
    void onSubmit({
      fulfillmentMethod: ORDER_FULFILLMENT_DELIVERY,
      deliveryAddress: deliveryAddress.line.trim(),
      deliveryAddressFlat: deliveryAddress.flat.trim(),
      paymentMethod,
    });
  };

  // Ни одного общего способа у продавцов — заказ сервер всё равно отклонит.
  const hasPaymentMethod = availablePaymentMethods.includes(paymentMethod);
  const isFormDisabled =
    isDisabled || isSubmitting || !isAddressValid || !hasPaymentMethod;
  const displayError = localError || submitError;
  // Своя доставка продавца — сумма зависит от адреса формы.
  const sellerDeliveryCostVisible =
    !isPickup && !cdekChosen && !yandexChosen && sellerDelivery != null;
  const renderSellerDeliveryCost = (inDock: boolean) =>
    sellerDeliveryCostVisible && sellerDelivery ? (
      <CheckoutSellerDeliveryCost
        sellerDelivery={sellerDelivery}
        productIds={deliveryProductIds}
        address={deliveryAddress}
        isAddressValid={isAddressValid}
        inDock={inDock}
      />
    ) : null;

  return (
    <View style={[checkoutStyles.form, pinSubmitToBottom && checkoutStyles.formPinned]}>
      <View style={[checkoutStyles.fields, fieldsStyle]}>
        {showHeading ? (
          <Text style={checkoutStyles.heading}>{CHECKOUT_FORM_UI.HEADING}</Text>
        ) : null}

        <Text style={checkoutStyles.fieldLabel}>
          {CHECKOUT_FORM_UI.LABEL_FULFILLMENT}
        </Text>
        <View style={checkoutStyles.fulfillmentRow}>
          <Pressable
            disabled={isDisabled || isSubmitting}
            accessibilityState={{
              disabled: !pickupSelectable || isDisabled || isSubmitting,
              checked: isPickup,
            }}
            onPress={() => {
              if (!pickupSelectable) {
                Alert.alert(
                  CHECKOUT_FORM_UI.FULFILLMENT_PICKUP,
                  pickupOptionHint || CHECKOUT_FORM_UI.FULFILLMENT_PICKUP_UNAVAILABLE,
                );
                return;
              }
              setLocalError("");
              setFulfillmentMethod(ORDER_FULFILLMENT_PICKUP);
            }}
            style={[
              checkoutStyles.fulfillmentOption,
              isPickup && checkoutStyles.fulfillmentOptionActive,
              !pickupSelectable && checkoutStyles.fulfillmentOptionDisabled,
            ]}
          >
            <Text
              style={[
                checkoutStyles.fulfillmentOptionText,
                isPickup && checkoutStyles.fulfillmentOptionTextActive,
                !pickupSelectable && checkoutStyles.fulfillmentOptionTextDisabled,
              ]}
            >
              {CHECKOUT_FORM_UI.FULFILLMENT_PICKUP}
            </Text>
          </Pressable>
          <Pressable
            disabled={isDisabled || isSubmitting}
            accessibilityState={{
              disabled: !deliverySelectable || isDisabled || isSubmitting,
              checked: !isPickup,
            }}
            onPress={() => {
              if (!deliverySelectable) {
                Alert.alert(
                  CHECKOUT_FORM_UI.FULFILLMENT_DELIVERY,
                  deliveryOptionHint ||
                    CHECKOUT_FORM_UI.FULFILLMENT_DELIVERY_UNAVAILABLE,
                );
                return;
              }
              setLocalError("");
              setFulfillmentMethod(ORDER_FULFILLMENT_DELIVERY);
            }}
            style={[
              checkoutStyles.fulfillmentOption,
              !isPickup && checkoutStyles.fulfillmentOptionActive,
              !deliverySelectable && checkoutStyles.fulfillmentOptionDisabled,
            ]}
          >
            <Text
              style={[
                checkoutStyles.fulfillmentOptionText,
                !isPickup && checkoutStyles.fulfillmentOptionTextActive,
                !deliverySelectable && checkoutStyles.fulfillmentOptionTextDisabled,
              ]}
            >
              {CHECKOUT_FORM_UI.FULFILLMENT_DELIVERY}
            </Text>
          </Pressable>
        </View>

        {isPickup ? (
          <View
            style={[
              checkoutStyles.fulfillmentSection,
              checkoutStyles.fulfillmentSectionPickup,
            ]}
          >
            <View style={checkoutStyles.fulfillmentSectionHead}>
              <Text
                style={[
                  checkoutStyles.fulfillmentSectionBadge,
                  checkoutStyles.fulfillmentSectionBadgePickup,
                ]}
              >
                {CHECKOUT_FORM_UI.FULFILLMENT_PICKUP}
              </Text>
              <Text style={checkoutStyles.fulfillmentSectionTitle}>
                {CHECKOUT_FORM_UI.PICKUP_ADDRESS_LABEL}
              </Text>
            </View>
            <View style={checkoutStyles.fulfillmentSectionBody}>
              {pickupReady ? (
                <>
                  {pickupGroups.length > 1 ? (
                    <Text style={checkoutStyles.pickupHint}>
                      {CHECKOUT_FORM_UI.PICKUP_MULTI_HINT}
                    </Text>
                  ) : null}
                  <View style={checkoutStyles.pickupList}>
                    {pickupGroups.map((group) => {
                      const needsSelect = group.locations.length >= 2;
                      const selectedId =
                        selectedPickupByProductId[group.productId] ??
                        group.locations.find((item) => item.isDefault)?.id ??
                        group.locations[0]?.id;

                      return (
                        <View key={group.productId} style={checkoutStyles.pickupGroup}>
                          {showPickupTitles && group.productTitle ? (
                            <Text style={checkoutStyles.pickupProducts}>
                              {group.productTitle}
                            </Text>
                          ) : null}
                          {needsSelect ? (
                            <>
                              <Text style={checkoutStyles.pickupSelectLabel}>
                                {CHECKOUT_FORM_UI.CHECKOUT_PICK_LOCATION}
                              </Text>
                              <View style={checkoutStyles.pickupOptions}>
                                {group.locations.map((location) => {
                                  const active = selectedId === location.id;
                                  return (
                                    <Pressable
                                      key={location.id}
                                      disabled={isDisabled || isSubmitting}
                                      accessibilityRole="radio"
                                      accessibilityState={{ checked: active }}
                                      onPress={() =>
                                        setSelectedPickupByProductId((prev) => ({
                                          ...prev,
                                          [group.productId]: location.id,
                                        }))
                                      }
                                      style={[
                                        checkoutStyles.pickupOption,
                                        active && checkoutStyles.pickupOptionActive,
                                      ]}
                                    >
                                      {location.label ? (
                                        <Text style={checkoutStyles.pickupOptionLabel}>
                                          {location.label}
                                        </Text>
                                      ) : null}
                                      <Text style={checkoutStyles.pickupAddressText}>
                                        {location.address}
                                      </Text>
                                    </Pressable>
                                  );
                                })}
                              </View>
                            </>
                          ) : (
                            <Text style={checkoutStyles.pickupAddressText}>
                              {group.locations[0]?.address}
                            </Text>
                          )}
                        </View>
                      );
                    })}
                  </View>
                </>
              ) : (
                <Text
                  style={[
                    checkoutStyles.pickupAddressText,
                    checkoutStyles.pickupAddressError,
                  ]}
                >
                  {CHECKOUT_FORM_UI.ERROR_PICKUP_REQUIRED}
                </Text>
              )}
            </View>
          </View>
        ) : (
          <View
            style={[
              checkoutStyles.fulfillmentSection,
              checkoutStyles.fulfillmentSectionDelivery,
            ]}
          >
            <View style={checkoutStyles.fulfillmentSectionHead}>
              <Text
                style={[
                  checkoutStyles.fulfillmentSectionBadge,
                  checkoutStyles.fulfillmentSectionBadgeDelivery,
                ]}
              >
                {CHECKOUT_FORM_UI.FULFILLMENT_DELIVERY}
              </Text>
            </View>
            <View style={checkoutStyles.fulfillmentSectionBody}>
              <CheckoutShippingProviderPicker
                disabled={isDisabled || isSubmitting}
                sellerDeliveryAvailable={sellerDeliverySelectable}
                carriers={carrierCards}
                selectedCarrier={chosenCarrier}
                onSelectCarrier={(carrier) => {
                  setLocalError("");
                  setCarrierChoice(carrier);
                }}
              />

              {yandexChosen && yandex ? (
                <>
                  <Text style={checkoutStyles.pickupHint}>
                    {CHECKOUT_FORM_UI.YANDEX_CARD_ONLY_HINT}
                  </Text>
                  <YandexPickupPointPicker
                    sellerId={yandex.sellerId}
                    items={yandex.items}
                    initialRecipientName={yandex.recipientName}
                    initialRecipientPhone={yandex.recipientPhone}
                    disabled={isDisabled || isSubmitting}
                    onChange={setYandexSelection}
                  />
                </>
              ) : cdekChosen && cdek ? (
                <CdekPickupPointPicker
                  sellerId={cdek.sellerId}
                  productIds={cdek.productIds}
                  initialRecipientName={cdek.recipientName}
                  initialRecipientPhone={cdek.recipientPhone}
                  disabled={isDisabled || isSubmitting}
                  onChange={setCdekSelection}
                />
              ) : (
                <>
                  <CheckoutSavedAddressPicker
                    addresses={savedAddresses}
                    selectedId={selectedSavedAddressId}
                    onSelect={handleSavedAddressSelect}
                    disabled={isDisabled || isSubmitting}
                  />

                  <AddressSuggestInput
                    value={deliveryAddress}
                    onChange={handleDeliveryAddressChange}
                    disabled={isDisabled || isSubmitting}
                    displayOnly
                    placeholder={CHECKOUT_FORM_UI.PLACEHOLDER_DELIVERY_ADDRESS}
                    label={CHECKOUT_FORM_UI.LABEL_DELIVERY_ADDRESS}
                    containerStyle={checkoutStyles.fieldGroup}
                    labelStyle={checkoutStyles.fieldLabel}
                    inputStyle={checkoutStyles.fieldInput}
                  />

                  <Text style={checkoutStyles.fieldLabel}>
                    {CHECKOUT_FORM_UI.LABEL_FLAT}
                  </Text>
                  <TextInput
                    style={checkoutStyles.fieldInput}
                    value={deliveryAddress.flat}
                    onChangeText={(flat) =>
                      setDeliveryAddress((prev) => ({ ...prev, flat }))
                    }
                    placeholder={CHECKOUT_FORM_UI.PLACEHOLDER_FLAT}
                    placeholderTextColor={theme.colors.textMuted}
                    editable={!isDisabled && !isSubmitting}
                    keyboardType="default"
                  />

                  {renderFooter ? null : renderSellerDeliveryCost(false)}
                </>
              )}
            </View>
          </View>
        )}

        {/* Товар за баллы: при самовывозе рублями платить нечего — выбора нет. */}
        {paidWithLoyaltyPoints && isPickup ? null : (
          <CheckoutPaymentMethodPicker
            value={paymentMethod}
            onChange={setPaymentMethod}
            disabled={isDisabled || isSubmitting}
            cardPrepaidAvailable={cardPrepaidAvailable}
            allowedMethods={effectiveAllowedPaymentMethods}
            legend={
              paidWithLoyaltyPoints
                ? CHECKOUT_FORM_UI.LABEL_PAYMENT_METHOD_DELIVERY
                : CHECKOUT_FORM_UI.LABEL_PAYMENT_METHOD
            }
          />
        )}

        {!renderFooter && displayError ? (
          <Text style={checkoutStyles.feedbackError}>{displayError}</Text>
        ) : null}
        {!renderFooter && submitSuccess ? (
          <Text style={checkoutStyles.feedbackSuccess}>{submitSuccess}</Text>
        ) : null}
      </View>

      {renderFooter ? (
        renderFooter({
          submit: handleSubmit,
          submitDisabled: isFormDisabled,
          isSubmitting,
          error: displayError,
          success: submitSuccess,
          deliveryCost: renderSellerDeliveryCost(true),
        })
      ) : (
        <AppButton
          label={CHECKOUT_FORM_UI.SUBMIT_IDLE}
          variant="primary"
          onPress={handleSubmit}
          disabled={isFormDisabled}
          style={[
            checkoutStyles.submitSpacer,
            pinSubmitToBottom && checkoutStyles.submitDocked,
            pinSubmitToBottom ? { marginBottom: Math.max(insets.bottom, 12) } : null,
          ]}
        />
      )}
    </View>
  );
};
