# Production checklist

Пошаговый чеклист перед выкладкой Izibuy в production.

| Гайд | Назначение |
| ---- | ---------- |
| [`../../docs/deploy/DEPLOY.md`](../../docs/deploy/DEPLOY.md) | **первый деплой** по шагам |
| [`PRODUCTION-AND-ARCHITECTURE.md`](PRODUCTION-AND-ARCHITECTURE.md) | архитектура, варианты A/B |
| [`../../docs/deploy/PROD-S3-CDN.md`](../../docs/deploy/PROD-S3-CDN.md) | медиа на R2 |

---

## 0. Быстрая проверка env (локально на сервере)

```bash
cd server
cp .env.production.example .env   # или copy на Windows
npm run preflight:prod
```

`preflight:prod` = `validate:prod` + ping Mongo + replica set warning + режим upload.

---

## 1. Обязательные переменные (`server/.env`)

| Переменная               | Production                                 | Зачем                                        |
| ------------------------ | ------------------------------------------ | -------------------------------------------- |
| `NODE_ENV`               | `production`                               | Secure cookie, скрытие деталей 5xx           |
| `JWT_SECRET`             | ≥32 символов, `crypto.randomBytes(32).hex` | подпись access/refresh JWT                   |
| `MONGO_URI`              | **Atlas или replica set**                  | без RS транзакции баллов/заказов не работают |
| `FRONTEND_URL`           | `https://ваш-домен.ru`                     | CORS + ссылки verify email                   |
| `PUBLIC_UPLOAD_BASE_URL` | `https://ваш-домен.ru`                     | полные URL фото/видео в БД (вариант A)       |
| `PORT`                   | `4444` (за nginx)                          | порт Express                                 |

**Вариант B** (фронт и API на разных доменах):

| Переменная               | Значение                                    |
| ------------------------ | ------------------------------------------- |
| `FRONTEND_URL`           | origin SPA, напр. `https://app.example.com` |
| `PUBLIC_UPLOAD_BASE_URL` | origin API, напр. `https://api.example.com` |
| `COOKIE_CROSS_SITE`      | `true`                                      |
| Client build             | `VITE_API_URL=https://api.example.com`      |

Генерация секрета:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 2. MongoDB

- [ ] **Replica set** — Atlas M0+ или `mongod --replSet rs0` на VPS
- [ ] После первого деплоя: `cd server && npm run migrate:apply`
- [ ] Бэкапы: Atlas Continuous Backup или cron `mongodump`
- [ ] IP whitelist (Atlas) или firewall (VPS)

Проверка транзакций: integration-тесты в CI (`npm test`) используют memory-server с RS.

---

## 3. Сборка и деплой (вариант A — один домен)

```bash
# на сервере
git pull
cd server && npm ci && npm run validate:prod && npm run migrate:apply
cd ../client && npm ci && npm run build
# dist → /var/www/izibuy/client/dist
# server → /var/www/izibuy/server (uploads/ — persistent volume!)
```

**Процесс API:**

- systemd: [`docs/deploy/systemd-izibuy.service.example`](../../docs/deploy/systemd-izibuy.service.example)
- или pm2: `NODE_ENV=production pm2 start index.js --name izibuy-api`

**Nginx:**

- [`docs/deploy/nginx-izibuy.conf.example`](../../docs/deploy/nginx-izibuy.conf.example)
- SSL: `certbot --nginx -d ваш-домен.ru`
- `client_max_body_size 6m` — upload до 5 МБ

**Клиент (вариант A):** собирать **без** `VITE_API_URL`.

---

## 4. Проверки после деплоя

### API

| #   | Проверка                                 | Ожидание                                                  |
| --- | ---------------------------------------- | --------------------------------------------------------- |
| 1   | `GET https://домен/health`               | `status`, `mongo`, `uptimeSec`, `uploadStorage` (`disk`/`s3`), `catalogSearch` (`atlas`/`regex`), `gitCommit` (или `null`) |
| 2   | Register / Login                         | cookie `access_token` + `refresh_token`, httpOnly, Secure |
| 3   | `GET /auth/me` с cookie                  | 200 + user                                                |
| 4   | `POST /auth/logout` → `GET /auth/me`     | 401                                                       |
| 5   | Register                                 | ссылка verify в SMTP или логах `[email-verify]`           |
| 6   | Заказ без verify email                   | 403                                                       |
| 7   | Upload фото товара → URL в новой вкладке | 200; при S3 — host = CDN (`PUBLIC_UPLOAD_BASE_URL`)       |
| 8   | Staff: модерация товара                  | очередь открывается                                       |

### Auth v2 (refresh)

| #   | Проверка                                                           | Ожидание                                  |
| --- | ------------------------------------------------------------------ | ----------------------------------------- |
| 9   | Подождать истечение access (1 ч) или удалить только `access_token` | следующий API-запрос → auto refresh → 200 |
| 10  | `POST /auth/refresh` без cookie                                    | 401                                       |

---

## 5. Безопасность

- [ ] `JWT_SECRET` не из `.env.example`
- [ ] `FRONTEND_URL` — один origin, CORS без `*`
- [ ] Не логировать passport, password, JWT (см. `pii-passport-handling.md`)
- [x] Rate limits: `rateLimitMW.js` + аудит `server/docs/RATE-LIMIT-AUDIT.md` (auth, upload, order)
- [x] CSP / Helmet: `server/docs/CSP-HELMET.md`, `buildSpaContentSecurityPolicy`, nginx example, API без CSP
- [x] Mongo indexes: `server/docs/MONGO-INDEXES-AUDIT.md`, миграция `20260611`, `npm run explain:queries`
- [x] План горизонтали: `server/docs/HORIZONTAL-SCALING.md` (лестница VPS → Redis → replica → queue)
- [ ] Helmet включён (`createApp.js`)
- [ ] Uploads: лимит 5 МБ, MIME jpeg/png/webp/mp4/webm
- [ ] `server/uploads/` на persistent disk (не терять при redeploy)

---

## 6. SMTP (email verify)

Nodemailer включён: при заданных `SMTP_*` письмо уходит на реальный email.  
Иначе — ссылка в логах `[email-verify]`.

---

## 7. Мониторинг (рекомендация)

- [ ] Uptime ping на `/health` каждые 1–5 мин
- [ ] Алерт при `mongo: disconnected` или status ≠ ok
- [x] Sentry (опционально, `docs/SENTRY.md`) + runbook (`docs/RUNBOOK.md`)
- [x] Request ID + JSON-логи ошибок (`docs/OBSERVABILITY.md`)
- [ ] `journalctl -u izibuy-api -f` или pm2 logs (фильтр по `requestId`)

---

## 8. Первый админ

```bash
cd server
npm run create-admin -- admin@example.com YourPassword123 adminNick
```

---

## 9. Smoke после каждого релиза

```bash
cd server && npm test
cd ../client && npm run build
```

На prod вручную: login → каталог → корзина → заказ → upload → logout.

---

## 10. Частые ошибки

| Симптом                   | Причина                                                      |
| ------------------------- | ------------------------------------------------------------ | ---- |
| CORS error                | неверный `FRONTEND_URL`                                      |
| Cookie не ставится        | нет HTTPS / `COOKIE_CROSS_SITE` / разные домены              |
| 404 на `/uploads/...`     | nginx не проксирует uploads или нет `PUBLIC_UPLOAD_BASE_URL` |
| 413 на upload             | `client_max_body_size` в nginx                               |
| Баллы «зависли»           | Mongo без replica set — транзакции не commit                 |
| Файлы пропали             | redeploy без persistent `uploads/`                           |
| F5 на `/user-list` → JSON | nginx проксирует `/user-list` в API (нужен regex `^/user(/   | $)`) |

---

## Связанные файлы

| Файл                                         | Содержание                    |
| -------------------------------------------- | ----------------------------- |
| `PRODUCTION-AND-ARCHITECTURE.md`             | архитектура, варианты A/B/C   |
| `server/.env.example`                        | шаблон env                    |
| `client/.env.example`                        | `VITE_API_URL` для варианта B |
| `server/docs/auth-session.md`                | JWT refresh flow              |
| `docs/deploy/nginx-izibuy.conf.example`      | nginx                         |
| `docs/deploy/systemd-izibuy.service.example` | systemd unit                  |
