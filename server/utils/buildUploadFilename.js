/**
 * @param {string} mimetype
 */
export const buildUploadFilename = (mimetype) => {
  const raw = String(mimetype ?? "").split("/")[1] || "bin";
  const ext = raw.replace(/[^a-z0-9]/gi, "") || "bin";
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
};
