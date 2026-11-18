/**
 * CSP живёт в `@izibuy/shared-lib` — один источник для vite и nginx/preflight.
 * Этот файл — тонкий re-export для server-скриптов и тестов.
 */
export { buildSpaContentSecurityPolicy } from "@izibuy/shared-lib";
