import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render as rtlRender, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createTestQueryClient } from "../../../test/createTestQueryClient.js";
import { UserProfileInfoPanel } from "./UserProfileInfoPanel.jsx";

// Панель читает тренды статистики через react-query.
function render(ui) {
  return rtlRender(
    <QueryClientProvider client={createTestQueryClient()}>{ui}</QueryClientProvider>,
  );
}

const rows = [
  { id: "followingCount", label: "Подписки", value: "7" },
  { id: "totalSalesCount", label: "Продажи", value: "52" },
  { id: "totalSalesAmount", label: "Продаж на сумму", value: "3.2M" },
  { id: "totalPurchasesAmount", label: "Покупок на сумму", value: "10K" },
];

describe("строки-переходы в профиле", () => {
  it("нажатие на строку вызывает её переход, остальные строки не кнопки", () => {
    const onSales = vi.fn();
    const onSubscriptions = vi.fn();
    const onOrders = vi.fn();

    render(
      <UserProfileInfoPanel
        rows={rows}
        rowActions={{
          totalSalesCount: onSales,
          followingCount: onSubscriptions,
          totalPurchasesAmount: onOrders,
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Продажи" }));
    fireEvent.click(screen.getByRole("button", { name: "Подписки" }));
    fireEvent.click(screen.getByRole("button", { name: "Покупок на сумму" }));

    expect(onSales).toHaveBeenCalledTimes(1);
    expect(onSubscriptions).toHaveBeenCalledTimes(1);
    expect(onOrders).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("button", { name: "Продаж на сумму" })).toBeNull();
  });

  it("без rowActions строки остаются текстом (чужой профиль)", () => {
    render(<UserProfileInfoPanel rows={rows} />);

    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });
});
