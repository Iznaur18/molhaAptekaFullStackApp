# Локальный запуск на новом ПК

Инструкция для разработки: web (`client/`), API (`server/`), mobile (`mobile/`).  
Production-деплой — [`deploy/DEPLOY.md`](deploy/DEPLOY.md).

---

## 0. Требования

| Компонент | Версия / примечание |
| --------- | ------------------- |
| **Node.js** | 20 LTS |
| **Git** | любой свежий |
| **MongoDB** | Atlas M0+ **или** Docker (`npm run mongo:up`) с **replica set** |
| **Docker** | только если Mongo локально через compose (см. вариант C) |

Опционально для dev: Redis, SMTP, DaData, Sentry — без них базовый сценарий работает.

> **Replica set:** заказы и баллы используют MongoDB transactions. Standalone `mongod` без RS — заказы/баллы ненадёжны. Варианты: **Atlas**, **Docker** (`docker-compose.yml` в корне), или свой `mongod --replSet rs0`.

---

## 1. Клон репозитория

```powershell
git clone https://github.com/Iznaur18/molhaAptekaFullStackApp.git
cd molhaAptekaFullStackApp
git checkout main
git pull origin main
```

---

## 2. Установка зависимостей

Порядок важен: `server/` и `contract/` **не** входят в npm workspaces корня.

```powershell
# корень: client, mobile, packages/*
npm install

# contract (@molha/api-contract)
cd contract
npm install
cd ..

# server
cd server
npm install
cd ..

# shared-lib — dist/ не в git, собирается локально
npm run build --prefix packages/shared-lib
```

---

## 3. Переменные окружения и данные

В git **не** попадают: `.env`, `server/uploads/`, `node_modules/`, `packages/shared-lib/dist/`.

### Вариант A — окружение «как на другом ПК» (1:1)

С рабочей машины перенесите **вне git** (USB, архив, защищённый канал):

| Путь | Назначение |
| ---- | ---------- |
| `server/.env` | JWT, Mongo, SMTP, DaData, upload storage |
| `mobile/.env` | `EXPO_PUBLIC_API_URL` и др. |
| `client/.env` | если есть (в dev часто не нужен) |
| `server/uploads/` | медиа на диске (если `UPLOAD_STORAGE=disk`) |

На **новом ПК** в `mobile/.env` обновите LAN IP хоста:

```powershell
ipconfig
# IPv4 Wi‑Fi, напр. 192.168.1.25
```

```env
EXPO_PUBLIC_API_URL=http://192.168.1.25:4444
```

Тот же `MONGO_URI` → те же пользователи, товары и заказы.

### Вариант B — чистая локальная копия (Atlas)

```powershell
copy server\.env.example server\.env
copy mobile\.env.example mobile\.env
```

Минимум в `server/.env`:

```env
JWT_SECRET=<сгенерировать, см. ниже>
MONGO_URI=mongodb+srv://user:password@cluster.xxxxx.mongodb.net/molhaApteka
FRONTEND_URL=http://127.0.0.1:5173
```

Генерация `JWT_SECRET`:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Миграции и первый admin:

```powershell
cd server
npm run migrate:apply
npm run create-admin -- admin@molha.ru YourPassword123 adminboss
cd ..
```

Шаблоны env: `server/.env.example`, `client/.env.example`, `mobile/.env.example`.

### Вариант C — локальная Mongo с replica set (Docker)

Нужен [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/Mac) или Docker Engine (Linux).

> **Только local/dev/CI.** Корневой `docker-compose.yml` — Mongo **без auth** на `127.0.0.1:27017`. Не деплоить на VPS. Production — Atlas с `user:password` (`server/.env.production.example`); `preflight:prod` отклонит localhost URI.

```powershell
# из корня репозитория
npm run mongo:up
npm run mongo:check
```

Проверка replica set: `npm run mongo:check` → `PRIMARY` и строка `MONGO_URI=...replicaSet=rs0`.

Остановка: `npm run mongo:down` (данные в volume `izibuy_mongo_data` сохраняются).

В `server/.env` (после `copy server\.env.example server\.env`):

```env
JWT_SECRET=<сгенерировать>
MONGO_URI=mongodb://127.0.0.1:27017/molhaApteka?replicaSet=rs0
FRONTEND_URL=http://127.0.0.1:5173
```

Дальше — миграции и admin как в варианте B.

---

## 4. Запуск (три терминала)

### Терминал 1 — API (порт **4444**)

```powershell
cd server
npm run start:dev
```

### Терминал 2 — Web client (порт **5173**)

```powershell
cd client
npm run dev
```

Открыть: **http://127.0.0.1:5173**  
Vite проксирует API на `127.0.0.1:4444` (см. `client/vite.config.js`).

### Терминал 3 — Mobile (Expo)

```powershell
cd mobile
npm start
```

Для быстрой проверки в браузере: в Metro нажать `w` → `http://localhost:8081`.

Expo Go на Samsung в этом проекте **не используется** (SDK 54) — см. [`mobile/README.md`](../mobile/README.md) и [`mobile/docs/SAMSUNG-ANDROID-DEV.md`](../mobile/docs/SAMSUNG-ANDROID-DEV.md).

Staff-разделы в mobile открывают web SPA — в dev:

```env
EXPO_PUBLIC_WEB_APP_URL=http://127.0.0.1:5173
```

На физическом телефоне вместо `127.0.0.1` — LAN IP ПК с запущенным Vite.

---

## 5. Порты

| Сервис | URL |
| ------ | --- |
| API | `http://127.0.0.1:4444` |
| Web (Vite) | `http://127.0.0.1:5173` |
| Expo Metro | `http://localhost:8081` |
| Mobile → API с телефона | `http://<LAN-IP>:4444` |

---

## 6. Типичные проблемы

| Симптом | Решение |
| ------- | ------- |
| `Cannot find module ... shared-lib/dist` | `npm run build --prefix packages/shared-lib` |
| Mobile не достучится до API | `EXPO_PUBLIC_API_URL` = LAN IP; разрешить порт 4444 в firewall |
| Пустой каталог / нет пользователей | другая БД; скопируйте `MONGO_URI` с рабочей машины |
| Нет картинок товаров | скопируйте `server/uploads/` или настройте S3 в `.env` |
| Ошибки транзакций (заказ, баллы) | `npm run mongo:up` + `?replicaSet=rs0` в `MONGO_URI`, или Atlas |
| `mongo:up` падает | Docker не запущен; порт 27017 занят другим mongod |
| CORS / cookie не сохраняются | `FRONTEND_URL=http://127.0.0.1:5173` в `server/.env` |

---

## 7. Проверка после установки

```powershell
npm run test:mongo-replica
cd server
npm test
cd ..\mobile
npm run regression:wf72
```

Если Mongo через Docker: `npm run mongo:check` перед ручной проверкой заказов.

---

## 8. Что не в git (напоминание)

| Игнорируется | Действие на новом ПК |
| ------------ | -------------------- |
| `**/node_modules/` | `npm install` |
| `packages/shared-lib/dist/` | `npm run build --prefix packages/shared-lib` |
| `server/.env`, `client/.env`, `mobile/.env` | скопировать или создать из `*.env.example` |
| `server/uploads/` | скопировать или загрузить медиа заново |
| `client/dist/` | только для production build |
| `mobile/.expo/`, `mobile/ios/`, `mobile/android/` | генерируются Expo/EAS |

---

## Связанные документы

- [`mobile/README.md`](../mobile/README.md) — mobile, FSD, buyer path
- [`deploy/DEPLOY.md`](deploy/DEPLOY.md) — production VPS
- [`server/docs/production-checklist.md`](../server/docs/production-checklist.md) — smoke prod
- [`server/.env.example`](../server/.env.example) — все переменные server
