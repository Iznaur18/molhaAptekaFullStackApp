const TARGET_MIGRATION_ID = "20260508-order-items-status";

if (!process.argv.includes("--id")) {
  process.argv.push("--id", TARGET_MIGRATION_ID);
}

await import("./runMigrations.js");
