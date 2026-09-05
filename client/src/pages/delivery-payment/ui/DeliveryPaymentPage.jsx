import { useEffect, useMemo, useState } from "react";
import { CircleAlert, CircleCheck } from "lucide-react";

import {
  ORDER_PAYMENT_METHOD_CARD_ON_DELIVERY,
  ORDER_PAYMENT_METHOD_CARD_PREPAID,
  ORDER_PAYMENT_METHOD_LABEL_RU,
  ORDER_PAYMENT_METHODS,
} from "../../../entities/order/model/constants.js";
import { userSavedAddressesFromUser } from "../../../entities/address/lib/userSavedAddressesFromUser.js";
import { useAuthSession } from "../../../entities/user/model/useAuthSession.js";
import { ProductPickupLocationFields } from "../../../entities/product/ui/ProductPickupLocationFields.jsx";
import { SellerDeliveryTariffFields } from "../../../entities/seller-commerce-defaults/ui/SellerDeliveryTariffFields.jsx";
import {
  useMySellerCommerceDefaultsQuery,
  useSaveSellerCommerceDefaultsMutation,
} from "../../../entities/seller-commerce-defaults/model/sellerCommerceDefaultsQueries.js";
import { SELLER_COMMERCE_DEFAULTS_UI } from "../../../shared/config/appUiCopy.js";
import {
  FREE_SELLER_DELIVERY_TARIFF,
  PRODUCT_DELIVERY_CARRIER_SELLER,
  normalizeSellerDeliveryTariff,
} from "@molha/api-contract";
import { AppIcon } from "../../../shared/ui/icon/index.js";

import "./DeliveryPaymentPage.css";

const PAYMENT_METHOD_HINT = {
  [ORDER_PAYMENT_METHOD_CARD_ON_DELIVERY]:
    SELLER_COMMERCE_DEFAULTS_UI.PAYMENT_PAYOUT_HINT,
  [ORDER_PAYMENT_METHOD_CARD_PREPAID]:
    SELLER_COMMERCE_DEFAULTS_UI.PAYMENT_PREPAID_HINT,
};

/**
 * Настройки, приведённые к форме товара.
 *
 * `ProductPickupLocationFields` — тот же компонент, что и в мастере товара,
 * и разговаривает он на product-полях. Форк ради переименования разошёлся бы
 * с формой товара на первой же правке, поэтому переводим здесь.
 *
 * @param {import("../../../entities/seller-commerce-defaults/model/types.js").SellerCommerceDefaults | undefined} defaults
 */
function formFromDefaults(defaults) {
  return {
    productPickupLocations: (defaults?.pickupLocations ?? []).map((item) => ({
      id: item.id,
      label: item.label ?? "",
      address: item.address,
      lat: item.lat,
      lon: item.lon,
      isDefault: item.isDefault === true,
      selectedFromSuggest: true,
    })),
    productPickupEnabled: defaults?.pickupEnabled !== false,
    productDeliveryCarrier: String(defaults?.deliveryCarrier ?? ""),
    productRegionCode: String(defaults?.regionCode ?? ""),
    deliveryTariff: normalizeSellerDeliveryTariff(defaults?.deliveryTariff),
    paymentMethods:
      Array.isArray(defaults?.paymentMethods) && defaults.paymentMethods.length > 0
        ? defaults.paymentMethods
        : [...ORDER_PAYMENT_METHODS],
  };
}

/**
 * «Доставка и оплата» — настройки продавца, общие для всех его товаров.
 *
 * Товар хранит адрес у себя (по нему ищет каталог), но пока он помечен
 * «как в профиле», сохранение здесь переписывает его одним запросом.
 */
export function DeliveryPaymentPage() {
  const { user } = useAuthSession();
  const defaultsQuery = useMySellerCommerceDefaultsQuery();
  const saveMutation = useSaveSellerCommerceDefaultsMutation();

  const [form, setForm] = useState(() => formFromDefaults(undefined));
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  const defaults = defaultsQuery.data;

  useEffect(() => {
    if (!defaults) return;
    setForm(formFromDefaults(defaults));
  }, [defaults]);

  const savedAddresses = useMemo(
    () => (user ? userSavedAddressesFromUser(user) : []),
    [user],
  );

  const isSubmitting = saveMutation.isPending;
  const ownDelivery =
    String(form.productDeliveryCarrier ?? "") === PRODUCT_DELIVERY_CARRIER_SELLER;
  const locations = Array.isArray(form.productPickupLocations)
    ? form.productPickupLocations
    : [];
  const followingCount = defaults?.followingProductCount ?? 0;
  const isConfigured = defaults?.fulfillmentConfigured === true;
  const statusText = isConfigured
    ? SELLER_COMMERCE_DEFAULTS_UI.FOLLOWING_COUNT(followingCount)
    : SELLER_COMMERCE_DEFAULTS_UI.NOT_CONFIGURED_HINT;

  const togglePaymentMethod = (method) => {
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
        // Канонический порядок: карточки на чекауте не должны прыгать
        // от того, в каком порядке продавец натыкал галочки.
        paymentMethods: ORDER_PAYMENT_METHODS.filter((item) => current.has(item)),
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSavedMessage("");

    if (form.paymentMethods.length === 0) {
      setError(SELLER_COMMERCE_DEFAULTS_UI.PAYMENT_REQUIRED);
      return;
    }
    if (
      ownDelivery &&
      form.deliveryTariff?.paid &&
      !form.deliveryTariff.baseFeeRub &&
      !form.deliveryTariff.perKmRub
    ) {
      setError(SELLER_COMMERCE_DEFAULTS_UI.TARIFF_EMPTY_ERROR);
      return;
    }

    try {
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
        // Тариф уходит только со своей доставкой: схема отклонит платный
        // тариф при другом перевозчике, а не проглотит его молча.
        deliveryTariff: ownDelivery
          ? form.deliveryTariff
          : { ...FREE_SELLER_DELIVERY_TARIFF },
        // Регион уже вытащен из подсказки адреса: без DaData на сервере
        // это единственный способ не потерять региональный буст.
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

  if (defaultsQuery.isLoading) {
    return (
      <section className="delivery-payment-page">
        <p className="delivery-payment-page__muted">
          {SELLER_COMMERCE_DEFAULTS_UI.LOADING}
        </p>
      </section>
    );
  }

  return (
    <section className="delivery-payment-page">
      <header className="delivery-payment-page__header">
        <div className="delivery-payment-page__header-copy">
          <h1 className="delivery-payment-page__title">
            {SELLER_COMMERCE_DEFAULTS_UI.TITLE}
          </h1>
          <p className="delivery-payment-page__intro">
            {SELLER_COMMERCE_DEFAULTS_UI.INTRO}
          </p>
        </div>
        <p
          className={[
            "delivery-payment-page__status",
            isConfigured
              ? "delivery-payment-page__status--ok"
              : "delivery-payment-page__status--warn",
          ].join(" ")}
        >
          {statusText}
        </p>
      </header>

      <form className="delivery-payment-page__form" onSubmit={handleSubmit}>
        <fieldset className="delivery-payment-page__block">
          <legend className="delivery-payment-page__legend">
            {SELLER_COMMERCE_DEFAULTS_UI.SECTION_FULFILLMENT}
          </legend>
          <ProductPickupLocationFields
            locations={locations}
            pickupEnabled={form.productPickupEnabled !== false}
            deliveryEnabled={form.productDeliveryCarrier === "seller"}
            courierDeliveryEnabled={form.productDeliveryCarrier === "gitorg_courier"}
            productDeliveryCarrier={String(form.productDeliveryCarrier ?? "")}
            productRegionCode={String(form.productRegionCode ?? "")}
            sellerRegionCode={String(user?.userRegionCode ?? "")}
            disabled={isSubmitting}
            savedAddresses={savedAddresses}
            onChange={(next) => {
              setSavedMessage("");
              setForm((prev) => ({
                ...prev,
                productPickupLocations: Array.isArray(next.productPickupLocations)
                  ? next.productPickupLocations
                  : [],
                productPickupEnabled: next.productPickupEnabled !== false,
                ...(next.productDeliveryCarrier === undefined
                  ? {}
                  : { productDeliveryCarrier: next.productDeliveryCarrier }),
                ...(next.productRegionCode
                  ? { productRegionCode: next.productRegionCode }
                  : {}),
              }));
            }}
          />
        </fieldset>

        {ownDelivery ? (
          <fieldset className="delivery-payment-page__block">
            <legend className="delivery-payment-page__legend">
              {SELLER_COMMERCE_DEFAULTS_UI.SECTION_TARIFF}
            </legend>
            <SellerDeliveryTariffFields
              value={form.deliveryTariff}
              disabled={isSubmitting}
              onChange={(deliveryTariff) => {
                setSavedMessage("");
                setForm((prev) => ({ ...prev, deliveryTariff }));
              }}
            />
          </fieldset>
        ) : null}

        <fieldset className="delivery-payment-page__block">
          <legend className="delivery-payment-page__legend">
            {SELLER_COMMERCE_DEFAULTS_UI.SECTION_PAYMENT}
          </legend>
          <p className="delivery-payment-page__block-hint">
            {SELLER_COMMERCE_DEFAULTS_UI.PAYMENT_HINT}
          </p>
          <ul className="delivery-payment-page__methods">
            {ORDER_PAYMENT_METHODS.map((method) => {
              const checked = form.paymentMethods.includes(method);
              return (
                <li key={method}>
                  <label
                    className={[
                      "delivery-payment-page__method",
                      checked ? "delivery-payment-page__method--on" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <input
                      className="delivery-payment-page__method-input"
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePaymentMethod(method)}
                      disabled={isSubmitting}
                    />
                    <span className="delivery-payment-page__method-copy">
                      <span className="delivery-payment-page__method-title">
                        {ORDER_PAYMENT_METHOD_LABEL_RU[method]}
                      </span>
                      {PAYMENT_METHOD_HINT[method] ? (
                        <span className="delivery-payment-page__method-hint">
                          {PAYMENT_METHOD_HINT[method]}
                        </span>
                      ) : null}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>

        {error ? (
          <p className="delivery-payment-page__error" role="alert">
            <AppIcon
              icon={CircleAlert}
              className="delivery-payment-page__feedback-icon"
              size={18}
            />
            <span>{error}</span>
          </p>
        ) : null}
        {savedMessage ? (
          <p className="delivery-payment-page__success" role="status">
            <AppIcon
              icon={CircleCheck}
              className="delivery-payment-page__feedback-icon"
              size={18}
            />
            <span>{savedMessage}</span>
          </p>
        ) : null}

        <div className="delivery-payment-page__actions">
          <button
            type="submit"
            className="delivery-payment-page__submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? SELLER_COMMERCE_DEFAULTS_UI.SAVING
              : SELLER_COMMERCE_DEFAULTS_UI.SAVE}
          </button>
        </div>
      </form>
    </section>
  );
}
