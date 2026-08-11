# Аудит rate limit

Дата: 2026-08. Реализация: `express-rate-limit` v7, `server/middlewares/rateLimitMW.js`, глобально `createApp.js` → `generalRateLimiter`. `trust proxy: 1` для корректного IP за nginx.

## Сводка

| Зона | Статус |
|------|--------|
| **Auth** login/register/OTP/resend | ✅ dedicated + login key `ip+email` |
| **Upload** | ✅ per `userId`, 110/h |
| **Order** create / item actions | ✅ |
| **Reviews / Q&A / reports / stories / price offers / votes / address / user-search / phone-reveal / data-confirm** | ✅ |
| **Advertising** submit (intro / header / personal category) | ✅ 5/h `userId` |
| **Money** unlock-raffle / premium / promotion request | ✅ 10/h `userId` |
| **Product** create | ✅ 30/h |
| **Installment** create + mutators | ✅ 60/h |
| **Catalog** `GET /product/` | ✅ 300/15m IP |
| **Auth** logout / GET verify-email | ⚠️ только general (низкий приоритет) |
| **nginx** `limit_req` | ❌ нет |

## Auth (`/auth`)

| Метод | Путь | Лимитер | Ключ | Лимит |
|-------|------|---------|------|-------|
| POST | `/register`, `/register/phone`, `/register/confirm` | `registerAuthRateLimiter` | `ip+email` | 20 / 15 мин |
| POST | `/login`, phone login/confirm, bind confirm, password reset confirm, password change | `authRateLimiter` | `ip+email` если email в body, иначе IP | 55 / 15 мин, успех не считается |
| POST | `/refresh` | `refreshAuthRateLimiter` | IP | 120 / 15 мин |
| POST | OTP/resend/reset request | `emailVerificationResendRateLimiter` | `userId\|ip` | 5 / час |
| POST | `/logout` | — | — | только general |
| GET | `/verify-email` | — | — | токен в query |

## Advertising / money / product / installment / catalog

| Метод | Путь | Лимитер | Ключ | Лимит |
|-------|------|---------|------|-------|
| POST | `/intro-ad`, `/site-header-banner-campaign`, `/seller-personal-category` | `advertisingSubmitRateLimiter` | `userId\|ip` | 5 / час (общий bucket) |
| POST | `/product/raffles/unlock-create`, `/user/me/premium/purchase`, `/product/:id/promotions/request` | `moneyMutationRateLimiter` | `userId\|ip` | 10 / час (общий bucket) |
| POST | `/product` | `productCreateRateLimiter` | `userId\|ip` | 30 / час |
| POST/PATCH | installment create + payment/dispute/message | `installmentActionRateLimiter` | `userId\|ip` | 60 / час |
| GET | `/product/` | `catalogListRateLimiter` | IP | 300 / 15 мин |

Константы: `server/constants/securityRateLimitConstants.js`.

## Глобальный слой

```text
requestId → json → cors → helmet → generalRateLimiter (5_000 / 15 min / IP prod) → routers
```

`/health` и `/uploads*` не считаются в general.

## Инфра

| Слой | Rate limit |
|------|------------|
| Express | ✅ |
| nginx | ❌ нет `limit_req_zone` |
| Redis store | ✅ при `REDIS_URL`; иначе in-memory per process |

## Клиент 429

`formatApiErrorMessage` (`packages/shared-lib`) предпочитает `response.data.message`, иначе статусный fallback «Слишком много запросов…».

## Чеклист prod

- [ ] `trust proxy` + nginx передаёт `X-Forwarded-For`
- [ ] `REDIS_URL` на multi-instance
- [ ] Мониторинг 429: `/auth/login`, advertising submit, money mutation, `GET /product/`
- [ ] v2: nginx `limit_req` на `/auth/` и `/upload`

## Связанные файлы

- `server/middlewares/rateLimitMW.js`
- `server/constants/securityRateLimitConstants.js`, `rateLimitConstants.js`, `orderRateLimitConstants.js`
- `server/routes/authRouter.js`, `introAdRouter.js`, `siteHeaderBannerCampaignRouter.js`, `sellerPersonalCategoryRouter.js`, `productRouter.js`, `userRouter.js`, `installmentRouter.js`, `uploadRouter.js`, `orderRouter.js`
