import { execFile } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import {
  MONGO_COMPOSE_SERVICE,
  buildReplicaInitEvalScript,
  buildReplicaStatusEvalScript,
} from "./mongoReplicaSetDev.mjs";

const execFileAsync = promisify(execFile);

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const composeFile = path.join(repoRoot, "docker-compose.yml");

const PING_RETRIES = 30;
const PING_DELAY_MS = 1_000;
const PRIMARY_RETRIES = 30;
const PRIMARY_DELAY_MS = 1_000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * @param {string[]} args
 */
const runDockerCompose = async (args) => {
  const { stdout, stderr } = await execFileAsync(
    "docker",
    ["compose", "-f", composeFile, ...args],
    { cwd: repoRoot, encoding: "utf8" },
  );

  if (stderr?.trim()) {
    console.error(stderr.trim());
  }

  return stdout.trim();
};

/**
 * @param {string} evalScript
 */
const runMongoEval = async (evalScript) =>
  runDockerCompose(["exec", "-T", MONGO_COMPOSE_SERVICE, "mongosh", "--quiet", "--eval", evalScript]);

const waitForMongoPing = async () => {
  const pingScript = "db.adminCommand({ ping: 1 }).ok";

  for (let attempt = 1; attempt <= PING_RETRIES; attempt += 1) {
    try {
      const output = await runMongoEval(pingScript);
      if (output === "1") {
        return;
      }
    } catch {
      // mongod ещё поднимается
    }

    await sleep(PING_DELAY_MS);
  }

  throw new Error("MongoDB не ответил на ping после docker compose up");
};

const waitForPrimary = async () => {
  const statusScript = buildReplicaStatusEvalScript();

  for (let attempt = 1; attempt <= PRIMARY_RETRIES; attempt += 1) {
    try {
      const output = await runMongoEval(statusScript);
      if (output === "OK") {
        return;
      }
    } catch {
      // replica set ещё выбирает primary
    }

    await sleep(PRIMARY_DELAY_MS);
  }

  throw new Error("Replica set не перешёл в PRIMARY");
};

const main = async () => {
  try {
    console.log("[mongo] Ожидание mongod...");
    await waitForMongoPing();

    const initOutput = await runMongoEval(buildReplicaInitEvalScript());
    if (initOutput === "INITIATED") {
      console.log("[mongo] Replica set инициализирован (rs0)");
    } else if (initOutput === "READY") {
      console.log("[mongo] Replica set уже настроен (rs0)");
    } else {
      console.log(`[mongo] ${initOutput}`);
    }

    await waitForPrimary();
    console.log("[mongo] PRIMARY готов — транзакции заказов/баллов доступны");
  } catch (error) {
    console.error("[mongo] Не удалось подготовить replica set");
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
};

main();
