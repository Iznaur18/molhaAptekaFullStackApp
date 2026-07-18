import { expect, test } from "vitest";

import {
  formatRubPriceInput,
  parseRubPriceInput,
} from "./numericInput.js";

test("formatRubPriceInput groups thousands for create-product price fields", () => {
  expect(formatRubPriceInput("1000")).toBe("1\u00a0000");
  expect(formatRubPriceInput("1 000 000")).toBe("1\u00a0000\u00a0000");
  expect(formatRubPriceInput("12abc34")).toBe("1\u00a0234");
  expect(formatRubPriceInput("")).toBe("");
});

test("formatRubPriceInput caps at 9 digits", () => {
  expect(formatRubPriceInput("1234567890")).toBe("123\u00a0456\u00a0789");
});

test("parseRubPriceInput reads grouped rub input", () => {
  expect(parseRubPriceInput("1 000")).toBe(1000);
  expect(parseRubPriceInput("1\u00a0000\u00a0000")).toBe(1_000_000);
  expect(parseRubPriceInput("")).toBe(null);
});
