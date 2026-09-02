// Тонкая обёртка над @sentry/react со СТАТИЧЕСКИМИ именованными импортами.
//
// Зачем: раньше код делал `await import("@sentry/react")` — namespace-импорт,
// который бандлер не может тришейкать, поэтому в чанк vendor-sentry попадали
// Session Replay (~73 KB) и Feedback (~23 KB), которыми мы не пользуемся.
// Здесь мы импортируем ровно то, что нужно (init + browserTracing + breadcrumb),
// и Rollup выкидывает остальное.
//
// Модуль грузится ТОЛЬКО динамически (import("./sentryClient.js")), поэтому сам
// @sentry остаётся в ленивом чанке и вне первой загрузки. Добавляешь новый вызов
// Sentry — добавь сюда соответствующий реэкспорт.
export {
  init,
  browserTracingIntegration,
  addBreadcrumb,
  captureException,
} from "@sentry/react";
