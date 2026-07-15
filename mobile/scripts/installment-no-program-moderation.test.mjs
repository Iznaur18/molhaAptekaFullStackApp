import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT = join(ROOT, "..", "client");
const SHARED = join(ROOT, "..", "packages", "shared-lib", "src");
const SERVER = join(ROOT, "..", "server");

const read = (from, relativePath) => readFileSync(join(from, relativePath), "utf8");

test("installment program: no staff moderation queue", () => {
  const service = read(SERVER, "services/product/productInstallment.js");
  const router = read(SERVER, "routes/productRouter.js");
  const sharedSections = read(SHARED, "profileSections.ts");
  const staffViews = read(SHARED, "staffMainViews.ts");
  const homePaths = read(CLIENT, "src/shared/lib/homeMainViewPaths.js");
  const hub = read(ROOT, "features/profile-hub/ui/HubSectionContent.tsx");
  const migration = read(
    SERVER,
    "scripts/migrations/20260714-approve-pending-installment-programs.js",
  );
  const migrationsIndex = read(SERVER, "scripts/migrations/index.js");

  assert.match(service, /INSTALLMENT_MODERATION_APPROVED/);
  assert.doesNotMatch(service, /INSTALLMENT_MODERATION_PENDING/);
  assert.doesNotMatch(service, /getPendingInstallmentModeration/);
  assert.doesNotMatch(service, /approveInstallmentModeration/);
  assert.doesNotMatch(router, /installment\/moderation/);
  assert.doesNotMatch(sharedSections, /INSTALLMENT_MODERATION/);
  assert.doesNotMatch(staffViews, /installment-moderation/);
  assert.doesNotMatch(homePaths, /installment-moderation/);
  assert.doesNotMatch(hub, /installment-moderation/);
  assert.match(migration, /approve-pending-installment|INSTALLMENT_MODERATION_APPROVED/);
  assert.match(migrationsIndex, /20260714-approve-pending-installment-programs/);
});
