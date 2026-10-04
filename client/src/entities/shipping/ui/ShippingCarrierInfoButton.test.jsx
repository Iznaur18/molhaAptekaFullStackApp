import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "../../../test/renderWithProviders.jsx";
import { fetchShippingCarrierInfo } from "../api/shippingCarriersApi.js";
import { ShippingCarrierInfoButton } from "./ShippingCarrierInfoButton.jsx";

vi.mock("../api/shippingCarriersApi.js", () => ({
  fetchShippingCarrierInfo: vi.fn(),
}));

const LOBO_INFO = {
  carrierId: "lobo",
  label: "ЛОБО",
  description: "",
  workHours: "Тестовый график",
  coverage: "",
  phone: "8 (800) 000-00-00",
  website: "",
};

describe("кнопка «!» у службы доставки", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchShippingCarrierInfo).mockResolvedValue([LOBO_INFO]);
  });

  it("справка заполнена — кнопка открывает окно с графиком и телефоном", async () => {
    const onSelect = vi.fn();
    renderWithProviders(
      // Кнопка живёт внутри подписи службы: выбирать службу она не должна.
      <label>
        <input type="radio" onChange={onSelect} />
        ЛОБО
        <ShippingCarrierInfoButton carrierId="lobo" />
      </label>,
    );

    fireEvent.click(await screen.findByRole("button", { name: "О службе «ЛОБО»" }));

    const dialog = await screen.findByRole("dialog", { name: "ЛОБО" });
    expect(dialog).toHaveTextContent("График работы");
    expect(dialog).toHaveTextContent("Тестовый график");
    expect(screen.getByRole("link", { name: "8 (800) 000-00-00" })).toHaveAttribute(
      "href",
      "tel:88000000000",
    );
    // Пустые поля не показываются.
    expect(dialog).not.toHaveTextContent("Где работает");
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("справки по службе нет — кнопки нет", async () => {
    renderWithProviders(<ShippingCarrierInfoButton carrierId="cdek" />);

    await waitFor(() => expect(fetchShippingCarrierInfo).toHaveBeenCalled());
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("у доставки продавцом справки не бывает — запроса нет", () => {
    renderWithProviders(<ShippingCarrierInfoButton carrierId={null} />);

    expect(fetchShippingCarrierInfo).not.toHaveBeenCalled();
    expect(screen.queryByRole("button")).toBeNull();
  });
});
