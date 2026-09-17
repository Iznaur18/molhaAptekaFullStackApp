import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

import {
  OPS_ALERT_SEVERITY_CRITICAL,
  OPS_ALERT_SEVERITY_WARNING,
  formatOpsAlertText,
  notifyOps,
  resetOpsAlertDedupe,
  resolveOpsAlertSeverity,
  resolveOpsAlertTelegramConfig,
} from "../services/ops-alerts/index.js";

const CONFIG = { token: "123:abc", chatId: "-100500" };

/**
 * @param {{ ok?: boolean; status?: number; throws?: Error }} [behaviour]
 */
function createFetchStub(behaviour = {}) {
  /** @type {Array<{ url: string; body: Record<string, unknown> }>} */
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url: String(url), body: JSON.parse(String(init.body)) });
    if (behaviour.throws) {
      throw behaviour.throws;
    }
    return { ok: behaviour.ok ?? true, status: behaviour.status ?? 200 };
  };
  return { calls, fetchImpl: /** @type {typeof fetch} */ (fetchImpl) };
}

afterEach(() => {
  resetOpsAlertDedupe();
});

test("resolveOpsAlertTelegramConfig: disabled without token or chat", () => {
  assert.equal(resolveOpsAlertTelegramConfig({}), null);
  assert.equal(
    resolveOpsAlertTelegramConfig({ OPS_ALERT_TELEGRAM_BOT_TOKEN: "t" }),
    null,
  );
  assert.deepEqual(
    resolveOpsAlertTelegramConfig({
      OPS_ALERT_TELEGRAM_BOT_TOKEN: " t ",
      OPS_ALERT_TELEGRAM_CHAT_ID: " c ",
    }),
    { token: "t", chatId: "c" },
  );
});

test("resolveOpsAlertSeverity: money is critical, jobs are warnings, fatal always alerts", () => {
  assert.equal(
    resolveOpsAlertSeverity("error", "payment.amount_mismatch"),
    OPS_ALERT_SEVERITY_CRITICAL,
  );
  assert.equal(
    resolveOpsAlertSeverity("error", "cron.job_failed"),
    OPS_ALERT_SEVERITY_WARNING,
  );
  assert.equal(
    resolveOpsAlertSeverity("fatal", "anything.unknown"),
    OPS_ALERT_SEVERITY_CRITICAL,
  );
  assert.equal(
    resolveOpsAlertSeverity("error", "notify_buyer_order_status_failed"),
    null,
  );
  assert.equal(resolveOpsAlertSeverity("info", "worker.heartbeat"), null);
});

test("notifyOps: no-op without config", async () => {
  const { calls, fetchImpl } = createFetchStub();
  const result = await notifyOps(
    { severity: OPS_ALERT_SEVERITY_CRITICAL, key: "k", title: "t" },
    { config: null, fetchImpl },
  );
  assert.deepEqual(result, { sent: false, reason: "disabled" });
  assert.equal(calls.length, 0);
});

test("notifyOps: sends to the configured chat without leaking the token into text", async () => {
  const { calls, fetchImpl } = createFetchStub();
  const result = await notifyOps(
    {
      severity: OPS_ALERT_SEVERITY_CRITICAL,
      key: "payment.amount_mismatch",
      title: "payment.amount_mismatch",
      details: { paymentId: "p1", expected: 100, actual: 90, stack: "long" },
    },
    { config: CONFIG, fetchImpl, source: "host · api" },
  );

  assert.deepEqual(result, { sent: true });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://api.telegram.org/bot123:abc/sendMessage");
  assert.equal(calls[0].body.chat_id, "-100500");
  const text = String(calls[0].body.text);
  assert.match(text, /^🔴 Критично · host · api\npayment\.amount_mismatch/);
  assert.match(text, /paymentId: p1/);
  assert.match(text, /actual: 90/);
  assert.doesNotMatch(text, /stack/);
  assert.doesNotMatch(text, /123:abc/);
});

test("notifyOps: repeats within 15 minutes are counted, not sent", async () => {
  const { calls, fetchImpl } = createFetchStub();
  let now = 1_000_000;
  const deps = { config: CONFIG, fetchImpl, now: () => now, source: "s" };
  const alert = {
    severity: OPS_ALERT_SEVERITY_WARNING,
    key: "cron.job_failed",
    title: "cron",
  };

  assert.equal((await notifyOps(alert, deps)).sent, true);
  now += 60_000;
  assert.deepEqual(await notifyOps(alert, deps), { sent: false, reason: "deduped" });
  now += 60_000;
  assert.deepEqual(await notifyOps(alert, deps), { sent: false, reason: "deduped" });
  now += 15 * 60_000;
  assert.equal((await notifyOps(alert, deps)).sent, true);

  assert.equal(calls.length, 2);
  assert.match(String(calls[1].body.text), /Повторялось ещё 2 раз/);
  assert.match(String(calls[1].body.text), /^🟠 Важно/);
});

test("notifyOps: delivery failures never throw", async () => {
  const originalError = console.error;
  const lines = [];
  console.error = (line) => lines.push(String(line));
  try {
    const http = createFetchStub({ ok: false, status: 429 });
    assert.deepEqual(
      await notifyOps(
        { severity: OPS_ALERT_SEVERITY_CRITICAL, key: "a", title: "a" },
        { config: CONFIG, fetchImpl: http.fetchImpl, source: "s" },
      ),
      { sent: false, reason: "http_429" },
    );

    const network = createFetchStub({ throws: new Error("offline") });
    assert.deepEqual(
      await notifyOps(
        { severity: OPS_ALERT_SEVERITY_CRITICAL, key: "b", title: "b" },
        { config: CONFIG, fetchImpl: network.fetchImpl, source: "s" },
      ),
      { sent: false, reason: "network" },
    );
  } finally {
    console.error = originalError;
  }
  assert.equal(lines.length, 2);
  assert.ok(lines.every((line) => line.includes("ops_alert.delivery_failed")));
  assert.ok(lines.every((line) => !line.includes("123:abc")));
});

test("formatOpsAlertText: long values and too many fields are trimmed", () => {
  const details = Object.fromEntries(
    Array.from({ length: 15 }, (_, i) => [`f${i}`, "x".repeat(500)]),
  );
  const text = formatOpsAlertText({
    severity: OPS_ALERT_SEVERITY_WARNING,
    title: "t",
    details,
    source: "s",
  });
  const fieldLines = text.split("\n").filter((line) => line.startsWith("f"));
  assert.equal(fieldLines.length, 10);
  assert.ok(fieldLines.every((line) => line.length <= "f10: ".length + 201));
});
