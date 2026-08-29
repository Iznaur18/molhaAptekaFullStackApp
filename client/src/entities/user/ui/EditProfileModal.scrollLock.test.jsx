import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "../../../test/renderWithProviders.jsx";

vi.mock("../../maps/ui/MapPointPicker.jsx", () => ({ MapPointPicker: () => null }));

const { EditProfileModal } = await import("./EditProfileModal.jsx");

const user = {
  _id: "6a871e02e4b218aa47757078",
  email: "user@example.com",
  userName: "user.name",
  userFullName: "Иван",
};

function renderModal() {
  return renderWithProviders(
    <EditProfileModal
      isOpen
      adminMode
      staffCanEditRole
      user={user}
      onClose={() => {}}
      onSaved={() => {}}
    />,
  );
}

describe("EditProfileModal: блокировка скролла", () => {
  it("не ставит position:fixed на body — это роняет мобильную клавиатуру", () => {
    const { unmount } = renderModal();

    expect(document.body.style.position).toBe("");
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.documentElement.style.overflow).toBe("hidden");

    unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("глушит touchmove вне диалога и пропускает внутри", () => {
    renderModal();

    const dispatchTouchMove = (target) => {
      const event = new Event("touchmove", { bubbles: true, cancelable: true });
      target.dispatchEvent(event);
      return event.defaultPrevented;
    };

    expect(dispatchTouchMove(document.body)).toBe(true);
    expect(dispatchTouchMove(screen.getByRole("dialog"))).toBe(false);
  });

  it("копит символы в поле и не теряет узел инпута", () => {
    renderModal();

    const input = screen.getByDisplayValue("Иван");
    fireEvent.change(input, { target: { value: "Иванн" } });
    fireEvent.change(input, { target: { value: "Иванно" } });

    expect(screen.getByDisplayValue("Иванно")).toBe(input);
  });
});
