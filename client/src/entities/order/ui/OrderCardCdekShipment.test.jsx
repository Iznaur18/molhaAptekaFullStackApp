import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ORDER_CDEK_UI } from "../../../shared/config/appUiCopy.js";
import { OrderCardCdekShipment } from "./OrderCardCdekShipment.jsx";

const shipment = (waybill) => ({
  sellerId: "s1",
  fulfillmentMethod: "delivery",
  deliveryCarrier: "cdek",
  cdekShipmentAtOrder: {
    pickupPoint: { code: "GRZ5", address: "Грозный, ул. Субры Кишиевой, 9" },
  },
  cdekWaybill: { uuid: "u-1", cdekNumber: "10325488383", ...waybill },
});

describe("посылка СДЭК у покупателя", () => {
  it("готова к выдаче: этап как у СДЭК, срок и пункт", () => {
    render(
      <OrderCardCdekShipment
        role="buyer"
        shipment={shipment({
          statusCode: "ACCEPTED_AT_PICK_UP_POINT",
          status: "Принят на склад до востребования",
          keepFreeUntil: "2026-10-03T20:59:59.000Z",
        })}
      />,
    );

    expect(screen.getByText("Готов к выдаче")).toBeTruthy();
    expect(screen.getByText("Заберите до 3 октября")).toBeTruthy();
    expect(screen.getByText(/Субры Кишиевой, 9/)).toBeTruthy();
    expect(
      screen
        .getByRole("link", { name: ORDER_CDEK_UI.TRACKING_LINK })
        .getAttribute("href"),
    ).toContain("10325488383");
  });

  it("в пути — без срока хранения", () => {
    render(
      <OrderCardCdekShipment
        role="buyer"
        shipment={shipment({ statusCode: "SENT_TO_RECIPIENT_CITY" })}
      />,
    );

    expect(screen.getByText("В пути")).toBeTruthy();
    expect(screen.queryByText(/Заберите до/)).toBeNull();
  });

  it("продавцу блок не нужен — у него панель накладной", () => {
    const { container } = render(
      <OrderCardCdekShipment
        role="seller"
        shipment={shipment({ statusCode: "ACCEPTED_AT_PICK_UP_POINT" })}
      />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("накладной ещё нет или она отменена — молчим", () => {
    const { container } = render(
      <OrderCardCdekShipment
        role="buyer"
        shipment={{ ...shipment({}), cdekWaybill: null }}
      />,
    );
    expect(container.innerHTML).toBe("");
  });
});
