import { useMemo } from "react";

import { userSavedAddressesFromUser } from "../../../address/lib/userSavedAddressesFromUser.js";
import { useAuthSession } from "../../../user/model/useAuthSession.js";
import {
  legacyPickupFieldsFromLocations,
} from "../../lib/productPickupLocationsForm.js";
import { ProductPickupLocationFields } from "../ProductPickupLocationFields.jsx";

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
  const savedAddresses = useMemo(
    () => (user ? userSavedAddressesFromUser(user) : []),
    [user],
  );

  const locations = Array.isArray(form.productPickupLocations)
    ? form.productPickupLocations
    : [];

  return (
    <div className="create-product-section">
      <ProductPickupLocationFields
        locations={locations}
        pickupEnabled={form.productPickupEnabled !== false}
        deliveryEnabled={form.productDeliveryEnabled === true}
        courierDeliveryEnabled={form.productCourierDeliveryEnabled === true}
        productDeliveryCarrier={String(form.productDeliveryCarrier ?? "")}
        productRegionCode={String(form.productRegionCode ?? "")}
        sellerRegionCode={String(user?.userRegionCode ?? "")}
        disabled={isSubmitting}
        savedAddresses={savedAddresses}
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
    </div>
  );
}
