# Аудит rate limit: auth / upload / order

Дата: 2026-06. Реализация: `express-rate-limit` v7, `server/middlewares/rateLimitMW.js`, глобально `createApp.js` → `generalRateLimiter`. `trust proxy: 1` для корректного IP за nginx.

## Сводка

| Зона | Статус до аудита | После аудита |
|------|------------------|--------------|
| **Auth** login/register | ✅ `authRateLimiter` (IP, 55/15m, skip success) | без изменений |
| **Auth** refresh | ✅ `refreshAuthRateLimiter` (IP, 120/15m) | без изменений |
| **Auth** resend email | ✅ per `userId` | без изменений |
| **Auth** logout / verify-email | ⚠️ только `generalRateLimiter` | задокументировано (низкий приоритет) |
| **Upload** image/video | ⚠️ IP до `checkAuthMW`, комментарии ≠ `max` | ✅ per `userId`, auth перед лимитом |
| **Order** POST create | ❌ нет dedicated | ✅ `orderCreateRateLimiter` per `userId` |
| **Order** PATCH items | ❌ нет dedicated | ✅ `orderItemActionRateLimiter` per `userId` |
| **Order** GET / admin | ⚠️ только general | ок для чтения; спам — general 10k/15m |

## Auth (`/auth`)

| Метод | Путь | Лимитер | Ключ | Лимит |
|-------|------|---------|------|-------|
| POST | `/register` | `authRateLimiter` | IP (default) | 55 / 15 мин, успех не считается |
| POST | `/login` | `authRateLimiter` | IP | то же |
| POST | `/refresh` | `refreshAuthRateLimiter` | IP | 120 / 15 мин |
| POST | `/resend-verification` | `emailVerificationResendRateLimiter` | `userId` | см. `emailVerificationConstants` |
| POST | `/logout` | — | — | только general |
| GET | `/verify-email` | — | — | токен в query; brute — низкая вероятность при длинном токене |
| GET/PATCH | `/me`, … | — | — | JWT + general |

**Риски (приняты v1):** logout/verify без отдельного лимита; брут пароля ограничен IP (NAT — общий счётчик офиса). **v2:** лимит по `email` из body на login/register, Redis store за несколькими инстансами.

## Upload (`/upload`)

| Метод | Путь | Лимитер | Ключ | Лимит |
|-------|------|---------|------|-------|
| POST | `/` (image) | `uploadRateLimiter` | `userId` (после auth) | 110 / час |
| POST | `/video` | `uploadRateLimiter` | `userId` | 110 / час |

**Было:** `uploadRateLimiter` → `checkAuthMW` → ключ только IP.  
**Стало:** `checkAuthMW` → `uploadRateLimiter` → multer.

nginx: `client_max_body_size 6m`, отдельного `limit_req` нет — только Express.

## Order (`/order`)

| Метод | Путь | Лимитер | Ключ | Лимит |
|-------|------|---------|------|-------|
| POST | `/` | `orderCreateRateLimiter` | `userId` | 30 / час (`ORDER_CREATE_RATE_LIMIT_PER_HOUR`) |
| PATCH | `/:orderId/items/:itemIndex/*` | `orderItemActionRateLimiter` | `userId` | 120 / 15 мин |
| PATCH | `/:orderId/status` | — | admin + general | staff |
| GET | `/*` | — | — | general |

Бизнес-логика `makeOrderController`: транзакция, сток, email verified — **не** заменяет rate limit.

## Глобальный слой

```text
requestId → json → cors → helmet → generalRateLimiter (10_000 / 15 min / IP) → routers
```

Специализированные лимитеры **дополнительно** считают свои окна (двойной учёт на одном запросе — ожидаемо).

## Инфра

| Слой | Rate limit |
|------|------------|
| Express | ✅ см. выше |
| nginx (`docs/deploy/nginx-izibuy.conf.example`) | ❌ нет `limit_req_zone` |
| Mongo / app-level throttle на заказы | ❌ |

**Prod:** при `REDIS_URL` — общий store `rate-limit-redis` (`server/utils/rateLimitRedisStore.js`); без Redis — in-memory (один процесс). `/health` → `rateLimitStore: redis|memory`.

## Расхождения в коде (исправлено)

- Комментарии «10 загрузок / 10 голосов» при `max: 110` в `rateLimitMW.js` — комментарии приведены к факту или к константам.

## Чеклист prod

- [ ] `trust proxy` + nginx передаёт `X-Forwarded-For`
- [ ] При 429 клиент показывает `message` из JSON
- [ ] Мониторинг доли 429 на `/auth/login`, `/upload`, `POST /order`
- [ ] v2: Redis store, nginx `limit_req` на `/auth/` и `/upload`

## Связанные файлы

- `server/middlewares/rateLimitMW.js`
- `server/routes/authRouter.js`, `uploadRouter.js`, `orderRouter.js`
- `server/constants/orderRateLimitConstants.js`
- `server/docs/production-checklist.md`
