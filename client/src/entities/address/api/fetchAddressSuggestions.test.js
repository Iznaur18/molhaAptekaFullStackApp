import { beforeEach, describe, expect, it, vi } from "vitest";

import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";
import { buildAddressSuggestions } from "../../../test/fixtures/apiFixtures.js";

const postMock = vi.fn();

vi.mock("../../../shared/api/index.js", () => ({
  apiClient: {
    post: (...args) => postMock(...args),
  },
}));

const { fetchAddressSuggestions } = await import("./fetchAddressSuggestions.js");

describe("fetchAddressSuggestions", () => {
  beforeEach(() => {
    postMock.mockReset();
  });

  it("posts query and returns suggestions", async () => {
    const suggestions = buildAddressSuggestions();
    postMock.mockResolvedValue({
      data: { success: true, data: { suggestions } },
    });

    const result = await fetchAddressSuggestions("Москва");

    expect(postMock).toHaveBeenCalledWith("/address/suggest", { query: "Москва" });
    expect(result).toEqual(suggestions);
  });

  it("throws on invalid envelope", async () => {
    postMock.mockResolvedValue({ data: { success: false } });

    await expect(fetchAddressSuggestions("Москва")).rejects.toThrow(
      API_CLIENT_UI.INVALID_SERVER_RESPONSE,
    );
  });

  it("maps server error message", async () => {
    postMock.mockRejectedValue({
      response: { data: { message: "DaData недоступен" } },
    });

    await expect(fetchAddressSuggestions("Москва")).rejects.toThrow("DaData недоступен");
  });
});
