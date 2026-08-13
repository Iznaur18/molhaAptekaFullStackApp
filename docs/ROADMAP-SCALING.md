# Roadmap масштабирования Izibuy

Стратегия роста маркетплейса: **масштаб**, **качество**, **безопасность**. Не «сразу k8s», а **лестница** — каждый шаг отдельный релиз с чеклистом.

| Документ | Когда читать |
| -------- | ------------ |
| Этот файл | планирование инфра и процессов |
| [`deploy/DEPLOY.md`](deploy/DEPLOY.md) | первый и каждый prod-деплой |
| [`../server/docs/HORIZONTAL-SCALING.md`](../server/docs/HORIZONTAL-SCALING.md) | метрики «пора», 2+ API, read replica |
| [`../server/docs/production-checklist.md`](../server/docs/production-checklist.md) | smoke перед/после выкладки |
| [`../server/docs/RUNBOOK.md`](../server/docs/RUNBOOK.md) | бэкап, rollback, инциденты |
| [`release-smoke-matrix.md`](release-smoke-matrix.md) | матрица smoke по зонам |
| [`../todo.md`](../todo.md) | **оперативный** чеклист (синхрон с фазой 0) |

---

## 1. Принципы

1. **Сначала измеримость** — без Sentry, `/health` и p95 нельзя понять, что масштабировать.
2. **Managed-сервисы раньше своего DevOps** — Atlas, Redis (Upstash / Yandex MDB), S3/R2.
3. **Монолит Express** — осознанный выбор до десятков тысяч DAU; микросервисы не раньше боли с деплоем.
4. **Contract-first** — API меняется через `contract/` + тесты; client и mobile не расходятся.
5. **Compliance с ростом** — 152-ФЗ, платежи через провайдера, аудит staff-действий.

---

## 2. Что уже есть в кодовой базе

| Область | Статус | Где |
| ------- | ------ | --- |
| API-контракт (Zod) | ✅ | `contract/` |
| Shared client/mobile | ✅ | `packages/shared-lib`, `shared-api` |
| Миграции Mongo (27+) | ✅ | `server/scripts/migrations/` |
| JWT + refresh rotation | ✅ | `server/docs/auth-session.md` |
| Rate limit + Redis store | ✅ код, env опционально | `REDIS_URL`, `rateLimitRedisStore.js` |
| BullMQ + worker | ✅ | `server/worker.js`, `queues/` |
| Read replica hook | ✅ | `MONGO_URI_READ`, `mongoReadConnection.js` |
| S3/R2 медиа | ✅ | `UPLOAD_STORAGE=s3`, `PROD-S3-CDN.md` |
| Отдельный **приватный** бакет для PII | ✅ | `S3_PRIVATE_BUCKET` (обязателен в prod, ≠ `S3_BUCKET`) |
| Graceful shutdown API (drain + close) | ✅ | `index.js` (SIGTERM/SIGINT) |
| Warning, если cron нигде не запущен | ✅ | `index.js` (prod + не BullMQ + не leader) |
| FSD клиент (23 entities) | ✅ | `client/src/entities/` |
| CI: lint, server tests, e2e | ✅ | `.github/workflows/` |
| Горизонтальный план | ✅ | `HORIZONTAL-SCALING.md` |
| Dev Mongo (Docker) | ✅ | `docker-compose.yml`, `npm run mongo:up` |

**Главные gaps:** prod ещё не закрыт чеклистом; client unit tests не в CI; централизованные логи/метрики; staging; SMTP; staff audit log.

---

## 3. Фазы роста

```
Фаза 0 ──► Фаза 1 ──► Фаза 2 ──► Фаза 3
запуск      рост        масштаб     лидерство
~0–5k DAU   ~5k–50k     ~50k+       100k+
```

Ориентир DAU — порядок величины, не жёсткий порог. Действовать по **метрикам** из [`HORIZONTAL-SCALING.md` §1](../server/docs/HORIZONTAL-SCALING.md).

---

## Фаза 0 — «Запуск в бою»

**Цель:** стабильный production, один VPS, предсказуемый деплой.

### Инфраструктура

| Компонент | Настройка |
| --------- | --------- |
| VPS | Ubuntu 22+, nginx + certbot, Node 20 LTS |
| API | systemd `izibuy-api` → `node index.js` |
| SPA | `client/dist` за nginx |
| MongoDB | Atlas M0+ **replica set** (транзакции заказов) |
| Медиа | Вариант A: disk на VPS **или** сразу S3 (см. §4) |
| Docker | Только dev: `npm run mongo:up` |

### Чеклист фазы 0

- [ ] `server/.env` из `.env.production.example`, `chmod 600`
- [ ] `npm run preflight:prod` на сервере с реальным `.env`
- [ ] `npm run migrate:apply`
- [ ] Client build **без** `VITE_API_URL` (вариант A)
- [ ] nginx + SSL ([`CERTBOT-SSL.md`](deploy/CERTBOT-SSL.md))
- [ ] systemd API ([`systemd-izibuy.service.example`](deploy/systemd-izibuy.service.example))
- [ ] `npm run create-admin`
- [ ] Smoke: login → каталог → upload → заказ ([`production-checklist.md` §4](../server/docs/production-checklist.md))
- [ ] SMTP или осознанный verify через логи ([`smtp-setup.md`](../server/docs/smtp-setup.md))
- [ ] Sentry DSN server + client ([`SENTRY.md`](../server/docs/SENTRY.md))
- [ ] Бэкапы Mongo (Atlas Continuous Backup или `mongodump` cron)

### Качество (фаза 0)

- [ ] Каждый релиз: `git pull` → `migrate:apply` → build → restart ([`DEPLOY.md` §8](deploy/DEPLOY.md))
- [ ] PR: CI green (lint, server tests, client build, e2e при затронутых путях)
- [ ] Новые поля БД — только через миграцию ([`migrations.md`](../server/docs/migrations.md))

### Безопасность (фаза 0)

- [ ] `JWT_SECRET` ≥ 32 байт (`crypto.randomBytes(32).hex`)
- [ ] `NODE_ENV=production`, httpOnly cookies
- [ ] Atlas IP whitelist / firewall VPS
- [ ] Политика ПДн, оферта (юридически)
- [ ] Паспортные данные — [`pii-passport-handling.md`](../server/docs/pii-passport-handling.md)

### Docker на фазе 0

**Не нужен** для prod. `docker-compose.yml` — локальная Mongo RS **без auth** для dev/CI.  
Production: Atlas (`mongodb+srv` + credentials); `assertProductionEnv` режет localhost / URI без auth.

**Выход из фазы 0:** prod работает 7+ дней, smoke зелёный, Sentry ловит ошибки, есть план бэкапа.

---

## Фаза 1 — «Рост и доверие»

**Цель:** Redis, worker, S3/CDN, staging, усиление CI и compliance.

### Инфраструктура

```
Пользователи → Cloudflare (опц.) → nginx (SSL)
                    ├─ /           → client/dist (+ CDN кэш assets)
                    ├─ /auth/...   → API :4444
                    └─ /uploads/   → S3/CDN (не disk на VPS)

API (systemd) ──► Mongo primary (Atlas)
       │
       └── REDIS_URL ──► rate limit (глобальный) + BullMQ
Worker (systemd) ──► CRON_LEADER=true, BullMQ consumer
```

### Чеклист фазы 1

**Redis + worker**

- [ ] Managed Redis или Redis на том же VPS
- [ ] `REDIS_URL` в `server/.env`
- [ ] API: `CRON_LEADER=false` (или не задавать в prod — default false)
- [ ] Отдельный systemd unit `izibuy-worker` → `npm run start:worker`
- [ ] `/health` → `rateLimitStore: redis`, worker жив

**Медиа**

- [ ] `UPLOAD_STORAGE=s3`, CDN URL ([`PROD-S3-CDN.md`](deploy/PROD-S3-CDN.md))
- [ ] `npm run sync-uploads:s3:apply` если был disk-prod
- [ ] nginx `client_max_body_size` согласован с лимитами contract

**Staging**

- [ ] `staging.torgum.ru` (или отдельный VPS)
- [ ] Отдельная БД Atlas, отдельные секреты
- [ ] Деплой staging перед prod на критичных релизах

**Наблюдаемость**

- [ ] Sentry alerts на spike 5xx и новые issues
- [ ] Регулярный просмотр Atlas Performance Advisor
- [ ] `npm run explain:queries` после тяжёлых фич каталога

**CI / качество**

- [ ] Client unit tests (`npm run test:client`) в GitHub Actions
- [ ] [`release-smoke-matrix.md`](release-smoke-matrix.md) перед релизом
- [ ] Feature flags через env для рискованных фич (рассрочка, розыгрыши)

**Безопасность (РФ-маркетплейс)**

- [ ] Cloudflare / WAF перед nginx
- [ ] Интеграция оплаты через провайдера (ЮKassa / CloudPayments / Тинькофф) — **не хранить** карты
- [ ] 54-ФЗ чеки при онлайн-оплате (через провайдера)
- [ ] Логирование staff-действий (модерация, смена ролей) — backlog
- [ ] 2FA для admin/moderator — backlog при появлении команды

**Поиск**

- [ ] Atlas Search index для каталога ([`ATLAS-SEARCH.md`](../server/docs/ATLAS-SEARCH.md))

**Docker (опционально фаза 1)**

- [ ] `docker-compose.staging.yml`: mongo + redis + api + worker — для локального e2e/staging (backlog)
- Prod остаётся **systemd**, не контейнеры

**Выход из фазы 1:** Redis + worker в prod, медиа на S3/CDN, staging, client tests в CI, платежи в roadmap.

---

## Фаза 2 — «Масштаб маркетплейса»

**Цель:** 2+ API за nginx, read replica для каталога, централизованные логи и метрики.

См. детали: [`HORIZONTAL-SCALING.md`](../server/docs/HORIZONTAL-SCALING.md) §2–§6.

### Чеклист фазы 2

**Горизонталь API**

- [ ] `UPLOAD_STORAGE=s3` (обязательно до 2-го инстанса)
- [ ] `REDIS_URL` + redis rate limit (обязательно)
- [ ] Worker отдельно, cron не на API-инстансах
- [ ] nginx upstream: `:4444`, `:4445` (второй systemd unit)
- [ ] Load test: k6 — 50 concurrent catalog + 10 checkout
- [ ] Sentry alert на p95 `/product`, `/order`

**Mongo**

- [ ] Поднять Atlas tier / Auto Scale
- [ ] `MONGO_URI_READ` для `GET /product` (код готов)
- [ ] Индексы: [`MONGO-INDEXES-AUDIT.md`](../server/docs/MONGO-INDEXES-AUDIT.md)

**Кэш**

- [ ] Заменить in-memory catalog cache на Redis (при N API) — backlog H-7
- [ ] CDN cache headers на статику (уже в nginx example)

**Очереди**

- [ ] Email verify / уведомления через BullMQ (не блокировать HTTP)
- [ ] Тяжёлые denorm / отчёты staff — только worker

**Наблюдаемость**

- [x] Централизованные логи (док: [`deploy/LOGGING-CENTRAL.md`](deploy/LOGGING-CENTRAL.md), Alloy example) — включить агент на VPS
- [ ] Метрики: RPS, p95 latency, Mongo connections, Redis memory
- [x] Единый structured JSON (`logServerEvent`) на runtime-путях (api/worker/cron)
**Mobile**

- [ ] EAS build в CI
- [ ] Staged rollout в stores

**Выход из фазы 2:** 2+ API без дублирования cron, каталог с read replica, метрики и алерты.

---

## Фаза 3 — «Лидерство»

**Только при упоре в метрики фазы 2** (см. жёлтая/красная зона в `HORIZONTAL-SCALING.md`).

| Направление | Решение |
| ----------- | ------- |
| Оркестрация | Kubernetes (Yandex Cloud / Selectel) или managed containers |
| Поиск | Выделенный OpenSearch/Elasticsearch при лимитах Atlas Search |
| Аналитика | ClickHouse / DWH для воронок, A/B |
| Антифрод | Правила: фейковые заказы, накрутка отзывов |
| Compliance | Pentest, bug bounty, внешний аудит 152-ФЗ |
| Multi-region | При реальной географии трафика |

**Не делать рано** (из `HORIZONTAL-SCALING.md` §3):

- Kubernetes до 2+ VPS и боли с деплоем
- Шардирование Mongo
- Микросервисы (order-service, catalog-service) — план и триггеры в [`MICROSERVICES.md`](MICROSERVICES.md)
- GraphQL/BFF только ради масштаба

---

## 4. Целевой `.env` production (по фазам)

### Фаза 0 (минимум)

```env
NODE_ENV=production
PORT=4444
JWT_SECRET=<64 hex>
MONGO_URI=mongodb+srv://...
FRONTEND_URL=https://torgum.ru
PUBLIC_UPLOAD_BASE_URL=https://torgum.ru
# UPLOAD_STORAGE=disk  # или s3 сразу
SENTRY_DSN=
```

### Фаза 1 (+)

```env
REDIS_URL=redis://...
UPLOAD_STORAGE=s3
PUBLIC_UPLOAD_BASE_URL=https://cdn.torgum.ru
S3_BUCKET=...
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_REGION=auto
S3_ENDPOINT=...
S3_FORCE_PATH_STYLE=true
SMTP_HOST=...
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=...
GIT_COMMIT_SHA=<из CI или git rev-parse>
```

### Фаза 2 (+)

```env
# На API-инстансах:
CRON_LEADER=false
# На worker (worker.js выставляет true сам):
MONGO_URI_READ=mongodb+srv://.../?readPreference=secondaryPreferred
```

Проверка: `npm run preflight:prod` и `GET /health`.

---

## 5. Docker — роль в roadmap

| Фаза | Docker |
| ---- | ------ |
| 0 | Dev Mongo: `docker-compose.yml`, `npm run mongo:up` |
| 1 | Опционально `docker-compose.staging.yml` для staging/e2e |
| 2 | Опционально prod API image при переходе на PaaS |
| 3 | k8s manifests при dedicated DevOps |

**Prod на одном VPS без Docker — нормально** для фаз 0–1. Контейнеры не заменяют чеклист деплоя.

---

## 6. Процесс разработки (все фазы)

### Изменение API

1. Схема в `contract/src/`
2. Тесты в `contract/tests/`
3. Server route + validation
4. Client entity hook + UI
5. Mobile при необходимости (buyer path)

### Изменение БД

1. Mongoose schema + индекс в миграции
2. `npm run migrate:dry` → `migrate:apply`
3. `explain:queries` при новых фильтрах/sort

### Релиз

1. CI green
2. Staging smoke (фаза 1+)
3. `migrate:apply` на prod
4. Build client, restart API (+ worker)
5. [`production-checklist.md`](../server/docs/production-checklist.md) §4
6. Мониторинг Sentry 30 мин

---

## 7. Backlog в коде (связь с HORIZONTAL-SCALING)

| ID | Задача | Фаза | Статус |
| -- | ------ | ---- | ------ |
| H-1 | Redis rate limit store | 1–2 | ✅ |
| H-2 | `worker.js` + `CRON_LEADER` | 1–2 | ✅ |
| H-3 | `MONGO_URI_READ` для каталога | 2 | ✅ |
| H-4 | BullMQ + email/cron | 1–2 | ✅ |
| H-5 | Денорм `soldQuantity` | 0–2 | ✅ |
| H-6 | Cron promotions вне hot path | 0 | ✅ |
| R-1 | Client unit tests в CI | 1 | ⬜ |
| R-2 | systemd unit для worker (example) + heartbeat + DEPLOY §4a | 1 | ✅ |
| R-3 | Staging env + deploy doc | 1 | ⬜ |
| R-4 | Staff audit log | 1–2 | ⬜ |
| R-5 | Redis catalog cache (вместо in-memory) | 2 | ⬜ |
| R-6 | Централизованные логи / метрики | 2 | ⬜ |
| R-7 | `docker-compose.staging.yml` | 1–2 | ⬜ |
| R-8 | GitHub Actions deploy (SSH) | 2 | ⬜ |
| R-9 | Платёжный провайдер | 1–2 | ⬜ |
| R-10 | EAS CI для mobile | 2 | ⬜ |

---

## 8. План на ближайшие 2–4 недели (фаза 0 → 1)

1. Закрыть prod по [`DEPLOY.md`](deploy/DEPLOY.md) + smoke checklist
2. Подключить `REDIS_URL` + systemd worker
3. Перевести медиа на S3/R2 + CDN
4. Включить Sentry на prod
5. Настроить SMTP для реальных пользователей
6. Добавить client tests в CI (R-1)
7. Задокументировать staging (R-3)
8. **Не** трогать k8s и полный Docker prod

---

## 9. Связанные документы

- [`deploy/DEPLOY.md`](deploy/DEPLOY.md)
- [`deploy/PROD-S3-CDN.md`](deploy/PROD-S3-CDN.md)
- [`MICROSERVICES.md`](MICROSERVICES.md) — что/когда/как выделять (и почему не сейчас)
- [`../server/docs/PRODUCTION-AND-ARCHITECTURE.md`](../server/docs/PRODUCTION-AND-ARCHITECTURE.md)
- [`../server/docs/HORIZONTAL-SCALING.md`](../server/docs/HORIZONTAL-SCALING.md)
- [`../server/docs/OBSERVABILITY.md`](../server/docs/OBSERVABILITY.md)
- [`../server/docs/MEDIA-OBJECT-STORAGE.md`](../server/docs/MEDIA-OBJECT-STORAGE.md)
- [`LOCAL-DEV-SETUP.md`](LOCAL-DEV-SETUP.md)
- [`MERN-AUDIT.md`](MERN-AUDIT.md)
