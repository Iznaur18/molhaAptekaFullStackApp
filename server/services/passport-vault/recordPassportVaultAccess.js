import PassportVaultAccessLogModel from "../../models/PassportVaultAccessLogModel.js";

/**
 * @param {{
 *   actorUserId?: string | null;
 *   purpose: string;
 *   resourceType: string;
 *   resourceId: string;
 * }} params
 */
export async function recordPassportVaultAccess(params) {
  const purpose = String(params.purpose ?? "").trim();
  const resourceType = String(params.resourceType ?? "").trim();
  const resourceId = String(params.resourceId ?? "").trim();
  if (!purpose || !resourceType || !resourceId) {
    return;
  }

  if (PassportVaultAccessLogModel.db?.readyState !== 1) {
    return;
  }

  try {
    await PassportVaultAccessLogModel.create({
      actorUserId: params.actorUserId || null,
      purpose,
      resourceType,
      resourceId,
    });
  } catch (error) {
    console.error(
      "[passport-vault] access log failed:",
      error instanceof Error ? error.message : error,
    );
  }
}
