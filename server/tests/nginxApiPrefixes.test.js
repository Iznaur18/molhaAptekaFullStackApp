import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

/**
 * API-префиксы обязаны быть в конфиге nginx.
 *
 * Раздел «Стать курьером» уехал на прод мёртвым: роутер `/couriers` был
 * смонтирован, а блока `location /couriers` в nginx не было — запросы
 * проваливались в SPA и возвращали HTML вместо JSON. Симптом при этом
 * выглядел как поломка фронта, а не конфига.
 *
 * Тест сверяет два списка: что монтирует приложение и что знает nginx.
 * Он не читает боевой сервер — только эталон в репозитории, поэтому эталон
 * надо править вместе с кодом.
 */
const APP_PATH = fileURLToPath(new URL("../createApp.js", import.meta.url));
const NGINX_PATH = fileURLToPath(
  new URL("../docs/deploy/nginx-api-prefixes.txt", import.meta.url),
);

/** Префиксы, которые нарочно не проксируются как API. */
const NOT_PROXIED = new Set([
  // Статика раздаётся самим nginx.
  "/uploads",
]);

const readMountedPrefixes = () => {
  const source = readFileSync(APP_PATH, "utf8");
  const found = new Set();
  for (const match of source.matchAll(/app\.use\(\s*"(\/[a-z0-9-]+)/gi)) {
    const prefix = match[1];
    if (NOT_PROXIED.has(prefix)) continue;
    found.add(prefix);
  }
  return [...found].sort();
};

const readNginxPrefixes = () => {
  const source = readFileSync(NGINX_PATH, "utf8");
  return source
    .split("\n")
    .map((line) => line.replace(/#.*$/, "").trim())
    .filter(Boolean)
    .sort();
};

describe("API-префиксы и nginx", () => {
  it("каждый смонтированный префикс описан в конфиге", () => {
    const mounted = readMountedPrefixes();
    const nginx = new Set(readNginxPrefixes());

    const missing = mounted.filter((prefix) => !nginx.has(prefix));

    assert.deepEqual(
      missing,
      [],
      "эти префиксы вернут HTML вместо JSON: добавьте location в nginx и в docs/deploy/nginx-api-prefixes.txt",
    );
  });

  it("в списке nginx нет префиксов, которых уже нет в приложении", () => {
    const mounted = new Set(readMountedPrefixes());
    const stale = readNginxPrefixes().filter((prefix) => !mounted.has(prefix));

    assert.deepEqual(stale, [], "конфиг проксирует то, чего в приложении нет");
  });
});
