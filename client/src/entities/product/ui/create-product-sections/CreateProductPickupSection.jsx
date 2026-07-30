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
  return (
    <div className="create-product-section">
      <ProductPickupLocationFields
        address={String(form.productPickupAddress ?? "")}
        lat={
          form.productPickupLat != null && Number.isFinite(Number(form.productPickupLat))
            ? Number(form.productPickupLat)
            : null
        }
        lon={
          form.productPickupLon != null && Number.isFinite(Number(form.productPickupLon))
            ? Number(form.productPickupLon)
            : null
        }
        pickupEnabled={form.productPickupEnabled !== false}
        deliveryEnabled={form.productDeliveryEnabled === true}
        disabled={isSubmitting}
        onChange={(next) => {
          setForm((prev) => ({
            ...prev,
            productPickupAddress: next.productPickupAddress,
            productPickupLat: next.productPickupLat,
            productPickupLon: next.productPickupLon,
            productPickupEnabled: next.productPickupEnabled !== false,
            productDeliveryEnabled: next.productDeliveryEnabled === true,
          }));
        }}
      />
    </div>
  );
}
