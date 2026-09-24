import { afterEach, describe, expect, it, vi } from "vitest";

import {
  listenAccountChanges,
  notifyAccountChanged,
} from "./accountChangeBroadcast.js";

const CHANNEL_NAME = "gitorg-account-change";

describe("accountChangeBroadcast", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("сигнал из другой вкладки перезагружает эту", async () => {
    const onChange = vi.fn();
    const stop = listenAccountChanges(onChange);
    const otherTab = new BroadcastChannel(CHANNEL_NAME);
    otherTab.postMessage({ tabId: "other-tab" });
    await vi.waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
    otherTab.close();
    stop();
  });

  it("свой же сигнал вкладку не перезагружает (иначе сбивался переход на вход)", async () => {
    const onChange = vi.fn();
    const stop = listenAccountChanges(onChange);
    notifyAccountChanged();
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(onChange).not.toHaveBeenCalled();
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
