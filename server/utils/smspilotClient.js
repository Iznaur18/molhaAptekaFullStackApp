import { logServerEvent } from "./logServerEvent.js";

const SMSPILOT_API_URL = "https://smspilot.ru/api.php";

/**
 * E.164 `+79…` → `79…` для SMSPILOT.
 * @param {string} e164
 */
export function toSmspilotPhone(e164) {
  return String(e164).trim().replace(/^\+/, "");
}

/**
 * Отправка SMS через SMSPILOT (реальная отправка и в development).
 *
 * @param {{ to: string; text: string; from?: string }} params
 *   `to` — E.164 (`+79…`) или digits `79…`
 * @returns {Promise<{ serverId?: string; balance?: string; cost?: string }>}
 */
export async function sendSmspilotSms({ to, text, from }) {
  const apikey = String(process.env.SMSPILOT_API_KEY ?? "").trim();
  if (!apikey) {
    throw new Error("SMS_DELIVERY_UNAVAILABLE");
  }

  const phone = toSmspilotPhone(to);
  const url = new URL(SMSPILOT_API_URL);
  url.searchParams.set("send", text);
  url.searchParams.set("to", phone);
  url.searchParams.set("apikey", apikey);
  url.searchParams.set("format", "json");
  url.searchParams.set("lang", "ru");
  const sender = String(from ?? process.env.SMSPILOT_SENDER ?? "").trim();
  if (sender) {
    url.searchParams.set("from", sender);
  }

  let response;
  try {
    response = await fetch(url, { method: "GET" });
  } catch (error) {
    logServerEvent("error", {
      event: "smspilot_fetch",
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error("SMS_DELIVERY_UNAVAILABLE");
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    logServerEvent("error", {
      event: "smspilot_json",
      status: response.status,
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error("SMS_DELIVERY_UNAVAILABLE");
  }

  if (data?.error) {
    const description =
      data.error.description_ru || data.error.description || "SMS error";
    const code = data.error.code ?? null;
    logServerEvent("error", {
      event: "smspilot_api_error",
      code,
      description,
      phone,
    });
    // Проброс текста SMSPILOT — иначе в UI только безликий 503.
    const err = new Error(`SMS_DELIVERY_UNAVAILABLE: ${description}`);
    err.smspilotCode = code;
    err.smspilotDescription = description;
    throw err;
  }

  const sendRow = Array.isArray(data?.send) ? data.send[0] : null;
  logServerEvent("info", {
    event: "smspilot_sent",
    phone,
    serverId: sendRow?.server_id ?? null,
    cost: data?.cost ?? null,
  });

  return {
    serverId: sendRow?.server_id != null ? String(sendRow.server_id) : undefined,
    balance: data?.balance != null ? String(data.balance) : undefined,
    cost: data?.cost != null ? String(data.cost) : undefined,
  };
}
