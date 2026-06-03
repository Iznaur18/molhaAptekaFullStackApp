# Сессия и JWT

## Flow

1. `POST /auth/login` или `POST /auth/register` → JSON `{ success, data: user }`, два httpOnly cookie:
   - `access_token` (1 ч)
   - `refresh_token` (30 д)
2. Клиент: `axios` с `withCredentials: true` — cookie отправляется автоматически.
3. `GET /auth/me` — читает access JWT из cookie (`checkAuthMW`).
4. При **401** клиент один раз вызывает `POST /auth/refresh` и повторяет запрос.
5. `POST /auth/logout` — очищает оба cookie.

## Cookie

| Cookie | TTL | typ в JWT |
|--------|-----|-----------|
| `access_token` | 1 ч | `access` |
| `refresh_token` | 30 д | `refresh` |

Общие параметры: httpOnly, path `/`, Secure в production (или при `COOKIE_CROSS_SITE=true`).

| SameSite | Когда |
|----------|-------|
| `lax` | dev, same-origin proxy |
| `none` | `COOKIE_CROSS_SITE=true` |

## Dev

- `FRONTEND_URL=http://127.0.0.1:5173` в `server/.env`
- Vite proxy `/auth` → `127.0.0.1:4444`
- Legacy `localStorage.rassro_auth_token` удаляется при загрузке `apiClient.js`

## Insomnia / API tools

Fallback: `Authorization: Bearer <access_token>`.

## Production

- `NODE_ENV=production` + `FRONTEND_URL` обязателен
- HTTPS → `Secure` cookie активен

## Legacy токены

Access JWT без поля `typ` принимается `checkAuthMW` (обратная совместимость до истечения старых 30d cookie).
