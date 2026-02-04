import { Router } from 'express'; // Импортируем Router из express. Он будет использоваться для создания роута.
import { uploadMW, checkAuthMW } from '../middlewares/index.js'; // Импортируем uploadMW и checkAuthMW из middlewares/index.js. Он будет использоваться для загрузки файла.
import { uploadController } from '../controllers/uploadController.js'; // Импортируем uploadController из controllers/uploadController.js. Это должен быть обработчик запроса на загрузку файла.

const router = Router(); // Создаем роут для загрузки файла. Этот роут будет использоваться в index.js. Это роутер, который будет использоваться для загрузки файла.

router.post('/', checkAuthMW, uploadMW.single('image'), uploadController); // POST /upload - загрузка файла. Если запрос пришел на этот путь, то выполняется checkAuthMW, uploadMW.single('image'), uploadController.

export { router as uploadRouter }; // Получаем в файле index.js и используем в app.use('/upload', uploadRouter);