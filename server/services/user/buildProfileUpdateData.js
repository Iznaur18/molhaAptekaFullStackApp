import { normalizeStoredUploadUrl } from "../upload/buildPublicUploadUrl.js";
import {
  normalizeUserAvatarFocus,
  normalizeUserBackgroundFocus,
} from "./profileImageFocus.js";
import { resolveUserAddressCityNormalized } from "../product/ruCityNormalized.js";

const hasOwn = (object, field) => Object.prototype.hasOwnProperty.call(object, field);

const applyVerifiedDeliveryAddress = (updateData, verifiedDeliveryAddress) => {
  if (verifiedDeliveryAddress === null) {
    updateData.userAddress = null;
    updateData.userAddressFlat = null;
    updateData.userAddressCity = null;
    updateData.userAddressDistrict = null;
    updateData.userAddressStreet = null;
    updateData.userAddressHouse = null;
    updateData.userAddressFiasId = null;
    updateData.userAddressGeo = null;
    updateData.userAddressCityNormalized = "";
    return;
  }

  updateData.userAddress = verifiedDeliveryAddress.displayAddress;
  updateData.userAddressFlat = verifiedDeliveryAddress.flat;
  updateData.userAddressCity = verifiedDeliveryAddress.city ?? "";
  updateData.userAddressDistrict = verifiedDeliveryAddress.district ?? "";
  updateData.userAddressStreet = verifiedDeliveryAddress.street ?? "";
  updateData.userAddressHouse = verifiedDeliveryAddress.house ?? "";
  updateData.userAddressFiasId = verifiedDeliveryAddress.fiasId;
  updateData.userAddressGeo = verifiedDeliveryAddress.geo;
  updateData.userAddressCityNormalized = resolveUserAddressCityNormalized(
    updateData.userAddressCity,
  );
};

const convertProfileFieldValue = (field, value) => {
  if (field === "userBirthDate") {
    return value !== null && value !== "" ? new Date(value) : null;
  }
  if (field === "userDiscountPercent") {
    return Number(value);
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
      ? [...new Set(value.weekdays.map((day) => Math.floor(Number(day))).filter(Number.isFinite))]
      : [];
    return {
      weekdays,
      openTime: typeof value.openTime === "string" ? value.openTime.trim() : value.openTime,
      closeTime: typeof value.closeTime === "string" ? value.closeTime.trim() : value.closeTime,
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
 *   verifiedDeliveryAddress?: unknown;
 * }} input
 */
export function buildProfileUpdateData({
  body,
  allowedFields,
  verifiedDeliveryAddress,
}) {
  const updateData = {};

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updateData[field] = convertProfileFieldValue(field, body[field]);
    }
  }

  if (verifiedDeliveryAddress !== undefined) {
    applyVerifiedDeliveryAddress(updateData, verifiedDeliveryAddress);
  } else if (hasOwn(updateData, "userAddressCity")) {
    updateData.userAddressCityNormalized = resolveUserAddressCityNormalized(
      updateData.userAddressCity,
    );
  }

  return updateData;
}
