import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { uploadRouter, authRouter } from './routes/index.js';
import { errorRes } from './utils/index.js';

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET не задан в .env'); // выводим ошибку в консоль
  process.exit(1); // выход из программы с кодом 1 (ошибка)
}
if (!process.env.MONGO_URI) {
  console.error('MONGO_URI не задан в .env'); // выводим ошибку в консоль
  process.exit(1); // выход из программы с кодом 1 (ошибка)
}

mongoose.connect(process.env.MONGO_URI) // подключаемся к MongoDB. Через process.env.MONGO_URI мы получаем URI из файла .env.
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('Ошибка подключения к MongoDB:', err); // выводим ошибку в консоль
    process.exit(1); // выход из программы с кодом 1 (ошибка)
  });

const app = express();
app.use(express.json());
app.use(process.env.FRONTEND_URL ? cors({ origin: process.env.FRONTEND_URL }) : cors()); // разрешаем запросы только с определенного домена если FRONTEND_URL задан в .env

// раздача загруженных файлов по URL /uploads/...
app.use('/uploads', express.static('uploads')); // раздаем загруженные файлы по URL /uploads/...

// роут загрузки файла: POST /upload
app.use('/upload', uploadRouter); // Это префикс, который будет использоваться для загрузки файла.

// авторизация: POST /auth/register, POST /auth/login, POST /auth/telegram
app.use('/auth', authRouter); // Это префикс для маршрутов авторизации.

// глобальный обработчик ошибок (необработанные исключения, в т.ч. от multer)
app.use((err, req, res, next) => { // обработчик ошибок
  console.error(err);
  if (err.code === 'LIMIT_FILE_SIZE') { // если ошибка связана с размером файла
    return errorRes(res, 413, 'Файл слишком большой. Максимум 5 MB.');
  }
  errorRes(res, 500, 'Ошибка сервера'); // если ошибка не связана с размером файла
});

const PORT = process.env.PORT ?? 4444; // порт для запуска сервера. Через process.env.PORT мы получаем порт из файла .env.
app.listen(PORT, (err) => { // запускаем сервер на порту PORT
  if (err) return console.log('Ошибка запуска сервера:', err);
  console.log(`Сервер успешно запущен и ожидает подключения на порту ${PORT}.`);
});