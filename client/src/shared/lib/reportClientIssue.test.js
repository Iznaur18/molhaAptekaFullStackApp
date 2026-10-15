import { afterEach, describe, expect, it, vi } from "vitest";

import {
  reportClientIssue,
  resetReportedClientIssuesForTests,
} from "./reportClientIssue.js";

describe("reportClientIssue", () => {
  afterEach(() => {
    resetReportedClientIssuesForTests();
    vi.restoreAllMocks();
  });

  it("пишет предупреждение один раз на место и тип ошибки", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    reportClientIssue("storage.read", new DOMException("blocked", "SecurityError"));
    reportClientIssue("storage.read", new DOMException("blocked", "SecurityError"));
    reportClientIssue("storage.read", new TypeError("other"));
    reportClientIssue("storage.write", new DOMException("full", "QuotaExceededError"));

    expect(warn).toHaveBeenCalledTimes(3);
    expect(warn.mock.calls[0][0]).toBe("[storage.read]");
  });
});
