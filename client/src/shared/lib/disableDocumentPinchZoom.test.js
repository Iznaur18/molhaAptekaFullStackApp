import { afterEach, expect, test, vi } from "vitest";

import { disableDocumentPinchZoom } from "./disableDocumentPinchZoom.js";

afterEach(() => {
  vi.restoreAllMocks();
});

test("не вешает touch-слушатели на документ — иначе iOS ждёт JS перед каждым сдвигом пальца", () => {
  const addEventListener = vi.spyOn(document, "addEventListener");

  disableDocumentPinchZoom();

  const types = addEventListener.mock.calls.map(([type]) => type);
  expect(types).not.toContain("touchmove");
  expect(types).not.toContain("touchstart");
  expect(types).toContain("gesturestart");
});
