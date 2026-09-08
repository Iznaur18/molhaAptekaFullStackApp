import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AuthContactChannelToggle } from "./AuthContactChannelToggle.jsx";

describe("AuthContactChannelToggle", () => {
  it("в test-среде рисует оба канала", () => {
    render(
      <AuthContactChannelToggle
        channel="phone"
        onChange={() => {}}
        ariaLabel="Способ входа"
        emailLabel="Email"
        phoneLabel="Телефон"
      />,
    );

    expect(screen.getByRole("group", { name: "Способ входа" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Email" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Телефон" })).toBeInTheDocument();
  });
});
