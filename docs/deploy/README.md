# Deploy: сервер и production

Всё про VPS, nginx, SSL, обновления сайта `gitorg.ru`.

| Файл | Зачем |
| ---- | ----- |
| [**SHPARGALKA-SERVER.md**](SHPARGALKA-SERVER.md) | **Для новичка:** SSH, обновление, логи, `.env` |
| [DEPLOY.md](DEPLOY.md) | Первый деплой с нуля (Selectel + Mongo на VPS) |
| [CERTBOT-SSL.md](CERTBOT-SSL.md) | Let’s Encrypt, продление, ошибки SSL |
| [PROD-S3-CDN.md](PROD-S3-CDN.md) | Медиа на S3/R2 вместо диска VPS |
| [LOGGING-CENTRAL.md](LOGGING-CENTRAL.md) | Центральные логи (Loki / Grafana и т.п.) |

Скрипты установки: папка [`scripts/`](scripts/).  
Примеры nginx/systemd: файлы `*.example` в этой папке.

Связано: [../architecture/ROADMAP-SCALING.md](../architecture/ROADMAP-SCALING.md), `server/docs/RUNBOOK.md`, `server/docs/production-checklist.md`.
