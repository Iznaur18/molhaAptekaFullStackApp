import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const captureExceptionMock = vi.fn();
vi.mock("../../lib/sentryClient.js", () => ({
  captureException: (...args) => captureExceptionMock(...args),
}));

const isEnabledMock = vi.fn();
vi.mock("../../lib/clientSentryEnv.js", () => ({
  isClientSentryEnabled: () => isEnabledMock(),
}));

const { AppErrorBoundary } = await import("./AppErrorBoundary.jsx");

function Boom() {
  throw new Error("Компонент упал");
}

describe("граница ошибок", () => {
  beforeEach(() => {
    captureExceptionMock.mockClear();
    // React печатает пойманную ошибку в консоль — в отчёте теста это шум.
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("докладывает о падении, когда Sentry включён", async () => {
    isEnabledMock.mockReturnValue(true);

    render(
      <AppErrorBoundary>
        <Boom />
      </AppErrorBoundary>,
    );

    // Падение в React граница гасит: без явной отправки Sentry о нём не узнает.
    await vi.waitFor(() => expect(captureExceptionMock).toHaveBeenCalled());
    expect(captureExceptionMock.mock.calls[0][0].message).toBe("Компонент упал");
  });

  it("без Sentry просто показывает экран ошибки", () => {
    isEnabledMock.mockReturnValue(false);

    render(
      <AppErrorBoundary>
        <Boom />
      </AppErrorBoundary>,
    );

    expect(captureExceptionMock).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toBeTruthy();
  });
});
