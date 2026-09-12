import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CatalogBrowserBreadcrumb } from "./CatalogBrowserBreadcrumb.jsx";

describe("CatalogBrowserBreadcrumb", () => {
  it("renders non-current segments as buttons when onItemClick is set", async () => {
    const user = userEvent.setup();
    const onItemClick = vi.fn();

    render(
      <CatalogBrowserBreadcrumb
        items={[
          { categoryId: "1", labelRu: "торты" },
          { categoryId: "2", labelRu: "с кремом" },
          { categoryId: "3", labelRu: "без сахара" },
        ]}
        onCatalogRootClick={() => {}}
        onItemClick={onItemClick}
      />,
    );

    expect(screen.getByRole("button", { name: "торты" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "с кремом" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "без сахара" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("без сахара")).toHaveAttribute("aria-current", "page");

    await user.click(screen.getByRole("button", { name: "торты" }));
    expect(onItemClick).toHaveBeenCalledWith(
      expect.objectContaining({ categoryId: "1", labelRu: "торты" }),
      0,
    );
  });

  it("renders label-only trail as buttons without categoryId", async () => {
    const user = userEvent.setup();
    const onItemClick = vi.fn();

    render(
      <CatalogBrowserBreadcrumb
        label="торты › с кремом › без сахара"
        onItemClick={onItemClick}
      />,
    );

    await user.click(screen.getByRole("button", { name: "с кремом" }));
    expect(onItemClick).toHaveBeenCalledWith(
      expect.objectContaining({ labelRu: "с кремом" }),
      1,
    );
  });
});
