import {
  UPLOAD_STORAGE_DISK,
  UPLOAD_STORAGE_S3,
} from "../constants/uploadStorageConstants.js";
import { isObjectStorageUploadEnabled } from "./objectStorageUpload.js";

/** @returns {typeof UPLOAD_STORAGE_DISK | typeof UPLOAD_STORAGE_S3} */
export function resolveUploadStorageMode() {
  return isObjectStorageUploadEnabled() ? UPLOAD_STORAGE_S3 : UPLOAD_STORAGE_DISK;
}
