import fs from "fs/promises";
import path from "path";

import { PRIVATE_UPLOAD_SUBDIR } from "../../constants/privateUploadConstants.js";
import {
  deletePrivateUploadFromObjectStorage,
  deleteUploadFromObjectStorage,
  isObjectStorageUploadEnabled,
} from "./objectStorageUpload.js";
import { parseUploadFilenameFromMediaUrl } from "./parseUploadFilenameFromMediaUrl.js";
import { parsePrivateUploadFilenameFromUrl } from "./privateUploadPaths.js";
import { UPLOADS_DIR } from "./uploadsDir.js";

/**
 * @param {string | null | undefined} mediaUrl
 */
export async function deleteUploadFileByUrl(mediaUrl) {
  const privateFilename = parsePrivateUploadFilenameFromUrl(mediaUrl);
  if (privateFilename) {
    if (isObjectStorageUploadEnabled()) {
      try {
        await deletePrivateUploadFromObjectStorage(privateFilename);
      } catch (error) {
        console.error("deleteUploadFileByUrl private s3 error:", error);
      }
      return;
    }

    const privateDir = path.resolve(UPLOADS_DIR, PRIVATE_UPLOAD_SUBDIR);
    const filePath = path.resolve(privateDir, privateFilename);
    if (!filePath.startsWith(`${privateDir}${path.sep}`)) {
      return;
    }
    try {
      await fs.unlink(filePath);
    } catch (error) {
      if (error?.code !== "ENOENT") {
        console.error("deleteUploadFileByUrl private error:", error);
      }
    }
    return;
  }

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

  const uploadsRoot = path.resolve(UPLOADS_DIR);
  const filePath = path.resolve(uploadsRoot, filename);
  const isInsideUploads =
    filePath === uploadsRoot || filePath.startsWith(`${uploadsRoot}${path.sep}`);
  if (!isInsideUploads) {
    return;
  }

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error?.code !== "ENOENT") {
      console.error("deleteUploadFileByUrl error:", error);
    }
  }
}
