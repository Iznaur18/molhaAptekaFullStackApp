import assert from "node:assert/strict";
import test from "node:test";

import { assertProductionEnv } from "../utils/assertProductionEnv.js";

const LONG_JWT = "a".repeat(32);
const VAULT_KEK = "a".repeat(64);

const withEnv = (overrides, fn) => {
  const keys = Object.keys(overrides);
  const previous = Object.fromEntries(
    keys.map((key) => [key, process.env[key]]),
  );
  try {
    for (const [key, value] of Object.entries(overrides)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
    return fn();
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
};

test("assertProductionEnv: dev допускает compose URI без auth", () => {
  withEnv(
    {
      NODE_ENV: "development",
      JWT_SECRET: LONG_JWT,
      MONGO_URI: "mongodb://127.0.0.1:27017/molhaApteka?replicaSet=rs0",
      FRONTEND_URL: undefined,
      SMTP_HOST: undefined,
      SMTP_USER: undefined,
      SMTP_PASS: undefined,
    },
    () => {
      const result = assertProductionEnv();
      assert.equal(result.ok, true);
      assert.equal(
        result.errors.some((e) => e.includes("localhost")),
        false,
      );
    },
  );
});

test("assertProductionEnv: production режет localhost compose URI", () => {
  withEnv(
    {
      NODE_ENV: "production",
      JWT_SECRET: LONG_JWT,
      PASSPORT_VAULT_KEK: VAULT_KEK,
      MONGO_URI: "mongodb://127.0.0.1:27017/molhaApteka?replicaSet=rs0",
      FRONTEND_URL: "https://izibuy.ru",
      SMTP_HOST: "smtp.example.com",
      SMTP_USER: "u",
      SMTP_PASS: "p",
    },
    () => {
      const result = assertProductionEnv();
      assert.equal(result.ok, false);
      assert.ok(result.errors.some((e) => e.includes("localhost")));
    },
  );
});

test("assertProductionEnv: production режет URI без credentials", () => {
  withEnv(
    {
      NODE_ENV: "production",
      JWT_SECRET: LONG_JWT,
      PASSPORT_VAULT_KEK: VAULT_KEK,
      MONGO_URI: "mongodb://db.internal:27017/izibuy?replicaSet=rs0",
      FRONTEND_URL: "https://izibuy.ru",
      SMTP_HOST: "smtp.example.com",
      SMTP_USER: "u",
      SMTP_PASS: "p",
    },
    () => {
      const result = assertProductionEnv();
      assert.equal(result.ok, false);
      assert.ok(result.errors.some((e) => e.includes("credentials")));
    },
  );
});

test("assertProductionEnv: production принимает Atlas mongodb+srv с auth", () => {
  withEnv(
    {
      NODE_ENV: "production",
      JWT_SECRET: LONG_JWT,
      PASSPORT_VAULT_KEK: VAULT_KEK,
      MONGO_URI:
        "mongodb+srv://user:pass@cluster.mongodb.net/izibuy?retryWrites=true&w=majority",
      FRONTEND_URL: "https://izibuy.ru",
      SMTP_HOST: "smtp.example.com",
      SMTP_USER: "u",
      SMTP_PASS: "p",
    },
    () => {
      const result = assertProductionEnv();
      assert.equal(
        result.errors.some(
          (e) => e.includes("localhost") || e.includes("credentials"),
        ),
        false,
      );
      assert.equal(
        result.errors.some((e) => e.includes("PASSPORT_VAULT_KEK")),
        false,
      );
      assert.ok(result.warnings.some((w) => w.includes("SENTRY_DSN")));
      assert.ok(result.warnings.some((w) => w.includes("бэкап Mongo")));
    },
  );
});

test("assertProductionEnv: production требует PASSPORT_VAULT_KEK", () => {
  withEnv(
    {
      NODE_ENV: "production",
      JWT_SECRET: LONG_JWT,
      PASSPORT_VAULT_KEK: undefined,
      MONGO_URI:
        "mongodb+srv://user:pass@cluster.mongodb.net/izibuy?retryWrites=true&w=majority",
      FRONTEND_URL: "https://izibuy.ru",
      SMTP_HOST: "smtp.example.com",
      SMTP_USER: "u",
      SMTP_PASS: "p",
    },
    () => {
      const result = assertProductionEnv();
      assert.equal(result.ok, false);
      assert.ok(result.errors.some((e) => e.includes("PASSPORT_VAULT_KEK")));
    },
  );
});
