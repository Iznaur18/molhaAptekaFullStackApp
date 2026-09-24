import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CheckoutCarrierDeliveryCost } from "./CheckoutCarrierDeliveryCost.jsx";

describe("итог с доставкой внешней службы", () => {
  it("ЛОБО: цена примерная, итог тоже", () => {
    render(
      <CheckoutCarrierDeliveryCost
        cost={{ feeRub: 200, label: "ЛОБО", approximate: true }}
        goodsTotalRub={80}
      />,
    );

    // 80 ₽ товары + 200 ₽ доставка.
    expect(screen.getByText("≈ 280 ₽")).toBeTruthy();
    expect(screen.getAllByText("≈ 200 ₽").length).toBeGreaterThan(0);
    expect(screen.getByText("80 ₽")).toBeTruthy();
    // Подсказку «товары — продавцу, доставку — службе» убрали: итог говорит сам.
    expect(screen.queryByText(/доставку — службе/)).toBeNull();
  });

  it("СДЭК: цена точная, без «примерно»", () => {
    render(
      <CheckoutCarrierDeliveryCost
        cost={{ feeRub: 350, label: "СДЭК", approximate: false }}
        goodsTotalRub={1000}
      />,
    );

    expect(screen.getByText("1 350 ₽")).toBeTruthy();
    expect(screen.queryByText(/≈/)).toBeNull();
  });

  it("служба цену не назвала — блока нет", () => {
    const { container } = render(
      <CheckoutCarrierDeliveryCost cost={null} goodsTotalRub={1000} />,
    );

    expect(container.innerHTML).toBe("");
  });
});
