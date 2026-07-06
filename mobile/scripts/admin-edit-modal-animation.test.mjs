import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const shellSource = readFileSync(join(root, "shared/ui/AdminEditModalShell.tsx"), "utf8");
const animationSource = readFileSync(
  join(root, "shared/model/useAdminEditModalAnimation.ts"),
  "utf8",
);
const categoryModalSource = readFileSync(
  join(root, "features/catalog-browser/ui/EditCategoryDisplayModal.tsx"),
  "utf8",
);

assert.match(shellSource, /animationType="none"/);
assert.match(shellSource, /backdropAnimatedStyle/);
assert.match(animationSource, /backdropOpacity/);
assert.match(animationSource, /withTiming/);
assert.match(animationSource, /finishClose/);
assert.doesNotMatch(animationSource, /isWeb/);
assert.match(shellSource, /pointerEvents={dismissDisabled \? "none" : "auto"}/);
assert.match(categoryModalSource, /useSyncAdminEditFormOnOpen/);
assert.match(categoryModalSource, /onInteractionBusyChange/);
assert.match(categoryModalSource, /onDismissed/);
assert.match(categoryModalSource, /categorySlug: resolved\.displaySlug/);

console.log("admin-edit-modal-animation.test.mjs: ok");
