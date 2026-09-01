import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "../../../test/renderWithProviders.jsx";

const { ConfirmButton } = await import("./ConfirmButton.jsx");

const setup = (onConfirm) =>
  renderWithProviders(
    <ConfirmButton
      label="Отменить"
      question="Точно отменить?"
      onConfirm={onConfirm}
    />,
  );

describe("подтверждение прямо в кнопке", () => {
  it("первый клик только спрашивает", () => {
    const onConfirm = vi.fn();
    setup(onConfirm);

    fireEvent.click(screen.getByRole("button", { name: "Отменить" }));

    expect(screen.getByText("Точно отменить?")).toBeTruthy();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("второй клик выполняет действие", () => {
    const onConfirm = vi.fn();
    setup(onConfirm);

    fireEvent.click(screen.getByRole("button", { name: "Отменить" }));
    fireEvent.click(screen.getByRole("button", { name: "Да" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("«Нет» возвращает кнопку и ничего не делает", () => {
    const onConfirm = vi.fn();
    setup(onConfirm);

    fireEvent.click(screen.getByRole("button", { name: "Отменить" }));
    fireEvent.click(screen.getByRole("button", { name: "Нет" }));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Отменить" })).toBeTruthy();
  });

  it("не зависит от блокировки диалогов браузером", () => {
    const onConfirm = vi.fn();
    // Именно так ведёт себя confirm после «не показывать больше».
    const spy = vi.spyOn(window, "confirm").mockReturnValue(false);
    setup(onConfirm);

    fireEvent.click(screen.getByRole("button", { name: "Отменить" }));
    fireEvent.click(screen.getByRole("button", { name: "Да" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});
