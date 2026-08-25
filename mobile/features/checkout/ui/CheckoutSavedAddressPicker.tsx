import {
  SavedAddressPicker,
  type SavedAddressPickerItem,
} from "@/entities/address/ui/SavedAddressPicker";
import { CHECKOUT_FORM_UI } from "@/shared/config";

type CheckoutSavedAddressPickerProps = {
  addresses: SavedAddressPickerItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
};

/** Обёртка с подписями чекаута. Порт `client/.../CheckoutSavedAddressPicker.jsx`. */
export const CheckoutSavedAddressPicker = ({
  addresses,
  selectedId,
  onSelect,
  disabled = false,
}: CheckoutSavedAddressPickerProps) => (
  <SavedAddressPicker
    addresses={addresses}
    selectedId={selectedId}
    onSelect={onSelect}
    disabled={disabled}
    minCount={1}
    sectionLabel={CHECKOUT_FORM_UI.LABEL_SAVED_ADDRESSES}
    otherLabel={CHECKOUT_FORM_UI.SAVED_ADDRESS_OTHER}
  />
);
