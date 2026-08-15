# Шпаргалка: сервер Gitorg (для новичка)

Сайт живёт на **VPS Selectel**. Ты правишь код на **ПК**, выкатываешь на **сервер**.

| | ПК (Windows) | Сервер (Linux) |
|---|---|---|
| Зачем | писать код, `git push` | крутить сайт для людей |
| Путь к проекту | `C:\Users\...\molhaAptekaFullStackApp` | `/var/www/gitorg` |
| Сайт | localhost | https://gitorg.ru |

---

## 1. Что где лежит (карта сервера)

```
IP сервера:     135.106.146.218
Домен:          https://gitorg.ru
Код:            /var/www/gitorg
Секреты API:    /var/www/gitorg/server/.env     ← НЕ в git
Загрузки фото:  /var/www/gitorg/server/uploads  ← не удалять
Собранный сайт: /var/www/gitorg/client/dist
Nginx конфиг:   /etc/nginx/sites-available/gitorg
```

**Сервисы (программы, которые всегда работают):**

| Имя | Что делает |
|---|---|
| `gitorg-api` | бэкенд (API), порт `127.0.0.1:4444` |
| `gitorg-worker` | фоновые задачи (письма и т.п.) |
| `nginx` | HTTPS, раздаёт фронт, проксирует API |
| `mongod` | база данных |

---

## 2. Подключение к серверу (SSH)

На **ПК** в PowerShell / терминале Cursor:

```powershell
ssh root@135.106.146.218
```

После входа prompt станет похож на `root@...#` — ты **на сервере**.

Выйти:

```bash
exit
```

> Если Cursor открыт через Remote SSH — команды ниже пиши в **том** терминале, где уже сервер.

---

## 3. Два мира: не путай команды

| Команда | Где |
|---|---|
| `git commit` / `git push` | только ПК |
| `cd /var/www/gitorg` | только сервер |
| `systemctl restart ...` | только сервер |
| правка `server/.env` прода | только сервер (через nano) |

На ПК путь `/var/www/gitorg` **не существует**.

---

## 4. Обновление сайта (самый частый сценарий)

### На ПК

1. Поправил код, проверил локально.
2. Запушил:

```powershell
git add .
git commit -m "что изменил"
git push origin main
```

### На сервере

```bash
cd /var/www/gitorg
git pull origin main
```

Дальше — **по тому, что менял** (см. таблицу ниже). Если не уверен — полный релиз (§5).

| Менял | На сервере после `git pull` |
|---|---|
| Только `client/` (кнопки, страницы) | `cd /var/www/gitorg/client && npm ci --ignore-scripts && npm run build` |
| `server/` (API, логика) | `cd /var/www/gitorg/server && npm ci --ignore-scripts && npm rebuild bcrypt` → миграции → restart API |
| Миграции БД | `cd /var/www/gitorg/server && npm run migrate:apply` |
| `contract/` или `packages/shared-lib` | пересобрать shared-lib + `server` deps + restart |
| Только `.env` на сервере | правишь файл → restart API/worker (**без** git) |
| Nginx / SSL | редко; после правок: `nginx -t && systemctl reload nginx` |

Перезапуск API (нужен после смены бэкенда / `.env`):

```bash
sudo systemctl restart gitorg-api gitorg-worker
```

Проверка:

```bash
curl -sS https://gitorg.ru/health
```

Ожидай: `{"status":"ok"}` (или похожее). В браузере: https://gitorg.ru + Ctrl+F5.

---

## 5. Полный релиз (когда не уверен)

Скопируй блок **целиком** на сервере:

```bash
cd /var/www/gitorg
git pull origin main

cd /var/www/gitorg/contract && npm ci
cd /var/www/gitorg/packages/shared-lib && npm install --ignore-scripts && npx tsc -p tsconfig.json
cd /var/www/gitorg/server && npm ci --ignore-scripts && npm rebuild bcrypt && npm run migrate:apply
cd /var/www/gitorg/client && npm ci --ignore-scripts && npm run build

sudo systemctl restart gitorg-api gitorg-worker
curl -sS https://gitorg.ru/health
```

Сборка `client` на слабом VPS может быть долгой / тяжёлой по RAM. Если зависает — собери `client` на ПК и залей `dist` (см. `DEPLOY.md` §11).

---

## 6. Просмотр: статус, логи, что сломалось

### Живы ли сервисы?

```bash
systemctl status gitorg-api --no-pager
systemctl status gitorg-worker --no-pager
systemctl status nginx --no-pager
systemctl status mongod --no-pager
```

Зелёный `active (running)` = ок.

### Логи в реальном времени (Ctrl+C — стоп)

```bash
journalctl -u gitorg-api -f
journalctl -u gitorg-worker -f
```

Последние 100 строк без «следования»:

```bash
journalctl -u gitorg-api -n 100 --no-pager
```

### Health и локальный API

```bash
curl -sS https://gitorg.ru/health
curl -sS http://127.0.0.1:4444/health
```

### Место на диске / память

```bash
df -h
free -h
```

---

## 7. Настройка: `.env` на сервере

Файл с паролями и URL:

```bash
sudo nano /var/www/gitorg/server/.env
```

В nano: правишь → `Ctrl+O` Enter (сохранить) → `Ctrl+X` (выйти).

После любой правки `.env`:

```bash
sudo systemctl restart gitorg-api gitorg-worker
```

Права (должно быть только у root/www-data):

```bash
sudo chmod 600 /var/www/gitorg/server/.env
sudo chown www-data:www-data /var/www/gitorg/server/.env
```

**Важно:**

- Этот файл **не коммитить** в GitHub.
- `FRONTEND_URL` / публичные URL — обычно `https://gitorg.ru`.
- Локальный `server/.env` на ПК и прод-`.env` на сервере — **разные**. Меняешь прод → только на сервере.
- Имя пользователя/БД в `MONGO_URI` смотри **в самом `.env`**. На живом сервере оно могло остаться старым (`torgum`) — не меняй вслепую на `gitorg`, иначе API не подключится к Mongo.

---

## 8. Nginx (сайт / HTTPS)

Проверить конфиг:

```bash
sudo nginx -t
```

Применить после правок:

```bash
sudo systemctl reload nginx
```

Смотреть/править сайт:

```bash
sudo nano /etc/nginx/sites-available/gitorg
```

Сертификат Let’s Encrypt (обычно уже есть). Продление:

```bash
sudo certbot renew --dry-run
```

Подробнее: `CERTBOT-SSL.md`.

---

## 9. Админ и полезные npm-команды (на сервере)

Всегда из папки server:

```bash
cd /var/www/gitorg/server
```

Создать админа (под тем же пользователем, что крутит API):

```bash
sudo -u www-data npm run create-admin
```

(или с аргументами — см. `DEPLOY.md`).

Миграции:

```bash
sudo -u www-data npm run migrate:apply
```

Preflight (проверка окружения перед продом):

```bash
cd /var/www/gitorg/server && npm run preflight:prod
```

---

## 10. Git на сервере — правила

```bash
cd /var/www/gitorg
git status
git pull origin main
```

- На сервере **не коммить** рабочие правки «на живую». Правь на ПК → push → pull.
- Если `git pull` ругается на локальные правки — не паникуй: `git status`, разберись что изменил, или спроси в чате с агентом.
- Папку `server/uploads` git не должен затирать; не делай `rm -rf` по uploads.

---

## 11. Бэкап Mongo (хотя бы раз в неделю)

URI бери **из** `/var/www/gitorg/server/.env` (`MONGO_URI`), не выдумывай.

Пример (подставь свой URI):

```bash
sudo mkdir -p /var/backups/gitorg-mongo
mongodump --uri='ВСТАВЬ_MONGO_URI_ИЗ_ENV' --out=/var/backups/gitorg-mongo/$(date +%F)
```

Желательно копировать бэкап ещё куда-то вне одного диска VPS.

---

## 12. Частые проблемы → что сделать

| Симптом | Куда смотреть |
|---|---|
| Сайт не открывается с телефона, с ПК ок | DNS / другой DNS (1.1.1.1), подождать пропагацию |
| Белый экран / старый UI после деплоя | не собрал `client` (`npm run build`), Ctrl+F5 |
| API ошибки / 502 | `journalctl -u gitorg-api -n 100`; `systemctl status gitorg-api` |
| После смены `.env` «как будто ничего» | забыл `systemctl restart gitorg-api gitorg-worker` |
| `git pull` конфликт | не правь прод руками; откатить лишнее или разрулить на ПК |
| Нет места / OOM при `npm run build` | `df -h` / `free -h`; собрать client на ПК |
| Mongo не коннектится | сверить `MONGO_URI` в `.env` с реальным юзером БД |

---

## 13. Чеклист одного обновления (распечатай себе)

1. ПК: код ок → `git push origin main`
2. SSH: `ssh root@135.106.146.218`
3. `cd /var/www/gitorg && git pull origin main`
4. Сборка / deps по таблице §4 (или полный блок §5)
5. `sudo systemctl restart gitorg-api gitorg-worker` (если трогал server/env)
6. `curl -sS https://gitorg.ru/health`
7. Браузер: https://gitorg.ru + Ctrl+F5

---

## 14. Чего никогда не делать

- Не публиковать содержимое `.env` в чат / GitHub / скриншоты.
- Не делать `rm -rf /var/www/gitorg` и не чистить `uploads`.
- Не `systemctl stop mongod` «на всякий случай».
- Не править прод-код в nano вместо git (потеряешь при следующем pull).
- Не путать ПК и SSH: `cd /var/www/gitorg` только после `ssh`.

---

## Куда ещё смотреть в репо

| Файл | Зачем |
|---|---|
| [`docs/README.md`](../README.md) | оглавление всей документации |
| [`DEPLOY.md`](DEPLOY.md) | полная установка с нуля + релиз |
| [`CERTBOT-SSL.md`](CERTBOT-SSL.md) | SSL |
| `server/docs/RUNBOOK.md` | откат / инциденты |
| `server/docs/production-checklist.md` | ручной smoke после релиза |

---

*Актуально для прода: домен `gitorg.ru`, путь `/var/www/gitorg`, юниты `gitorg-api` / `gitorg-worker`.*
