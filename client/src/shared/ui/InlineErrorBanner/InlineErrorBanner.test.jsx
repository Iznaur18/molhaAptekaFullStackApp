import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InlineErrorBanner } from "./InlineErrorBanner.jsx";

describe("InlineErrorBanner", () => {
  it("renders alert with message and mark", () => {
    render(
      <InlineErrorBanner>Сервер временно недоступен. Попробуйте позже</InlineErrorBanner>,
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("inline-error-banner");
    expect(alert).toHaveTextContent("Сервер временно недоступен. Попробуйте позже");
    expect(alert.querySelector(".inline-error-banner__mark")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});
