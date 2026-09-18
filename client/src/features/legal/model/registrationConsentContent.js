import { LEGAL_CONTACT_EMAIL } from "../../../pages/legal/model/legalSharedConstants.js";

export const LEGAL_OPERATOR_PLACEHOLDER =
  "Гужаев Рамзан Ризванович, 201400232973, Чеченская Республика, город Грозный";

export const REGISTRATION_PERSONAL_DATA_CONSENT_SUMMARY =
  "Даю согласие оператору на обработку данных, которые я указываю при регистрации и использовании сервиса: адрес электронной почты или номер телефона, имя пользователя, пароль (в хранилище — в виде хэша), технические данные сессии, необходимые для входа и безопасности аккаунта, а также источник перехода на сайт (метки рекламной ссылки и адрес сайта-источника).";

export const REGISTRATION_PERSONAL_DATA_CONSENT_PURPOSES =
  "Цели обработки: создание и ведение аккаунта, аутентификация, оформление и исполнение заказов, поддержка пользователей, обеспечение безопасности и стабильности сервиса, статистика использования сервиса и оценка эффективности рекламы.";

export const REGISTRATION_PERSONAL_DATA_CONSENT_OPERATOR = `Оператор: ${LEGAL_OPERATOR_PLACEHOLDER}.`;

export const REGISTRATION_PERSONAL_DATA_CONSENT_WITHDRAWAL = `Согласие действует до его отзыва. Отозвать согласие можно, обратившись на ${LEGAL_CONTACT_EMAIL} с email аккаунта. Подробности — в Политике конфиденциальности.`;
