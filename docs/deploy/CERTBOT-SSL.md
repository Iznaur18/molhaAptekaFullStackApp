# SSL через Certbot (Let's Encrypt, бесплатно)

Бесплатный TLS для **варианта A**: `izibuy.ru` + `www.izibuy.ru` на VPS с nginx.

| Документ | Когда |
| -------- | ----- |
| [`DEPLOY.md`](DEPLOY.md) | полный первый деплой |
| Этот файл | только SSL / продление / troubleshooting |

---

## 0. Предусловия

- [ ] VPS (Ubuntu 22.04+), порты **80** и **443** открыты в firewall / security group
- [ ] A-запись `izibuy.ru` → IP VPS (и при необходимости `www`)
- [ ] nginx установлен, сайт отвечает по HTTP:

```bash
curl -sI http://izibuy.ru/health
# ожидаем HTTP/1.1 200 (или 301 после SSL)
```

- [ ] Конфиг nginx скопирован и активен (см. [`nginx-izibuy.conf.example`](nginx-izibuy.conf.example)):

```bash
sudo cp /var/www/izibuy/docs/deploy/nginx-izibuy.conf.example \
  /etc/nginx/sites-available/izibuy
sudo ln -sf /etc/nginx/sites-available/izibuy /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default   # если мешает default_server
sudo nginx -t && sudo systemctl reload nginx
```

---

## 1. Установка certbot (один раз)

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

Проверка:

```bash
certbot --version
```

---

## 2. Получение сертификата

### Вариант A — скрипт из репо (рекомендуется)

На VPS, из корня клона:

```bash
cd /var/www/izibuy
chmod +x docs/deploy/scripts/setup-ssl.sh
./docs/deploy/scripts/setup-ssl.sh admin@izibuy.ru
```

Скрипт: проверка DNS → `certbot --nginx` → тест renewal → `curl` по HTTPS.

### Вариант B — вручную

```bash
sudo certbot --nginx \
  -d izibuy.ru \
  -d www.izibuy.ru \
  --email admin@izibuy.ru \
  --agree-tos \
  --no-eff-email \
  --redirect
```

Флаги:

| Флаг | Зачем |
| ---- | ----- |
| `--nginx` | плагин сам правит `/etc/nginx/sites-available/izibuy` |
| `--redirect` | HTTP → HTTPS (301) |
| `--agree-tos` | принятие ToS Let's Encrypt |
| `--no-eff-email` | не подписываться на рассылку EFF |

При первом запуске certbot спросит email, если не передан `--email`.

---

## 3. Что меняет certbot в nginx

После успеха в конфиге появятся примерно:

```nginx
listen 443 ssl;
ssl_certificate /etc/letsencrypt/live/izibuy.ru/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/izibuy.ru/privkey.pem;
include /etc/letsencrypt/options-ssl-nginx.conf;
ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
```

И отдельный `server { listen 80; ... return 301 https://... }` для редиректа.

**Не перезаписывай** `/etc/nginx/sites-available/izibuy` из git после certbot — certbot правит живой файл. Шаблон в репо — только **до** первого SSL.

---

## 4. Автопродление

На Ubuntu timer ставится вместе с пакетом:

```bash
sudo systemctl status certbot.timer
# active (waiting)
```

Проверка без реального продления:

```bash
sudo certbot renew --dry-run
```

Ручное продление (обычно не нужно):

```bash
sudo certbot renew
sudo nginx -t && sudo systemctl reload nginx
```

Сертификат Let's Encrypt живёт **90 дней**; timer обновляет за ~30 дней до истечения.

---

## 5. Проверка после SSL

```bash
curl -sS https://izibuy.ru/health
curl -sSI https://izibuy.ru | head -5
```

В браузере: замок HTTPS, редирект `http://` → `https://`.

В `server/.env` должны быть **https** URL:

```env
FRONTEND_URL=https://izibuy.ru
PUBLIC_UPLOAD_BASE_URL=https://izibuy.ru
```

Перезапуск API после смены env:

```bash
sudo systemctl restart izibuy-api
```

---

## 6. Troubleshooting

### `Connection refused` / timeout на 80

```bash
sudo ufw status
sudo ufw allow 'Nginx Full'
# или: allow 80/tcp, 443/tcp в панели хостинга
```

### `DNS problem: NXDOMAIN` / wrong IP

```bash
dig +short izibuy.ru A
curl -s ifconfig.me   # IP VPS — должны совпасть
```

Подожди TTL DNS (до 24 ч, обычно минуты).

### `404` на ACME challenge

- Убедись, что `server_name izibuy.ru www.izibuy.ru` в активном `server` на `:80`
- Нет ли другого `default_server` на 80: `sudo nginx -T | grep -A2 'listen 80'`
- `sudo nginx -t` без ошибок

### Certbot сломал nginx

```bash
sudo nginx -t
sudo certbot delete --cert-name izibuy.ru   # крайний случай
# восстанови конфиг из example, reload, снова certbot --nginx
```

### Продление падает

```bash
sudo journalctl -u certbot.service -u certbot.timer --since "7 days ago"
sudo certbot renew --dry-run -v
```

Частая причина: закрыт порт 80 (Let's Encrypt HTTP-01 требует 80).

---

## 7. CDN / S3 (вариант с `cdn.izibuy.ru`)

Для **API-домена** `izibuy.ru` — этот гайд.

Отдельный сертификат на `cdn.izibuy.ru` обычно выдаёт **Cloudflare** (proxy) или R2 custom domain — не certbot на этом VPS. См. [`PROD-S3-CDN.md`](PROD-S3-CDN.md).

---

## 8. С Windows (подготовка)

Certbot ставится **на VPS**, не на Windows-ПК. Локально можно только проверить DNS:

```powershell
nslookup izibuy.ru
```

Дальше — SSH на VPS и шаги §1–§5.
