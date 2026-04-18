# Insomnia quick guide (current API)

## 1) Base URL

- Если сервер запущен как у тебя в терминале: `http://localhost:5555`
- Если стандартный порт из `.env`: `http://localhost:4444`

## 2) Авторизация в Insomnia

1. Выполни `POST /auth/login` или `POST /auth/register`.
2. Скопируй `token` из ответа.
3. Для защищенных роутов добавь заголовок:
   - `Authorization: Bearer <TOKEN>`

## 3) Быстрый набор запросов

### Auth

- `POST /auth/register`
```json
{
  "email": "test@example.com",
  "password": "123456",
  "userName": "testUser"
}
```

- `POST /auth/login`
```json
{
  "email": "test@example.com",
  "password": "123456"
}
```

- `GET /auth/me` (нужен Bearer token)
- `POST /auth/telegram`
```json
{
  "telegramUserId": "123456789"
}
```

### Users

- `GET /user/search?search=test&page=1&limit=10`
- `GET /user/:userIdClient`
- `PATCH /user/:userIdClient` (нужен Bearer token)
```json
{
  "userName": "newName",
  "userPhoneNumber": "+79990000000"
}
```
- `DELETE /user/:userIdClient` (нужен Bearer token)

### Products

- `GET /product`
- `GET /product/my` (нужен Bearer token)
- `POST /product` (нужен Bearer token)
```json
{
  "productName": "Aspirin",
  "productDescription": "Pain relief tablets, 20 pcs",
  "productPrice": 199.99,
  "productCategory": "food",
  "productIsAvailable": true
}
```

### Orders

- `GET /order` (нужен Bearer token)
- `GET /order/all`
- `POST /order` (нужен Bearer token)
```json
{
  "items": [
    { "productId": "PUT_PRODUCT_ID_HERE", "quantity": 2 }
  ],
  "deliveryAddress": "Moscow, Tverskaya 1",
  "paymentMethod": "card"
}
```

### Vote

- `GET /vote/rating/:userIdClient`
- `POST /vote/:userVoteTargetIdClient` (нужен Bearer token)
```json
{
  "userVoteValueClient": 8
}
```

### Upload

- `POST /upload` (нужен Bearer token)
- Body type: `Multipart Form`
- Поле файла: `image` (jpg/png)

## 4) Рекомендуемый порядок теста

1. Register/Login -> получить token.
2. `GET /auth/me` -> проверить token.
3. Создать продукт (`POST /product`).
4. Получить продукты (`GET /product`) и взять `productId`.
5. Создать заказ (`POST /order`).
