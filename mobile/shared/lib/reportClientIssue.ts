const reportedScopes = new Set<string>();

/**
 * Ошибка, из-за которой не стоит мешать пользователю, но и терять её нельзя:
 * недоступное хранилище, сбой аналитики, отказ системного API.
 *
 * Пишем в консоль один раз на сочетание «место + тип ошибки»: такие сбои
 * обычно повторяются на каждом действии. Повторяет `client/src/shared/lib/
 * reportClientIssue.js` — JSX/платформенный код не шарим, а функция крошечная.
 */
export function reportClientIssue(scope: string, error: unknown): void {
  const errorName = error instanceof Error ? error.name : typeof error;
  const key = `${scope}:${errorName}`;
  if (reportedScopes.has(key)) {
    return;
  }
  reportedScopes.add(key);
  console.warn(`[${scope}]`, error);
}
