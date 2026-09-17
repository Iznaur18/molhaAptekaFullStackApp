import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { RAFFLE_PARTICIPANTS_SHEET_UI } from "../../../shared/config/appUiCopy.js";
import { renderWithProviders } from "../../../test/renderWithProviders.jsx";

const fetchRaffleParticipants = vi.fn();
vi.mock("../api/fetchRaffleParticipants.js", () => ({
  fetchRaffleParticipants: (...args) => fetchRaffleParticipants(...args),
}));

const { RaffleParticipantsSheet } = await import("./RaffleParticipantsSheet.jsx");

describe("окно участников розыгрыша", () => {
  it("грузит список при открытии и показывает, кто сколько купил", async () => {
    fetchRaffleParticipants.mockResolvedValue({
      participants: [
        { userId: "u1", userName: "Амина", userAvatarUrl: "", ticketCount: 3 },
        { userId: "u2", userName: "Ислам", userAvatarUrl: "", ticketCount: 1 },
      ],
      total: 2,
    });

    renderWithProviders(
      <RaffleParticipantsSheet
        isOpen
        raffleId="raffle-1"
        participantsCount={2}
        onClose={() => {}}
      />,
    );

    expect(await screen.findByText("Амина")).toBeTruthy();
    expect(fetchRaffleParticipants).toHaveBeenCalledWith("raffle-1");
    expect(screen.getByText("3 товара")).toBeTruthy();
    expect(screen.getByText("1 товар")).toBeTruthy();
    const names = screen
      .getAllByRole("button", { name: /Открыть профиль/ })
      .map((button) => button.textContent);
    expect(names).toEqual(["Амина", "Ислам"]);
  });

  it("закрытое окно ничего не запрашивает", () => {
    fetchRaffleParticipants.mockClear();
    renderWithProviders(
      <RaffleParticipantsSheet
        isOpen={false}
        raffleId="raffle-1"
        participantsCount={2}
        onClose={() => {}}
      />,
    );

    expect(fetchRaffleParticipants).not.toHaveBeenCalled();
  });

  it("пустой список и закрытие по кнопке", async () => {
    fetchRaffleParticipants.mockResolvedValue({ participants: [], total: 0 });
    const onClose = vi.fn();

    renderWithProviders(
      <RaffleParticipantsSheet
        isOpen
        raffleId="raffle-2"
        participantsCount={0}
        onClose={onClose}
      />,
    );

    await waitFor(() =>
      expect(screen.getByText(RAFFLE_PARTICIPANTS_SHEET_UI.EMPTY)).toBeTruthy(),
    );
    fireEvent.click(
      screen.getAllByRole("button", { name: RAFFLE_PARTICIPANTS_SHEET_UI.CLOSE })[1],
    );
    expect(onClose).toHaveBeenCalled();
  });
});
