/**
 * Временный выключатель входа / регистрации / сброса пароля через почту.
 *
 * Выключить почту:
 * 1. Поставь `EMAIL_AUTH_ENABLED_DEFAULT = false`
 * 2. `npm run build` в `packages/shared-lib`
 *
 * Env `EMAIL_AUTH_ENABLED=true|false` перекрывает константу (тесты, hotfix API).
 * В `NODE_ENV=test` без явного env почта включена, чтобы интеграционные тесты не падали.
 */
export const EMAIL_AUTH_ENABLED_DEFAULT = true;

export const EMAIL_AUTH_DISABLED_MESSAGE =
  "Вход, регистрация и восстановление пароля через почту временно недоступны. Используйте телефон.";

export type AuthContactChannel = "email" | "phone";

function readProcessEnv(): NodeJS.ProcessEnv | undefined {
  if (typeof process === "undefined" || !process.env) {
    return undefined;
  }
  return process.env;
}

export function isEmailAuthEnabled(
  env: NodeJS.ProcessEnv | undefined = readProcessEnv(),
): boolean {
  const raw = env?.EMAIL_AUTH_ENABLED;
  if (raw === "true" || raw === "1") {
    return true;
  }
  if (raw === "false" || raw === "0") {
    return false;
  }
  if (env?.NODE_ENV === "test") {
    return true;
  }
  return EMAIL_AUTH_ENABLED_DEFAULT;
}

export function resolveAuthContactChannel(
  preferred: AuthContactChannel = "email",
  env?: NodeJS.ProcessEnv,
): AuthContactChannel {
  return isEmailAuthEnabled(env) ? preferred : "phone";
}
