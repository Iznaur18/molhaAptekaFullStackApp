import { act, fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "../../../test/renderWithProviders.jsx";

const PRODUCT_ID = "6ac23971af6b1323a16c4688";
const navigateMock = vi.fn();
const beaconMock = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => navigateMock,
  useParams: () => ({ productId: PRODUCT_ID }),
}));
vi.mock("../../../shared/lib/sendDiagBeacon.js", () => ({
  sendDiagBeacon: (...args) => beaconMock(...args),
}));
vi.mock("../../../shared/lib/scheduleOpenAfterPaint.js", () => ({
  prefersReducedMotion: () => false,
}));
vi.mock("../../../shared/lib/useScrollLock.js", () => ({ useScrollLock: () => {} }));
vi.mock("../../../widgets/app-shell/model/AppShellStateContext.jsx", () => ({
  useAppShellStateContext: () => ({ isAuthorized: false, currentUserId: null }),
}));
vi.mock("../../../entities/product/model/useCatalogProductByIdQuery.js", () => ({
  useCatalogProductByIdQuery: () => ({
    data: { _id: PRODUCT_ID, productName: "Товар" },
    isPending: false,
  }),
}));
vi.mock(
  "../../../entities/product-report/model/useMyProductReportStatusQuery.js",
  () => ({ useMyProductReportStatusQuery: () => ({ data: null }) }),
);
vi.mock("../../../entities/product-report/ui/ReportProductModal.jsx", () => ({
  ReportProductModal: () => null,
}));
vi.mock("../../../entities/product/ui/ProductDetailsModal.jsx", () => ({
  ProductDetailsModal: ({ onClose, isPageClosing }) => (
    <div data-testid="page" data-closing={isPageClosing ? "yes" : "no"}>
      <button type="button" onClick={onClose}>
        Назад
      </button>
    </div>
  ),
}));

const { ProductDetailsPage } = await import("./ProductDetailsPage.jsx");

const isClosing = () => screen.getByTestId("page").getAttribute("data-closing");

describe("«Назад» в карточке товара", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    window.history.pushState({}, "", "/my-products");
    window.history.pushState({}, "", `/product/${PRODUCT_ID}`);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("после анимации закрытия делает шаг назад", () => {
    renderWithProviders(<ProductDetailsPage />);

    fireEvent.click(screen.getByRole("button", { name: "Назад" }));
    expect(isClosing()).toBe("yes");
    expect(navigateMock).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(180));
    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  it("шаг назад не убрал страницу — она возвращается на экран, а не остаётся белой", () => {
    renderWithProviders(<ProductDetailsPage />);

    fireEvent.click(screen.getByRole("button", { name: "Назад" }));
    act(() => vi.advanceTimersByTime(180));
    expect(isClosing()).toBe("yes");

    // navigate — заглушка: страница осталась смонтированной, как при зависшем переходе.
    act(() => vi.advanceTimersByTime(400));
    expect(isClosing()).toBe("no");
    expect(beaconMock).toHaveBeenCalledTimes(1);
    expect(beaconMock.mock.calls[0][0]).toBe("pdstuck");

    // Адрес всё ещё этой карточки — «Назад» можно нажать ещё раз.
    fireEvent.click(screen.getByRole("button", { name: "Назад" }));
    act(() => vi.advanceTimersByTime(180));
    expect(navigateMock).toHaveBeenCalledTimes(2);
  });

  it("адрес уже сменился, а страница ещё на экране — второй шаг назад не делаем", () => {
    renderWithProviders(<ProductDetailsPage />);

    fireEvent.click(screen.getByRole("button", { name: "Назад" }));
    act(() => vi.advanceTimersByTime(180));
    // Браузер уже шагнул назад, React ещё не убрал карточку.
    window.history.replaceState({}, "", "/my-products");
    act(() => vi.advanceTimersByTime(400));
    expect(isClosing()).toBe("no");

    fireEvent.click(screen.getByRole("button", { name: "Назад" }));
    act(() => vi.advanceTimersByTime(180));
    expect(isClosing()).toBe("no");
    expect(navigateMock).toHaveBeenCalledTimes(1);
  });
});
