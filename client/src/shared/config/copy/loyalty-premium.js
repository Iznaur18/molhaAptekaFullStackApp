// Автосгенерировано из appUiCopy.js: домен «loyalty-premium».
// Реэкспортируется через ../appUiCopy.js — импортируй оттуда, как раньше.

import {
  SELLER_PRODUCTS_LIMIT_PREMIUM,
  SELLER_PRODUCTS_LIMIT_REGULAR,
} from "@molha/api-contract";
import { pluralizeRuBall } from "../../lib/pluralizeRuBall.js";

export const SUBSCRIPTIONS_PAGE_UI = {
  LOADING: "Загрузка подписок…",
  EMPTY: "Вы ни на кого не подписаны. Найдите продавцов в разделе «Пользователи».",
  FETCH_FALLBACK: "Не удалось загрузить подписки",
  LOGIN_HINT: "Войдите, чтобы видеть список подписок.",
  LOGIN_BUTTON: "Войти",
  HERO_CAPTION: "Подписки",
  /** @type {readonly [string, string, string]} */
  HERO_UNIT_FORMS: ["продавец", "продавца", "продавцов"],
  HERO_INFO: "Продавцы, за которыми вы следите. Их товары — в фильтре «Подписки» на главной.",
};

/** Раздел «Баллы» в профиле */
export const LOYALTY_POINTS_PAGE_UI = {
  PAGE_ARIA: "Баллы",
  LOGIN_HINT: "Войдите, чтобы посмотреть баллы.",
  LOGIN_BUTTON: "Войти",
  LOADING: "Загрузка…",
  FETCH_FALLBACK: "Не удалось загрузить баллы",
  /** @param {number} balance */
  BALANCE_POINTS: (balance) => `Ваш баланс: ${balance} ${pluralizeRuBall(balance)}`,
  BALANCE_CAPTION: "Ваш баланс",
  INFO: "1 балл = 1 ₽. Продавец задаёт бонус за покупку; подтверждённый покупатель получает баллы после подтверждения получения.",
  USES_TITLE: "На что тратить баллы",
  PURCHASE_SECTION: "Пополнение",
  PURCHASE_AMOUNT_LABEL: "Сумма, ₽",
  PURCHASE_AMOUNT_HINT: "1 ₽ = 1 балл. Укажите, сколько хотите купить.",
  /** @param {number} points */
  PURCHASE_POINTS_PREVIEW: (points) => `Получите ${points} баллов`,
  PURCHASE_AMOUNT_MIN: (min) => `Минимум ${min} ₽`,
  PURCHASE_AMOUNT_MAX: (max) => `Не больше ${max} ₽`,
  BUY: "Купить",
  COMING_SOON: "Пополнение по СБП — скоро.",
  PAY_REDIRECT: "Открываем страницу оплаты…",
  PAY_ERROR: "Не удалось начать оплату",
  PAY_PENDING: "Ждём подтверждения оплаты от банка…",
  /** @param {number} points */
  PAY_SUCCESS: (points) => `Оплата прошла — начислено ${points} баллов.`,
  PAY_CANCELED: "Оплата не прошла. Деньги не списаны, можно попробовать снова.",
  /** @param {number} rub @param {number} points */
  COMING_SOON_AMOUNT: (rub, points) =>
    `Пополнение на ${rub} ₽ (${points} баллов) по СБП — скоро.`,
  ADMIN_FREE_SECTION: "Бесплатное пополнение (admin)",
  ADMIN_FREE_AMOUNT_LABEL: "Сумма, баллы",
  ADMIN_FREE_AMOUNT_HINT: "Начислить на свой баланс без оплаты.",
  /** @param {number} min */
  ADMIN_FREE_AMOUNT_MIN: (min) => `Минимум ${min}`,
  /** @param {number} max */
  ADMIN_FREE_AMOUNT_MAX: (max) => `Не больше ${max}`,
  ADMIN_FREE_SUBMIT: "Начислить бесплатно",
  ADMIN_FREE_SUBMITTING: "Начисление…",
  /** @param {number} credited @param {number} balance */
  ADMIN_FREE_SUCCESS: (credited, balance) =>
    `Начислено ${credited}. Баланс: ${balance}`,
  USES: [
    "Оплата премиум-подписки",
    "Продвижение товаров в каталоге",
    "Реклама в intro",
    "Бонус за покупку у продавца (поле на товаре)",
  ],
};

/** Раздел «Партнёрская программа» в профиле */
export const PARTNER_PROGRAM_PAGE_UI = {
  ARIA: "Партнёрская программа",
  LOGIN_HINT: "Войдите, чтобы открыть партнёрскую программу.",
  LOGIN_BUTTON: "Войти",
  LOADING: "Загрузка…",
  LOAD_ERROR: "Не удалось загрузить партнёрскую программу",
  /** @param {number} percent */
  INFO: (percent) =>
    `${percent}% от трат приглашённых на услуги платформы. Кэшбэк сразу начисляется баллами лояльности.`,
  STATS_TITLE: "Сводка",
  STAT_REFERRALS: "Рефералы",
  STAT_SPEND: "Их траты",
  STAT_EARNED: "Ваш кэшбэк",
  INVITE_TITLE: "Ваша ссылка",
  INVITE_HINT:
    "Отправьте друзьям — кэшбэк с их трат на услуги платформы сразу падает на ваши баллы.",
  COPY_BUTTON: "Копировать",
  SHARE_BUTTON: "Поделиться",
  COPIED: "Ссылка скопирована",
  SHARED: "Готово",
  SHARE_COPIED: "Ссылка скопирована — вставьте в мессенджер",
  COPY_FAILED: "Не удалось скопировать",
  SHARE_FAILED: "Не удалось поделиться",
  LIST_TITLE: "Ваши рефералы",
  LIST_EMPTY: "Пока никого нет — поделитесь ссылкой",
  COL_NAME: "Ник",
  COL_DATE: "Регистрация",
  COL_SPEND: "Траты",
  COL_CASHBACK: "Кэшбэк",
};

/** Раздел «Заработок с объявлений» (product affiliate) */
export const AFFILIATE_LISTINGS_PAGE_UI = {
  ARIA: "Заработок с объявлений",
  NAV_LABEL: "Заработок с объявлений",
  LOGIN_HINT: "Войдите, чтобы открыть заработок с объявлений.",
  LOGIN_BUTTON: "Войти",
  LOADING: "Загрузка…",
  LOAD_ERROR: "Не удалось загрузить данные",
  EARNINGS_TITLE: "Начисления за приведённых",
  EARNINGS_EMPTY: "Пока нет выплат — делитесь ссылками с бейджем «Партнёрам %»",
  EARNINGS_AMOUNT: "Сумма",
  EARNINGS_PERCENT: "Процент",
  EARNINGS_DATE: "Дата",
  EARNINGS_PRODUCT: "Товар",
  SELLER_PAYOUT_HINT:
    "Если вы продавец с партнёркой на объявлении: при подтверждении заказа % списывается со свободных баллов лояльности.",
  LOYALTY_BALANCE: "Ваши баллы",
};

/** Раздел «Премиум» в профиле */
export const PREMIUM_PAGE_UI = {
  PAGE_ARIA: "Премиум",
  LOGIN_HINT: "Войдите, чтобы оформить премиум.",
  LOGIN_BUTTON: "Войти",
  LOADING: "Загрузка…",
  FETCH_FALLBACK: "Не удалось загрузить премиум",
  PURCHASE_FALLBACK: "Не удалось оформить премиум",
  PLAN_TITLE: "Премиум",
  /** @param {number} price */
  PLAN_PRICE: (price) => `${price} баллов`,
  PLAN_PERIOD: "Срок: 1 календарный месяц",
  BENEFITS_TITLE: "Что входит",
  PLAN_BENEFITS: [
    `До ${SELLER_PRODUCTS_LIMIT_PREMIUM} товаров в каталоге (вместо ${SELLER_PRODUCTS_LIMIT_REGULAR})`,
    "Золотая обводка и галочка у имени",
    "Сторис и фон профиля по ссылке",
    "Товары в фильтре «Только премиум»",
    "Просмотр покупок других пользователей",
  ],
  /** @param {number} balance */
  BALANCE: (balance) => `Ваш баланс: ${balance} баллов`,
  ACTIVE: "Премиум уже активен. Продление будет доступно после окончания срока.",
  /** @param {number} required @param {number} balance */
  INSUFFICIENT_POINTS: (required, balance) =>
    `Недостаточно баллов: нужно ${required}, у вас ${balance}.`,
  SUBMIT: "Оформить премиум",
  SUBMIT_PENDING: "Оформляем…",
};
