import { fireEvent, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "../../../test/renderWithProviders.jsx";

vi.mock("../../shipping/model/shippingCarrierQueries.js", () => ({
  useShippingCarriersQuery: () => ({
    data: [
      { carrierId: "seller", available: true },
      { carrierId: "gitorg_courier", available: true },
    ],
  }),
}));

vi.mock("../../user/model/useAuthSession.js", () => ({
  useAuthSession: () => ({
    user: {
      _id: "seller-1",
      userRegionCode: "RU-CE",
      userAddresses: [
        {
          id: "a1",
          label: "Склад",
          line: "г Грозный, ул Мира, 1",
          fiasId: "fias-1",
          geo: { lat: 43.3145, lon: 45.7125 },
          isDefault: true,
        },
        { id: "a2", label: "Точка на юге", line: "г Грозный, ул Победы, 7", isDefault: false },
      ],
    },
  }),
}));

const { CreateProductPickupSection } = await import(
  "./create-product-sections/CreateProductPickupSection.jsx"
);

/** Форма шага 5 с настоящим состоянием: как в браузере, с перерисовкой. */
function Harness({ initial, onFormChange }) {
  const [form, setForm] = useState(initial);
  return (
    <>
      <CreateProductPickupSection
        form={form}
        setForm={(updater) => {
          setForm((prev) => {
            const next = updater(prev);
            onFormChange(next);
            return next;
          });
        }}
        isSubmitting={false}
      />
      <output data-testid="state">
        {`pickup=${form.productPickupEnabled !== false} delivery=${form.productDeliveryEnabled === true} courier=${form.productCourierDeliveryEnabled === true} carrier=${form.productDeliveryCarrier ?? ""} points=${(form.productPickupLocations ?? []).length}`}
      </output>
    </>
  );
}

const state = () => screen.getByTestId("state").textContent;

describe("пятый шаг товара: способы получения", () => {
  it("доставку с «Курьеры Gitorg» можно выключить, оставив самовывоз", () => {
    renderWithProviders(
      <Harness
        onFormChange={vi.fn()}
        initial={{
          productPickupEnabled: true,
          productDeliveryEnabled: false,
          productCourierDeliveryEnabled: true,
          productDeliveryCarrier: "gitorg_courier",
          productRegionCode: "RU-CE",
          productPickupLocations: [
            { id: "loc-1", address: "г Грозный, ул Мира, 1", lat: 43.31, lon: 45.69, isDefault: true },
          ],
        }}
      />,
    );

    fireEvent.click(screen.getByRole("checkbox", { name: "Доставка" }));

    expect(state()).toContain("delivery=false");
    expect(state()).toContain("courier=false");
    expect(state()).toContain("carrier=");
    expect(screen.getByRole("checkbox", { name: "Доставка" }).checked).toBe(false);
  });

  it("можно оставить только адрес, который не по умолчанию", () => {
    renderWithProviders(
      <Harness
        onFormChange={vi.fn()}
        initial={{
          productPickupEnabled: true,
          productDeliveryEnabled: false,
          productCourierDeliveryEnabled: false,
          productDeliveryCarrier: "",
          productRegionCode: "RU-CE",
          productPickupLocations: [
            { id: "loc-1", address: "г Грозный, ул Мира, 1", lat: 43.31, lon: 45.69, isDefault: true },
          ],
        }}
      />,
    );

    fireEvent.click(screen.getByRole("checkbox", { name: /Точка на юге/u }));
    fireEvent.click(screen.getByRole("checkbox", { name: /Склад/u }));

    expect(state()).toContain("points=1");
    expect(screen.getByRole("checkbox", { name: /Точка на юге/u }).getAttribute("aria-checked")).toBe("true");
  });

  it("при доставке продавцом склад можно сменить на не-дефолтный адрес", () => {
    renderWithProviders(
      <Harness
        onFormChange={vi.fn()}
        initial={{
          productPickupEnabled: false,
          productDeliveryEnabled: true,
          productCourierDeliveryEnabled: false,
          productDeliveryCarrier: "seller",
          productRegionCode: "RU-CE",
          productPickupLocations: [
            { id: "loc-1", address: "г Грозный, ул Мира, 1", lat: 43.31, lon: 45.69, isDefault: true },
          ],
        }}
      />,
    );

    fireEvent.click(screen.getByRole("checkbox", { name: /Точка на юге/u }));

    expect(screen.getByRole("checkbox", { name: /Точка на юге/u }).getAttribute("aria-checked")).toBe("true");
    expect(state()).toContain("points=1");
  });

  it("сохранённый адрес не по умолчанию выбирается", () => {
    renderWithProviders(
      <Harness
        onFormChange={vi.fn()}
        initial={{
          productPickupEnabled: true,
          productDeliveryEnabled: false,
          productCourierDeliveryEnabled: false,
          productDeliveryCarrier: "",
          productRegionCode: "RU-CE",
          productPickupLocations: [
            { id: "loc-1", address: "г Грозный, ул Мира, 1", lat: 43.31, lon: 45.69, isDefault: true },
          ],
        }}
      />,
    );

    fireEvent.click(screen.getByRole("checkbox", { name: /Точка на юге/u }));

    expect(state()).toContain("points=2");
  });
});
