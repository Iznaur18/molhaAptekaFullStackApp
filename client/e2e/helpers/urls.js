/**
 * Адреса API и клиента для E2E.
 *
 * По умолчанию — те же 127.0.0.1:4444 и :5173, что и в dev. Переопределяются
 * через E2E_API_PORT / E2E_CLIENT_PORT: так E2E можно гонять локально, не
 * останавливая уже запущенные dev-серверы на стандартных портах.
 */
export const E2E_API_PORT = Number(process.env.E2E_API_PORT ?? 4444);
export const E2E_CLIENT_PORT = Number(process.env.E2E_CLIENT_PORT ?? 5173);

export const E2E_API_ORIGIN = `http://127.0.0.1:${E2E_API_PORT}`;
export const E2E_CLIENT_ORIGIN = `http://127.0.0.1:${E2E_CLIENT_PORT}`;
