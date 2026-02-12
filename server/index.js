import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import { uploadRouter, authRouter, voteRouter, userRouter } from './routes/index.js';
import { generalRateLimiter, errorHandler, notFoundHandler } from './middlewares/index.js';

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET не задан в .env'); // выводим ошибку в консоль
  process.exit(1); // выход из программы с кодом 1 (ошибка)
}
if (!process.env.MONGO_URI) { // если MONGO_URI не задан в .env, то выводим ошибку в консоль и выходим из программы с кодом 1 (ошибка)
  console.error('MONGO_URI не задан в .env'); // выводим ошибку в консоль
  process.exit(1); // выход из программы с кодом 1 (ошибка)
}

mongoose.connect(process.env.MONGO_URI) // подключаемся к MongoDB. Через process.env.MONGO_URI мы получаем URI из файла .env.
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('Ошибка подключения к MongoDB:', err); // выводим ошибку в консоль
    process.exit(1); // выход из программы с кодом 1 (ошибка)
  });

const app = express(); // создаем экземпляр express
app.use(express.json()); // middleware для парсинга JSON в теле запроса
app.use(process.env.FRONTEND_URL ? cors({ origin: process.env.FRONTEND_URL }) : cors()); // разрешаем запросы только с определенного домена если FRONTEND_URL задан в .env
app.use(helmet()); // защита от некоторых типов атак

// Общий rate limiting для всех API запросов (защита от DDoS)
// Применяется ко всем маршрутам, кроме статических файлов
app.use(generalRateLimiter);

// раздача загруженных файлов по URL /uploads/...
app.use('/uploads', express.static('uploads')); // раздаем загруженные файлы по URL /uploads/...

// роут загрузки файла: POST /upload
app.use('/upload', uploadRouter); // Это префикс, который будет использоваться для загрузки файла.

// авторизация: POST /auth/register, POST /auth/login, POST /auth/telegram
app.use('/auth', authRouter); // Это префикс для маршрутов авторизации.

// голосование за пользователя: POST /vote/users/:userVoteTargetIdClient (body: userVoteValueClient 1–10)
app.use('/vote', voteRouter);

app.use('/user', userRouter);

// Обработчик несуществующих маршрутов (404) - должен быть перед errorHandler
app.use(notFoundHandler);

// Централизованный обработчик ошибок (должен быть последним middleware)
app.use(errorHandler);

const PORT = process.env.PORT ?? 4444; // порт для запуска сервера. Через process.env.PORT мы получаем порт из файла .env.
app.listen(PORT, (err) => { // запускаем сервер на порту PORT
  if (err) return console.log('Ошибка запуска сервера:', err);
  console.log(`Сервер успешно запущен и ожидает подключения на порту ${PORT}.`);
});