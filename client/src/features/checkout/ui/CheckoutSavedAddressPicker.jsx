import { CHECKOUT_FORM_UI } from "../../../shared/config/appUiCopy.js";
import { SavedAddressPicker } from "../../../entities/address/ui/SavedAddressPicker.jsx";

/**
 * @param {{
 *   addresses: Array<{
 *     id: string;
 *     label?: string;
 *     line: string;
 *     flat?: string;
 *     isDefault?: boolean;
 *   }>;
 *   selectedId: string;
 *   onSelect: (id: string) => void;
 *   disabled?: boolean;
 * }} props
 */
export function CheckoutSavedAddressPicker({
  addresses,
  selectedId,
  onSelect,
  disabled = false,
}) {
  return (
    <SavedAddressPicker
      addresses={addresses}
      selectedId={selectedId}
      onSelect={onSelect}
      disabled={disabled}
      minCount={1}
      sectionLabel={CHECKOUT_FORM_UI.LABEL_SAVED_ADDRESSES}
      otherLabel={CHECKOUT_FORM_UI.SAVED_ADDRESS_OTHER}
      layout="carousel"
    />
  );
}
