import { useState } from "react";

import { SHIPPING_CARRIER_INFO_UI } from "../../../shared/config/appUiCopy.js";
import { useShippingCarrierInfoQuery } from "../model/shippingCarrierQueries.js";
import { ShippingCarrierInfoSheet } from "./ShippingCarrierInfoSheet.jsx";

import "./ShippingCarrierInfoButton.css";

/**
 * Кнопка «!» рядом со службой доставки: открывает окно со справкой (график,
 * телефон, где работает). Если админ справку не заполнил — кнопки нет.
 *
 * @param {{ carrierId: string | null | undefined; className?: string }} props
 */
export function ShippingCarrierInfoButton({ carrierId, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const infoQuery = useShippingCarrierInfoQuery({ enabled: Boolean(carrierId) });
  const info = carrierId
    ? ((infoQuery.data ?? []).find((item) => item.carrierId === carrierId) ?? null)
    : null;

  if (!info) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className={["shipping-carrier-info-button", className]
          .filter(Boolean)
          .join(" ")}
        aria-label={SHIPPING_CARRIER_INFO_UI.BUTTON_ARIA(info.label)}
        aria-haspopup="dialog"
        onClick={(event) => {
          // Кнопка стоит внутри карточки/подписи службы: нажатие на «!» не
          // должно заодно выбирать службу.
          event.preventDefault();
          event.stopPropagation();
          setIsOpen(true);
        }}
      >
        <span aria-hidden="true">!</span>
      </button>
      <ShippingCarrierInfoSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        info={info}
      />
    </>
  );
}
