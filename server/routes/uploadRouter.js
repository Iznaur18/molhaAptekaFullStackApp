import { Router } from 'express'; // Импортируем Router из express. Он будет использоваться для создания роута.
import { uploadMW, checkAuthMW, uploadRateLimiter, uploadVideoMW } from '../middlewares/index.js'; // Импортируем uploadMW и checkAuthMW из middlewares/index.js. Он будет использоваться для загрузки файла.
import { uploadController, uploadVideoController } from '../controllers/index.js';

const router = Router(); // Создаем роут для загрузки файла. Этот роут будет использоваться в index.js. Это роутер, который будет использоваться для загрузки файла.

// Rate limiting для загрузки файлов (защита от перегрузки сервера)
router.post('/', uploadRateLimiter, checkAuthMW, uploadMW.single('image'), uploadController); // POST /upload - загрузка файла. Если запрос пришел на этот путь, то выполняется uploadRateLimiter, checkAuthMW, uploadMW.single('image'), uploadController.

router.post('/video', uploadRateLimiter, checkAuthMW, uploadVideoMW.single('video'), uploadVideoController);

export { router as uploadRouter }; // Получаем в файле index.js и используем в app.use('/upload', uploadRouter);