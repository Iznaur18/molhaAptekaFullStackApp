/**
 * Mock API Wayset (ЛОБО) под https://services.wayset.ru/api/v1/external/docs
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

const FLOW = ["new", "assigned", "accepted", "arrived", "in_progress", "done"];

/** @type {Map<string, Record<string, any>>} */
const ordersByExternalId = new Map();
/** @type {Map<string, Record<string, any>>} */
const ordersById = new Map();
let nextId = 1000;

/** @param {Record<string, any>} order */
function currentStatus(order) {
  if (order.cancelled_at) return "cancelled";
  if (order.merged_into != null) return "merged";
  const elapsed = (Date.now() - order.created_ms) / 1000;
  const index = Math.min(FLOW.length - 1, Math.floor(elapsed / STEP_SECONDS));
  return FLOW[index];
}

/** @param {Record<string, any>} order */
function present(order) {
  const status = currentStatus(order);
  const assigned = status !== "new";
  return {
    id: order.id,
    external_id: order.external_id,
    status,
    merged_into: order.merged_into ?? null,
    tariff: order.tariff,
    // Как у настоящего Wayset: в заказе цена — cost/final_cost, total только в расчёте.
    cost: order.total,
    final_cost: order.total,
    payment_method: order.payment_method,
    is_paid: order.is_paid,
    courier_name: assigned ? "Курьер ЛОБО (mock)" : "",
    courier_phone: assigned ? "+79280000000" : "",
    distance_km: 5.2,
    duration_min: 15,
    created_at: new Date(order.created_ms).toISOString(),
    delivered_at:
      status === "done" ? new Date(order.created_ms + 9000).toISOString() : null,
  };
}

/**
 * Простая формула тарифа «car»: 200 ₽ за первый километр, дальше 35 ₽/км
 * по прямой.
 *
 * @param {Record<string, number>} body
 */
function estimate(body) {
  const distanceKm =
    Math.abs(body.pickup_lat - body.delivery_lat) * 111 +
    Math.abs(body.pickup_lon - body.delivery_lon) * 62;
  const total = Math.round(Math.max(200, 200 + (distanceKm - 1) * 35));
  return { distanceKm: Math.round(distanceKm * 10) / 10, total };
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

const REQUIRED_ORDER_FIELDS = [
  "client_name",
  "client_phone",
  "pickup_address",
  "pickup_lat",
  "pickup_lon",
  "delivery_address",
  "delivery_lat",
  "delivery_lon",
];

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://127.0.0.1:${PORT}`);
  const path = url.pathname.replace(/^\/api\/v1\/external/, "");

  if (!isAuthorized(req)) {
    return send(res, 401, { detail: "Invalid API key or credentials" });
  }

  if (req.method === "GET" && path === "/ping") {
    return send(res, 200, { ok: true, merchant: { id: 1, name: "Mock" }, test: true });
  }

  if (req.method === "GET" && path === "/tariffs") {
    return send(res, 200, {
      city_id: 1,
      city_name: "Грозный",
      tariffs: [{ tariff: "car", title: "Легковой", base_fare: 200, per_km: 35 }],
    });
  }

  if (req.method === "POST" && path === "/estimate") {
    const body = await readJson(req);
    if (!body) return send(res, 422, { detail: "Invalid JSON" });
    for (const field of ["pickup_lat", "pickup_lon", "delivery_lat", "delivery_lon"]) {
      if (typeof body[field] !== "number") {
        return send(res, 400, { detail: `Field ${field} is required` });
      }
    }
    const { distanceKm, total } = estimate(body);
    return send(res, 200, {
      quote_token: `mock-quote-${total}`,
      quote_valid_for_seconds: 300,
      tariff: body.tariff || "car",
      city_id: 1,
      city_name: "Грозный",
      is_suburban: false,
      distance_km: distanceKm,
      duration_min: Math.max(10, Math.round(distanceKm * 3)),
      subzone_fee: 0,
      total,
    });
  }

  if (req.method === "GET" && path === "/orders") {
    return send(res, 200, [...ordersById.values()].map(present));
  }

  if (req.method === "POST" && path === "/orders") {
    const body = await readJson(req);
    if (!body) return send(res, 422, { detail: "Invalid JSON" });
    for (const field of REQUIRED_ORDER_FIELDS) {
      if (body[field] === undefined || body[field] === null || body[field] === "") {
        return send(res, 400, { detail: `Field ${field} is required` });
      }
    }
    // Недоступный способ оплаты Wayset отклоняет — заказ не создаётся.
    if (body.payment_method && !["cash", "online"].includes(body.payment_method)) {
      return send(res, 400, { detail: "Payment method is not available" });
    }

    const externalId = String(body.external_id || `mock-${nextId}`);
    const existing = ordersByExternalId.get(externalId);
    // Повтор с тем же номером возвращает уже созданный заказ, как у Wayset.
    if (existing) return send(res, 200, present(existing));

    const order = {
      id: nextId++,
      external_id: externalId,
      tariff: body.tariff || "car",
      total: estimate(body).total,
      payment_method: body.payment_method || "cash",
      is_paid: body.is_paid === true,
      created_ms: Date.now(),
      cancelled_at: null,
    };
    ordersByExternalId.set(externalId, order);
    ordersById.set(String(order.id), order);
    console.log(`[lobo-mock] создан заказ ${order.id} (${externalId})`);
    return send(res, 200, present(order));
  }

  // Только для тестов: склеить заказ с другим, как это делает диспетчер Wayset.
  if (req.method === "POST" && path === "/__test/merge") {
    const body = await readJson(req);
    const order = ordersById.get(String(body?.id));
    if (!order || !ordersById.has(String(body?.into))) {
      return send(res, 404, { detail: "Order not found" });
    }
    order.merged_into = Number(body.into);
    return send(res, 200, present(order));
  }

  const byId = path.match(/^\/orders\/([^/]+)(\/cancel|\/track)?$/);
  if (byId) {
    const order = ordersById.get(decodeURIComponent(byId[1]));
    if (!order) return send(res, 404, { detail: "Order not found" });

    if (byId[2] === "/cancel") {
      if (req.method !== "POST") return send(res, 405, { detail: "Use POST" });
      const status = currentStatus(order);
      if (status === "in_progress" || status === "done") {
        return send(res, 409, { detail: "Cannot cancel after pickup" });
      }
      order.cancelled_at = new Date().toISOString();
      console.log(`[lobo-mock] отменён заказ ${order.id}`);
      return send(res, 200, present(order));
    }

    if (byId[2] === "/track") {
      if (req.method !== "POST") return send(res, 405, { detail: "Use POST" });
      if (!["accepted", "arrived", "in_progress"].includes(currentStatus(order))) {
        return send(res, 400, {
          detail:
            "Отслеживание доступно, пока заказ везут: accepted, arrived, in_progress",
        });
      }
      return send(res, 200, {
        code: String(order.id),
        url: `https://wayset.ru/track/${order.id}`,
      });
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
