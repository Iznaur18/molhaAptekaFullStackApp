import assert from "node:assert/strict";
import test from "node:test";

import { buildS3ServerSideEncryptionParams } from "../services/upload/buildS3ServerSideEncryptionParams.js";

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

test("buildS3ServerSideEncryptionParams: unset → empty", () => {
  withEnv({ S3_SERVER_SIDE_ENCRYPTION: undefined }, () => {
    assert.deepEqual(buildS3ServerSideEncryptionParams(), {});
  });
});

test("buildS3ServerSideEncryptionParams: AES256", () => {
  withEnv({ S3_SERVER_SIDE_ENCRYPTION: "AES256" }, () => {
    assert.deepEqual(buildS3ServerSideEncryptionParams(), {
      ServerSideEncryption: "AES256",
    });
  });
});

test("buildS3ServerSideEncryptionParams: aws:kms + key", () => {
  withEnv(
    {
      S3_SERVER_SIDE_ENCRYPTION: "aws:kms",
      S3_SSE_KMS_KEY_ID: "arn:aws:kms:…:key/abc",
    },
    () => {
      assert.deepEqual(buildS3ServerSideEncryptionParams(), {
        ServerSideEncryption: "aws:kms",
        SSEKMSKeyId: "arn:aws:kms:…:key/abc",
      });
    },
  );
});
