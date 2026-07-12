import { LEGAL_OPERATOR_PLACEHOLDER } from "@/features/legal/model/legalSharedConstants";

export const REGISTRATION_PERSONAL_DATA_CONSENT_SUMMARY =
  "Даю согласие оператору на обработку данных, которые я указываю при регистрации и использовании сервиса: адрес электронной почты, имя пользователя, пароль (в хранилище — в виде хэша), а также технические данные сессии, необходимые для входа и безопасности аккаунта.";

export const REGISTRATION_PERSONAL_DATA_CONSENT_PURPOSES =
  "Цели обработки: создание и ведение аккаунта, аутентификация, оформление и исполнение заказов, поддержка пользователей, обеспечение безопасности и стабильности сервиса.";

export const REGISTRATION_PERSONAL_DATA_CONSENT_OPERATOR = `Оператор: ${LEGAL_OPERATOR_PLACEHOLDER}.`;

export const REGISTRATION_PERSONAL_DATA_CONSENT_WITHDRAWAL =
  "Согласие действует до его отзыва. Отозвать согласие можно, обратившись на support@izibuy.ru с email аккаунта. Подробности — в Политике конфиденциальности.";
