import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OrderCardLoboShipment } from "./OrderCardLoboShipment.jsx";

const HANDED_OVER = {
  deliveryCarrier: "lobo",
  shippingExternalId: "order-1:seller-1",
  shippingCarrierStatus: "accepted",
  shippingTrackingUrl: "https://wayset.ru/track/224",
  deliveryFeeRub: 260,
};

describe("доставка ЛОБО в карточке заказа", () => {
  it("покупатель видит статус, «Где курьер» и сумму курьеру", () => {
    render(<OrderCardLoboShipment shipment={HANDED_OVER} role="buyer" />);

    expect(screen.getByText("Курьер едет за заказом")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Где курьер" }).getAttribute("href")).toBe(
      "https://wayset.ru/track/224",
    );
    expect(screen.getByText(/Доставку оплатите курьеру наличными/)).toBeTruthy();
  });

  it("после доставки ссылки нет — Wayset её уже не отдаёт", () => {
    render(
      <OrderCardLoboShipment
        shipment={{ ...HANDED_OVER, shippingCarrierStatus: "done" }}
        role="buyer"
      />,
    );

    expect(screen.getByText("Доставлен")).toBeTruthy();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("продавец до передачи видит, когда вызовется курьер", () => {
    render(
      <OrderCardLoboShipment
        shipment={{ deliveryCarrier: "lobo", deliveryFeeRub: 0 }}
        role="seller"
      />,
    );

    expect(screen.getByText("ещё не вызван")).toBeTruthy();
    expect(screen.getByText(/«Готов к отгрузке»/)).toBeTruthy();
  });

  it("покупателю до передачи и чужим службам блок не нужен", () => {
    const { container, rerender } = render(
      <OrderCardLoboShipment shipment={{ deliveryCarrier: "lobo" }} role="buyer" />,
    );
    expect(container.innerHTML).toBe("");

    rerender(
      <OrderCardLoboShipment shipment={{ deliveryCarrier: "cdek" }} role="seller" />,
    );
    expect(container.innerHTML).toBe("");
  });
});
