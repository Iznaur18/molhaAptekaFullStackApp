import { z } from "zod";

import {
  deliveryAddressFlatFieldSchema,
  deliveryAddressLineFieldSchema,
  ruPhoneOptionalFieldSchema,
  ruPhoneRequiredFieldSchema,
  userBackgroundPresetFieldSchema,
  userGenderFieldSchema,
  userNameFieldSchema,
} from "./userFields.js";
import { EMAIL_VERIFICATION_CODE_LENGTH } from "./emailVerification.js";

export const loginBodySchema = z.object({
  email: z.string().email("Неверный email"),
  password: z.string().min(6, "Пароль должен быть не менее 6 символов"),
});

export const loginPhonePasswordBodySchema = z.object({
  phoneNumber: ruPhoneRequiredFieldSchema,
  password: z.string().min(6, "Пароль должен быть не менее 6 символов"),
});

export const loginPhoneOtpRequestBodySchema = z.object({
  phoneNumber: ruPhoneRequiredFieldSchema,
});

export const loginPhoneOtpConfirmBodySchema = z.object({
  phoneNumber: ruPhoneRequiredFieldSchema,
  code: z
    .string()
    .trim()
    .regex(
      new RegExp(`^\\d{${EMAIL_VERIFICATION_CODE_LENGTH}}$`),
      `Код должен содержать ${EMAIL_VERIFICATION_CODE_LENGTH} цифр`,
    ),
});

export const phoneBindRequestBodySchema = z.object({
  phoneNumber: ruPhoneOptionalFieldSchema,
});

export const phoneBindConfirmBodySchema = z.object({
  code: z
    .string()
    .trim()
    .regex(
      new RegExp(`^\\d{${EMAIL_VERIFICATION_CODE_LENGTH}}$`),
      `Код должен содержать ${EMAIL_VERIFICATION_CODE_LENGTH} цифр`,
    ),
});

export const registerBodySchema = z
  .object({
    email: z.string().email("Неверный email"),
    password: z.string().min(6, "Пароль должен быть не менее 6 символов"),
    passwordConfirm: z.string({ required_error: "Повторите пароль" }).min(1, "Повторите пароль"),
    userName: userNameFieldSchema,
    phoneNumber: ruPhoneOptionalFieldSchema,
    avatarUrl: z
      .string()
      .url("URL аватара должен быть валидным URL")
      .optional()
      .or(z.literal(""))
      .or(z.null())
      .optional(),
    backgroundPresetId: userBackgroundPresetFieldSchema,
    userBirthDate: z
      .union([z.string(), z.literal(""), z.null(), z.undefined()])
      .optional()
      .refine(
        (value) => value == null || value === "" || !Number.isNaN(Date.parse(String(value))),
        "Неверная дата рождения",
      ),
    userGender: userGenderFieldSchema,
    userAddress: deliveryAddressLineFieldSchema,
    userAddressFlat: deliveryAddressFlatFieldSchema,
    notificationsEnabled: z.boolean().optional(),
    referralCode: z
      .string()
      .trim()
      .max(32)
      .optional()
      .or(z.literal(""))
      .or(z.null())
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.passwordConfirm !== data.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Пароли не совпадают",
        path: ["passwordConfirm"],
      });
    }
  });

export const registerPhoneBodySchema = z
  .object({
    phoneNumber: ruPhoneRequiredFieldSchema,
    password: z.string().min(6, "Пароль должен быть не менее 6 символов"),
    passwordConfirm: z.string({ required_error: "Повторите пароль" }).min(1, "Повторите пароль"),
    userName: userNameFieldSchema,
    avatarUrl: z
      .string()
      .url("URL аватара должен быть валидным URL")
      .optional()
      .or(z.literal(""))
      .or(z.null())
      .optional(),
    backgroundPresetId: userBackgroundPresetFieldSchema,
    userBirthDate: z
      .union([z.string(), z.literal(""), z.null(), z.undefined()])
      .optional()
      .refine(
        (value) => value == null || value === "" || !Number.isNaN(Date.parse(String(value))),
        "Неверная дата рождения",
      ),
    userGender: userGenderFieldSchema,
    userAddress: deliveryAddressLineFieldSchema,
    userAddressFlat: deliveryAddressFlatFieldSchema,
    notificationsEnabled: z.boolean().optional(),
    referralCode: z
      .string()
      .trim()
      .max(32)
      .optional()
      .or(z.literal(""))
      .or(z.null())
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.passwordConfirm !== data.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Пароли не совпадают",
        path: ["passwordConfirm"],
      });
    }
  });
