import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SELLER_QR_UI } from "../../../shared/config/appUiCopy.js";
import { renderWithProviders } from "../../../test/renderWithProviders.jsx";
import { buildSellerQrMatrix, buildSellerQrSvgPath } from "../lib/sellerQrMatrix.js";
import { SellerQrButton } from "./SellerQrButton.jsx";

vi.mock("../../analytics/api/sellerQrAnalyticsApi.js", () => ({
  fetchMySellerQrStats: async () => ({ total: 12, recent: 5, recentDays: 30 }),
  trackSellerQrScan: vi.fn(),
}));

const SELLER_ID = "6a871e02e4b218aa47757078";

describe("QR-код витрины", () => {
  it("кнопка открывает окно с кодом, именем и счётчиком переходов", async () => {
    renderWithProviders(
      <SellerQrButton sellerId={SELLER_ID} sellerName="test.seller" />,
    );

    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: SELLER_QR_UI.BUTTON_ARIA }));

    const dialog = await screen.findByRole("dialog", { name: SELLER_QR_UI.TITLE });
    expect(dialog).toHaveTextContent("test.seller");
    expect(screen.getByRole("img", { name: SELLER_QR_UI.QR_ALT })).toBeTruthy();
    expect(screen.getByRole("button", { name: SELLER_QR_UI.DOWNLOAD })).toBeTruthy();
    expect(await screen.findByText(SELLER_QR_UI.STATS_TOTAL(12))).toBeTruthy();
    expect(screen.getByText(SELLER_QR_UI.STATS_RECENT(5, 30))).toBeTruthy();
  });

  it("гость видит код чужой витрины, но не счётчик переходов продавца", async () => {
    renderWithProviders(
      <SellerQrButton sellerId={SELLER_ID} sellerName="test.seller" isOwn={false} />,
    );

    fireEvent.click(screen.getByRole("button", { name: SELLER_QR_UI.BUTTON_ARIA }));

    await screen.findByRole("dialog", { name: SELLER_QR_UI.TITLE });
    expect(screen.getByRole("img", { name: SELLER_QR_UI.QR_ALT })).toBeTruthy();
    expect(screen.getByText(SELLER_QR_UI.HINT_VISITOR)).toBeTruthy();
    expect(screen.queryByText(SELLER_QR_UI.STATS_TITLE)).toBeNull();
  });

  it("без id продавца кнопки нет", () => {
    renderWithProviders(<SellerQrButton sellerId="" />);

    expect(screen.queryByRole("button")).toBeNull();
  });
});

describe("матрица QR-кода", () => {
  it("квадратная, с тремя метками-мишенями по углам", () => {
    const matrix = buildSellerQrMatrix(
      `https://example.test/seller/${SELLER_ID}?src=qr`,
    );
    const size = matrix.length;

    expect(size).toBeGreaterThanOrEqual(21);
    expect(matrix.every((row) => row.length === size)).toBe(true);
    // Углы меток поиска всегда тёмные.
    expect(matrix[0][0]).toBe(true);
    expect(matrix[0][size - 1]).toBe(true);
    expect(matrix[size - 1][0]).toBe(true);
    expect(buildSellerQrSvgPath(matrix)).toMatch(/^M4 4h1v1h-1z/);
  });

  it("разные ссылки дают разные коды", () => {
    const a = buildSellerQrSvgPath(
      buildSellerQrMatrix("https://example.test/seller/a"),
    );
    const b = buildSellerQrSvgPath(
      buildSellerQrMatrix("https://example.test/seller/b"),
    );

    expect(a).not.toBe(b);
  });
});
