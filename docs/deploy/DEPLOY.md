# Первый production-деплой (Selectel VPS + nginx + Mongo на том же сервере)

Линейный сценарий для **варианта A**: один домен `https://gitorg.ru` → SPA + API + uploads + **MongoDB replica set на VPS**.

**Без MongoDB Atlas.** База крутится в РФ на твоём Selectel-сервере (удобнее при ограничениях на зарубежные SaaS и для 152‑ФЗ).

| Документ | Когда |
| -------- | ----- |
| Этот файл | первый выклад |
| [`../ROADMAP-SCALING.md`](../ROADMAP-SCALING.md) | фазы роста, Redis, worker, staging |
| [`LOGGING-CENTRAL.md`](LOGGING-CENTRAL.md) | journald → Loki / Grafana Cloud / Yandex Logging |
| [`PROD-S3-CDN.md`](PROD-S3-CDN.md) | медиа на S3/R2 вместо диска |
| [`CERTBOT-SSL.md`](CERTBOT-SSL.md) | Let's Encrypt / продление / troubleshooting |
| [`../../server/docs/production-checklist.md`](../../server/docs/production-checklist.md) | smoke после деплоя |
| [`../../server/docs/RUNBOOK.md`](../../server/docs/RUNBOOK.md) | бэкап, rollback |

---

## Зачем Mongo «replica set» на одном VPS

Заказы и баллы в Gitorg идут через **транзакции Mongo**. Они работают только если у `mongod` включён **replica set** (`rs0`), даже если член всего один (тот же сервер).

- Корневой `docker-compose.yml` в репо — **только local/dev** (без пароля). На VPS **не** использовать.
- Atlas **не нужен**. Опционально позже, если сам захочешь.

---

## 0. Что нужно заранее

- VPS Selectel: Ubuntu **22.04 LTS**, публичный IP, SSH-ключ
- Рекомендуемый смоук: **2 GB RAM** (`flavor 1012`) или спокойнее **4 GB** (`1013`); диск **20–40 GB**
- Домен `gitorg.ru` → A-запись на IP VPS (и при желании `www`)
- SMTP (регистрация / verify email) — иначе часть сценариев заказа не пройти
- Репозиторий на GitHub (ветка `main`)

На сервере будут рядом: **nginx + Node API (+ worker) + mongod**.  
Для слабого тарифа клиент можно собрать на ПК и залить только `client/dist` (см. §10).

---

## 1. MongoDB на VPS (один раз) — replica set + пароль

Подключайся:

```bash
ssh root@ТВОЙ_IP
```

### 1.1. Установка MongoDB 7 (Ubuntu 22.04)

```bash
sudo apt update
sudo apt install -y gnupg curl

curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc \
  | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" \
  | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

sudo apt update
sudo apt install -y mongodb-org
```

### 1.2. Слушать только localhost + имя replica set

Открой `/etc/mongod.conf` и убедись:

```yaml
net:
  port: 27017
  bindIp: 127.0.0.1

replication:
  replSetName: rs0
```

`bindIp: 127.0.0.1` — Mongo **не торчит в интернет** (к ней ходит только API на этой же машине). Так и должно быть.

```bash
sudo systemctl enable mongod
sudo systemctl restart mongod
sudo systemctl status mongod
```

### 1.3. Инициализация replica set (пока без пароля)

```bash
mongosh --eval 'rs.initiate({_id:"rs0", members:[{_id:0, host:"127.0.0.1:27017"}]})'
```

Подожди несколько секунд, проверь:

```bash
mongosh --eval 'rs.status().ok'
# должно быть 1
```

### 1.4. Пользователь БД

Придумай сильный пароль (сохрани в менеджере паролей). Ниже `CHANGE_ME` замени:

```bash
mongosh --eval '
use admin
db.createUser({
  user: "gitorg",
  pwd: "CHANGE_ME",
  roles: [
    { role: "readWrite", db: "gitorg" },
    { role: "dbAdmin", db: "gitorg" },
    { role: "clusterMonitor", db: "admin" }
  ]
})
'
```

### 1.5. Включить auth + keyFile (нужно для RS с паролем)

```bash
sudo openssl rand -base64 756 | sudo tee /etc/mongo-keyfile >/dev/null
sudo chmod 400 /etc/mongo-keyfile
sudo chown mongodb:mongodb /etc/mongo-keyfile
```

В `/etc/mongod.conf` добавь:

```yaml
security:
  authorization: enabled
  keyFile: /etc/mongo-keyfile
```

```bash
sudo systemctl restart mongod
```

Проверка входа:

```bash
mongosh "mongodb://gitorg:CHANGE_ME@127.0.0.1:27017/gitorg?replicaSet=rs0&authSource=admin" --eval 'db.runCommand({ ping: 1 })'
```

**URI для `server/.env` (пароль URL-encode, если есть спецсимволы):**

```env
MONGO_URI=mongodb://gitorg:CHANGE_ME@127.0.0.1:27017/gitorg?replicaSet=rs0&authSource=admin
```

Localhost **разрешён** в production только если есть **логин/пароль** и **`replicaSet=`**. Голый `mongodb://127.0.0.1:27017/...` без auth — запрещён (`preflight:prod` упадёт).

---

## 2. Node, nginx, каталог приложения

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

sudo mkdir -p /var/www/gitorg
sudo chown -R $USER:$USER /var/www/gitorg
cd /var/www/gitorg
git clone https://github.com/Iznaur18/molhaAptekaFullStackApp.git .
# или: git clone <url> . && git checkout main
```

---

## 3. Env

```bash
cd /var/www/gitorg/server
cp .env.production.example .env
chmod 600 .env
nano .env
```

Минимум заполнить:

| Переменная | Пример |
| ---------- | ------ |
| `JWT_SECRET` / `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | три **разных** строки ≥32 символов |
| `PASSPORT_VAULT_KEK` | 64 hex (`openssl rand -hex 32`) |
| `MONGO_URI` | URI из §1.5 |
| `FRONTEND_URL` | `https://gitorg.ru` |
| `PUBLIC_UPLOAD_BASE_URL` | `https://gitorg.ru` |
| `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` | свой SMTP |

Секреты:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
openssl rand -hex 32
```

Проверка:

```bash
cd /var/www/gitorg/server
npm ci
npm run preflight:prod
# жди ✓ Mongo + replica set; без ошибок localhost/credentials
```

---

## 4. Сборка и миграции

```bash
cd /var/www/gitorg/contract && npm ci
cd /var/www/gitorg/server && npm ci && npm run migrate:apply

mkdir -p /var/www/gitorg/server/uploads
# uploads/ не удалять при git pull

cd /var/www/gitorg/client && npm ci
# Вариант A: НЕ задавай VITE_API_URL
npm run build
```

На VPS с **2 GB RAM** сборка client может не влезть — собери на ПК (§10) и залей `client/dist`.

---

## 5. systemd (API)

Пример в репо: `docs/deploy/systemd-izibuy.service.example` (имя файла старое).  
Скопируй и поправь пути на `/var/www/gitorg`:

```bash
sudo tee /etc/systemd/system/gitorg-api.service >/dev/null <<'EOF'
[Unit]
Description=Gitorg Express API
After=network.target mongod.service
Requires=mongod.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/gitorg/server
EnvironmentFile=/var/www/gitorg/server/.env
Environment=NODE_ENV=production
ExecStart=/usr/bin/node index.js
Restart=on-failure
RestartSec=5
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
EOF

sudo chown -R www-data:www-data /var/www/gitorg/server/uploads
sudo systemctl daemon-reload
sudo systemctl enable gitorg-api
sudo systemctl start gitorg-api
sudo systemctl status gitorg-api
```

Логи: `journalctl -u gitorg-api -f`

Если API не читает `.env` из‑за прав: `chmod 640 server/.env` и пользователь `www-data` в группе владельца файла, либо временно запускай unit от своего `$USER` (поменяй `User=`).

---

## 5a. systemd (Worker) — по возможности сразу

Нужен для cron (розыгрыши, рассрочка, промо). На смоуке можно отложить, но API тогда предупредит, что scheduled-задачи нигде не идут.

```bash
sudo tee /etc/systemd/system/gitorg-worker.service >/dev/null <<'EOF'
[Unit]
Description=Gitorg worker
After=network.target mongod.service gitorg-api.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/gitorg/server
EnvironmentFile=/var/www/gitorg/server/.env
Environment=NODE_ENV=production
ExecStart=/usr/bin/node worker.js
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable gitorg-worker
sudo systemctl start gitorg-worker
```

В `server/.env` для API: `CRON_LEADER=false` (worker сам включает leader).  
Иначе задачи выполнятся дважды.

---

## 6. nginx + SSL

```bash
sudo mkdir -p /var/www/certbot
sudo cp /var/www/gitorg/docs/deploy/nginx-izibuy.conf.example \
  /etc/nginx/sites-available/gitorg
```

В конфиге замени пути `/var/www/izibuy` → `/var/www/gitorg` и `server_name` на `gitorg.ru www.gitorg.ru` (в актуальном example уже `gitorg.ru`).

```bash
sudo ln -sf /etc/nginx/sites-available/gitorg /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

chmod +x /var/www/gitorg/docs/deploy/scripts/setup-ssl.sh
# DNS A уже должен смотреть на этот IP
/var/www/gitorg/docs/deploy/scripts/setup-ssl.sh admin@gitorg.ru
```

Подробнее: [`CERTBOT-SSL.md`](CERTBOT-SSL.md).

---

## 7. Первый админ

```bash
cd /var/www/gitorg/server
npm run create-admin -- admin@gitorg.ru 'StrongPassword123!' AdminName
```

---

## 8. Smoke (5 минут)

```bash
curl -sS https://gitorg.ru/health
# mongo: ок, uploadStorage, uptimeSec
```

В браузере:

1. Register / Login (cookie httpOnly)
2. Каталог
3. Upload фото → URL открывается
4. Корзина → заказ (нужен verify email / SMTP)

Полный список: `server/docs/production-checklist.md` §4.

---

## 9. Обновление (каждый релиз)

```bash
cd /var/www/gitorg && git pull
cd contract && npm ci
cd ../server && npm ci && npm run migrate:apply
cd ../client && npm ci && npm run build
sudo systemctl restart gitorg-api
sudo systemctl restart gitorg-worker   # если юнит есть
sudo nginx -t && sudo systemctl reload nginx
curl -sS https://gitorg.ru/health
```

Откат: `server/docs/RUNBOOK.md`.

**Бэкап Mongo (обязательно заведи в первую неделю):**

```bash
# пример
mongodump --uri="mongodb://gitorg:CHANGE_ME@127.0.0.1:27017/gitorg?replicaSet=rs0&authSource=admin" --out=/var/backups/gitorg-mongo/$(date +%F)
```

Кладёжь бэкапов лучше вне единственного диска приложения (или копируй offsite).

---

## 10. S3/CDN (опционально, не в первый день)

См. [`PROD-S3-CDN.md`](PROD-S3-CDN.md).

---

## 11. С Windows (сборка client без нагрузки на маленький VPS)

```powershell
cd client
npm ci
npm run build
# залить папку dist на VPS → /var/www/gitorg/client/dist
```

Env на VPS всё равно свой; `preflight:prod` гоняй **на сервере**, где живой `MONGO_URI` на `127.0.0.1`.

---

## Шпаргалка «что где»

```
Интернет → nginx :443 (gitorg.ru)
              ├─ /           → client/dist (SPA)
              ├─ /auth,/api… → Node :4444 (gitorg-api)
              └─ /uploads    → disk (или позже S3)

Node API / worker → MongoDB 127.0.0.1:27017 (rs0 + auth)
```

| Не делать | Почему |
| --------- | ------ |
| Ставить корневой `docker compose` Mongo на VPS | без auth / не для prod |
| Открывать `27017` в firewall наружу | взломают |
| Жить без `replicaSet=rs0` | заказы/баллы падают |
| Полагаться на Atlas «потому что в старых гайдах» | из РФ часто боль с оплатой/доступом |
