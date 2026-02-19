Upload (префикс /upload)
POST /upload — загрузка файла (JWT)
Auth (префикс /auth)
GET /auth/me — текущий пользователь (JWT)
POST /auth/register — регистрация
POST /auth/login — вход
POST /auth/telegram — вход через Telegram
User (префикс /user)
GET /user/search — поиск пользователей
GET /user/:userIdClient — профиль по id (публичный)
PATCH /user/:userIdClient — обновление профиля (JWT)
DELETE /user/:userIdClient — удаление профиля (JWT)
Vote (префикс /vote)
GET /vote/rating/:userIdClient — рейтинг пользователя
POST /vote/:userVoteTargetIdClient — поставить оценку (JWT)
Order (префикс /order)
GET /order — мои заказы (JWT)
GET /order/all — все заказы
POST /order — создать заказ (JWT)
Product (префикс /product)
GET /product — список товаров (пагинация: ?page=&limit=)
GET /product/my — мои товары (JWT)
POST /product — создать товар (JWT)
Статика
GET /uploads/* — раздача файлов из папки uploads
(JWT = нужен заголовок Authorization: Bearer <token>.)