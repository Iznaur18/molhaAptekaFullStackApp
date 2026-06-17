import "dotenv/config";

import mongoose from "mongoose";

import { assertProductionEnv } from "../utils/assertProductionEnv.js";
import { buildSpaContentSecurityPolicy } from "../utils/buildSpaContentSecurityPolicy.js";
import { isObjectStorageUploadEnabled } from "../services/upload/objectStorageUpload.js";

process.env.NODE_ENV = "production";

const MONGO_CONNECT_MS = 15_000;

/**
 * @returns {Promise<boolean>}
 */
const mongoHasReplicaSet = async () => {
  try {
    const result = await mongoose.connection.db.admin().command({
      replSetGetStatus: 1,
    });
    return result?.ok === 1;
  } catch {
    return false;
  }
};

const main = async () => {
  const { ok, errors, warnings } = assertProductionEnv();

  for (const message of warnings) {
    console.warn(`⚠ ${message}`);
  }

  if (errors.length > 0) {
    for (const message of errors) {
      console.error(`✗ ${message}`);
    }
    console.error("\nИсправьте server/.env → npm run validate:prod");
    process.exit(1);
  }

  console.log("✓ Env validation OK");

  const mongoUri = String(process.env.MONGO_URI ?? "").trim();
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: MONGO_CONNECT_MS,
    });
    console.log("✓ MongoDB: подключение успешно");

    const hasRs = await mongoHasReplicaSet();
    if (!hasRs) {
      console.warn(
        "⚠ Replica set не обнаружен — заказы/баллы с транзакциями могут падать (нужен Atlas M0+ или rs0)",
      );
    } else {
      console.log("✓ MongoDB: replica set");
    }
  } catch (error) {
    console.error("✗ MongoDB: не удалось подключиться");
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }

  const uploadMode = isObjectStorageUploadEnabled() ? "s3 + CDN" : "disk (server/uploads)";
  console.log(`✓ Upload mode: ${uploadMode}`);
  console.log(`✓ FRONTEND_URL: ${process.env.FRONTEND_URL}`);
  console.log(
    `✓ PUBLIC_UPLOAD_BASE_URL: ${process.env.PUBLIC_UPLOAD_BASE_URL ?? "(не задан)"}`,
  );
  console.log("✓ CSP (nginx location /):");
  console.log(`  ${buildSpaContentSecurityPolicy()}`);

  console.log("\nДальше на VPS: docs/deploy/DEPLOY.md, CSP → npm run csp:print");
};

main().catch((error) => {
  console.error("[preflight] FAILED:", error);
  process.exit(1);
});
