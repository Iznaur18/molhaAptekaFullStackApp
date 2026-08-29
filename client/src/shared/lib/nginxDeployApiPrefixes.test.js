import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { DEV_API_PROXY_PREFIXES } from "./devApiProxy.js";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);

const NGINX_CONF = readFileSync(
  path.join(repoRoot, "docs/deploy/nginx-izibuy.conf.example"),
  "utf8",
);

const LOCATION_LINES = NGINX_CONF.split(/\r?\n/)
  .filter((line) => /^\s*location\b/.test(line))
  .join("\n");

describe("nginx deploy example", () => {
  /**
   * Префикс, которого нет в nginx, отдаётся статикой: GET вернёт index.html
   * («Неверный ответ сервера»), POST — 405. Так пропал /analytics/track-ad.
   */
  it("проксирует все API-префиксы из DEV_API_PROXY_PREFIXES", () => {
    const missing = DEV_API_PROXY_PREFIXES.filter(
      (prefix) => !LOCATION_LINES.includes(prefix.slice(1)),
    );

    expect(missing).toEqual([]);
  });

  it("явно покрывает /analytics", () => {
    expect(LOCATION_LINES).toContain("location /analytics");
  });
});
