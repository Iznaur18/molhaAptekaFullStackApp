import { useEffect, useMemo } from "react";
import {
  PRODUCT_FULFILLMENT_SOURCE_CUSTOM,
  PRODUCT_FULFILLMENT_SOURCE_PROFILE,
  isCartDealType,
  normalizeCategoryDealType,
} from "@molha/api-contract";

import { PRODUCT_PICKUP_UI } from "../../../../shared/config/appUiCopy.js";

import { userSavedAddressesFromUser } from "../../../address/lib/userSavedAddressesFromUser.js";
import { useAuthSession } from "../../../user/model/useAuthSession.js";
import { useMySellerCommerceDefaultsQuery } from "../../../seller-commerce-defaults/model/sellerCommerceDefaultsQueries.js";
import { legacyPickupFieldsFromLocations } from "../../lib/productPickupLocationsForm.js";
import { ProductPickupLocationFields } from "../ProductPickupLocationFields.jsx";
import {
  useMyCdekConnectionQuery,
  useToggleCdekConnectionMutation,
} from "../../../cdek/model/cdekConnectionQueries.js";
import { ProductFulfillmentSourceSwitch } from "./ProductFulfillmentSourceSwitch.jsx";

import "./CreateProductSections.css";

/**
 * @param {{
 *   form: Record<string, unknown>;
 *   setForm: (updater: (prev: Record<string, unknown>) => Record<string, unknown>) => void;
 *   isSubmitting: boolean;
 * }} props
 */
export function CreateProductPickupSection({ form, setForm, isSubmitting }) {
  const { user } = useAuthSession();
  const cdekConnectionQuery = useMyCdekConnectionQuery();
  const cdekToggleMutation = useToggleCdekConnectionMutation();
  const defaultsQuery = useMySellerCommerceDefaultsQuery();
  const defaults = defaultsQuery.data ?? null;

  const savedAddresses = useMemo(
    () => (user ? userSavedAddressesFromUser(user) : []),
    [user],
  );

  // Авто, недвижимость, услуги: способов получения нет, нужен только адрес.
  const dealType = normalizeCategoryDealType(form.categoryDealType);
  const addressOnly = !isCartDealType(dealType);

  const source = String(form.productFulfillmentSource ?? "");

  // Пустой источник — товар, который ещё не выбирал. Настройки профиля есть →
  // берём их: ради этого всё и затевалось. Нет → форма спросит адрес сама.
  useEffect(() => {
    // Профиль продавца описывает доставку и самовывоз — объявлению без корзины
    // он не подходит, адрес встречи продавец указывает прямо здесь.
    if (addressOnly) {
      if (source !== PRODUCT_FULFILLMENT_SOURCE_CUSTOM) {
        setForm((prev) => ({
          ...prev,
          productFulfillmentSource: PRODUCT_FULFILLMENT_SOURCE_CUSTOM,
        }));
      }
      return;
    }
    if (source || !defaultsQuery.isSuccess) {
      return;
    }
    const next = defaults?.fulfillmentConfigured
      ? PRODUCT_FULFILLMENT_SOURCE_PROFILE
      : PRODUCT_FULFILLMENT_SOURCE_CUSTOM;
    setForm((prev) => ({ ...prev, productFulfillmentSource: next }));
  }, [addressOnly, source, defaults, defaultsQuery.isSuccess, setForm]);

  const followsProfile = !addressOnly && source === PRODUCT_FULFILLMENT_SOURCE_PROFILE;

  const locations = Array.isArray(form.productPickupLocations)
    ? form.productPickupLocations
    : [];

  return (
    <div className="create-product-section">
      {addressOnly ? (
        <p className="create-product-section__lead" role="note">
          {PRODUCT_PICKUP_UI.DEAL_FORM_NOTICE[dealType]}
        </p>
      ) : (
        <ProductFulfillmentSourceSwitch
          value={source}
          disabled={isSubmitting}
          defaults={defaults}
          onChange={(next) =>
            setForm((prev) => ({ ...prev, productFulfillmentSource: next }))
          }
        />
      )}

      {followsProfile ? null : (
        <ProductPickupLocationFields
          locations={locations}
          addressOnly={addressOnly}
          pickupEnabled={form.productPickupEnabled !== false}
          deliveryEnabled={form.productDeliveryEnabled === true}
          courierDeliveryEnabled={form.productCourierDeliveryEnabled === true}
          productDeliveryCarrier={String(form.productDeliveryCarrier ?? "")}
          productRegionCode={String(form.productRegionCode ?? "")}
          sellerRegionCode={String(user?.userRegionCode ?? "")}
          disabled={isSubmitting}
          savedAddresses={savedAddresses}
          // СДЭК включается на продавца целиком, а не на товар: это тот же
          // тумблер, что в «Доставка и оплата», и действует на все товары.
          cdekControl={{
            connected: cdekConnectionQuery.data?.connected === true,
            enabled: cdekConnectionQuery.data?.enabled !== false,
            pending: cdekToggleMutation.isPending,
            onToggle: (enabled) => cdekToggleMutation.mutate(enabled),
          }}
          onChange={(next) => {
            const nextLocations = Array.isArray(next.productPickupLocations)
              ? next.productPickupLocations
              : [];
            const legacy = legacyPickupFieldsFromLocations(nextLocations);
            setForm((prev) => ({
              ...prev,
              productPickupLocations: nextLocations,
              ...legacy,
              productPickupEnabled: next.productPickupEnabled !== false,
              productDeliveryEnabled: next.productDeliveryEnabled === true,
              productCourierDeliveryEnabled:
                next.productCourierDeliveryEnabled === true,
              ...(next.productDeliveryCarrier === undefined
                ? {}
                : { productDeliveryCarrier: next.productDeliveryCarrier }),
              ...(next.productRegionCode
                ? { productRegionCode: next.productRegionCode }
                : {}),
            }));
          }}
        />
      )}
    </div>
  );
}
