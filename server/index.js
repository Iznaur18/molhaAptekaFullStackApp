import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { uploadRouter } from './routes/index.js'; 

mongoose.connect(process.env.MONGO_URI) // подключаемся к MongoDB. Через process.env.MONGO_URI мы получаем URI из файла .env.
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('Ошибка подключения:', err));

const app = express();
app.use(express.json());
app.use(cors());

// раздача загруженных файлов по URL /uploads/...
app.use('/uploads', express.static('uploads'));

// роут загрузки файла: POST /upload
app.use('/upload', uploadRouter); // Путь выглядит так: /upload/uploads. Это префикс, который будет использоваться для загрузки файла.

const PORT = process.env.PORT ?? 4444; // порт для запуска сервера. Через process.env.PORT мы получаем порт из файла .env.
app.listen(PORT, (err) => {
  if (err) return console.log('Ошибка запуска сервера:', err);
  console.log(`Сервер успешно запущен и ожидает подключения на порту ${PORT}.`);
});