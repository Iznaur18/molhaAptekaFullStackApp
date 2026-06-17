import assert from "node:assert/strict";
import test from "node:test";

import { buildObjectStorageKey } from "../services/upload/objectStorageUpload.js";
import {
  buildPublicUploadUrl,
  normalizeStoredUploadUrl,
} from "../services/upload/buildPublicUploadUrl.js";
import { validateObjectStorageEnv } from "../services/upload/objectStorageUpload.js";
import { UPLOADS_DIR } from "../services/upload/uploadsDir.js";

test("buildPublicUploadUrl uses PUBLIC_UPLOAD_BASE_URL as CDN origin", () => {
  const prev = process.env.PUBLIC_UPLOAD_BASE_URL;
  process.env.PUBLIC_UPLOAD_BASE_URL = "https://cdn.example.com";

  try {
    assert.equal(
      buildPublicUploadUrl({ filename: "abc.webp" }),
      "https://cdn.example.com/uploads/abc.webp",
    );
  } finally {
    if (prev === undefined) {
      delete process.env.PUBLIC_UPLOAD_BASE_URL;
    } else {
      process.env.PUBLIC_UPLOAD_BASE_URL = prev;
    }
  }
});

test("normalizeStoredUploadUrl rewrites legacy host to CDN base", () => {
  const prev = process.env.PUBLIC_UPLOAD_BASE_URL;
  process.env.PUBLIC_UPLOAD_BASE_URL = "https://cdn.example.com";

  try {
    assert.equal(
      normalizeStoredUploadUrl("https://old-api.example.com/uploads/file.jpg"),
      "https://cdn.example.com/uploads/file.jpg",
    );
  } finally {
    if (prev === undefined) {
      delete process.env.PUBLIC_UPLOAD_BASE_URL;
    } else {
      process.env.PUBLIC_UPLOAD_BASE_URL = prev;
    }
  }
});

test("buildObjectStorageKey keeps uploads prefix", () => {
  assert.equal(buildObjectStorageKey("x.png"), "uploads/x.png");
});

test("validateObjectStorageEnv requires bucket and CDN when s3", () => {
  const prev = {
    UPLOAD_STORAGE: process.env.UPLOAD_STORAGE,
    S3_BUCKET: process.env.S3_BUCKET,
    S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
    PUBLIC_UPLOAD_BASE_URL: process.env.PUBLIC_UPLOAD_BASE_URL,
  };

  process.env.UPLOAD_STORAGE = "s3";
  delete process.env.S3_BUCKET;
  delete process.env.S3_ACCESS_KEY_ID;
  delete process.env.S3_SECRET_ACCESS_KEY;
  delete process.env.PUBLIC_UPLOAD_BASE_URL;

  try {
    const { errors } = validateObjectStorageEnv();
    assert.ok(errors.length >= 4);
  } finally {
    for (const [key, value] of Object.entries(prev)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
});

test("UPLOADS_DIR points at server/uploads (not services/uploads)", () => {
  assert.match(UPLOADS_DIR.replaceAll("\\", "/"), /\/server\/uploads$/);
});
