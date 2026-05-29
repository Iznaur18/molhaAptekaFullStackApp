import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import {
    uploadRouter,
    authRouter,
    voteRouter,
    userRouter,
    orderRouter,
    productRouter,
    cartRouter,
    addressRouter,
} from './routes/index.js';
import { generalRateLimiter, errorHandler, notFoundHandler } from './middlewares/index.js';
import { UPLOADS_DIR, ensureUploadsDir } from './utils/uploadsDir.js';

ensureUploadsDir();

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET не задан в .env'); // выводим ошибку в консоль
  process.exit(1); // выход из программы с кодом 1 (ошибка)
}
if (!process.env.MONGO_URI) { // если MONGO_URI не задан в .env, то выводим ошибку в консоль и выходим из программы с кодом 1 (ошибка)
    console.error('MONGO_URI не задан в .env'); // выводим ошибку в консоль
    process.exit(1); // выход из программы с кодом 1 (ошибка)
}

const app = express(); // создаем экземпляр express
// Один hop прокси (Vite dev `server.proxy`, nginx и т.п.) — иначе `express-rate-limit` v7
// может кинуть ValidationError из‑за `X-Forwarded-For` при `trust proxy === false`.
app.set('trust proxy', 1);
app.use(express.json()); // middleware для парсинга JSON в теле запроса
app.use(process.env.FRONTEND_URL ? cors({ origin: process.env.FRONTEND_URL }) : cors()); // разрешаем запросы только с определенного домена если FRONTEND_URL задан в .env
app.use(helmet()); // защита от некоторых типов атак

// Общий rate limiting для всех API запросов (защита от DDoS)
// Применяется ко всем маршрутам, кроме статических файлов
app.use(generalRateLimiter);

// раздача загруженных файлов по URL /uploads/...
app.use(
  '/uploads',
  (_req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  express.static(UPLOADS_DIR),
);

// роут загрузки файла: POST /upload
app.use('/upload', uploadRouter); // Это префикс, который будет использоваться для загрузки файла.

// авторизация: POST /auth/register, POST /auth/login, POST /auth/telegram
app.use('/auth', authRouter); // Это префикс для маршрутов авторизации.

// голосование за пользователя: POST /vote/:userVoteTargetIdClient (body: userVoteValueClient 1–10)
app.use('/vote', voteRouter);

app.use('/user', userRouter);

app.use('/order', orderRouter);

app.use('/cart', cartRouter);

app.use('/product', productRouter);

app.use('/address', addressRouter);

// Обработчик несуществующих маршрутов (404) - должен быть перед errorHandler
app.use(notFoundHandler);

// Централизованный обработчик ошибок (должен быть последним middleware)
app.use(errorHandler);

const PORT = process.env.PORT ?? 4444; // порт для запуска сервера. Через process.env.PORT мы получаем порт из файла .env.

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    app
      .listen(PORT, () => {
        console.log(`Сервер успешно запущен на ${PORT}.`);
      })
      .on('error', (err) => {
        console.error('Ошибка запуска сервера:', err);
        process.exit(1);
      });
  } catch (err) {
    console.error('Ошибка подключения к MongoDB:', err);
    process.exit(1);
  }
}

void start();