import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const prepareSource = readFileSync(
  join(root, "features/image-upload/lib/prepareImageAssetForUpload.ts"),
  "utf8",
);
const gallerySource = readFileSync(
  join(root, "features/image-upload/lib/pickGalleryImageAsset.ts"),
  "utf8",
);
const pickerOptionsSource = readFileSync(
  join(root, "features/image-upload/lib/imagePickerGalleryOptions.ts"),
  "utf8",
);
const profileSource = readFileSync(
  join(root, "features/image-upload/lib/pickProfileImageAsset.ts"),
  "utf8",
);

assert.match(prepareSource, /expo-image-manipulator/);
assert.match(prepareSource, /image\/heic/);
assert.match(prepareSource, /image\/heif/);
assert.match(prepareSource, /\.heic/);
assert.match(gallerySource, /prepareImageAssetForUpload/);
assert.match(gallerySource, /IMAGE_PICKER_GALLERY_OPTIONS/);
assert.match(profileSource, /prepareImageAssetForUpload/);
assert.match(profileSource, /IMAGE_PICKER_GALLERY_OPTIONS/);
assert.match(pickerOptionsSource, /Compatible/);
assert.doesNotMatch(gallerySource, /image\/heic.*image\/jpeg/s);

console.log("image-upload-heic-parity.test.mjs: ok");
