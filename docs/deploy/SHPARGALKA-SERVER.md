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
| `ufw` | фаервол: наружу только 22/80/443 (см. §15) |
| `fail2ban` | бан IP за перебор паролей SSH (см. §15) |

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

## 4a. Деплой одной командой (рекомендуется)

Чтобы каждый раз не собирать вручную — на **ПК** из Git Bash, из корня репо:

```bash
bash scripts/deploy-prod.sh
```

Скрипт сам: `git push` → соберёт `client` локально → зальёт `dist` на сервер →
на сервере сделает `git pull` + deps + миграции + рестарт → проверит `/health`.
Нужен только рабочий SSH-ключ к серверу. Внутри — ровно шаги §4–§5.

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

## 11. Бэкап Mongo (настроен автоматически)

**С 2026-08-21 бэкап идёт сам** — вручную ничего запускать не надо.

| Что | Где |
|---|---|
| Скрипт | `/usr/local/bin/gitorg-mongo-backup.sh` |
| Расписание | cron `/etc/cron.d/gitorg-mongo-backup` — каждый день **03:30** |
| Куда пишет | `/var/backups/gitorg-mongo/gitorg-ДАТА.archive.gz` (доступ только root) |
| Хранит | последние **7** архивов (старые удаляются сами) |
| Лог | `/var/log/gitorg-mongo-backup.log` |

`MONGO_URI` скрипт читает **из** `/var/www/gitorg/server/.env` — руками URI подставлять не нужно.

Проверить, что бэкапы идут:

```bash
ls -lh /var/backups/gitorg-mongo/          # свежие архивы
tail /var/log/gitorg-mongo-backup.log      # лог последних запусков
```

Сделать бэкап прямо сейчас (например, перед рискованным изменением):

```bash
/usr/local/bin/gitorg-mongo-backup.sh
```

### Восстановление из бэкапа

⚠️ `--drop` удалит текущие коллекции и зальёт их из архива. Делай осознанно (лучше сняв свежий бэкап перед этим).

```bash
cd /var/www/gitorg/server
MONGO_URI="$(grep -E '^MONGO_URI=' .env | cut -d= -f2- | tr -d '"'"'"'"')"
mongorestore --uri="$MONGO_URI" --gzip --drop \
  --archive=/var/backups/gitorg-mongo/ВЫБЕРИ-АРХИВ.archive.gz
```

### Пересоздать бэкап на новом VPS (скрипт НЕ в git)

Скрипт и cron живут только на сервере. При переустановке VPS создай заново:

```bash
cat > /usr/local/bin/gitorg-mongo-backup.sh <<'SCRIPT'
#!/usr/bin/env bash
set -euo pipefail
umask 077
ENV_FILE=/var/www/gitorg/server/.env
BACKUP_ROOT=/var/backups/gitorg-mongo
KEEP=7
MONGO_URI="$(grep -E '^MONGO_URI=' "$ENV_FILE" | head -1 | cut -d= -f2-)"
MONGO_URI="${MONGO_URI%\"}"; MONGO_URI="${MONGO_URI#\"}"
MONGO_URI="${MONGO_URI%\'}"; MONGO_URI="${MONGO_URI#\'}"
[ -n "$MONGO_URI" ] || { echo "MONGO_URI empty in $ENV_FILE" >&2; exit 1; }
mkdir -p "$BACKUP_ROOT"
STAMP="$(date +%F_%H%M%S)"
ARCHIVE="$BACKUP_ROOT/gitorg-$STAMP.archive.gz"
mongodump --uri="$MONGO_URI" --gzip --archive="$ARCHIVE" --quiet
ls -1t "$BACKUP_ROOT"/gitorg-*.archive.gz 2>/dev/null | tail -n +$((KEEP+1)) | xargs -r rm -f
echo "backup ok: $ARCHIVE"
SCRIPT
chmod 750 /usr/local/bin/gitorg-mongo-backup.sh

printf '%s\n' \
  '# Ежедневный бэкап Mongo для Gitorg' \
  '30 3 * * * root /usr/local/bin/gitorg-mongo-backup.sh >> /var/log/gitorg-mongo-backup.log 2>&1' \
  > /etc/cron.d/gitorg-mongo-backup
chmod 644 /etc/cron.d/gitorg-mongo-backup
```

### Offsite-копия в S3 (Selectel) — шифрованная

Чтобы бэкап пережил отказ диска VPS, свежий дамп шифруется и заливается в Selectel Object Storage. **Настроено и проверено 2026-08-21** (бакет `gitorg-backups`, регион `ru-6`, round-trip восстановления пройден).

| Что | Где |
|---|---|
| Скрипт выгрузки | `/usr/local/bin/gitorg-backup-offsite.sh` (gpg-AES256 → rclone → S3) |
| Ключ шифрования | `/root/.gitorg-backup-pass` (root-only) — **БЕЗ него дамп не расшифровать** |
| Настройки | `/etc/gitorg-backup.conf` (`REMOTE=selectel`, `BUCKET=gitorg-backups`, `REMOTE_KEEP=30`) |
| rclone remote | `selectel` → `s3.ru-6.storage.selcloud.ru` (в `/root/.config/rclone/rclone.conf`) |
| Бакет | `gitorg-backups` (Москва / ru-6, приватный), объекты в `mongo/` |
| Запуск | тем же cron `03:30` сразу после локального дампа |

Скрипт **best-effort**: если `BUCKET`/rclone не настроены — он молча пропускает, локальный бэкап при этом идёт как обычно.

**Первичная настройка (одноразово, нужны ключи из панели Selectel) — уже выполнена, шаги на случай переустановки VPS:**

1. В панели Selectel → **Продукты → S3**: создать приватный бакет (напр. `gitorg-backups`) + **S3-ключ** (вкладка «Личные» = ключ «Мне», тогда не нужна отдельная политика доступа). Endpoint/регион показаны у бакета.
2. Прописать rclone remote (ключи вставляешь ты — **замени плейсхолдеры на реальные значения**, иначе rclone запишет их дословно):

   ```bash
   rclone config create selectel s3 provider Other \
     access_key_id ТВОЙ_ACCESS_KEY \
     secret_access_key ТВОЙ_SECRET_KEY \
     endpoint https://s3.ru-6.storage.selcloud.ru \
     region ru-6 acl private
   ```

   (endpoint/регион — как в панели у бакета; у нас `ru-6`. Проверить: `rclone config show selectel`.)
3. Указать бакет:

   ```bash
   sed -i 's/^BUCKET=.*/BUCKET=gitorg-backups/' /etc/gitorg-backup.conf
   ```
4. **Сохранить ключ шифрования в менеджер паролей** (иначе offsite-копии бесполезны):

   ```bash
   cat /root/.gitorg-backup-pass
   ```
5. Проверить:

   ```bash
   /usr/local/bin/gitorg-mongo-backup.sh && /usr/local/bin/gitorg-backup-offsite.sh
   rclone ls selectel:ИМЯ_БАКЕТА/mongo/
   ```

**Восстановление из offsite:**

```bash
cd /var/www/gitorg/server
rclone copy selectel:ИМЯ_БАКЕТА/mongo/gitorg-ДАТА.archive.gz.gpg /tmp/
gpg --batch --pinentry-mode loopback --passphrase-file /root/.gitorg-backup-pass \
    -d -o /tmp/restore.archive.gz /tmp/gitorg-ДАТА.archive.gz.gpg
MONGO_URI="$(grep -E '^MONGO_URI=' .env | cut -d= -f2- | tr -d '"'"'"'"')"
mongorestore --uri="$MONGO_URI" --gzip --drop --archive=/tmp/restore.archive.gz
```

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

## 15. Безопасность сервера (базовый хардненинг)

Настроено 2026-08-15. Эти правки живут **на сервере, не в git** — при переустановке VPS повтори их.

### Фаервол (ufw)

Пускаем только SSH/HTTP/HTTPS, остальное закрыто:

```bash
ufw status verbose        # проверить
```

Ожидаемо: `Status: active`, разрешены `22/tcp`, `80/tcp`, `443/tcp`, `Default: deny (incoming)`.

Если ставишь с нуля — **сначала разреши 22, потом enable** (иначе отрежешь себе SSH):

```bash
apt-get install -y ufw
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp
ufw --force enable
```

### Защита от перебора паролей (fail2ban)

```bash
systemctl is-active fail2ban          # active
fail2ban-client status sshd           # забаненные IP, счётчики
```

Конфиг `/etc/fail2ban/jail.local`: jail `sshd`, `backend=auto` + `logpath=/var/log/auth.log`
(**не** `backend=systemd` — на этом сервере нет модуля `python3-systemd`), бан 1ч после 5 попыток.

### SSH — только по ключу

Вход по паролю выключен, root — только по ключу. Настройки в `/etc/ssh/sshd_config.d/00-hardening.conf`:

```
PermitRootLogin prohibit-password
PasswordAuthentication no
KbdInteractiveAuthentication no
```

> Имя файла `00-` важно: `Include` в главном `sshd_config` идёт раньше строк `...yes`, а в sshd **побеждает первое** значение. После правок: `sshd -t` (проверка синтаксиса) → `systemctl reload ssh` → **проверь вход новым окном до закрытия текущего**.

Проверка эффективных значений:

```bash
sshd -T | grep -Ei 'permitrootlogin|passwordauthentication'
```

### API слушает только localhost

`server/index.js` биндит API на `127.0.0.1` (через `HOST`, по умолчанию loopback). Наружу API идёт **только** через nginx-прокси. Проверка — порт 4444 должен быть на `127.0.0.1`, не на `0.0.0.0`/`*`:

```bash
ss -tlnp | grep 4444        # ждём 127.0.0.1:4444
```

Снаружи 4444 должен быть закрыт (проверять с ПК, не с сервера).

### nginx — скрыта версия, усилен gzip

- `server_tokens off;` в `/etc/nginx/nginx.conf` — в ответах `Server: nginx` без версии.
- В `/etc/nginx/sites-available/gitorg` подняты `gzip_comp_level 6`, `gzip_vary on`, расширены `gzip_types` (шрифты/wasm). Бэкапы конфига — рядом: `gitorg.bak.*`.

После правок nginx: `nginx -t && systemctl reload nginx`.

### Не сделано (на будущее)

- **brotli** — пакета в репах Ubuntu 22.04 нет; компилировать nginx из исходников на живом проде не стали. gzip6 покрывает ~95% выгоды.

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
