если ты понял и у тебя нет вопросов, избегая дублирования кода, чрезмерного пробрасывания пропсов, принимая эффективные решения, не нагружая 1 файл кодом, не ломая порядок что мы настраивали в этом проекте, не отходя от общей картины архитектуры и структуры проекта, соблюдая fsd, slice, kiss принципы, не забывая что важна читаемость и масштабируемость проекта в будущем, делая тест после своих доработок, сделай это

а это не повлияет на работу устройства ? не будет ли нагрузка на слабые смартфоны? и не нагрузит ли это базу? ты предусмотрел меры предосторожности ?

в веб версии мобайл размер сайта

=====================================

1. Посмотреть какая картинка грузится первой при запуске приложения
2. Поиск картинок для каталога
3. ПОнять как работает система отображения товаров для юзера в авито и в вб озон
4. Майл пароль

=================================

# Todo (оперативный)

Стратегия и backlog **R-1…R-10**: [`docs/ROADMAP-SCALING.md`](docs/ROADMAP-SCALING.md)  
Сейчас: **фаза 0** — «Запуск в бою» ([roadmap § Фаза 0](docs/ROADMAP-SCALING.md#фаза-0--запуск-в-бою))

---

## Продукт (отдельно от деплоя)

- [x] Адаптив web: mobile ≤640 / tablet / desktop ≥1024 (shell max ~1200), без phone-frame 430

---

## Фаза 0 — prod (сейчас)

Пошагово: [`docs/deploy/DEPLOY.md`](docs/deploy/DEPLOY.md)

### Подготовка env

- [ ] `server/.env` из `.env.production.example`, `chmod 600` на VPS
- [ ] `JWT_SECRET` ≥ 32 байт, `NODE_ENV=production`, Atlas replica set
- [ ] Локально или на VPS: `cd server && npm run preflight:prod`

### Деплой

- [ ] VPS: Node 20, nginx, certbot, клон репо в `/var/www/izibuy`
- [ ] `npm run migrate:apply`
- [ ] `cd client && npm ci && npm run build` — **без** `VITE_API_URL` (вариант A)
- [ ] nginx + SSL — [`docs/deploy/CERTBOT-SSL.md`](docs/deploy/CERTBOT-SSL.md)
- [ ] systemd API — [`docs/deploy/systemd-izibuy.service.example`](docs/deploy/systemd-izibuy.service.example)
- [ ] `npm run create-admin`

### После выкладки

- [ ] Smoke: login → каталог → upload → заказ — [`server/docs/production-checklist.md` §4](server/docs/production-checklist.md)
- [ ] SMTP или осознанный verify через логи (для реальных пользователей — SMTP) — [`server/docs/smtp-setup.md`](server/docs/smtp-setup.md)
- [ ] Sentry DSN server + client — [`server/docs/SENTRY.md`](server/docs/SENTRY.md)
- [ ] Бэкапы Mongo (Atlas Continuous Backup или `mongodump` cron) — [`server/docs/RUNBOOK.md`](server/docs/RUNBOOK.md)

**Выход из фазы 0:** prod 7+ дней, smoke зелёный, Sentry, бэкап.

---

## Фаза 1 — следующий блок (после фазы 0)

Не начинать, пока фаза 0 не закрыта. План: [roadmap §8](docs/ROADMAP-SCALING.md#8-план-на-ближайшие-2-4-недели-фаза-0--1)

| # | Задача | Backlog |
| - | ------ | ------- |
| 1 | `REDIS_URL` + systemd worker | R-2 |
| 2 | Медиа S3/R2 + CDN | [`PROD-S3-CDN.md`](docs/deploy/PROD-S3-CDN.md) |
| 3 | Client unit tests в CI | R-1 |
| 4 | Staging env + deploy doc | R-3 |

Полный чеклист фазы 1: [roadmap § Фаза 1](docs/ROADMAP-SCALING.md#фаза-1--рост-и-доверие)
