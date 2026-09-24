import { afterEach, describe, expect, it, vi } from "vitest";

import {
  listenAccountChanges,
  notifyAccountChanged,
} from "./accountChangeBroadcast.js";

describe("accountChangeBroadcast", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("другая вкладка получает сигнал о смене аккаунта", async () => {
    const onChange = vi.fn();
    const stop = listenAccountChanges(onChange);
    notifyAccountChanged();
    await vi.waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
    stop();
  });

  it("без BroadcastChannel — через событие storage", () => {
    vi.stubGlobal("BroadcastChannel", undefined);
    const onChange = vi.fn();
    const stop = listenAccountChanges(onChange);
    window.dispatchEvent(
      new StorageEvent("storage", { key: "gitorg-account-change-at", newValue: "1" }),
    );
    window.dispatchEvent(new StorageEvent("storage", { key: "other", newValue: "1" }));
    expect(onChange).toHaveBeenCalledTimes(1);
    stop();
  });
});
