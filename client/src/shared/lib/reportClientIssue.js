const reportedScopes = new Set();

/**
 * Ошибка, из-за которой не стоит мешать пользователю, но и терять её нельзя:
 * недоступное хранилище, сбой аналитики, отказ браузерного API.
 *
 * Пишем в консоль один раз на сочетание «место + тип ошибки»: такие сбои
 * обычно повторяются на каждом действии, и поток одинаковых строк скрыл бы
 * остальное.
 *
 * @param {string} scope — где случилось, например `storage.theme_read`
 * @param {unknown} error
 */
export function reportClientIssue(scope, error) {
  const errorName = error instanceof Error ? error.name : typeof error;
  const key = `${scope}:${errorName}`;
  if (reportedScopes.has(key)) {
    return;
  }
  reportedScopes.add(key);
  console.warn(`[${scope}]`, error);
}

/** Только для тестов: сбросить «уже сообщали». */
export function resetReportedClientIssuesForTests() {
  reportedScopes.clear();
}
