import { z } from "zod";

import {
  deliveryAddressFlatFieldSchema,
  deliveryAddressLineFieldSchema,
  ruPhoneOptionalFieldSchema,
  userBackgroundPresetFieldSchema,
  userGenderFieldSchema,
  userNameFieldSchema,
} from "./userFields.js";

export const loginBodySchema = z.object({
  email: z.string().email("Неверный email"),
  password: z.string().min(6, "Пароль должен быть не менее 6 символов"),
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
