/**
 * Smoke: скидка из колеса только на самый дорогой товар в заказе.
 * Покупатель buyer@test.local, продавец adminaa.
 */
import "dotenv/config";
import { mergeSellerGameDiscountWinsIntoAppliedPromos } from "@izibuy/shared-lib";

const API = process.env.SMOKE_API_URL || "http://127.0.0.1:4444";
const ORIGIN = "http://127.0.0.1:5173";

const teeId = "6b086f779ecc00329eb635e0";
const headphonesId = "6b086f779ecc00329eb635e2";
const sellerId = "6b08624173b9364d1fb7ea96";

async function api(path, { method = "GET", body, cookie } = {}) {
  const headers = {
    Origin: ORIGIN,
    Referer: `${ORIGIN}/`,
    Accept: "application/json",
  };
  if (cookie) headers.Cookie = cookie;
  if (body != null) headers["Content-Type"] = "application/json";
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  });
  const setCookie = res.headers.getSetCookie?.() ?? [];
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status} ${text}`);
  }
  return { json, setCookie };
}

function cookieJar(setCookieList, prev = "") {
  const map = new Map();
  for (const part of prev
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)) {
    const i = part.indexOf("=");
    if (i > 0) map.set(part.slice(0, i), part.slice(i + 1));
  }
  for (const raw of setCookieList) {
    const first = String(raw).split(";")[0];
    const i = first.indexOf("=");
    if (i > 0) map.set(first.slice(0, i), first.slice(i + 1));
  }
  return [...map.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

let cookie = "";
{
  const login = await api("/auth/login", {
    method: "POST",
    body: { email: "buyer@test.local", password: "123456" },
  });
  cookie = cookieJar(login.setCookie);
}

const wins = await api("/seller-fortune-wheel/me/wins", { cookie });
cookie = cookieJar(wins.setCookie, cookie);
const activeWins = (wins.json?.data?.wins ?? []).filter(
  (w) => !w.prizeProductId && Number(w.discountPercent) > 0,
);
console.log(
  "activeWins",
  activeWins.map((w) => ({
    discountPercent: w.discountPercent,
    sellerId: w.sellerId,
  })),
);
if (activeWins.length === 0) {
  throw new Error("Нет активного скидочного выигрыша у buyer@test.local");
}

const mergePreview = mergeSellerGameDiscountWinsIntoAppliedPromos(
  [],
  activeWins.map((w) => ({
    sellerId: String(w.sellerId),
    discountPercent: w.discountPercent,
    prizeProductId: w.prizeProductId,
  })),
  [
    { productId: teeId, sellerId, productPrice: 1590 },
    { productId: headphonesId, sellerId, productPrice: 4990 },
  ],
  "FORTUNEWHEEL",
);
console.log("mergePreview", mergePreview);
if (mergePreview.length !== 1 || mergePreview[0].productId !== headphonesId) {
  throw new Error("merge: скидка должна лечь только на наушники (4990)");
}

const order = await api("/order", {
  method: "POST",
  cookie,
  body: {
    items: [
      { productId: teeId, quantity: 1 },
      { productId: headphonesId, quantity: 1 },
    ],
    fulfillmentMethod: "pickup",
    paymentMethod: "cashOnDelivery",
    idempotencyKey: `smoke-game-disc-${Date.now()}`,
  },
});

const payload = order.json?.data ?? {};
const items =
  payload.order?.items ?? payload.items ?? payload.createdOrder?.items ?? [];
const lines = items.map((item) => ({
  productId: String(item.productId?._id ?? item.productId),
  name: item.productNameAtOrder ?? item.productName,
  unitPrice: item.unitPriceAtOrder ?? item.unitPrice,
  retail: item.productPriceAtOrder ?? item.productPrice,
  promoCode: item.promoCodeAtOrder ?? item.promoCode ?? null,
  promoDiscountPercent:
    item.promoDiscountPercentAtOrder ?? item.promoDiscountPercent ?? null,
}));
console.log("orderLines", lines);
console.log("orderKeys", Object.keys(payload));

const teeLine = lines.find((l) => l.productId === teeId);
const hpLine = lines.find((l) => l.productId === headphonesId);
if (!teeLine || !hpLine) {
  throw new Error(`Нет строк заказа: ${JSON.stringify({ lines, payload }, null, 2)}`);
}
if (teeLine.promoCode === "FORTUNEWHEEL" || Number(teeLine.promoDiscountPercent) > 0) {
  throw new Error(`FAIL: скидка на футболке: ${JSON.stringify(teeLine)}`);
}
if (hpLine.promoCode !== "FORTUNEWHEEL") {
  throw new Error(`FAIL: на наушниках нет FORTUNEWHEEL: ${JSON.stringify(hpLine)}`);
}
if (!(Number(hpLine.promoDiscountPercent) > 0)) {
  throw new Error(`FAIL: на наушниках нет %: ${JSON.stringify(hpLine)}`);
}
const expectedUnit = Math.max(1, Math.floor((4990 * (100 - 40)) / 100));
if (Number(hpLine.unitPrice) !== expectedUnit) {
  throw new Error(
    `FAIL: unitPrice наушников ${hpLine.unitPrice}, ожидали ${expectedUnit}`,
  );
}
if (Number(teeLine.unitPrice) !== 1590) {
  throw new Error(`FAIL: футболка должна быть без скидки: ${teeLine.unitPrice}`);
}

console.log("SMOKE_OK: скидка только на наушники");
