import { EMAIL_AUTH_DISABLED_MESSAGE } from "@izibuy/shared-lib";

import { AppError } from "../../errors/AppError.js";
import { SMS_DELIVERY_UNAVAILABLE_MESSAGE } from "../../constants/phoneVerificationConstants.js";

/**
 * Ошибки SMS/почты из сервисов → AppError с нужным статусом.
 * Сырой E11000 и прочий мусор сюда не пускаем (caller логирует и кидает 500).
 *
 * @param {unknown} error
 * @param {{ fallbackMessage?: string, fallbackStatus?: number }} [opts]
 * @returns {never}
 */
export function throwMappedAuthChannelError(
  error,
  { fallbackMessage = "Не удалось выполнить запрос", fallbackStatus = 400 } = {},
) {
  if (error instanceof AppError) {
    throw error;
  }

  const raw = error instanceof Error ? error.message : String(error ?? "");
  const message = mapSmsDeliveryMessage(error, raw);

  if (message === EMAIL_AUTH_DISABLED_MESSAGE) {
    throw new AppError(503, message);
  }
  if (message === "EMAIL_DELIVERY_UNAVAILABLE") {
    throw new AppError(503, "Не удалось отправить письмо. Попробуйте позже");
  }
  if (
    message === "SMS_DELIVERY_UNAVAILABLE" ||
    message.startsWith("SMS_DELIVERY_UNAVAILABLE") ||
    message === SMS_DELIVERY_UNAVAILABLE_MESSAGE ||
    message.startsWith(`${SMS_DELIVERY_UNAVAILABLE_MESSAGE}:`)
  ) {
    throw new AppError(
      503,
      message.startsWith("SMS_DELIVERY_UNAVAILABLE")
        ? "Не удалось отправить SMS. Попробуйте позже"
        : message,
    );
  }
  if (isSmsDeliveryFailure(message)) {
    throw new AppError(503, message);
  }

  throw new AppError(fallbackStatus, message || fallbackMessage);
}

/**
 * @param {unknown} error
 * @param {string} message
 */
function mapSmsDeliveryMessage(error, message) {
  if (!isSmsDeliveryFailure(message) && !isSmsDeliveryFailure(String(error?.message ?? ""))) {
    return message;
  }
  const detail =
    error?.smspilotDescription ||
    (message.includes(": ") ? message.slice(message.indexOf(": ") + 2).trim() : "");
  if (detail && !detail.startsWith(SMS_DELIVERY_UNAVAILABLE_MESSAGE)) {
    return `${SMS_DELIVERY_UNAVAILABLE_MESSAGE}: ${detail}`;
  }
  if (detail) return detail;
  if (
    message === "SMS_DELIVERY_UNAVAILABLE" ||
    message.startsWith("SMS_DELIVERY_UNAVAILABLE")
  ) {
    return SMS_DELIVERY_UNAVAILABLE_MESSAGE;
  }
  return message || SMS_DELIVERY_UNAVAILABLE_MESSAGE;
}

/** @param {string} message */
function isSmsDeliveryFailure(message) {
  return (
    message === "SMS_DELIVERY_UNAVAILABLE" ||
    message.startsWith("SMS_DELIVERY_UNAVAILABLE") ||
    message === SMS_DELIVERY_UNAVAILABLE_MESSAGE ||
    message.startsWith(`${SMS_DELIVERY_UNAVAILABLE_MESSAGE}:`)
  );
}
