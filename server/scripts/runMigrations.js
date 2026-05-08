import "dotenv/config";
import mongoose from "mongoose";

import { MIGRATIONS } from "./migrations/index.js";

const APPLY_FLAG = "--apply";
const ID_FLAG = "--id";
const MIGRATIONS_COLLECTION = "app_migrations";

const readMigrationIdArg = (argv) => {
  const idx = argv.indexOf(ID_FLAG);
  if (idx === -1) return null;
  return argv[idx + 1] ?? null;
};

const toIso = (value) => (value instanceof Date ? value.toISOString() : String(value));

async function run() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI не задан в .env");
  }

  const isApply = process.argv.includes(APPLY_FLAG);
  const singleMigrationId = readMigrationIdArg(process.argv);
  const selectedMigrations = singleMigrationId
    ? MIGRATIONS.filter((migration) => migration.id === singleMigrationId)
    : MIGRATIONS;

  if (selectedMigrations.length === 0) {
    throw new Error(
      singleMigrationId
        ? `Миграция с id="${singleMigrationId}" не найдена`
        : "Список миграций пуст",
    );
  }

  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const metaCollection = db.collection(MIGRATIONS_COLLECTION);

  try {
    for (const migration of selectedMigrations) {
      const alreadyApplied = await metaCollection.findOne({ _id: migration.id });
      if (alreadyApplied) {
        console.log(
          `[migrate] SKIP ${migration.id} (already applied at ${toIso(
            alreadyApplied.appliedAt,
          )})`,
        );
        continue;
      }

      console.log(
        `[migrate] START ${migration.id} (${isApply ? "APPLY" : "DRY-RUN"})`,
      );
      const startedAt = new Date();
      const result = await migration.up({ db, isApply });
      const finishedAt = new Date();

      console.log(
        `[migrate] DONE ${migration.id}: ${JSON.stringify(result ?? {})}`,
      );

      if (isApply) {
        await metaCollection.insertOne({
          _id: migration.id,
          description: migration.description,
          appliedAt: finishedAt,
          startedAt,
          result: result ?? {},
        });
      }
    }
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((error) => {
  console.error("[migrate] FAILED:", error);
  process.exit(1);
});
