import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const WELL_KNOWN = join(ROOT, "client/public/.well-known");
const AASA_PATH = join(WELL_KNOWN, "apple-app-site-association");
const ASSETLINKS_PATH = join(WELL_KNOWN, "assetlinks.json");
const NGINX_EXAMPLE = join(ROOT, "docs/deploy/nginx-izibuy.conf.example");
const NGINX_SNAPSHOT = join(ROOT, "docs/deploy/nginx-gitorg.prod-snapshot.conf");

const PACKAGE_NAME = "ru.gitorg.app";
const PLACEHOLDER_TEAM = "XXXXXXXXXX";
const PLACEHOLDER_SHA = "REPLACE_WITH_EAS_OR_PLAY_APP_SIGNING_SHA256";

describe("well-known Universal / App Links", () => {
  it("AASA файл есть и валидный JSON с appID package", () => {
    assert.equal(existsSync(AASA_PATH), true, "нет apple-app-site-association");
    const raw = readFileSync(AASA_PATH, "utf8");
    const data = JSON.parse(raw);
    const details = data?.applinks?.details;
    assert.ok(Array.isArray(details) && details.length > 0, "applinks.details пуст");
    const appId = details[0].appID;
    assert.equal(typeof appId, "string");
    assert.ok(
      appId.endsWith(`.${PACKAGE_NAME}`),
      `appID должен заканчиваться на .${PACKAGE_NAME}, got ${appId}`,
    );
    assert.ok(
      Array.isArray(details[0].paths) && details[0].paths.includes("*"),
      "paths должен включать *",
    );
    assert.ok(
      appId.startsWith(`${PLACEHOLDER_TEAM}.`) || /^[A-Z0-9]{10}\./.test(appId),
      "Team ID: placeholder XXXXXXXXXX или 10 символов",
    );
  });

  it("assetlinks.json есть и валидный JSON с package_name", () => {
    assert.equal(existsSync(ASSETLINKS_PATH), true, "нет assetlinks.json");
    const data = JSON.parse(readFileSync(ASSETLINKS_PATH, "utf8"));
    assert.ok(Array.isArray(data) && data.length > 0);
    const target = data[0].target;
    assert.equal(target?.namespace, "android_app");
    assert.equal(target?.package_name, PACKAGE_NAME);
    assert.ok(Array.isArray(target?.sha256_cert_fingerprints));
    assert.ok(target.sha256_cert_fingerprints.length > 0);
    const fp = target.sha256_cert_fingerprints[0];
    assert.ok(
      fp === PLACEHOLDER_SHA || /^[0-9A-F:]+$/i.test(fp),
      "fingerprint: placeholder или SHA256 с двоеточиями",
    );
  });

  it("nginx example/snapshot содержат location ^~ /.well-known/", () => {
    for (const path of [NGINX_EXAMPLE, NGINX_SNAPSHOT]) {
      const source = readFileSync(path, "utf8");
      assert.match(
        source,
        /location\s+\^~\s+\/\.well-known\//,
        `${path}: нет location ^~ /.well-known/`,
      );
      assert.match(
        source,
        /default_type\s+application\/json/,
        `${path}: нужен default_type application/json для AASA`,
      );
    }
  });
});
