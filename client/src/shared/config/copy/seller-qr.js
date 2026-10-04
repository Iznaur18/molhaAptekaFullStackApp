import { pluralizeRu } from "../../lib/pluralizeRu.js";

/** QR-код витрины продавца: кнопка, окно и карточка для печати. */
export const SELLER_QR_UI = {
  BUTTON_ARIA: "QR-код витрины",
  TITLE: "QR-код витрины",
  CLOSE: "Закрыть",
  HINT: "Покупатель наводит камеру телефона на код и попадает на вашу витрину. Картинку можно распечатать или отправить.",
  CARD_CAPTION: "Наведите камеру — откроется витрина",
  BRAND: "Gitorg",
  QR_ALT: "QR-код со ссылкой на витрину",
  DOWNLOAD: "Скачать картинку",
  DOWNLOAD_PENDING: "Готовим…",
  SHARE: "Поделиться",
  DOWNLOAD_ERROR: "Не удалось собрать картинку. Попробуйте ещё раз.",
  /** @param {string} sellerName */
  FILE_NAME: (sellerName) =>
    `gitorg-qr-${
      String(sellerName)
        .trim()
        .replace(/[^\p{L}\p{N}]+/gu, "-")
        .replace(/^-+|-+$/gu, "") || "vitrina"
    }.png`,
  STATS_TITLE: "Переходы по коду",
  STATS_LOADING: "Считаем переходы…",
  STATS_FALLBACK: "Не удалось загрузить переходы по QR-коду",
  STATS_EMPTY: "По коду пока никто не переходил.",
  /** @param {number} total */
  STATS_TOTAL: (total) =>
    `${total} ${pluralizeRu(total, ["переход", "перехода", "переходов"])} за всё время`,
  /** @param {number} recent @param {number} days */
  STATS_RECENT: (recent, days) => `${recent} за последние ${days} дней`,
  STATS_NOTE: "Один человек считается не чаще раза в день. Ваши заходы не считаются.",
};
