import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "../../../test/renderWithProviders.jsx";

const { ProductPickupLocationFields } = await import(
  "./ProductPickupLocationFields.jsx"
);

const SAVED_ADDRESS = {
  id: "037bb089-9632-4c53-ba80-cac4c587c500",
  label: "Супермаркет",
  line: "г Грозный, р-н Ахматовский, ул Субры Кишиевой, д 56",
  flat: "",
  isDefault: true,
  geo: { lat: 43.324728, lon: 45.711483 },
};

const SAVED_LOCATION = {
  id: SAVED_ADDRESS.id,
  label: SAVED_ADDRESS.label,
  address: SAVED_ADDRESS.line,
  lat: SAVED_ADDRESS.geo.lat,
  lon: SAVED_ADDRESS.geo.lon,
  isDefault: true,
  selectedFromSuggest: true,
};

/** @param {{ savedAddresses: unknown[]; onChange?: () => void }} props */
const renderFields = ({ savedAddresses, onChange = vi.fn() }) =>
  renderWithProviders(
    <ProductPickupLocationFields
      locations={[SAVED_LOCATION]}
      savedAddresses={savedAddresses}
      pickupEnabled
      deliveryEnabled={false}
      productDeliveryCarrier="seller"
      productRegionCode="RU-CE"
      sellerRegionCode="RU-CE"
      onChange={onChange}
    />,
  );

/**
 * Книга адресов приходит из сессии отдельным запросом и опаздывает к первому
 * рендеру: настройки продавца успевают раньше. Первичная чистка защёлкивалась
 * навсегда, поэтому после перезагрузки «Доставки и оплаты» сохранённая точка
 * оставалась без галочки — а следующее изменение в блоке вычищало её из формы.
 */
describe("книга адресов пришла позже настроек", () => {
  it("сохранённая точка отмечена, когда адреса приходят с опозданием", async () => {
    const { rerender } = renderFields({ savedAddresses: [] });

    rerender(
      <ProductPickupLocationFields
        locations={[SAVED_LOCATION]}
        savedAddresses={[SAVED_ADDRESS]}
        pickupEnabled
        deliveryEnabled={false}
        productDeliveryCarrier="seller"
        productRegionCode="RU-CE"
        sellerRegionCode="RU-CE"
        onChange={vi.fn()}
      />,
    );

    const option = await screen.findByRole("checkbox", { name: /Супермаркет/u });
    expect(option.getAttribute("aria-checked")).toBe("true");
  });

  it("не вычищает точку из формы, пока адреса не приехали", () => {
    const onChange = vi.fn();
    renderFields({ savedAddresses: [], onChange });

    const wipes = onChange.mock.calls.filter(
      ([patch]) =>
        Array.isArray(patch?.productPickupLocations) &&
        patch.productPickupLocations.length === 0,
    );
    expect(wipes).toEqual([]);
  });

  it("адреса пришли сразу — точка отмечена без всяких задержек", async () => {
    renderFields({ savedAddresses: [SAVED_ADDRESS] });

    const option = await screen.findByRole("checkbox", { name: /Супермаркет/u });
    expect(option.getAttribute("aria-checked")).toBe("true");
  });
});
