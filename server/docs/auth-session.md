# Сессия и JWT

## Flow

1. `POST /auth/login` или `POST /auth/register` → JSON `{ success, data: user }`, JWT в **httpOnly** cookie `access_token`.
2. Клиент: `axios` с `withCredentials: true` — cookie отправляется автоматически, **без** `Authorization` header.
3. `GET /auth/me` — читает JWT из cookie (`checkAuthMW`).
4. `POST /auth/logout` — `clearCookie`, клиент сбрасывает state.

## Cookie

| Параметр | Значение |
|----------|----------|
| Имя | `access_token` |
| httpOnly | да |
| Secure | да в `NODE_ENV=production` |
| SameSite | `lax` |
| maxAge | 30 дней (как JWT `expiresIn`) |
| path | `/` |

## Dev

- `FRONTEND_URL=http://127.0.0.1:5173` в `server/.env`
- Vite proxy `/auth` → `127.0.0.1:4444` (same-site для cookie)
- Legacy `localStorage.rassro_auth_token` удаляется при загрузке `apiClient.js`

## Insomnia / API tools

Поддерживается fallback: `Authorization: Bearer <token>` (cookie не обязателен).

## Production

- `NODE_ENV=production` + `FRONTEND_URL` обязателен
- HTTPS → `Secure` cookie активен

## Отложено (v2)

- Refresh token + короткий TTL access
