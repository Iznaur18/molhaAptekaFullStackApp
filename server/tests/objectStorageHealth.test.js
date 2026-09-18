import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";

import { buildHealthPayload } from "../utils/buildHealthPayload.js";
import {
  probeObjectStorageHealth,
  resetObjectStorageHealthCache,
} from "../services/upload/objectStorageUpload.js";

const ENV_KEYS = ["UPLOAD_STORAGE", "S3_BUCKET"];
/** @type {Record<string, string | undefined>} */
let savedEnv = {};

beforeEach(() => {
  savedEnv = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));
  resetObjectStorageHealthCache();
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (savedEnv[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = savedEnv[key];
    }
  }
  resetObjectStorageHealthCache();
});

test("probeObjectStorageHealth: disabled for disk storage, no request made", async () => {
  process.env.UPLOAD_STORAGE = "disk";
  let calls = 0;
  const state = await probeObjectStorageHealth({
    send: async () => {
      calls += 1;
    },
  });
  assert.equal(state, "disabled");
  assert.equal(calls, 0);
});

test("probeObjectStorageHealth: caches the result for a minute", async () => {
  process.env.UPLOAD_STORAGE = "s3";
  process.env.S3_BUCKET = "gitorg-media";
  let now = 0;
  /** @type {string[]} */
  const buckets = [];
  const send = async (command) => {
    buckets.push(command.input.Bucket);
  };

  assert.equal(await probeObjectStorageHealth({ now: () => now, send }), "ok");
  now += 30_000;
  assert.equal(await probeObjectStorageHealth({ now: () => now, send }), "ok");
  assert.deepEqual(buckets, ["gitorg-media"]);

  now += 31_000;
  assert.equal(await probeObjectStorageHealth({ now: () => now, send }), "ok");
  assert.equal(buckets.length, 2);
});

test("probeObjectStorageHealth: error when the bucket does not answer", async () => {
  process.env.UPLOAD_STORAGE = "s3";
  process.env.S3_BUCKET = "gitorg-media";
  const originalWarn = console.warn;
  const warnings = [];
  console.warn = (line) => warnings.push(String(line));
  try {
    const state = await probeObjectStorageHealth({
      send: async () => {
        throw new Error("timeout");
      },
    });
    assert.equal(state, "error");
  } finally {
    console.warn = originalWarn;
  }
  assert.ok(warnings.some((line) => line.includes("object_storage.health_failed")));
});

test("buildHealthPayload: unreachable object storage degrades status", () => {
  assert.equal(buildHealthPayload({ objectStorage: "error" }).status, "degraded");
  assert.equal(buildHealthPayload({ objectStorage: "error" }).objectStorage, "error");
  assert.equal(buildHealthPayload().objectStorage, "disabled");
});
