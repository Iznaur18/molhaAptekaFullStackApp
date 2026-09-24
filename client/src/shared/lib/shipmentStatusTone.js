/**
 * Цвет статуса доставки для любой службы (ЛОБО, СДЭК, Яндекс, Экспресс):
 * у каждой свои коды, а покупателю и продавцу важно одно — всё хорошо,
 * что-то пошло не так, ждёт действия или просто в пути.
 *
 * @typedef {"success" | "danger" | "warning" | "info" | "neutral"} ShipmentStatusTone
 */

const SUCCESS_RE =
  /deliver(ed|y_finish)|delivered_finish|postomat_received|^done$|complete/i;
const DANGER_RE = /cancel|fail|not_delivered|invalid|error|return|lost/i;
const NEUTRAL_RE = /^(created|accepted|new|draft|merged)$/i;

/**
 * @param {string | null | undefined} statusCode код статуса от службы
 * @param {{ cancelled?: boolean; notStarted?: boolean }} [flags]
 *   cancelled — отмена известна не из кода (например, накладная отозвана);
 *   notStarted — служба ещё не вызвана, ждём действия продавца.
 * @returns {ShipmentStatusTone}
 */
export function resolveShipmentStatusTone(
  statusCode,
  { cancelled = false, notStarted = false } = {},
) {
  if (cancelled) return "danger";
  if (notStarted) return "warning";
  const code = String(statusCode ?? "").trim();
  if (!code) return "neutral";
  if (DANGER_RE.test(code)) return "danger";
  if (SUCCESS_RE.test(code)) return "success";
  if (NEUTRAL_RE.test(code)) return "neutral";
  return "info";
}
