import fs from "fs/promises";
import path from "path";

import {
  deleteUploadFromObjectStorage,
  isObjectStorageUploadEnabled,
} from "./objectStorageUpload.js";
import { parseUploadFilenameFromMediaUrl } from "./parseUploadFilenameFromMediaUrl.js";
import { UPLOADS_DIR } from "./uploadsDir.js";

/**
 * @param {string | null | undefined} mediaUrl
 */
export async function deleteUploadFileByUrl(mediaUrl) {
  const filename = parseUploadFilenameFromMediaUrl(mediaUrl);
  if (!filename) {
    return;
  }

  if (isObjectStorageUploadEnabled()) {
    try {
      await deleteUploadFromObjectStorage(filename);
    } catch (error) {
      console.error("deleteUploadFileByUrl s3 error:", error);
    }
    return;
  }

  const filePath = path.join(UPLOADS_DIR, filename);
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error?.code !== "ENOENT") {
      console.error("deleteUploadFileByUrl error:", error);
    }
  }
}
