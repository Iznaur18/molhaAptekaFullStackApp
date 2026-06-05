# Runbook — prod (вариант A: VPS + nginx + systemd)

Операционные процедуры для **izibuy**. Перед продом: `server/docs/production-checklist.md`.

---

## 0. Быстрая диагностика

| Симптом | Действие |
| -------- | -------- |
| Сайт 502/504 | `sudo systemctl status izibuy-api`, `journalctl -u izibuy-api -n 100` |
| API жив? | `curl -sS https://ДОМЕН/health \| jq` → `status`, `mongo`, `gitCommit` |
| Ошибка у пользователя | `requestId` из ответа API → `journalctl … \| jq 'select(.requestId=="…")'` |
| 5xx в Sentry | Issues по `release` = `gitCommit` из `/health` |

---

## 1. Бэкап MongoDB

### 1.1 Atlas (рекомендуется)

- Включить **Cloud Backup** / Continuous Backup в проекте Atlas.
- Периодический **snapshot** перед крупным релизом (консоль → Backup → Take Snapshot).
- Экспорт вручную (если нужен файл на диск):

```bash
mongodump --uri="$MONGO_URI" --gzip --archive=backup-$(date +%Y%m%d-%H%M).gz
```

Хранить архив **вне** VPS (S3/R2, другой сервер). Не коммитить в git.

### 1.2 Mongo на том же VPS

```bash
# остановка не обязательна для mongodump с --oplog (replica set)
mongodump --uri="mongodb://127.0.0.1:27017/molhaApteka" \
  --gzip --archive=/var/backups/mongo-$(date +%Y%m%d).gz
```

Cron (пример, root):

```cron
0 3 * * * mongodump --uri='...' --gzip --archive=/var/backups/mongo-$(date +\%Y\%m\%d).gz
```

Ротация: удалять архивы старше 14–30 дней.

### 1.3 Что ещё бэкапить

| Ресурс | Путь / способ |
| ------ | ------------- |
| Загрузки (disk) | `/var/www/izibuy/server/uploads` → rsync/tar в backup |
| Загрузки (S3) | versioning / lifecycle на бакете |
| Env | `/var/www/izibuy/server/.env` — секреты в менеджере, не только на диске |
| Код | git tag на каждый релиз |

---

## 2. Restore MongoDB

**Простой** (dev/staging или пустая БД):

```bash
mongorestore --uri="$MONGO_URI" --gzip --archive=backup-YYYYMMDD.gz --drop
```

`--drop` удаляет коллекции перед импортом — **опасно на prod**. На prod:

1. Остановить API: `sudo systemctl stop izibuy-api`
2. Restore в **отдельную** БД или staging, проверить данные
3. Либо point-in-time restore в Atlas (предпочтительно для prod)
4. Запустить API: `sudo systemctl start izibuy-api`
5. Smoke: `/health`, login, один заказ

После restore с другой даты проверить **миграции**: `cd server && npm run migrate:apply` (идемпотентно).

---

## 3. Rollback деплоя

### 3.1 Только API (Node)

```bash
cd /var/www/izibuy
git fetch origin
git checkout <предыдущий-tag-или-sha>
cd server && npm ci --omit=dev
sudo systemctl restart izibuy-api
curl -sS https://ДОМЕН/health
```

`GIT_COMMIT_SHA` в `.env` или systemd — обновить на откатываемый sha (для `/health` и Sentry release).

### 3.2 API + фронт

```bash
git checkout <sha>
cd server && npm ci --omit=dev
cd ../client && npm ci && npm run build
sudo cp -a dist/* /var/www/izibuy/client/dist/   # или ваш путь nginx
sudo systemctl restart izibuy-api
sudo nginx -t && sudo systemctl reload nginx
```

### 3.3 Откат миграции

В репо миграции в основном **вперёд-only**. Откат кода **без** отката схемы — норма, если миграция только добавляет поля.

Если миграция ломает старый код:

1. Stop API
2. Restore Mongo из snapshot **до** миграции (раздел 2)
3. Deploy старого sha
4. Разобрать миграцию на staging

### 3.4 Чеклист после rollback

- [ ] `/health` → `ok`, ожидаемый `gitCommit`
- [ ] Login / refresh cookie
- [ ] Upload → URL открывается
- [ ] Sentry: новые 5xx привязаны к старому `release`?

---

## 4. Деплой вперёд (кратко)

```bash
cd /var/www/izibuy && git pull
cd server && npm ci --omit=dev && npm run migrate:apply
cd ../client && npm ci && npm run build
# при Sentry: см. docs/SENTRY.md — upload sourcemaps
sudo systemctl restart izibuy-api
sudo nginx -t && sudo systemctl reload nginx
```

---

## 5. Инциденты

### Mongo disconnected

1. Atlas: статус кластера / IP allowlist
2. VPS: `systemctl status mongod`
3. `MONGO_URI` в `.env`
4. После восстановления — burst 5xx возможен; смотреть Sentry + JSON-логи

### Диск uploads заполнен

```bash
df -h
du -sh /var/www/izibuy/server/uploads
```

Очистка только осознанно; лучше перейти на S3 (`MEDIA-OBJECT-STORAGE.md`).

### Подозрение на утечку JWT/пароля

1. Ротировать `JWT_SECRET` → все сессии сбросятся
2. Проверить логи на утечку PII (`pii-passport-handling.md`)

---

## 6. Медиа S3/CDN

Включение и откат: `docs/deploy/PROD-S3-CDN.md`, sync: `cd server && npm run sync-uploads:s3:apply`.

## 7. Ссылки

- nginx: `docs/deploy/nginx-izibuy.conf.example`
- systemd: `docs/deploy/systemd-izibuy.service.example`
- Sentry: `server/docs/SENTRY.md`
- Наблюдаемость: `server/docs/OBSERVABILITY.md`
- Object storage: `server/docs/MEDIA-OBJECT-STORAGE.md`
