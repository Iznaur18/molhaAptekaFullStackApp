import assert from "node:assert/strict";
import test from "node:test";

import {
  AUTH_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
} from "../constants/authCookieConstants.js";
import { csrfCookieOriginCheckMW } from "../middlewares/csrfCookieOriginCheckMW.js";
import { detectImageMimeFromMagic } from "../services/upload/assertUploadedImageMagic.js";

test("detectImageMimeFromMagic: jpeg/png/webp", () => {
  const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const webp = Buffer.from("RIFF....WEBP", "ascii");
  webp[4] = 0;
  webp[5] = 0;
  webp[6] = 0;
  webp[7] = 0;

  assert.equal(detectImageMimeFromMagic(jpeg), "image/jpeg");
  assert.equal(detectImageMimeFromMagic(png), "image/png");
  assert.equal(detectImageMimeFromMagic(webp), "image/webp");
  assert.equal(detectImageMimeFromMagic(Buffer.from("not-image")), null);
});

test("csrfCookieOriginCheckMW: refresh-only cookie requires Origin", async () => {
  const previousEnv = process.env.NODE_ENV;
  const previousFrontend = process.env.FRONTEND_URL;
  process.env.NODE_ENV = "development";
  process.env.FRONTEND_URL = "https://torgum.ru";

  try {
    /** @type {{ statusCode?: number; body?: unknown }} */
    const res = {
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(body) {
        this.body = body;
        return this;
      },
    };

    let nextCalled = false;
    const req = {
      method: "POST",
      cookies: { [REFRESH_COOKIE_NAME]: "refresh-jwt" },
      get(name) {
        if (name === "origin") return "https://evil.example";
        return undefined;
      },
    };

    csrfCookieOriginCheckMW(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 403);

    let okNext = false;
    const okReq = {
      method: "POST",
      cookies: { [AUTH_COOKIE_NAME]: "access", [REFRESH_COOKIE_NAME]: "refresh" },
      get(name) {
        if (name === "origin") return "https://torgum.ru";
        return undefined;
      },
    };
    csrfCookieOriginCheckMW(okReq, res, () => {
      okNext = true;
    });
    assert.equal(okNext, true);
  } finally {
    process.env.NODE_ENV = previousEnv;
    if (previousFrontend === undefined) {
      delete process.env.FRONTEND_URL;
    } else {
      process.env.FRONTEND_URL = previousFrontend;
    }
  }
});
