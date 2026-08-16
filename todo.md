"Личная рекомендация

так же, если ты понял и у тебя нет вопросов, избегая дублирования кода, чрезмерного пробрасывания пропсов, принимая эффективные решения, не нагружая 1 файл кодом, не ломая порядок что мы настраивали в этом проекте, не отходя от общей картины архитектуры и структуры проекта, соблюдая fsd, slice, kiss принципы, не забывая что важна читаемость и масштабируемость проекта в будущем, делая тест после своих доработок, не пиши что готово не перепроверив, вот после всего этого, можешь начать делать"

а это не повлияет на работу устройства ? не будет ли нагрузка на слабые смартфоны? и не нагрузит ли это база? ты предусмотрел меры предосторожности ?

в веб версии мобайл размер сайта

=================================

# Todo (оперативный)

Стратегия и backlog **R-1…R-10**: [`docs/architecture/ROADMAP-SCALING.md`](docs/architecture/ROADMAP-SCALING.md)  
Сейчас: **фаза 0** — прод Gitorg live, дожимаем выходные критерии  
Оглавление доков: [`docs/README.md`](docs/README.md)  
Шпаргалка VPS: [`docs/deploy/SHPARGALKA-SERVER.md`](docs/deploy/SHPARGALKA-SERVER.md)

| | |
|---|---|
| Prod | https://gitorg.ru · VPS `135.106.146.218` · `/var/www/gitorg` |
| Units | `gitorg-api` / `gitorg-worker` · nginx · Mongo `rs0` на той же машине |
| Деплой | ПК: commit + push → VPS: `git pull` + client build; `.env` на сервере не в git |

---

## Продукт

- [x] Адаптив web: mobile ≤640 / tablet / desktop ≥1024 (shell max ~1200), без phone-frame 430
- [x] Ребренд Torgum → Gitorg
- [x] First load SPA: lazy routes/chunks (`447b2fb6`)
- [x] SMS / регистрация по телефону (`SMSPILOT_API_KEY`, `DADATA_*` на прод)

---

## Фаза 0 — prod

Пошагово с нуля: [`docs/deploy/DEPLOY.md`](docs/deploy/DEPLOY.md)  
Повседневное: [`docs/deploy/SHPARGALKA-SERVER.md`](docs/deploy/SHPARGALKA-SERVER.md)

### Инфра (сделано)

- [x] VPS Selectel: Node, nginx, certbot, код в `/var/www/gitorg`
- [x] `server/.env` на VPS (`chmod 600`), не в git
- [x] Mongo replica set `rs0` на той же машине
- [x] nginx + SSL (gitorg.ru)
- [x] systemd `gitorg-api` + `gitorg-worker`
- [x] Client build за nginx (вариант A, без `VITE_API_URL`)

### Дожать выход из фазы 0

- [ ] Smoke: login → каталог → upload → заказ — [`server/docs/production-checklist.md` §4](server/docs/production-checklist.md)
- [ ] Sentry DSN server + client — [`server/docs/SENTRY.md`](server/docs/SENTRY.md)
- [ ] Бэкапы Mongo (`mongodump` cron) — [`server/docs/RUNBOOK.md`](server/docs/RUNBOOK.md)
- [ ] Prod 7+ дней без критичных инцидентов

**Выход из фазы 0:** smoke зелёный + Sentry + бэкап + 7 дней стабильности.

---

## Отложено (не фаза 1)

| Тема | Почему | Когда вернуться |
| ---- | ------ | --------------- |
| Email-регистрация | Selectel режет исходящий SMTP 25/465/587; Yandex с VPS не достучаться | Selectel Mail (порт **1127**) или другой канал |
| Доступ без VPN (iPhone / домашний Wi‑Fi) | DNS/маршрут/провайдер до IP, сервер живой | опционально Cloudflare |
| `/me` после «регистрации» | чаще нет сессии из-за незавершённой email-регистрации, не мёртвый роут | вместе с почтой |

---

## Фаза 1 — следующий блок (после фазы 0)

Не начинать, пока фаза 0 не закрыта. План: [roadmap §8](docs/architecture/ROADMAP-SCALING.md#8-план-на-ближайшие-2-4-недели-фаза-0--1)

| # | Задача | Backlog |
| - | ------ | ------- |
| 1 | `REDIS_URL` (worker unit уже на проде) | R-2 |
| 2 | Медиа S3/R2 + CDN | [`PROD-S3-CDN.md`](docs/deploy/PROD-S3-CDN.md) |
| 3 | Client unit tests в CI | R-1 |
| 4 | Staging env + deploy doc | R-3 |

Полный чеклист фазы 1: [roadmap § Фаза 1](docs/architecture/ROADMAP-SCALING.md#фаза-1--рост-и-доверие)

---

## Следующий шаг (когда вернёмся к инцидентам)

1. Почта: Selectel Mail `:1127` **или** альтернатива  
2. и/или Cloudflare для доступа без VPN
