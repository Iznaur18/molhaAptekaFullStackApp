import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, test } from "node:test";

import { inlineScriptCspHashes } from "../utils/inlineScriptCspHashes.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

describe("inlineScriptCspHashes", () => {
  test("хэширует только инлайн-скрипты, пропуская внешние и пустые", () => {
    const hashes = inlineScriptCspHashes(
      `<script src="/err.js"></script><script>a()</script><script>  </script>`,
    );

    assert.equal(hashes.length, 1);
    assert.match(hashes[0], /^'sha256-[A-Za-z0-9+/]+=*'$/);
  });

  test("CRLF даёт тот же хэш, что и LF (HTML-парсер нормализует переводы строк)", () => {
    const lf = inlineScriptCspHashes("<script>\na();\nb();\n</script>");
    const crlf = inlineScriptCspHashes("<script>\r\na();\r\nb();\r\n</script>");

    assert.deepEqual(crlf, lf);
  });

  test("дубли схлопываются", () => {
    assert.equal(
      inlineScriptCspHashes("<script>a()</script><script>a()</script>").length,
      1,
    );
  });

  test("nginx-пример содержит хэш инлайн-скрипта из client/index.html", () => {
    const html = readFileSync(path.join(repoRoot, "client/index.html"), "utf8");
    const conf = readFileSync(
      path.join(repoRoot, "docs/deploy/nginx-izibuy.conf.example"),
      "utf8",
    );

    const hashes = inlineScriptCspHashes(html);
    assert.ok(hashes.length > 0, "в client/index.html ожидается инлайн-скрипт темы");

    for (const hash of hashes) {
      assert.ok(
        conf.includes(hash),
        `${hash} нет в docs/deploy/nginx-izibuy.conf.example — перегенерируй CSP: cd server && node scripts/printSpaCspHeader.js`,
      );
    }
  });
});
