const BYTES_PER_MIB = 1024 * 1024;

/**
 * @param {number} bytes
 */
export function formatUploadBytesAsMb(bytes) {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value <= 0) {
    return "0";
  }
  return (value / BYTES_PER_MIB).toFixed(1).replace(".", ",");
}

/**
 * @param {number} fileSizeBytes
 * @param {number} maxBytes
 */
export function buildUploadVideoSizeError(fileSizeBytes, maxBytes) {
  return `Файл ${formatUploadBytesAsMb(fileSizeBytes)} МБ — лимит ${formatUploadBytesAsMb(maxBytes)} МБ`;
}
