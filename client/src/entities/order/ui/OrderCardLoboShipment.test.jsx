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

    expect(screen.getByText("Не вызван")).toBeTruthy();
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

describe("адрес забора в карточке продажи", () => {
  it("продавец видит, откуда курьер заберёт заказ", () => {
    render(
      <OrderCardLoboShipment
        shipment={{ deliveryCarrier: "lobo", deliveryFeeRub: 0 }}
        role="seller"
        pickupAddress="г Грозный, ул Субры Кишиевой, д 58"
      />,
    );

    expect(screen.getByText("Курьер заберёт отсюда:")).toBeTruthy();
    expect(screen.getByText("г Грозный, ул Субры Кишиевой, д 58")).toBeTruthy();
    expect(screen.getByText(/Поменяйте точку отправления/)).toBeTruthy();
  });

  it("покупателю адрес продавца не показываем", () => {
    render(
      <OrderCardLoboShipment
        shipment={{ ...HANDED_OVER }}
        role="buyer"
        pickupAddress="г Грозный, ул Субры Кишиевой, д 58"
      />,
    );

    expect(screen.queryByText("г Грозный, ул Субры Кишиевой, д 58")).toBeNull();
  });
});
