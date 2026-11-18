import { normalizeSellerProductsLimitOverride } from "@molha/api-contract";

import { normalizeStoredUploadUrl } from "../upload/buildPublicUploadUrl.js";
import {
  normalizeUserAvatarFocus,
  normalizeUserBackgroundFocus,
} from "./profileImageFocus.js";
import { resolveUserAddressCityNormalized } from "../product/ruCityNormalized.js";
import { applyVerifiedUserAddressesUpdate } from "./applyVerifiedUserAddressesUpdate.js";
import {
  buildLegacyClearUserAddresses,
  buildLegacyVerifiedUserAddresses,
} from "./buildLegacyVerifiedUserAddresses.js";
import { UserModel } from "../../models/index.js";

const hasOwn = (object, field) => Object.prototype.hasOwnProperty.call(object, field);

const convertProfileFieldValue = (field, value) => {
  if (field === "userBirthDate") {
    return value !== null && value !== "" ? new Date(value) : null;
  }
  if (field === "userDiscountPercent") {
    return Number(value);
  }
  if (field === "sellerProductsLimitOverride") {
    return normalizeSellerProductsLimitOverride(value);
  }
  if (field === "userLoyaltyPoints") {
    const points = Math.floor(Number(value));
    return Number.isFinite(points) ? Math.max(0, points) : 0;
  }
  if (field === "premiumExpiresAt") {
    return value === null || value === "" ? null : new Date(value);
  }
  if (field === "userName") {
    return typeof value === "string" ? value.trim().toLowerCase() : value;
  }
  if (field === "userBusinessHours") {
    if (value == null) {
      return null;
    }
    if (typeof value !== "object") {
      return value;
    }
    const weekdays = Array.isArray(value.weekdays)
      ? [
          ...new Set(
            value.weekdays
              .map((day) => Math.floor(Number(day)))
              .filter(Number.isFinite),
          ),
        ]
      : [];
    return {
      weekdays,
      openTime:
        typeof value.openTime === "string" ? value.openTime.trim() : value.openTime,
      closeTime:
        typeof value.closeTime === "string" ? value.closeTime.trim() : value.closeTime,
    };
  }
  if (
    field === "userPhoneNumber" ||
    field === "userFullName" ||
    field === "sellerPayoutRequisites" ||
    field === "userAddress" ||
    field === "userAddressFlat" ||
    field === "userAddressFiasId" ||
    field === "notesAboutUser" ||
    field === "socialTelegramUrl" ||
    field === "socialInstagramUrl" ||
    field === "socialVkUrl" ||
    field === "socialYoutubeUrl" ||
    field === "socialWhatsappUrl" ||
    field === "socialWebsiteUrl"
  ) {
    return typeof value === "string" ? value.trim() : value;
  }
  if (field === "userAddressGeo") {
    return value;
  }
  if (field === "userAvatarUrl") {
    const trimmed = typeof value === "string" ? value.trim() : "";
    return trimmed === "" ? trimmed : normalizeStoredUploadUrl(trimmed);
  }
  if (field === "userAvatarFocus") {
    return normalizeUserAvatarFocus(value);
  }
  if (field === "userBackgroundFocus") {
    return normalizeUserBackgroundFocus(value);
  }
  return value;
};

/**
 * @param {{
 *   body: Record<string, unknown>;
 *   allowedFields: string[];
 *   targetUserId: string;
 *   verifiedDeliveryAddress?: unknown;
 *   verifiedUserAddresses?: unknown;
 * }} input
 */
export async function buildProfileUpdateData({
  body,
  allowedFields,
  targetUserId,
  verifiedDeliveryAddress,
  verifiedUserAddresses,
}) {
  const updateData = {};

  for (const field of allowedFields) {
    // userAddresses приходит только через middleware → verifiedUserAddresses.
    if (field === "userAddresses") {
      continue;
    }
    if (body[field] !== undefined) {
      updateData[field] = convertProfileFieldValue(field, body[field]);
    }
  }

  if (verifiedUserAddresses !== undefined) {
    applyVerifiedUserAddressesUpdate(updateData, verifiedUserAddresses);
  } else if (verifiedDeliveryAddress !== undefined) {
    const existingUser = await UserModel.findById(targetUserId)
      .select("userAddresses")
      .lean();
    const existingAddresses = Array.isArray(existingUser?.userAddresses)
      ? existingUser.userAddresses
      : [];

    if (verifiedDeliveryAddress === null) {
      applyVerifiedUserAddressesUpdate(
        updateData,
        buildLegacyClearUserAddresses(existingAddresses),
      );
    } else {
      applyVerifiedUserAddressesUpdate(
        updateData,
        buildLegacyVerifiedUserAddresses(existingAddresses, verifiedDeliveryAddress),
      );
    }
  } else if (hasOwn(updateData, "userAddressCity")) {
    updateData.userAddressCityNormalized = resolveUserAddressCityNormalized(
      updateData.userAddressCity,
    );
  }

  return updateData;
}
