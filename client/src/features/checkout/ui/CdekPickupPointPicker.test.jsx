import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchCdekDeliveryPointsMock = vi.fn();
const fetchCdekQuoteMock = vi.fn();

vi.mock("../../../entities/cdek/api/cdekCheckoutApi.js", () => ({
  fetchCdekDeliveryPoints: (...args) => fetchCdekDeliveryPointsMock(...args),
  fetchCdekQuote: (...args) => fetchCdekQuoteMock(...args),
}));

const { CdekPickupPointPicker } = await import("./CdekPickupPointPicker.jsx");

const POINTS = [
  {
    code: "MSK180",
    name: "MSK180",
    address: "Москва, ул. Верхняя Красносельская, 17А",
    cityCode: 44,
    city: "Москва",
    lat: 55.78,
    lon: 37.66,
    workTime: "Пн-Пт 10:00-21:00",
    hasCashless: true,
  },
];

const QUOTE = {
  available: true,
  exact: false,
  best: { tariffCode: 136 },
  options: [
    {
      tariffCode: 136,
      tariffName: "Посылка склад-склад",
      deliveryMode: 4,
      deliverySumRub: 390,
      periodMinDays: 3,
      periodMaxDays: 4,
    },
  ],
};

describe("выбор пункта выдачи СДЭК", () => {
  beforeEach(() => {
    fetchCdekDeliveryPointsMock.mockReset();
    fetchCdekQuoteMock.mockReset();
  });

  it("город → пункты и цена → наружу уходит только выбор, без суммы", async () => {
    fetchCdekDeliveryPointsMock.mockResolvedValue({ points: POINTS, cityCode: 44 });
    fetchCdekQuoteMock.mockResolvedValue(QUOTE);
    const onChange = vi.fn();
    const { container } = render(
      <CdekPickupPointPicker sellerId="s1" productIds={["p1"]} onChange={onChange} />,
    );

    fireEvent.change(container.querySelector("input"), {
      target: { value: "Москва" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Найти пункты" }));

    expect(await screen.findByText("390 ₽ · 3–4 дн.")).toBeTruthy();
    // Товары без веса — покупатель должен знать, что цена примерная.
    expect(screen.getByText(/Цена примерная/)).toBeTruthy();
    expect(screen.getByText(/оплачиваете СДЭК при получении/)).toBeTruthy();

    const [, pointSelect] = container.querySelectorAll("select");
    fireEvent.change(pointSelect, { target: { value: "MSK180" } });

    await waitFor(() => {
      expect(onChange).toHaveBeenLastCalledWith({
        tariffCode: 136,
        pickupPointCode: "MSK180",
        toCityCode: 44,
      });
    });
    expect(fetchCdekQuoteMock).toHaveBeenCalledWith({
      productIds: ["p1"],
      toCityCode: 44,
    });
  });

  it("город без пунктов — понятный ответ, выбор пуст", async () => {
    fetchCdekDeliveryPointsMock.mockResolvedValue({ points: [], cityCode: null });
    const onChange = vi.fn();
    const { container } = render(
      <CdekPickupPointPicker sellerId="s1" productIds={["p1"]} onChange={onChange} />,
    );

    fireEvent.change(container.querySelector("input"), {
      target: { value: "Нетакойгород" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Найти пункты" }));

    expect(await screen.findByText(/пунктов СДЭК не нашлось/)).toBeTruthy();
    expect(fetchCdekQuoteMock).not.toHaveBeenCalled();
    expect(onChange).toHaveBeenLastCalledWith(null);
  });
});
