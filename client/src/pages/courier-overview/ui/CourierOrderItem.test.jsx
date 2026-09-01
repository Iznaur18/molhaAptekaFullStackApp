import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "../../../test/renderWithProviders.jsx";

const { CourierOrderItem } = await import("./CourierOrderItem.jsx");

const ITEM = {
  productId: "p-1",
  name: "Часы Apple Watch",
  quantity: 2,
  imageUrl: "/uploads/watch.jpg",
};

describe("позиция заказа у курьера", () => {
  it("клик по товару открывает карточку", () => {
    const onProductClick = vi.fn();
    renderWithProviders(
      <ul>
        <CourierOrderItem item={ITEM} onProductClick={onProductClick} />
      </ul>,
    );

    fireEvent.click(screen.getByRole("button"));

    expect(onProductClick).toHaveBeenCalledWith("p-1");
  });

  it("обложка выводится", () => {
    renderWithProviders(
      <ul>
        <CourierOrderItem item={ITEM} onProductClick={vi.fn()} />
      </ul>,
    );

    const image = document.querySelector("img.courier-overview__item-image");
    expect(image).not.toBeNull();
    expect(image.getAttribute("src")).toContain("watch.jpg");
  });

  it("без товара под рукой строка не кликается", () => {
    renderWithProviders(
      <ul>
        <CourierOrderItem item={{ name: "Товар", quantity: 1 }} />
      </ul>,
    );

    expect(screen.queryByRole("button")).toBeNull();
  });
});
