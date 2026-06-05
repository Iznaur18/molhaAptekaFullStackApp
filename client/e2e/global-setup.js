import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default async function globalSetup() {
  if (process.env.SKIP_E2E_SEED === "1") {
    return;
  }

  const serverDir = path.resolve(__dirname, "../../server");
  const result = spawnSync("node", ["scripts/e2ePlaywrightSeed.js"], {
    cwd: serverDir,
    env: process.env,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error("e2ePlaywrightSeed failed");
  }
}
