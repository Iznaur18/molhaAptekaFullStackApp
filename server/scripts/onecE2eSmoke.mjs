/**
 * End-to-end smoke: API :4444 + onec mock :3091
 *
 * Preconditions:
 *   - API running (npm run start:dev)
 *   - mock: npm run onec:mock
 *
 * Usage:
 *   cd server && node scripts/onecE2eSmoke.mjs
 */
import "dotenv/config";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

const API = process.env.ONEC_E2E_API_URL || "http://127.0.0.1:4444";
const MOCK = process.env.ONEC_E2E_MOCK_URL || "http://127.0.0.1:3091";
const MOCK_KEY = process.env.ONEC_MOCK_API_KEY || "mock-onec-key";

const SELLER_EMAIL = "onec-e2e-seller@example.com";
const BUYER_EMAIL = "onec-e2e-buyer@example.com";
const PASSWORD = "OnecE2ePass12!";

function fail(step, detail) {
  console.error(`FAIL [${step}]`, detail);
  process.exitCode = 1;
  throw new Error(String(detail));
}

function ok(step, detail = "") {
  console.log(`OK   [${step}]${detail ? ` ${detail}` : ""}`);
}

async function api(pathname, { method = "GET", token, body, headers = {} } = {}) {
  const response = await fetch(`${API}${pathname}`, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Auth-Client": "mobile",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body != null ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  return { status: response.status, json };
}

async function ensureUsers() {
  const { UserModel } = await import("../models/index.js");
  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const upsert = async (email, userName) => {
    const user = await UserModel.findOneAndUpdate(
      { email },
      {
        $set: {
          email,
          passwordHash,
          userName,
          isEmailVerified: true,
          isActiveUser: true,
          isUserDataConfirmed: true,
          userRole: "user",
        },
        $unset: {
          emailVerificationTokenHash: "",
          emailVerificationExpiresAt: "",
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    return user;
  };
  const seller = await upsert(SELLER_EMAIL, "onec_e2e_seller");
  const buyer = await upsert(BUYER_EMAIL, "onec_e2e_buyer");
  return { seller, buyer };
}

async function login(email) {
  const { status, json } = await api("/auth/login", {
    method: "POST",
    body: { email, password: PASSWORD },
  });
  if (status !== 200 || !json?.data?.accessToken) {
    fail("login", `${email} → ${status} ${JSON.stringify(json)}`);
  }
  ok("login", email);
  return json.data.accessToken;
}

async function main() {
  console.log(`API=${API}`);
  console.log(`MOCK=${MOCK}`);

  // 0) mock health direct
  {
    const res = await fetch(`${MOCK}/v1/health`, {
      headers: { Authorization: `Bearer ${MOCK_KEY}` },
    });
    const body = await res.json();
    if (!res.ok || body?.ok !== true) {
      fail("mock-health", `${res.status} ${JSON.stringify(body)}`);
    }
    ok("mock-health");
  }

  await mongoose.connect(process.env.MONGO_URI);
  const { seller } = await ensureUsers();
  ok("users", `seller=${seller._id}`);

  const sellerToken = await login(SELLER_EMAIL);
  const buyerToken = await login(BUYER_EMAIL);

  // 1) save settings
  {
    const { status, json } = await api("/onec/settings", {
      method: "PUT",
      token: sellerToken,
      body: {
        enabled: true,
        baseUrl: MOCK,
        apiKey: MOCK_KEY,
      },
    });
    if (status !== 200 || json?.data?.settings?.enabled !== true) {
      fail("settings", `${status} ${JSON.stringify(json)}`);
    }
    ok("settings", json.data.settings.apiKeyMasked);
  }

  // 2) test connection via API → mock
  {
    const { status, json } = await api("/onec/test", {
      method: "POST",
      token: sellerToken,
    });
    if (status !== 200) {
      fail("test", `${status} ${JSON.stringify(json)}`);
    }
    ok("test", json?.data?.message || "");
  }

  // 3) sync nomenclature
  {
    const { status, json } = await api("/onec/sync", {
      method: "POST",
      token: sellerToken,
    });
    if (status !== 200) {
      fail("sync", `${status} ${JSON.stringify(json)}`);
    }
    const nom = json?.data?.summary?.nomenclature;
    if (!nom || nom.fetched < 1 || nom.created + nom.updated < 1) {
      fail("sync-summary", JSON.stringify(json?.data?.summary));
    }
    ok(
      "sync",
      `fetched=${nom.fetched} created=${nom.created} updated=${nom.updated}`,
    );
  }

  // 4) products from 1C visible
  const { ProductModel } = await import("../models/index.js");
  const products = await ProductModel.find({
    productSeller: seller._id,
    productFromOneC: true,
    productIsAvailable: true,
  })
    .select("_id productName product1cGuid productPrice productStockQuantity")
    .lean();
  if (products.length < 1) {
    fail("products", "no available OneC products");
  }
  ok(
    "products",
    products.map((p) => `${p.product1cGuid}:${p.productStockQuantity}`).join(", "),
  );

  const product = products[0];

  // pickup address required for checkout — set on synced product for smoke
  await ProductModel.updateOne(
    { _id: product._id },
    {
      $set: {
        productPickupEnabled: true,
        productPickupAddress: "E2E mock pickup, ул. Тест 1",
      },
    },
  );

  // 5) buyer creates order → enqueue push
  {
    const { status, json } = await api("/order", {
      method: "POST",
      token: buyerToken,
      body: {
        items: [{ productId: String(product._id), quantity: 1 }],
        paymentMethod: "cashOnDelivery",
        fulfillmentMethod: "pickup",
        idempotencyKey: `onec-e2e-${Date.now()}`,
      },
    });
    if (status !== 200 && status !== 201) {
      fail("order", `${status} ${JSON.stringify(json)}`);
    }
    ok("order", json?.data?.order?._id || json?.data?.message);
  }

  // 6) sync again → push customer order to mock
  {
    const { status, json } = await api("/onec/sync", {
      method: "POST",
      token: sellerToken,
    });
    if (status !== 200) {
      fail("sync-orders", `${status} ${JSON.stringify(json)}`);
    }
    const orders = json?.data?.summary?.orders;
    if (!orders || orders.synced < 1) {
      fail("sync-orders-summary", JSON.stringify(json?.data?.summary));
    }
    ok("sync-orders", `synced=${orders.synced} failed=${orders.failed}`);
  }

  // 7) logs
  {
    const { status, json } = await api("/onec/logs?limit=10", {
      token: sellerToken,
    });
    if (status !== 200 || !Array.isArray(json?.data?.logs) || json.data.logs.length < 1) {
      fail("logs", `${status} ${JSON.stringify(json)}`);
    }
    const dirs = json.data.logs.map((l) => `${l.direction}/${l.status}`).join(", ");
    ok("logs", dirs);
  }

  console.log("\nE2E PASS: mock ↔ API (settings → test → sync → order → push)");
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
  process.exit(1);
});
