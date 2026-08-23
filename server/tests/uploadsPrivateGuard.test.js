import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import express from "express";

import { resolveUploadsRequestPathPrivacy } from "../utils/resolveUploadsRequestPathPrivacy.js";

test("resolveUploadsRequestPathPrivacy ловит percent-encoding и двойные слэши", () => {
  const privatePaths = [
    "/private",
    "/private/secret.jpg",
    "/%70rivate/secret.jpg",
    "/pri%76ate/secret.jpg",
    "/%2570rivate/secret.jpg",
    "//private/secret.jpg",
    "///private//secret.jpg",
    "/./private/secret.jpg",
    "/PRIVATE/secret.jpg",
    "/public/../private/secret.jpg",
  ];
  for (const requestPath of privatePaths) {
    assert.equal(
      resolveUploadsRequestPathPrivacy(requestPath).isPrivate,
      true,
      `должен считаться приватным: ${requestPath}`,
    );
  }
});

test("resolveUploadsRequestPathPrivacy пропускает публичные пути", () => {
  for (const requestPath of [
    "/",
    "/photo.jpg",
    "/1700000000-abc.webp",
    "/privately-named.jpg",
    "/nested/private.jpg",
  ]) {
    assert.equal(
      resolveUploadsRequestPathPrivacy(requestPath).isPrivate,
      false,
      `должен считаться публичным: ${requestPath}`,
    );
  }
});

test("resolveUploadsRequestPathPrivacy помечает битый percent-encoding", () => {
  assert.deepEqual(resolveUploadsRequestPathPrivacy("/%E0%A4%A.jpg"), {
    malformed: true,
    isPrivate: false,
  });
});

test("express.static за гвардом не отдаёт uploads/private ни в одном варианте", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "uploads-guard-"));
  fs.mkdirSync(path.join(root, "private"));
  fs.writeFileSync(path.join(root, "private", "secret.jpg"), "PASSPORT-SELFIE");
  fs.writeFileSync(path.join(root, "public.jpg"), "PUBLIC");

  const app = express();
  app.use("/uploads", (req, res, next) => {
    const { malformed, isPrivate } = resolveUploadsRequestPathPrivacy(req.path);
    if (malformed) {
      return res.status(400).end();
    }
    if (isPrivate) {
      return res.status(404).end();
    }
    return next();
  });
  app.use("/uploads", express.static(root));

  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;

  try {
    for (const attack of [
      "/uploads/private/secret.jpg",
      "/uploads/%70rivate/secret.jpg",
      "/uploads/pri%76ate/secret.jpg",
      "/uploads//private/secret.jpg",
      "/uploads/./private/secret.jpg",
    ]) {
      const response = await fetch(base + attack);
      const body = await response.text();
      assert.equal(response.status, 404, `утечка через ${attack}`);
      assert.ok(!body.includes("PASSPORT-SELFIE"), `утечка тела через ${attack}`);
    }

    const ok = await fetch(`${base}/uploads/public.jpg`);
    assert.equal(ok.status, 200);
    assert.equal(await ok.text(), "PUBLIC");
  } finally {
    server.close();
    fs.rmSync(root, { recursive: true, force: true });
  }
});
