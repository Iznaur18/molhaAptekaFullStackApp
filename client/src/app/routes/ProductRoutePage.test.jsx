import { act, render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

const mounts = vi.fn();

vi.mock("../../pages/product-details/ui/ProductDetailsPage.jsx", () => ({
  ProductDetailsPage: () => {
    useEffect(() => {
      mounts();
    }, []);
    return <p>карточка</p>;
  },
}));

const { ProductRoutePage } = await import("./ProductRoutePage.jsx");

/** @type {import('react-router-dom').NavigateFunction | null} */
let navigateRef = null;
function CaptureNavigate() {
  navigateRef = useNavigate();
  return null;
}

describe("страница товара при переходе «товар → товар»", () => {
  it("пересоздаётся: закрытие прошлой карточки не переживает переход", () => {
    render(
      <MemoryRouter initialEntries={["/product/a"]}>
        <CaptureNavigate />
        <Routes>
          <Route path="/product/:productId" element={<ProductRoutePage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText("карточка")).toBeTruthy();
    expect(mounts).toHaveBeenCalledTimes(1);

    act(() => navigateRef?.("/product/b"));
    expect(mounts).toHaveBeenCalledTimes(2);

    act(() => navigateRef?.(-1));
    expect(mounts).toHaveBeenCalledTimes(3);
  });
});
