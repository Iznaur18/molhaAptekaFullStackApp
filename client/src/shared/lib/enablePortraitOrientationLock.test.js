import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const CLIENT_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../..");

const readClient = (relativePath) =>
  readFileSync(join(CLIENT_ROOT, relativePath), "utf8");

describe("portrait orientation lock", () => {
  it("is wired for all touch devices", () => {
    const lock = readClient("src/shared/lib/enablePortraitOrientationLock.js");
    const main = readClient("src/app/main.jsx");
    const css = readClient("src/index.css");
    const html = readClient("index.html");
    const manifest = readClient("public/manifest.webmanifest");

    expect(lock).toMatch(/screen\.orientation\.lock/);
    expect(lock).toMatch(/app-portrait-lock-active/);
    expect(lock).toMatch(/pointer: coarse/);
    expect(lock).not.toMatch(/shortSide <= 560/);
    expect(main).toMatch(/enablePortraitOrientationLock/);
    expect(css).toMatch(/app-portrait-lock-active/);
    expect(html).toMatch(/manifest\.webmanifest/);
    expect(manifest).toMatch(/"orientation":\s*"portrait"/);
  });
});
