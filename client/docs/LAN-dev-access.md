# Доступ к сайту по Wi‑Fi (LAN, вариант C)

Пока включён режим LAN, с телефона/другого ПК в **той же сети** открывают:

`http://<IPv4-твоего-ПК>:5173`

Пример: `http://192.168.0.42:5173`

## Запуск

```powershell
# Терминал 1
cd server
npm run start:dev

# Терминал 2
cd client
npm run dev
```

В консоли Vite смотри строку **Network** — там готовый URL.

Узнать IP вручную: `ipconfig` → IPv4 у адаптера Wi‑Fi.

## Cookies и вход

Cookie **привязаны к адресу в строке браузера**. `127.0.0.1`, `localhost` и `192.168.x.x` — **разные сайты**.

- С телефона / по Wi‑Fi: смотри cookie для **`http://192.168.x.x`** в DevTools → Application → Cookies (не для `127.0.0.1`).
- На LAN Chrome часто **не сохраняет** httpOnly cookie по IP — в Vite DEV клиент шлёт `X-Auth-Client: web-dev`, сервер кладёт JWT в JSON, клиент пишет их в `sessionStorage` (Bearer). Application → Session Storage → `dev_access_token`.
- После смены адреса (LAN ↔ localhost) — **выйди и войди снова** на том же URL.

---

Разреши входящие TCP **5173** (Vite) и **4444** (API), если с телефона не открывается.

## Что изменено в проекте

| Файл                    | Смысл                                                                 |
| ----------------------- | --------------------------------------------------------------------- |
| `client/vite.config.js` | `DEV_SERVER_HOST = true` — Vite слушает все интерфейсы                |
| `client/vite.config.js` | `LOCAL_API_PROXY_TARGET = "127.0.0.1"` — прокси API на этой же машине |
| `client/vite.config.js` | в прокси добавлен `/address` (подсказки адресов с телефона)           |

Сервер Express менять не нужно: `listen(PORT)` уже доступен в LAN.

---

## Как вернуть всё как было (только этот компьютер)

### 1. `client/vite.config.js`

Замени в начале файла:

```js
const DEV_SERVER_HOST = true;
```

на:

```js
const DEV_SERVER_HOST = "127.0.0.1";
```

Опционально убери `"/address"` из массива `DEV_API_PROXY_PREFIXES`, если не пользовался подсказками адресов.

### 2. Перезапуск

Останови `npm run dev` (Ctrl+C) и снова `npm run dev`.

Сайт снова только по `http://127.0.0.1:5173`.

### 3. Удалить эту памятку (по желанию)

- `client/docs/LAN-dev-access.md`
- комментарий в шапке `vite.config.js` про LAN

---

## `server/.env` (опционально)

Для LAN **не обязательно** задавать `FRONTEND_URL` — без него CORS открыт для всех.

Если задавал `FRONTEND_URL=http://192.168.x.x:5173` — удали строку или верни `http://127.0.0.1:5173`.
