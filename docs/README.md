# Документация Gitorg — с чего начать

Вся документация проекта собрана **здесь** (`docs/`), по смыслу.  
Документы рядом с кодом (`server/docs`, `client/docs`, `mobile/docs`) **не дублируем** — на них есть ссылки ниже.

## Карта папок

| Папка | О чём | Когда открывать |
| ----- | ----- | --------------- |
| [**start/**](start/) | Локальный запуск на ПК | Первый день / новый компьютер |
| [**deploy/**](deploy/) | Сервер, прод, SSL, шпаргалка VPS | Выкатка и работа с `gitorg.ru` |
| [**clients/**](clients/) | Web + Mobile (общие планы) | Фичи в приложении / parity |
| [**product/**](product/) | Продуктовые спеки (1С, СДЭК, QA) | Новые интеграции и фичи |
| [**architecture/**](architecture/) | Рост, масштаб, аудит стека | Планирование инфраструктуры |
| [**quality/**](quality/) | Баги, lint, smoke, аудиты | Перед релизом / triage |

---

## Новичку — 3 файла

1. [start/LOCAL-DEV-SETUP.md](start/LOCAL-DEV-SETUP.md) — поднять проект локально  
2. [deploy/SHPARGALKA-SERVER.md](deploy/SHPARGALKA-SERVER.md) — SSH, обновление, логи, `.env`  
3. [deploy/DEPLOY.md](deploy/DEPLOY.md) — полный первый деплой (если с нуля)

Оперативный чеклист задач: [`../todo.md`](../todo.md)

---

## По зонам кода (лежат у пакетов)

### Сервер (`server/docs/`)

| Файл | Зачем |
| ---- | ----- |
| [project-overview.md](../server/docs/project-overview.md) | Обзор API |
| [PRODUCTION-AND-ARCHITECTURE.md](../server/docs/PRODUCTION-AND-ARCHITECTURE.md) | Архитектура + прод |
| [production-checklist.md](../server/docs/production-checklist.md) | Smoke после деплоя |
| [RUNBOOK.md](../server/docs/RUNBOOK.md) | Бэкап, откат, инциденты |
| [auth-session.md](../server/docs/auth-session.md) | JWT / cookies |
| [migrations.md](../server/docs/migrations.md) | Миграции БД |
| [smtp-setup.md](../server/docs/smtp-setup.md) | Почта |
| [SENTRY.md](../server/docs/SENTRY.md) | Ошибки в Sentry |
| [OBSERVABILITY.md](../server/docs/OBSERVABILITY.md) | Логи, request id |
| [MEDIA-OBJECT-STORAGE.md](../server/docs/MEDIA-OBJECT-STORAGE.md) | Uploads / S3 |
| [HORIZONTAL-SCALING.md](../server/docs/HORIZONTAL-SCALING.md) | Когда масштабировать |
| [USER-CAPABILITIES.md](../server/docs/USER-CAPABILITIES.md) | Права пользователей |
| [INSOMNIA_GUIDE.md](../server/docs/INSOMNIA_GUIDE.md) | Ручные API-запросы |
| [CSP-HELMET.md](../server/docs/CSP-HELMET.md) | CSP / Helmet |
| [RATE-LIMIT-AUDIT.md](../server/docs/RATE-LIMIT-AUDIT.md) | Rate limits |
| [MONGO-INDEXES-AUDIT.md](../server/docs/MONGO-INDEXES-AUDIT.md) | Индексы Mongo |
| [pii-passport-handling.md](../server/docs/pii-passport-handling.md) | ПДн / паспорт |
| [validation-guide.md](../server/docs/validation-guide.md) | Валидация |
| [ATLAS-SEARCH.md](../server/docs/ATLAS-SEARCH.md) | Поиск Atlas |
| [aboutRouter.md](../server/docs/aboutRouter.md) | Роутеры |
| [aboutDependencies.md](../server/docs/aboutDependencies.md) | Зависимости server |
| [improvements.md](../server/docs/improvements.md) | Бэклог улучшений |
| [validation-cleanup.md](../server/docs/validation-cleanup.md) | Чистка валидации |

### Web-клиент (`client/docs/`)

| Файл | Зачем |
| ---- | ----- |
| [связка-клиента-с-сервером.md](../client/docs/связка-клиента-с-сервером.md) | Как client ↔ API |
| [ROUTING.md](../client/docs/ROUTING.md) | Роуты SPA |
| [LAN-dev-access.md](../client/docs/LAN-dev-access.md) | Dev с телефона в LAN |
| [PRODUCT-MODALS-AUDIT.md](../client/docs/PRODUCT-MODALS-AUDIT.md) | Модалки продукта |

### Mobile (`mobile/docs/` + README)

| Файл | Зачем |
| ---- | ----- |
| [mobile/README.md](../mobile/README.md) | Вход в mobile |
| [mobile/QUICKSTART.md](../mobile/QUICKSTART.md) | Быстрый старт |
| [BUYER-CRITICAL-PATH.md](../mobile/docs/BUYER-CRITICAL-PATH.md) | Критичный путь покупателя |
| [STAFF-WEB-ONLY.md](../mobile/docs/STAFF-WEB-ONLY.md) | Staff только в web |
| [SAMSUNG-ANDROID-DEV.md](../mobile/docs/SAMSUNG-ANDROID-DEV.md) | Dev на Samsung |
| [EAS-DEV-BUILD.md](../mobile/docs/EAS-DEV-BUILD.md) | EAS dev build |
| [SCREEN-ADAPTATION-CHECKLIST.md](../mobile/docs/SCREEN-ADAPTATION-CHECKLIST.md) | Адаптация экранов |
| [STORE-SCREENSHOTS.md](../mobile/docs/STORE-SCREENSHOTS.md) | Скриншоты для сторов |

### Контракт API

| Файл | Зачем |
| ---- | ----- |
| [contract/docs/TYPES.md](../contract/docs/TYPES.md) | Типы контракта |

---

## Как пользоваться

1. Открой **эту** страницу (`docs/README.md`).
2. Выбери папку по задаче (таблица сверху).
3. Внутри папки — свой `README.md` со списком файлов.
4. Для прода почти всегда хватает **deploy/SHPARGALKA-SERVER.md**.

Старые пути вроде `docs/bug-triage-labels.md` оставлены как **заглушки** со ссылкой на новое место.
