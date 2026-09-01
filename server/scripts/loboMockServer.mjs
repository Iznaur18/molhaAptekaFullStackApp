/**
 * Mock DMS ЛОБО (Wayset) под docs/lobo-api-contract.md
 *
 * Запуск:
 *   cd server && npm run lobo:mock
 *
 * По умолчанию: http://127.0.0.1:3092
 * Ключи: dms_mock_key / mock:mock (или LOBO_MOCK_*)
 *
 * Нужен, чтобы прогонять весь путь доставки без боевых ключей: заказ
 * создаётся, статус двигается, отмена работает. Статус переключается сам по
 * таймеру — так проще смотреть, как наша лестница реагирует на чужую.
 */
import http from "node:http";

const PORT = Number(process.env.LOBO_MOCK_PORT || 3092);
const API_KEY = process.env.LOBO_MOCK_API_KEY || "dms_mock_key";
const LOGIN = process.env.LOBO_MOCK_LOGIN || "mock";
const PASSWORD = process.env.LOBO_MOCK_PASSWORD || "mock";

/** Сколько секунд держится каждый статус, прежде чем сменится следующим. */
const STEP_SECONDS = Number(process.env.LOBO_MOCK_STEP_SECONDS || 20);

const FLOW = [
  "created",
  "assigned",
  "accepted",
  "arrived",
  "picked_up",
  "delivered",
];

/** @type {Map<string, Record<string, any>>} */
const ordersByExternalId = new Map();
let nextId = 1000;

/** @param {Record<string, any>} order */
function currentStatus(order) {
  if (order.cancelled_at) return "cancelled";
  const elapsed = (Date.now() - order.created_ms) / 1000;
  const index = Math.min(FLOW.length - 1, Math.floor(elapsed / STEP_SECONDS));
  return FLOW[index];
}

/** @param {Record<string, any>} order */
function present(order) {
  const status = currentStatus(order);
  return {
    id: order.id,
    external_id: order.external_id,
    status,
    cost: order.cost,
    final_cost: order.final_cost,
    zone_id: 26,
    is_suburban: false,
    courier_id: status === "created" ? null : 501,
    courier_name: status === "created" ? "" : "Курьер ЛОБО (mock)",
    courier_phone: status === "created" ? "" : "+79280000000",
    distance_km: 5.2,
    duration_min: 15,
    created_at: new Date(order.created_ms).toISOString(),
    assigned_at:
      status === "created" ? null : new Date(order.created_ms + 1000).toISOString(),
    delivered_at:
      status === "delivered" ? new Date(order.created_ms + 9000).toISOString() : null,
  };
}

/** @param {import('node:http').IncomingMessage} req */
function isAuthorized(req) {
  if (req.headers["x-api-key"] !== API_KEY) return false;
  const auth = String(req.headers.authorization || "");
  if (!auth.startsWith("Basic ")) return false;
  const decoded = Buffer.from(auth.slice(6), "base64").toString("utf8");
  return decoded === `${LOGIN}:${PASSWORD}`;
}

/** @param {import('node:http').IncomingMessage} req */
async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (chunks.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return null;
  }
}

/** @param {import('node:http').ServerResponse} res */
function send(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://127.0.0.1:${PORT}`);
  const path = url.pathname.replace(/^\/api\/v1\/external/, "");

  if (!isAuthorized(req)) {
    return send(res, 401, { detail: "Invalid API key or credentials" });
  }

  if (req.method === "GET" && path === "/zones") {
    return send(res, 200, {
      zones: [
        {
          id: 26,
          name: "Грозный",
          city: "Грозный",
          default_tariff_id: 1,
          default_tariff: { id: 1, name: "Стандарт", base_price: 150 },
          tariffs: [{ id: 1, name: "Стандарт", base_price: 150 }],
        },
      ],
    });
  }

  if (req.method === "GET" && path === "/tariffs") {
    return send(res, 200, {
      tariffs: [
        {
          id: 1,
          name: "Стандарт",
          base_price: 150,
          price_per_km: 20,
          price_per_min: 0,
          min_price: 150,
          point_price: 0,
          zone_id: 26,
          is_default: true,
        },
      ],
    });
  }

  if (req.method === "POST" && path === "/estimate") {
    const body = await readJson(req);
    if (!body) return send(res, 422, { detail: "Invalid JSON" });
    const required = ["pickup_lat", "pickup_lon", "delivery_lat", "delivery_lon"];
    for (const field of required) {
      if (typeof body[field] !== "number") {
        return send(res, 400, { detail: `Field ${field} is required` });
      }
    }
    // Простая, но не выдуманная формула: база плюс расстояние по прямой.
    const distanceKm =
      Math.abs(body.pickup_lat - body.delivery_lat) * 111 +
      Math.abs(body.pickup_lon - body.delivery_lon) * 62;
    const cost = Math.round(150 + distanceKm * 20);
    return send(res, 200, {
      cost,
      subzone_fee: 0,
      final_cost: cost,
      zone: { id: 26, name: "Грозный" },
      is_suburban: false,
      distance_km: Math.round(distanceKm * 10) / 10,
      duration_min: Math.max(10, Math.round(distanceKm * 3)),
    });
  }

  if (req.method === "POST" && path === "/orders") {
    const body = await readJson(req);
    if (!body) return send(res, 422, { detail: "Invalid JSON" });
    for (const field of [
      "client_name",
      "client_phone",
      "pickup_address",
      "pickup_lat",
      "pickup_lon",
      "delivery_address",
      "delivery_lat",
      "delivery_lon",
    ]) {
      if (body[field] === undefined || body[field] === null || body[field] === "") {
        return send(res, 400, { detail: `Field ${field} is required` });
      }
    }

    const externalId = String(body.external_id || `mock-${nextId}`);
    const existing = ordersByExternalId.get(externalId);
    // Повторный вызов с тем же номером не плодит заказы — так спокойнее
    // отлаживать ретраи.
    if (existing) return send(res, 200, present(existing));

    const order = {
      id: nextId++,
      external_id: externalId,
      cost: Number(body.cost) || 0,
      final_cost: Number(body.cost) || 0,
      created_ms: Date.now(),
      cancelled_at: null,
    };
    ordersByExternalId.set(externalId, order);
    console.log(`[lobo-mock] создан заказ ${externalId}`);
    return send(res, 200, present(order));
  }

  const byNumber = path.match(/^\/orders\/by-number\/([^/]+)(\/cancel)?$/);
  if (byNumber) {
    const externalId = decodeURIComponent(byNumber[1]);
    const order = ordersByExternalId.get(externalId);
    if (!order) return send(res, 404, { detail: "Order not found" });

    if (byNumber[2] === "/cancel") {
      if (req.method !== "POST") return send(res, 405, { detail: "Use POST" });
      const status = currentStatus(order);
      if (status === "picked_up" || status === "delivered") {
        return send(res, 409, { detail: "Cannot cancel after pickup" });
      }
      order.cancelled_at = new Date().toISOString();
      console.log(`[lobo-mock] отменён заказ ${externalId}`);
      return send(res, 200, present(order));
    }

    if (req.method !== "GET") return send(res, 405, { detail: "Use GET" });
    return send(res, 200, present(order));
  }

  return send(res, 404, { detail: "Not found" });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[lobo-mock] http://127.0.0.1:${PORT}/api/v1/external`);
  console.log(`[lobo-mock] X-API-Key: ${API_KEY}`);
  console.log(`[lobo-mock] Basic: ${LOGIN}:${PASSWORD}`);
  console.log(`[lobo-mock] шаг статуса: ${STEP_SECONDS}с`);
});
