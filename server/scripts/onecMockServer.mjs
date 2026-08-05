/**
 * Mock HTTP-сервис 1С под контракт docs/onec-http-contract.md
 *
 * Запуск:
 *   cd server && node scripts/onecMockServer.mjs
 *
 * По умолчанию: http://127.0.0.1:3091
 * Ключ: mock-onec-key (или ONEC_MOCK_API_KEY)
 */
import http from "node:http";

const PORT = Number(process.env.ONEC_MOCK_PORT || 3091);
const API_KEY = process.env.ONEC_MOCK_API_KEY || "mock-onec-key";

/** @type {Array<Record<string, unknown>>} */
const NOMENCLATURE = [
  {
    guid: "mock-guid-aspirin",
    article: "ASP-500",
    name: "Аспирин 500 мг (mock 1С)",
    price: 120,
    stock: 25,
    isActive: true,
    description: "Тестовая номенклатура из mock 1С",
    imageUrls: [],
  },
  {
    guid: "mock-guid-bandage",
    article: "BND-10",
    name: "Бинт стерильный (mock 1С)",
    price: 45,
    stock: 100,
    isActive: true,
    description: "",
    imageUrls: [],
  },
  {
    guid: "mock-guid-inactive",
    article: "OFF-1",
    name: "Снято с продажи (mock)",
    price: 10,
    stock: 0,
    isActive: false,
    description: "",
    imageUrls: [],
  },
];

/** @type {Array<Record<string, unknown>>} */
const ORDERS = [];

/**
 * @param {import('node:http').IncomingMessage} req
 * @returns {Promise<unknown>}
 */
function readJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw.trim()) {
        resolve(null);
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

/**
 * @param {import('node:http').IncomingMessage} req
 */
function authorize(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  return token === API_KEY;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const path = url.pathname.replace(/\/+$/, "") || "/";

  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (!authorize(req)) {
    res.statusCode = 401;
    res.end(JSON.stringify({ message: "Unauthorized" }));
    return;
  }

  try {
    if (req.method === "GET" && path === "/v1/health") {
      res.end(JSON.stringify({ ok: true, service: "onec-mock", version: "v1" }));
      return;
    }

    if (req.method === "GET" && path === "/v1/nomenclature") {
      res.end(JSON.stringify({ items: NOMENCLATURE }));
      return;
    }

    if (req.method === "POST" && path === "/v1/customer-orders") {
      const body = await readJson(req);
      const externalId = `MOCK-${ORDERS.length + 1}`;
      ORDERS.push({ receivedAt: new Date().toISOString(), body, externalId });
      console.log("[onec-mock] customer-order:", JSON.stringify(body, null, 2));
      res.statusCode = 201;
      res.end(JSON.stringify({ externalId }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ message: `Not found: ${path}` }));
  } catch (error) {
    res.statusCode = 400;
    res.end(
      JSON.stringify({
        message: error instanceof Error ? error.message : "Bad request",
      }),
    );
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[onec-mock] listening on http://127.0.0.1:${PORT}`);
  console.log(`[onec-mock] API key: ${API_KEY}`);
  console.log("[onec-mock] paths: /v1/health /v1/nomenclature /v1/customer-orders");
});
