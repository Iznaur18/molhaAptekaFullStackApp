# Сессия и JWT

## Flow (web)

1. `POST /auth/login` или `POST /auth/register` → JSON `{ success, data }`, два httpOnly cookie:
   - `access_token` (1 ч)
   - `refresh_token` (30 д)
2. Клиент: `axios` с `withCredentials: true` — cookie отправляется автоматически.
3. `GET /auth/me` — без cookie **200** и `user: null`; с валидным access JWT — профиль. Просроченный access — **401**, клиент делает refresh.
4. При **401** на `/auth/me` клиент один раз вызывает `POST /auth/refresh` и повторяет запрос.
5. `POST /auth/logout` — очищает оба cookie; инкрементирует `authTokenVersion` (все refresh недействительны).
6. `POST /auth/refresh` — **rotation**: проверка `tv` в JWT ↔ `user.authTokenVersion`, затем bump и новая пара токенов; старый refresh → 401.

## Flow (mobile / native)

Mobile **не использует cookies**. Те же эндпоинты, но токены в JSON:

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "email": "...",
    "accessToken": "<jwt>",
    "refreshToken": "<jwt>"
  }
}
```

1. Login/register → сохранить `accessToken` + `refreshToken` в `expo-secure-store`.
2. Запросы: `Authorization: Bearer <accessToken>`.
3. `POST /auth/refresh` с body `{ "refreshToken": "..." }` (cookie — fallback для web). Rotation: старый refresh после успешного refresh → 401.
4. `POST /auth/logout` — очистка cookie; body `{ refreshToken }` опционально; bump `authTokenVersion`.

## Cookie

| Cookie          | TTL  | typ в JWT |
| --------------- | ---- | --------- |
| `access_token`  | 1 ч  | `access`  |
| `refresh_token` | 30 д | `refresh` |

Общие параметры: httpOnly, path `/`, Secure в production (или при `COOKIE_CROSS_SITE=true`).

| SameSite | Когда                    |
| -------- | ------------------------ |
| `lax`    | dev, same-origin proxy   |
| `none`   | `COOKIE_CROSS_SITE=true` |

## Dev

- `FRONTEND_URL=http://127.0.0.1:5173` в `server/.env`
- Vite proxy `/auth` → `127.0.0.1:4444`
- Legacy `localStorage.rassro_auth_token` удаляется при загрузке `apiClient.js`
- Mobile: `EXPO_PUBLIC_API_URL=http://192.168.x.x:4444` (LAN IP, не `127.0.0.1`)

## Insomnia / API tools / mobile

`Authorization: Bearer <access_token>` — приоритет после cookie для access.

Refresh token: cookie `refresh_token` **или** body `refreshToken` (приоритет у cookie).

## Production

- `NODE_ENV=production` + `FRONTEND_URL` обязателен
- HTTPS → `Secure` cookie активен

## CORS

Native HTTP-клиенты (React Native) **не отправляют browser CORS preflight** — отдельный mobile origin не нужен.

## Contract

- `@molha/api-contract`: `authSessionDataSchema`, `refreshAuthBodySchema`, `logoutAuthBodySchema`

## Legacy токены

Access JWT без поля `typ` принимается `checkAuthMW` (обратная совместимость до истечения старых 30d cookie).
