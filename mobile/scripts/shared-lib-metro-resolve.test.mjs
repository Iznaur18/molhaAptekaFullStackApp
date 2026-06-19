import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const MOBILE_ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SHARED_LIB_ROOT = path.join(MOBILE_ROOT, "../packages/shared-lib");
const SHARED_LIB_PKG_PATH = path.join(SHARED_LIB_ROOT, "package.json");

test("shared-lib react-native export uses compiled dist", () => {
  const pkg = JSON.parse(fs.readFileSync(SHARED_LIB_PKG_PATH, "utf8"));
  assert.equal(pkg.exports["."]["react-native"], "./dist/index.js");
});

test("shared-lib dist contains formatApiErrorMessage.js after build", () => {
  execSync("npm run build", { cwd: SHARED_LIB_ROOT, stdio: "pipe" });

  const distIndexPath = path.join(SHARED_LIB_ROOT, "dist/index.js");
  const distModulePath = path.join(SHARED_LIB_ROOT, "dist/formatApiErrorMessage.js");

  assert.equal(fs.existsSync(distIndexPath), true);
  assert.equal(fs.existsSync(distModulePath), true);

  const distIndexSource = fs.readFileSync(distIndexPath, "utf8");
  assert.match(distIndexSource, /formatApiErrorMessage\.js/);
});
