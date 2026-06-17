
## Workflow (client ↔ mobile)

| Документ | Назначение |
| -------- | ---------- |
| [`docs/bug-triage-labels.md`](docs/bug-triage-labels.md) | Метки багов при triage (A.2) |
| [`docs/release-smoke-matrix.md`](docs/release-smoke-matrix.md) | Ручной smoke перед релизом (F.4) |
| [`docs/client-mobile-consolidation-audit.md`](docs/client-mobile-consolidation-audit.md) | Аудит и roadmap консолидации |

**Метки triage (одна на баг):** `web-dev-infra` · `web-feature` · `mobile-feature` · `server` · `contract` · `shared-drift`

---

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

=====================

Я хочу провести полный аудит моего MERN-проекта (MongoDB, Express, React, Node.js). Твоя задача — проанализировать кодовую базу и структуру проекта по двум главным направлениям: корректность сборки/безопасность и архитектурные паттерны.

Пожалуйста, проверь проект по следующим пунктам и дай конкретные рекомендации со ссылками на мои файлы:

1. Архитектура и Структура:
- Насколько текущая структура папок (Client, Server) соответствует Best Practices? 
- Разделены ли зоны ответственности? (Слои маршрутизации, бизнес-логики/контроллеров, работы с БД/моделей).
- Какую архитектуру здесь лучше применить для масштабирования (например, Feature-Driven Development для фронтенда, Clean Architecture или Layered Architecture для бэкенда)? Покажи на примере моего кода, как перестроить структуру.

2. Правильность сборки и Конфигурация:
- Оптимальны ли настройки package.json, скрипты сборки и конфигурация сборщика (Vite/Webpack/CRA)?
- Правильно ли настроены переменные окружения (.env), нет ли утечек секретов в клиентскую часть?
- Корректно ли настроен CORS и обработка статических файлов?

3. Качество кода и Безопасность бэкенда:
- Как организована обработка ошибок (Global Error Handling Middleware)? Есть ли риск падения сервера при необработанных ре rejection'ах?
- Защищены ли роуты (Authentication/Authorization middleware)?
- Оптимальны ли запросы к MongoDB (используются ли индексы, lean(), правильная ли схема Mongoose)?

Выведи отчет в формате: 
- Текущие критические проблемы (если есть).
- Рекомендации по улучшению архитектуры (с примером "Было / Стало" для структуры папок).
- Оптимизация сборки и зависимостей.

Я хочу, чтобы ты проверил мой MERN-проект на соответствие официальным индустриальным стандартам и гайдлайнам. 

Пожалуйста, используй в качестве критериев проверки следующие существующие правила:
1. Node.js Best Practices (от Goldbergyoni) — для проверки архитектуры бэкенда, обработки ошибок и структуры слоев.
2. OWASP Top 10 — для проверки безопасности бэкенда (защита от инъекций, утечки данных, безопасность JWT/сессий, проверка CORS и заголовков Helmet).
3. React Clean Code & Airbnb Style Guide — для проверки структуры компонентов, хуков, стейт-менеджмента и форматирования на фронтенде.
4. Production-ready MERN стандарты — правильная конфигурация production-сборки, разделение зависимостей (dependencies vs devDependencies), безопасность переменных окружения (.env).

Контекст проекта: бэкенд тут @папка_сервера , фронтенд тут @папка_клиента.

Сделай аудит в виде таблицы или чек-листа:
- Название правила/критерия
- Соответствует ли мой проект (Да / Частично / Нет)
- Что именно нарушено (конкретный файл и строка кода)
- Как исправить (код "Было" -> "Стало")

Давай улучшим читаемость и архитектуру моего проекта. Проверь код по @папка_сервера и @папка_клиента на соответствие следующим инженерным практикам:

1. Примени принципы KISS и SOLID: найди слишком сложные, длинные функции или компоненты и покажи, как разбить их на мелкие логические части.
2. Реализуй Сервисный слой на бэкенде: проверь, чтобы бизнес-логика не находилась внутри контроллеров или роутов. Помоги вынести её в папки `services/`.
3. Очисти React-компоненты: найди компоненты, перегруженные логикой (fetch-запросами, сложными стейтами), и помоги вынести эту логику в кастомные хуки.
4. Внедри безопасную валидацию: предложи, как использовать библиотеку Zod (или аналог) для жесткой проверки входящих запросов на бэкенде.

Выведи список мест, которые нужно отрефакторить в первую очередь, и покажи пример кода для одного бэкенд-модуля и одного фронтенд-компонента.