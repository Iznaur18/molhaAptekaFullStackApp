/** httpOnly cookie с access JWT (сам JWT живёт 1 час — `expiresIn` в signAccessToken). */
export const AUTH_COOKIE_NAME = "access_token";

/** httpOnly cookie с refresh JWT (длинный TTL). */
export const REFRESH_COOKIE_NAME = "refresh_token";

/**
 * Refresh JWT + cookie: ~1 год (пока пользователь сам не нажмёт «Выйти»).
 * Должен совпадать с `expiresIn` в `signRefreshToken`.
 */
export const REFRESH_TOKEN_TTL_DAYS = 365;

/** Cookie maxAge для refresh — синхрон с JWT TTL. */
export const REFRESH_COOKIE_MAX_AGE_MS =
  REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;

/**
 * Cookie maxAge для access-токена — это время жизни КУКИ-транспорта, а НЕ самого
 * JWT (тот протухает через 1 час, см. `signAccessToken`). Держим равным
 * refresh-куке.
 *
 * Почему НЕ 1 час (был баг «выкидывает после ~часа отсутствия»): если
 * access-cookie удаляется браузером раньше refresh-куки, то после >1ч простоя
 * `GET /auth/me` приходит вообще без access-токена → `checkAuthMeMW` пропускает
 * как гостя и сервер отвечает `200 {user:null}`. Клиентский интерсептор
 * (`packages/shared-api`) делает refresh ТОЛЬКО на 401 — на 200 он молчит,
 * поэтому валидный годовой refresh-токен НЕ используется и пользователя
 * «выкидывает». С access-cookie длиной в refresh протухший-но-присутствующий
 * токен даёт 401 (ветка TokenExpiredError в `checkAuthMeMW`) → интерсептор
 * прозрачно поднимает сессию через `/auth/refresh`.
 */
export const ACCESS_TOKEN_MAX_AGE_MS = REFRESH_COOKIE_MAX_AGE_MS;
