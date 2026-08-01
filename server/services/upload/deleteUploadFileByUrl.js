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
import { logServerEvent } from "../../utils/logServerEvent.js";

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
        logServerEvent("error", {
          event: "deleteuploadfilebyurl_private_s3",
          error: error instanceof Error ? error.message : String(error),
        });
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
        logServerEvent("error", {
          event: "deleteuploadfilebyurl_private",
          error: error instanceof Error ? error.message : String(error),
        });
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
      logServerEvent("error", {
        event: "deleteuploadfilebyurl_s3",
        error: error instanceof Error ? error.message : String(error),
      });
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
      logServerEvent("error", {
        event: "deleteuploadfilebyurl",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
