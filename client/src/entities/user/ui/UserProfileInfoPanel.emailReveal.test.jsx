import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render as rtlRender, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createTestQueryClient } from "../../../test/createTestQueryClient.js";

const fetchUserEmailMock = vi.fn();
vi.mock("../api/fetchUserEmail.js", () => ({
  fetchUserEmail: (...args) => fetchUserEmailMock(...args),
}));

const { UserProfileInfoPanel } = await import("./UserProfileInfoPanel.jsx");
const { getUserProfileRows } = await import("../lib/getUserProfileRows.js");

function render(ui) {
  return rtlRender(
    <QueryClientProvider client={createTestQueryClient()}>{ui}</QueryClientProvider>,
  );
}

const emailRow = (user) => getUserProfileRows(user).filter((row) => row.id === "email");

describe("почта в чужом профиле", () => {
  it("зарегистрирован по почте — кнопка, по нажатию ссылка на почту", async () => {
    fetchUserEmailMock.mockResolvedValue("seller@mail.ru");
    render(
      <UserProfileInfoPanel
        rows={emailRow({ _id: "u1", hasEmail: true })}
        hidePhoneUntilReveal
        userId="u1"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Показать почту" }));

    const link = await screen.findByRole("link", { name: "seller@mail.ru" });
    expect(link.getAttribute("href")).toBe("mailto:seller@mail.ru");
    expect(fetchUserEmailMock).toHaveBeenCalledWith("u1");
  });

  it("зарегистрирован по телефону — кнопки нет", () => {
    render(
      <UserProfileInfoPanel
        rows={emailRow({ _id: "u2" })}
        hidePhoneUntilReveal
        userId="u2"
      />,
    );

    expect(screen.queryByRole("button", { name: "Показать почту" })).toBeNull();
  });

  it("свой профиль — почта видна сразу, без кнопки", () => {
    render(
      <UserProfileInfoPanel rows={emailRow({ _id: "me", email: "me@mail.ru" })} />,
    );

    expect(screen.getByText("me@mail.ru")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Показать почту" })).toBeNull();
  });
});
