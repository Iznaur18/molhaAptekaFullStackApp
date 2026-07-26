/**
 * Optional PutObject encryption headers for AWS S3.
 * R2 encrypts at rest by default — leave S3_SERVER_SIDE_ENCRYPTION unset.
 *
 * @returns {Record<string, string>}
 */
export function buildS3ServerSideEncryptionParams() {
  const mode = String(process.env.S3_SERVER_SIDE_ENCRYPTION ?? "")
    .trim()
    .toLowerCase();
  if (!mode || mode === "none" || mode === "off") {
    return {};
  }

  if (mode === "aes256") {
    return { ServerSideEncryption: "AES256" };
  }

  if (mode === "aws:kms" || mode === "aws_kms") {
    const params = { ServerSideEncryption: "aws:kms" };
    const keyId = process.env.S3_SSE_KMS_KEY_ID?.trim();
    if (keyId) {
      params.SSEKMSKeyId = keyId;
    }
    return params;
  }

  return {};
}
