import { z } from "zod";

import {
  userAddressCityFieldSchema,
  userAddressDistrictFieldSchema,
  userAddressHouseFieldSchema,
  userAddressStreetFieldSchema,
} from "./addressStructured.js";
import {
  ADDRESS_LINE_MAX_LENGTH,
  USER_BACKGROUND_PRESET_IDS,
  USER_GENDER_VALUES,
  assertUserNameFormat,
  normalizeRuPhoneInput,
  normalizeUserNameInput,
  RU_PHONE_E164_REGEX,
} from "./userFields.js";
import { optionalRuRegionCodeFieldSchema } from "./ruRegions.js";
import { isStoredMediaUrl } from "./storedMediaUrl.js";
import { userSocialLinksBodyShape } from "./userSocialLinks.js";
import { userAddressesPatchFieldSchema, USER_ADDRESS_PATCH_CONFLICT_MESSAGE } from "./userAddresses.js";

/** Синхрон с `server/constants/profileImageFocusConstants.js`. */
export const PROFILE_IMAGE_FOCUS_MIN = 0;
export const PROFILE_IMAGE_FOCUS_MAX = 100;

/** Синхрон с `server/utils/maxWordsText.js`. */
export const NOTES_ABOUT_USER_MAX_CHARS = 500;

export const USER_ROLE_VALUES = ["user", "admin", "moderator"];

export const USER_BACKGROUND_PRESET_PREFIX = "preset:";

const clearableOptionalString = z
  .union([z.string(), z.null(), z.literal("")])
  .optional();

/**
 * @param {string} value
 */
function parseUserBackgroundPresetId(value) {
  const trimmed = value.trim();
  if (!trimmed.startsWith(USER_BACKGROUND_PRESET_PREFIX)) {
    return null;
  }
  const id = trimmed.slice(USER_BACKGROUND_PRESET_PREFIX.length);
  return USER_BACKGROUND_PRESET_IDS.includes(id) ? id : null;
}

/**
 * @param {unknown} value
 */
function isHttpBackgroundImageUrl(value) {
  return isStoredMediaUrl(value);
}

export const profileImageFocusSchema = z
  .object({
    x: z.number({ invalid_type_error: "x и y должны быть числами" }).finite(),
    y: z.number({ invalid_type_error: "x и y должны быть числами" }).finite(),
  })
  .superRefine((value, ctx) => {
    if (
      value.x < PROFILE_IMAGE_FOCUS_MIN ||
      value.x > PROFILE_IMAGE_FOCUS_MAX ||
      value.y < PROFILE_IMAGE_FOCUS_MIN ||
      value.y > PROFILE_IMAGE_FOCUS_MAX
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `x и y от ${PROFILE_IMAGE_FOCUS_MIN} до ${PROFILE_IMAGE_FOCUS_MAX}`,
      });
    }
  });

export const nullableProfileImageFocusSchema = z
  .union([profileImageFocusSchema, z.null()])
  .optional();

const clearableProfileImageFocusSchema = nullableProfileImageFocusSchema;

const clearableUserNameSchema = clearableOptionalString
  .transform((value) => {
    if (value === undefined) return undefined;
    if (value === null || value === "") return null;
    return normalizeUserNameInput(value);
  })
  .superRefine((value, ctx) => {
    if (value === undefined || value === null) return;
    try {
      assertUserNameFormat(value);
    } catch (error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: error instanceof Error ? error.message : "Неверный никнейм",
      });
    }
  });

const clearableRuPhoneSchema = clearableOptionalString
  .transform((raw, ctx) => {
    if (raw === undefined) return undefined;
    if (raw === null || raw === "") return null;
    try {
      const normalized = normalizeRuPhoneInput(raw);
      if (!RU_PHONE_E164_REGEX.test(normalized)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Номер РФ: +7 9XX XXX XX XX (можно 8…, 9XXXXXXXXX или с пробелами/скобками)",
        });
        return z.NEVER;
      }
      return normalized;
    } catch (error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: error instanceof Error ? error.message : "Неверный номер телефона",
      });
      return z.NEVER;
    }
  });

const clearableBirthDateSchema = clearableOptionalString.superRefine((value, ctx) => {
  if (value === undefined || value === null || value === "") return;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Дата рождения должна быть в формате ISO 8601",
    });
    return;
  }
  if (date > new Date()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Дата рождения не может быть в будущем",
    });
  }
});

const clearableAvatarUrlSchema = clearableOptionalString.superRefine((value, ctx) => {
  if (value === undefined || value === null || value === "") return;
  if (isStoredMediaUrl(value)) {
    return;
  }
  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    message: "URL аватара: http(s):// или /uploads/...",
  });
});

const clearableBackgroundUrlSchema = clearableOptionalString.superRefine((value, ctx) => {
  if (value === undefined || value === null || value === "") return;
  if (parseUserBackgroundPresetId(value) || isHttpBackgroundImageUrl(value)) {
    return;
  }
  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    message: "Фон: пресет preset:<id> или URL (http/https, /uploads/...)",
  });
});

const clearablePremiumExpiresAtSchema = clearableOptionalString.superRefine((value, ctx) => {
  if (value === undefined || value === null || value === "") return;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "premiumExpiresAt: некорректная дата",
    });
  }
});

const clearableBooleanSchema = z.union([z.boolean(), z.null()]).optional();

/** Тело `PATCH /user/:userIdClient` (структура; DaData — отдельно на сервере). */
export const updateProfileBodySchema = z.object({
  userName: clearableUserNameSchema,
  userBirthDate: clearableBirthDateSchema,
  userGender: z.union([z.enum(USER_GENDER_VALUES), z.null()]).optional(),
  userPhoneNumber: clearableRuPhoneSchema,
  userAvatarUrl: clearableAvatarUrlSchema,
  userAvatarFocus: clearableProfileImageFocusSchema,
  userBackgroundFocus: clearableProfileImageFocusSchema,
  userBackgroundUrl: clearableBackgroundUrlSchema,
  userAddress: z
    .union([z.string(), z.null(), z.literal("")])
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined;
      if (value === null || value === "") return null;
      return String(value).trim();
    })
    .refine(
      (value) => value === undefined || value === null || value.length <= ADDRESS_LINE_MAX_LENGTH,
      `Адрес не длиннее ${ADDRESS_LINE_MAX_LENGTH} символов`,
    ),
  userAddressFlat: z
    .union([z.string(), z.null(), z.literal("")])
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined;
      if (value === null || value === "") return null;
      return String(value).trim();
    }),
  userAddressCity: userAddressCityFieldSchema,
  userAddressDistrict: userAddressDistrictFieldSchema,
  userAddressStreet: userAddressStreetFieldSchema,
  userAddressHouse: userAddressHouseFieldSchema,
  userAddresses: userAddressesPatchFieldSchema.optional(),
  userRegionCode: optionalRuRegionCodeFieldSchema,
  notificationsEnabled: clearableBooleanSchema,
  userRole: z.union([z.enum(USER_ROLE_VALUES), z.null()]).optional(),
  isActiveUser: clearableBooleanSchema,
  isUserDataConfirmed: clearableBooleanSchema,
  isBlockedUser: clearableBooleanSchema,
  userDiscountPercent: z
    .union([z.coerce.number(), z.null()])
    .optional()
    .refine(
      (value) => value === undefined || value === null || (value >= 0 && value <= 100),
      "Процент скидки должен быть числом от 0 до 100",
    ),
  userLoyaltyPoints: z
    .union([z.coerce.number().int(), z.null()])
    .optional()
    .refine(
      (value) => value === undefined || value === null || value >= 0,
      "Баллы лояльности должны быть целым числом не меньше 0",
    ),
  isPremiumUser: clearableBooleanSchema,
  premiumExpiresAt: clearablePremiumExpiresAtSchema,
  notesAboutUser: z
    .union([z.string(), z.null(), z.literal("")])
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined;
      if (value === null || value === "") return null;
      return String(value).trim();
    })
    .refine(
      (value) => value === undefined || value === null || value.length <= NOTES_ABOUT_USER_MAX_CHARS,
      `Слишком длинный текст`,
    ),
  ...userSocialLinksBodyShape,
}).superRefine((body, ctx) => {
  if (body.userAddresses === undefined) {
    return;
  }

  const hasLegacyAddress =
    body.userAddress !== undefined ||
    body.userAddressFlat !== undefined ||
    body.userAddressCity !== undefined ||
    body.userAddressDistrict !== undefined ||
    body.userAddressStreet !== undefined ||
    body.userAddressHouse !== undefined;

  if (hasLegacyAddress) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: USER_ADDRESS_PATCH_CONFLICT_MESSAGE,
    });
  }
});
