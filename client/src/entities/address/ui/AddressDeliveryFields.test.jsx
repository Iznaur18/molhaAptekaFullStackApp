import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ADDRESS_SUGGEST_DEBOUNCE_MS } from "../model/constants.js";
import { ADDRESS_DELIVERY_UI } from "../../../shared/config/appUiCopy.js";
import { buildAddressSuggestions } from "../../../test/fixtures/apiFixtures.js";
import { renderWithProviders } from "../../../test/renderWithProviders.jsx";

const fetchAddressSuggestionsMock = vi.fn();

vi.mock("../api/fetchAddressSuggestions.js", () => ({
  fetchAddressSuggestions: (...args) => fetchAddressSuggestionsMock(...args),
}));

vi.mock("../../maps/ui/MapPointPicker.jsx", () => ({
  MapPointPicker: () => null,
}));

const { AddressDeliveryFields } = await import("./AddressDeliveryFields.jsx");

const emptyValue = {
  line: "",
  flat: "",
  fiasId: "",
  geo: null,
  selectedFromSuggest: false,
};

/**
 * @param {{ onChangeSpy?: (next: typeof emptyValue) => void; labels?: { line?: string } }} props
 */
function AddressDeliveryFieldsHarness({ onChangeSpy, labels }) {
  const [value, setValue] = useState(emptyValue);

  return (
    <AddressDeliveryFields
      value={value}
      labels={labels}
      onChange={(next) => {
        setValue(next);
        onChangeSpy?.(next);
      }}
    />
  );
}

describe("AddressDeliveryFields", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    fetchAddressSuggestionsMock.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders combobox and updates value while typing", () => {
    const onChangeSpy = vi.fn();

    renderWithProviders(<AddressDeliveryFieldsHarness onChangeSpy={onChangeSpy} />);

    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "Мо" } });

    expect(onChangeSpy).toHaveBeenCalledWith(
      expect.objectContaining({ line: "Мо", selectedFromSuggest: false }),
    );
    expect(input).toHaveValue("Мо");
  });

  it("shows suggestions after debounce and applies pick", async () => {
    vi.useRealTimers();
    const suggestions = buildAddressSuggestions();
    fetchAddressSuggestionsMock.mockResolvedValue(suggestions);
    const onChangeSpy = vi.fn();

    renderWithProviders(<AddressDeliveryFieldsHarness onChangeSpy={onChangeSpy} />);

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "Моск" } });

    await waitFor(
      () => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      },
      { timeout: ADDRESS_SUGGEST_DEBOUNCE_MS + 1500 },
    );

    fireEvent.click(screen.getByRole("button", { name: suggestions[0].value }));

    expect(onChangeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        line: suggestions[0].value,
        selectedFromSuggest: true,
        fiasId: "fias-house-1",
        geo: { lat: 55.75, lon: 37.62 },
      }),
    );
  });

  it("uses custom line label", () => {
    renderWithProviders(
      <AddressDeliveryFieldsHarness labels={{ line: "Кастомный адрес" }} />,
    );

    expect(screen.getByText("Кастомный адрес")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(ADDRESS_DELIVERY_UI.PLACEHOLDER_LINE)).toBeInTheDocument();
  });
});
