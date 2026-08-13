# Первый production-деплой (VPS + nginx)

Линейный сценарий для **варианта A**: один домен `https://torgum.ru` → SPA + API + uploads.

| Документ | Когда |
| -------- | ----- |
| Этот файл | первый выклад |
| [`../ROADMAP-SCALING.md`](../ROADMAP-SCALING.md) | фазы роста, Redis, worker, staging |
| [`LOGGING-CENTRAL.md`](LOGGING-CENTRAL.md) | journald → Loki / Grafana Cloud / Yandex Logging |
| [`PROD-S3-CDN.md`](PROD-S3-CDN.md) | медиа на R2 вместо диска |
| [`CERTBOT-SSL.md`](CERTBOT-SSL.md) | Let's Encrypt / продление / troubleshooting |
| [`../../server/docs/production-checklist.md`](../../server/docs/production-checklist.md) | smoke после деплоя |
| [`../../server/docs/RUNBOOK.md`](../../server/docs/RUNBOOK.md) | бэкап, rollback |

---

## 0. Что нужно заранее

- VPS (Ubuntu 22+), домен → A-запись на IP VPS
- **MongoDB Atlas** (M0+, replica set, **с auth**) или свой `mongod --replSet` с пользователем  
  — корневой `docker-compose.yml` (Mongo без auth) **только** local/dev, не на VPS
- Node.js **20 LTS** на VPS
- nginx + certbot

---

## 1. Подготовка env (локально или на VPS)

```bash
cd server
cp .env.production.example .env
# заполни JWT_SECRET, MONGO_URI, FRONTEND_URL, PUBLIC_UPLOAD_BASE_URL
```

Секрет:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Проверка **до** выкладки (нужен доступ к Mongo из твоей сети / Atlas IP whitelist):

```bash
cd server
npm run preflight:prod
```

---

## 2. Установка на VPS (один раз)

```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

sudo mkdir -p /var/www/izibuy
sudo chown -R $USER:$USER /var/www/izibuy
```

Клон репо (или `git pull` при обновлениях):

```bash
cd /var/www/izibuy
git clone <your-repo-url> .
```

---

## 3. Сборка на VPS

```bash
cd /var/www/izibuy/contract && npm ci
cd /var/www/izibuy/server && npm ci
cp .env.production.example .env   # если ещё нет — отредактируй
npm run preflight:prod
npm run migrate:apply

cd /var/www/izibuy/client && npm ci
# Вариант A: НЕ задавай VITE_API_URL
npm run build
```

**Persistent uploads (disk):**

```bash
mkdir -p /var/www/izibuy/server/uploads
# не удалять при git pull
```

---

## 4. systemd (API)

```bash
sudo cp /var/www/izibuy/docs/deploy/systemd-izibuy.service.example \
  /etc/systemd/system/izibuy-api.service
# отредактируй User/пути при необходимости
sudo systemctl daemon-reload
sudo systemctl enable izibuy-api
sudo systemctl start izibuy-api
sudo systemctl status izibuy-api
```

Логи: `journalctl -u izibuy-api -f`

---

## 4a. systemd (Worker) — фоновые + scheduled задачи

Отдельный процесс от API. Нужен, когда используешь Redis/BullMQ **или** хочешь,
чтобы cron-задачи (завершение розыгрышей, дедлайны рассрочки, истечение
промо/баннеров/премиума) шли на выделенном процессе.

```bash
sudo cp /var/www/izibuy/docs/deploy/systemd-izibuy-worker.service.example \
  /etc/systemd/system/izibuy-worker.service
sudo systemctl daemon-reload
sudo systemctl enable izibuy-worker
sudo systemctl start izibuy-worker
sudo systemctl status izibuy-worker
```

Логи/heartbeat: `journalctl -u izibuy-worker -f` (JSON `event=worker.heartbeat`).

**Координация cron (обязательно, если запускаешь worker):** на API задай
`CRON_LEADER=false` в `server/.env` (или не задавай — в prod дефолт «не запускать
cron на API»). worker сам ставит `CRON_LEADER=true`. Иначе scheduled-задачи
выполнятся дважды. Если worker **не** запускаешь — API при старте предупредит,
что задачи нигде не идут.

> Один VPS: API и worker — два systemd-юнита рядом. `worker.js` умеет graceful
> shutdown (SIGTERM), поэтому `systemctl stop`/деплой дренирует текущие задачи.

---

## 5. nginx + SSL

```bash
sudo mkdir -p /var/www/certbot
sudo cp /var/www/izibuy/docs/deploy/nginx-izibuy.conf.example \
  /etc/nginx/sites-available/izibuy
# root → /var/www/izibuy/client/dist
sudo ln -sf /etc/nginx/sites-available/izibuy /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# SSL (Let's Encrypt, бесплатно) — подробно: docs/deploy/CERTBOT-SSL.md
chmod +x /var/www/izibuy/docs/deploy/scripts/setup-ssl.sh
/var/www/izibuy/docs/deploy/scripts/setup-ssl.sh admin@torgum.ru
```

---

## 6. Первый админ

```bash
cd /var/www/izibuy/server
npm run create-admin -- admin@yourdomain.ru 'StrongPassword123!' AdminName
```

---

## 7. Smoke (5 минут)

```bash
curl -sS https://torgum.ru/health
```

В браузере:

1. Register / Login (cookie httpOnly)
2. Каталог открывается
3. Upload фото товара → URL открывается в новой вкладке
4. Корзина → заказ (нужен verify email или SMTP)

Полный список: `server/docs/production-checklist.md` §4.

---

## 8. Обновление (каждый релиз)

```bash
cd /var/www/izibuy && git pull
cd contract && npm ci
cd server && npm ci && npm run migrate:apply
cd ../client && npm ci && npm run build
sudo systemctl restart izibuy-api
# Если запущен worker (Redis/BullMQ или cron-leader) — рестартни и его:
sudo systemctl restart izibuy-worker   # пропусти, если юнита нет
sudo nginx -t && sudo systemctl reload nginx
curl -sS https://torgum.ru/health
```

Откат: `server/docs/RUNBOOK.md` §3.

---

## 9. S3/CDN (опционально, после стабильного disk-prod)

См. [`PROD-S3-CDN.md`](PROD-S3-CDN.md) — не смешивай с первым днём, если не готов R2.

---

## 10. С Windows (подготовка без VPS)

На своём ПК можно проверить только env + Mongo:

```powershell
cd server
copy .env.production.example .env
# заполни MONGO_URI (Atlas), JWT_SECRET, FRONTEND_URL
npm run preflight:prod
cd ..\client
npm run build
```

Артефакт `client/dist/` копируешь на VPS или собираешь прямо на сервере (предпочтительно).
