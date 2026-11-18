# Шпаргалка: локальный запуск (этот ПК)

Рабочая копия: `C:\Users\Izna\projects\molhaAptekaFullStackApp`  
Docker здесь нет. Mongo только на `127.0.0.1:27017`, replica set `rs0`.

Прод / SSH / выкат → [`SHPARGALKA-SERVER.md`](SHPARGALKA-SERVER.md).

## Важно: `npm run start:dev` ≠ весь проект

`start:dev` есть **только в `server/`** — поднимает API (nodemon, порт 4444).  
Сайт (`client`) и Expo (`mobile`) — отдельные команды. В корне репо одной команды «всё сразу» нет.

Если Mongo уже крутится и нужен только бэкенд:

```powershell
cd server
npm run start:dev
```

## Порядок полного стека (4 терминала)

### 1. MongoDB

```bat
C:\Users\Izna\mongodb\start-mongo.cmd
```

Если cmd ругается на кириллицу — PowerShell:

```powershell
Start-Process "C:\Users\Izna\mongodb\extract\MongoDB\Server\8.2\bin\mongod.exe" `
  -ArgumentList "--replSet","rs0","--bind_ip","127.0.0.1","--port","27017",`
  "--dbpath","C:\Users\Izna\mongodb\data",`
  "--logpath","C:\Users\Izna\mongodb\log\mongod.log","--logappend" `
  -WindowStyle Hidden
```

Проверка: порт `27017` слушает. Лог: `C:\Users\Izna\mongodb\log\mongod.log`.

### 2. API (порт 4444)

Обычный день (с авторестартом):

```powershell
cd server
npm run start:dev
```

Или из корня без nodemon: `npm run start:e2e --prefix server`.

`.env` лежит в `server/`. В логе должно быть `api.listening` / port `4444`.

Демо-данные (по желанию, один раз / после сброса):

```powershell
npm run e2e:seed --prefix server
```

### 3. Сайт (Vite, порт 5173)

```powershell
npm run dev --prefix client
```

Открыть: [http://127.0.0.1:5173](http://127.0.0.1:5173)  
LAN (телефон в той же Wi‑Fi): `http://192.168.x.x:5173` — смотри IP в выводе Vite.

### 4. Мобильное приложение (Expo)

```powershell
npm run start --prefix mobile
```

- Expo Go: `npm run start:go --prefix mobile`
- Dev Client: `npm run start:dev --prefix mobile`
- Сканируй QR в терминале / Expo Dev Tools.

Перед стартом Expo сам соберёт `packages/shared-lib` (`prestart`).

## Быстрый чеклист

| Что | Команда / URL |
| --- | --- |
| Mongo | `start-mongo.cmd` → `:27017` |
| API | `cd server; npm run start:dev` → `:4444` |
| Web | `npm run dev --prefix client` → `:5173` |
| Mobile | `npm run start --prefix mobile` |

## Остановка

- Ctrl+C в терминалах API / client / mobile.
- Mongo: `Stop-Process -Name mongod` (или Диспетчер задач → `mongod.exe`).

## Типичные грабли

1. API без Mongo → падения/таймауты к БД. Сначала Mongo.
2. `npm install` только из **корня** репо (`workspaces`). Не `npm ci` внутри `client/`/`mobile/`.
3. Node на этом ПК — 26; на проде — 20. Для локалки ок.
4. Перед `deploy-prod.sh` / `npm ci` **гаси Vite** — иначе EPERM на esbuild.
5. Деплой/прод — только [`SHPARGALKA-SERVER.md`](SHPARGALKA-SERVER.md), не из этой шпаргалки.
