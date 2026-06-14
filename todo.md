# Web (client/) — backlog

> Мобильное приложение (iOS + Android): **`docs/mobile-development.md`**

**Порядок работ:** Сейчас → Перед prod → Идеи. Блок «Когда вырастем» — справочник, не ежедневный чеклист.

---

## Сейчас (1–2 дня)

- [x] **Mobile MVP** — фазы 0–4, smoke web, privacy, store-assets (`docs/mobile-development.md`)
- [x] **Интро-ролик** — `client/public/intro/intro.mp4`, poster, splash + admin (`/app-intro-admin`)
- [x] **Юр. оператор** — `legal/operator.config.json` → `npm run sync:legal`
- [x] **Git** — `7a946d1` mobile + client legal/intro/store

---

## Перед prod (когда есть VPS + домен)

Главный блокер для реальных пользователей. Док: **`docs/deploy/DEPLOY.md`**, **`server/docs/production-checklist.md`**.

- [ ] **Первый деплой**
  - [ ] VPS + nginx (вариант A: один домен, SPA + API proxy)
  - [ ] `NODE_ENV=production`, `JWT_SECRET` ≥32 символов, `FRONTEND_URL=https://домен`
  - [ ] Mongo **replica set** (Atlas M0+) — транзакции заказов/баллов
  - [ ] `cd server && npm run migrate:apply`
  - [ ] `UPLOAD_STORAGE=s3`, `PUBLIC_UPLOAD_BASE_URL` = CDN (`docs/deploy/PROD-S3-CDN.md`)
  - [ ] `npm run preflight:prod` / `validate:prod` на сервере
  - [ ] systemd / pm2 для API, бэкапы Mongo

- [ ] **Email на prod**
  - [ ] Transactional-провайдер (Unisender / SendPulse / SES / Resend) или Yandex **временно** на первую неделю
  - [ ] `noreply@твой-домен.ru` — не личный `@yandex.ru` (долгосрочно)
  - [ ] DNS: SPF + DKIM + DMARC
  - [ ] `npm run test:smtp -- ...` после деплоя
  - [ ] Мониторинг bounce / spam у провайдера

- [ ] **Интро-ролик на сайте** (как у DrinkIt) — до публичного анонса — ✅ код + `intro.mp4`; заменить ролик в `client/public/intro/` при необходимости

---

## Идеи (после деплоя / по приоритету бизнеса)

- [ ] Запрашивать код с почты при «Войти в аккаунт» (отдельно от verify при регистрации)

---

## Когда вырастем (справочник — не трогать без метрик)

> Доки: `server/docs/HORIZONTAL-SCALING.md`, `RATE-LIMIT-AUDIT.md`, `MONGO-INDEXES-AUDIT.md`

**Сигналы «пора»** (7 дней p95): CPU VPS >60%, `GET /product` p95 >800 ms, `POST /order` p95 >1.5 s, Mongo primary CPU >50%, регулярные 502/504. Инструменты: `/health`, Sentry, Atlas, `npm run explain:queries`.

### Лестница (снизу вверх)

1. **Один VPS** — индексы, S3/CDN, transactional email, nginx кэш assets, `client_max_body_size` под видео 25 МБ
2. **Mongo** — tier / Auto Scale, `explain:queries`, Atlas Search
3. **Код в hot path** — email async (BullMQ), cron leader, Redis rate limit при 2+ API
4. **2+ инстанс API** — только после S3 + `REDIS_URL` + `CRON_LEADER` / `worker.js`
5. **Read replica** — `GET /product`; заказы только primary
6. **BullMQ worker** — email, cron, denorm, уведомления

### Узкие места в коде (v2)

| Место | Файл | v2 |
|-------|------|-----|
| Email при register | `registerUserController.js` | BullMQ `sendEmailVerification` |
| SMTP | `emailVerification.js` | retry в очереди |
| Cron × N | `server/index.js` | `CRON_LEADER` или `worker.js` |
| Rate limit | `rateLimitMW.js` | `REDIS_URL` (H-1 ✅ в коде) |
| Каталог | `getProducts.js` | read replica, кэш |

### Чеклист перед вторым инстансом API

- [ ] `UPLOAD_STORAGE=s3`
- [ ] `REDIS_URL` → `/health` показывает `rateLimitStore: redis`
- [ ] Cron только на leader
- [ ] Load test k6: 50 catalog + 10 checkout

### Roadmap H-*

- [x] H-1 Redis rate limit store
- [ ] H-2 `CRON_LEADER` / `worker.js`
- [ ] H-3 `MONGO_URI_READ` для каталога
- [ ] H-4 BullMQ: email + cron из request path
- [x] H-5 денорм `soldQuantity`
- [x] H-6 promotions cron вынесен из hot path

### Целевая схема (100k+ база)

```
CDN/nginx (SPA) → API × N
                    ↓
                Redis (rate limit + queue)
                    ↓
            Worker × 1 (cron + BullMQ)
                    ↓
       Mongo primary (+ read replica)
       S3/CDN + transactional email
```

**Не делать рано:** k8s, шард Mongo, микросервисы, 2 API без Redis.
