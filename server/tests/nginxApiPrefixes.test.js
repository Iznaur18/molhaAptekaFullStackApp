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
const EXAMPLE_CONF_PATH = fileURLToPath(
  new URL("../../docs/deploy/nginx-izibuy.conf.example", import.meta.url),
);

const { findMissingPrefixes, parseNginxLocationPatterns, patternCoversPrefix } =
  await import("../scripts/checkNginxPrefixes.mjs");

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
    // Файл живёт и с CRLF: при split("\n") в конце строки остаётся \r, а он для
    // регулярки — конец строки, и вырезание комментария молча срывалось —
    // комментарии приезжали в список префиксов.
    .split(/\r?\n/)
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

  it("образец конфига содержит location для каждого префикса", () => {
    // Раньше образец сверялся только с прокси разработки и нестрого, через
    // includes: `location /seller-shelf` засчитывался бы за `/seller`.
    const missing = findMissingPrefixes({
      required: readNginxPrefixes(),
      conf: readFileSync(EXAMPLE_CONF_PATH, "utf8"),
    });

    assert.deepEqual(
      missing,
      [],
      "docs/deploy/nginx-izibuy.conf.example отстал от списка префиксов",
    );
  });
});

/**
 * Разбор конфига живёт в scripts/checkNginxPrefixes.mjs — им же деплой сверяет
 * БОЕВОЙ сервер. Здесь проверяется сам разбор: тесты выше читают только
 * репозиторий и спокойно проходили, пока на проде не было `location /sellers`.
 */
describe("разбор конфига nginx", () => {
  it("снимает модификаторы, кавычки и якорь", () => {
    const conf = [
      "    location /order {",
      '    location ~ "^/user/[a-f0-9]{24}$" {',
      "    location ^~ /.well-known/acme-challenge/ {",
    ].join("\n");

    assert.deepEqual(parseNginxLocationPatterns(conf), [
      "/order",
      "/user/[a-f0-9]{24}$",
      "/.well-known/acme-challenge/",
    ]);
  });

  it("именованные локации пропускает: URI им не сопоставляется", () => {
    assert.deepEqual(parseNginxLocationPatterns("    location @product_spa {"), []);
  });

  it("регулярка по началу пути покрывает префикс", () => {
    assert.equal(patternCoversPrefix("/user(/|$)", "/user"), true);
    assert.equal(patternCoversPrefix("/user/[a-f]{24}$", "/user"), true);
    assert.equal(patternCoversPrefix("/order", "/order"), true);
    assert.equal(patternCoversPrefix("/faq/", "/faq"), true);
  });

  it("сосед по началу строки за покрытие не считается", () => {
    // Совпадение по префиксу без границы врёт: /users-loyalty-raffle не
    // обслуживает /user, а /seller-shelf — /sellers.
    assert.equal(patternCoversPrefix("/users-loyalty-raffle", "/user"), false);
    assert.equal(patternCoversPrefix("/seller-shelf", "/sellers"), false);
    assert.equal(patternCoversPrefix("/uploads/", "/upload"), false);
  });

  it("находит ровно тот префикс, которого нет", () => {
    const conf = ["    location /order {", "    location /product {"].join("\n");

    assert.deepEqual(
      findMissingPrefixes({ required: ["/order", "/product", "/sellers"], conf }),
      ["/sellers"],
    );
  });
});
