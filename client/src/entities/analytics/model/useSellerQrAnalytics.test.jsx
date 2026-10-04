import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { trackSellerQrScan } from "../api/sellerQrAnalyticsApi.js";
import { useTrackSellerQrScan } from "./useSellerQrAnalytics.js";

vi.mock("../api/sellerQrAnalyticsApi.js", () => ({
  trackSellerQrScan: vi.fn(),
  fetchMySellerQrStats: vi.fn(),
}));

const SELLER_ID = "6a871e02e4b218aa47757078";

function Probe({ isSelf = false }) {
  useTrackSellerQrScan({ sellerId: SELLER_ID, isSelf });
  return null;
}

/** @param {string} url @param {{ isSelf?: boolean }} [props] */
const renderAt = (url, props = {}) =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <Probe {...props} />
    </MemoryRouter>,
  );

describe("учёт переходов по QR-коду витрины", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it("зашли по коду — один раз сообщаем серверу", () => {
    renderAt(`/seller/${SELLER_ID}?src=qr`);

    expect(trackSellerQrScan).toHaveBeenCalledTimes(1);
    expect(vi.mocked(trackSellerQrScan).mock.calls[0][0].sellerId).toBe(SELLER_ID);
    expect(vi.mocked(trackSellerQrScan).mock.calls[0][0].visitorId).toMatch(
      /^[A-Za-z0-9_-]{8,64}$/,
    );
  });

  it("повторный заход в тот же день не считается", () => {
    renderAt(`/seller/${SELLER_ID}?src=qr`);
    renderAt(`/seller/${SELLER_ID}?src=qr`);

    expect(trackSellerQrScan).toHaveBeenCalledTimes(1);
  });

  it("обычный заход на витрину без метки не считается", () => {
    renderAt(`/seller/${SELLER_ID}`);

    expect(trackSellerQrScan).not.toHaveBeenCalled();
  });

  it("продавец на своей витрине не считается", () => {
    renderAt(`/seller/${SELLER_ID}?src=qr`, { isSelf: true });

    expect(trackSellerQrScan).not.toHaveBeenCalled();
  });
});
