import { execFile } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import {
  LOCAL_DEV_MONGO_URI,
  MONGO_COMPOSE_SERVICE,
  buildReplicaStatusEvalScript,
} from "./mongoReplicaSetDev.mjs";

const execFileAsync = promisify(execFile);

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const composeFile = path.join(repoRoot, "docker-compose.yml");

const main = async () => {
  try {
    const output = await execFileAsync(
      "docker",
      [
        "compose",
        "-f",
        composeFile,
        "exec",
        "-T",
        MONGO_COMPOSE_SERVICE,
        "mongosh",
        "--quiet",
        "--eval",
        buildReplicaStatusEvalScript(),
      ],
      { cwd: repoRoot, encoding: "utf8" },
    );

    if (output.stdout.trim() !== "OK") {
      throw new Error(`Неожиданный ответ mongosh: ${output.stdout.trim()}`);
    }

    console.log(`✓ MongoDB replica set rs0 (PRIMARY)`);
    console.log(`  MONGO_URI=${LOCAL_DEV_MONGO_URI}`);
  } catch (error) {
    console.error("✗ Replica set недоступен. Запустите: npm run mongo:up");
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
};

main();
