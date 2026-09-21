import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const pointsMock = vi.fn();
const quoteMock = vi.fn();
vi.mock("../../../entities/yandex-delivery/api/yandexDeliveryCheckoutApi.js", () => ({
  fetchYandexDeliveryPoints: (...args) => pointsMock(...args),
  fetchYandexDeliveryQuote: (...args) => quoteMock(...args),
}));

const { YandexPickupPointPicker } = await import("./YandexPickupPointPicker.jsx");

const ITEMS = [{ productId: "64c000000000000000000001", quantity: 2 }];

describe("выбор пункта Яндекс Доставки", () => {
  beforeEach(() => {
    pointsMock.mockReset();
    quoteMock.mockReset();
  });

  it("город → пункт → цена под пункт → выбор уходит наружу", async () => {
    pointsMock.mockResolvedValue([
      {
        id: "pt-1",
        name: "ПВЗ",
        address: "Грозный, пр. Путина, 1",
        instruction: "Вход со двора",
      },
    ]);
    quoteMock.mockResolvedValue({
      available: true,
      deliverySumRub: 731,
      deliveryDays: 3,
    });
    const onChange = vi.fn();
    render(
      <YandexPickupPointPicker
        sellerId="seller-1"
        items={ITEMS}
        initialRecipientName="Иван Петров"
        initialRecipientPhone="+79990001122"
        onChange={onChange}
      />,
    );

    fireEvent.change(screen.getByLabelText("Город получения"), {
      target: { value: "Грозный" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Найти пункты" }));
    fireEvent.change(await screen.findByLabelText("Пункт выдачи Яндекса"), {
      target: { value: "pt-1" },
    });

    expect(await screen.findByText("731 ₽ · 3 дн.")).toBeTruthy();
    expect(screen.getByText("Вход со двора")).toBeTruthy();
    expect(quoteMock.mock.calls[0][0]).toEqual({ items: ITEMS, pickupPointId: "pt-1" });
    await waitFor(() =>
      expect(onChange).toHaveBeenLastCalledWith({
        pickupPointId: "pt-1",
        recipient: { name: "Иван Петров", phone: "+79990001122" },
      }),
    );
  });

  it("нет пунктов с оплатой картой — честно говорим", async () => {
    pointsMock.mockResolvedValue([]);
    render(<YandexPickupPointPicker sellerId="s" items={ITEMS} onChange={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("Город получения"), {
      target: { value: "Урус-Мартан" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Найти пункты" }));

    expect(
      await screen.findByText(/нет пунктов Яндекса с оплатой картой/),
    ).toBeTruthy();
  });

  it("без телефона выбор не готов", async () => {
    pointsMock.mockResolvedValue([{ id: "pt-1", name: "ПВЗ", address: "Адрес" }]);
    quoteMock.mockResolvedValue({
      available: true,
      deliverySumRub: 100,
      deliveryDays: 2,
    });
    const onChange = vi.fn();
    render(
      <YandexPickupPointPicker
        sellerId="s"
        items={ITEMS}
        initialRecipientName="Иван"
        onChange={onChange}
      />,
    );

    fireEvent.change(screen.getByLabelText("Город получения"), {
      target: { value: "Грозный" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Найти пункты" }));
    fireEvent.change(await screen.findByLabelText("Пункт выдачи Яндекса"), {
      target: { value: "pt-1" },
    });
    await screen.findByText("100 ₽ · 2 дн.");

    expect(onChange).toHaveBeenLastCalledWith(null);
  });
});
