import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const hookSource = readFileSync(join(root, "shared/model/useSyncAdminEditFormOnOpen.ts"), "utf8");
const uploadFieldSource = readFileSync(
  join(root, "features/image-upload/ui/ImageUrlUploadField.tsx"),
  "utf8",
);

assert.match(hookSource, /didOpen/);
assert.match(hookSource, /sessionChanged/);
assert.match(uploadFieldSource, /isPicking/);
assert.match(uploadFieldSource, /onInteractionBusyChange/);

console.log("admin-edit-form-hydration.test.mjs: ok");
