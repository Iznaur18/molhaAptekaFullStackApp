import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  ADMIN_PRODUCT_MODERATION_TRUST_UI,
  FORMAT_BOOLEAN_RU,
} from "../../../shared/config/appUiCopy.js";
import { renderWithProviders } from "../../../test/renderWithProviders.jsx";

const patchTrustMock = vi.fn(async ({ trusted }) => ({
  userId: "user-1",
  productModerationTrusted: trusted,
}));

vi.mock("../api/patchSellerProductModerationTrust.js", () => ({
  patchSellerProductModerationTrust: (input) => patchTrustMock(input),
}));

const { AdminProductModerationTrustControl } = await import(
  "./AdminProductModerationTrustControl.jsx"
);

const renderControl = ({ trusted }) => {
  const onChanged = vi.fn();
  renderWithProviders(
    <AdminProductModerationTrustControl
      user={{ _id: "user-1", productModerationTrusted: trusted }}
      onChanged={onChanged}
    />,
  );
  return { onChanged };
};

describe("админский тумблер публикации без проверки", () => {
  it("недоверенному продавцу предлагает выдать доверие", async () => {
    patchTrustMock.mockClear();
    const { onChanged } = renderControl({ trusted: false });

    expect(screen.getByText(ADMIN_PRODUCT_MODERATION_TRUST_UI.STATUS_OFF)).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", {
        name: ADMIN_PRODUCT_MODERATION_TRUST_UI.ACTION_GRANT,
      }),
    );
    expect(
      screen.getByText(ADMIN_PRODUCT_MODERATION_TRUST_UI.CONFIRM_GRANT),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: FORMAT_BOOLEAN_RU.YES }));

    await waitFor(() => expect(patchTrustMock).toHaveBeenCalledTimes(1));
    expect(patchTrustMock).toHaveBeenCalledWith({ userId: "user-1", trusted: true });
    await waitFor(() =>
      expect(onChanged).toHaveBeenCalledWith({ productModerationTrusted: true }),
    );
  });

  it("доверенному продавцу предлагает вернуть проверку", async () => {
    patchTrustMock.mockClear();
    const { onChanged } = renderControl({ trusted: true });

    expect(screen.getByText(ADMIN_PRODUCT_MODERATION_TRUST_UI.STATUS_ON)).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", {
        name: ADMIN_PRODUCT_MODERATION_TRUST_UI.ACTION_REVOKE,
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: FORMAT_BOOLEAN_RU.YES }));

    await waitFor(() =>
      expect(patchTrustMock).toHaveBeenCalledWith({ userId: "user-1", trusted: false }),
    );
    await waitFor(() =>
      expect(onChanged).toHaveBeenCalledWith({ productModerationTrusted: false }),
    );
  });

  it("ошибку сервера показывает на месте", async () => {
    patchTrustMock.mockClear();
    patchTrustMock.mockRejectedValueOnce(new Error("Доступ только для администратора"));
    const { onChanged } = renderControl({ trusted: false });

    fireEvent.click(
      screen.getByRole("button", {
        name: ADMIN_PRODUCT_MODERATION_TRUST_UI.ACTION_GRANT,
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: FORMAT_BOOLEAN_RU.YES }));

    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toContain(
        "Доступ только для администратора",
      ),
    );
    expect(onChanged).not.toHaveBeenCalled();
  });
});
